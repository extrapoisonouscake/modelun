import { TRPCError } from "@trpc/server";
import { isProd } from "../../constants";
import { redis, redisKeys } from "../../db/redis";
import { getSocketRoomFullPath, io } from "../../io";
import { CHAIR_IDENTIFIER, socketEvents, type VotingRecord } from "../../types";
import { generateSessionToken } from "../helpers";
import {
  authenticatedProcedure,
  votingSessionInProgressProcedure,
} from "../procedures";
import { publicProcedure, router } from "../trpc";
import { findCommitteeSchema, joinCommitteeSchema, voteSchema } from "./public";

export const committeeRouter = router({
  find: publicProcedure
    .input(findCommitteeSchema)

    .query(async ({ input }) => {
      const committeeId = await redis.operations.getCommitteeIdByCode(
        input.code
      );
      if (!committeeId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Committee not found",
        });
      }
      const [committee, participants] = await Promise.all([
        redis.operations.getCommittee(committeeId),
        redis.operations.getParticipants(committeeId),
      ]);
      if (!committee || !participants) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Committee not found",
        });
      }
      const { name, description, countries, customCountries } = committee;

      return {
        name,
        description,
        countries: countries.map((code) => ({
          code,
          isAvailable: !participants.has(code),
        })),
        customCountries,
      };
    }),
  get: authenticatedProcedure.query(async ({ ctx }) => {
    return ctx.committee;
  }),
  getMine: authenticatedProcedure.query(async ({ ctx }) => {
    const committee = ctx.committee;
    const [participants, votingSessions] = await Promise.all([
      redis.operations.getParticipants(committee.id),
      redis.operations.getVotingSessions(committee.id),
    ]);
    const votingSessionsWithRecords = Object.fromEntries(
      await Promise.all(
        Object.entries(votingSessions).map(async ([id, votingSession]) => {
          const records = await redis.operations.getVotingRecords(
            committee.id,
            id
          );
          return [id, { ...votingSession, records }];
        })
      )
    );
    const connectedParticipants = (
      await io.in(getSocketRoomFullPath(committee.id)).fetchSockets()
    ).map((socket) => socket.data.session.countryCode);
    const participantsWithStatus = Array.from(participants).map(
      (participant) => ({
        countryCode: participant,
        isOnline: connectedParticipants.includes(participant),
      })
    );
    const currentVotingSessionId =
      await redis.operations.getCurrentVotingSessionId(committee.id);
    return {
      committee,
      participants: participantsWithStatus,
      votingSessions: votingSessionsWithRecords,
      currentVotingSessionId,
    };
  }),
  join: publicProcedure
    .input(joinCommitteeSchema)
    .mutation(async ({ ctx, input }) => {
      const { code, passphrase, countryCode } = input;
      const committeeId = await redis.hget(...redisKeys.committeeByCode(code));
      if (!committeeId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Committee not found",
        });
      }
      const committee = await redis.operations.getCommittee(committeeId);
      if (!committee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Committee not found",
        });
      }

      const isChairCountry = countryCode === CHAIR_IDENTIFIER;
      if (isChairCountry) {
        if (passphrase !== committee.passphrase) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid passphrase",
          });
        }
      }
      if (!isChairCountry)
        await redis.sadd(redisKeys.participants(committee.id), countryCode);
      const sessionToken = await generateSessionToken({
        committeeId,
        countryCode,
        isChair: isChairCountry,
      });

      if (!isChairCountry)
        io.to(getSocketRoomFullPath(committee.id)).emit(
          socketEvents.participants.joined,
          countryCode
        );

      ctx.res.cookie("session", sessionToken, {
        httpOnly: false,
        secure: isProd,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        path: "/",
      });
      return committee;
    }),
  logOut: authenticatedProcedure.mutation(async ({ ctx }) => {
    const { countryCode } = ctx.session;
    if (countryCode) {
      await redis.srem(redisKeys.participants(ctx.committee.id), countryCode);
      io.to(getSocketRoomFullPath(ctx.committee.id)).emit(
        socketEvents.participants.left,
        countryCode
      );
      ctx.res.clearCookie("session");
    }
  }),
  vote: votingSessionInProgressProcedure
    .input(voteSchema)
    .mutation(async ({ ctx, input }) => {
      const { choice } = input;
      const { countryCode } = ctx.session;
      if (!countryCode) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not a member",
        });
      }
      const votingSession = await redis.operations.getVotingSession(
        ctx.committee.id,
        ctx.votingSessionId
      );
      if (!votingSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voting session not found",
        });
      }
      await redis.operations.addVotingRecord({
        committeeId: ctx.committee.id,
        sessionId: ctx.votingSessionId,
        countryCode,
        choice,
      });
      io.to(getSocketRoomFullPath(ctx.committee.id)).emit(
        socketEvents.voting.new_vote,
        {
          sessionId: ctx.votingSessionId,
          countryCode,
          choice,
        } satisfies VotingRecord
      );
    }),
  withdrawVote: votingSessionInProgressProcedure.mutation(async ({ ctx }) => {
    const { countryCode } = ctx.session;
    if (!countryCode) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not a member",
      });
    }
    const votingSession = await redis.operations.getVotingSession(
      ctx.committee.id,
      ctx.votingSessionId
    );
    if (!votingSession) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Voting session not found",
      });
    }
    await redis.operations.deleteVotingRecord({
      committeeId: ctx.committee.id,
      sessionId: ctx.votingSessionId,
      countryCode,
    });
    io.to(getSocketRoomFullPath(ctx.committee.id)).emit(
      socketEvents.voting.vote_withdrawn,
      ctx.votingSessionId,
      countryCode
    );
  }),
});
