import { TRPCError } from "@trpc/server";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { redis, redisKeys } from "../../db/redis";
import { generateSixDigitCode } from "../../helpers";
import { getSocketRoomFullPath, io } from "../../io";
import { socketEvents, type Committee, type VotingSession } from "../../types";
import { committeeSchema, votingSessionSchema } from "../../types/schemas";
import {
  authenticatedProcedure,
  votingSessionInProgressProcedure,
} from "../procedures";
import { publicProcedure, router } from "../trpc";
import { hashString } from "./helpers";
import {
  createCommitteeSchema,
  createVotingSessionSchema,
  updateCommitteeSchema,
} from "./public";
const chairProcedure = authenticatedProcedure.use(async ({ ctx, next }) => {
  const { isChair } = ctx.session;
  if (!isChair) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});
const generateUniqueCode = async () => {
  const code = generateSixDigitCode();
  const committeeId = await redis.operations.getCommitteeIdByCode(code);
  if (committeeId) {
    return generateUniqueCode();
  } else {
    return code;
  }
};
export const chairRouter = router({
  createCommittee: publicProcedure
    .input(createCommitteeSchema)
    .mutation(async ({ input }) => {
      const chairId = uuid();
      const code = await generateUniqueCode();
      const newCommittee = {
        name: input.name,
        passphrase: hashString(input.passphrase),
        id: uuid(),
        code,
        chairId,
        countries: input.countries,
        customCountries: input.customCountries,
        description: input.description,
      } satisfies Committee;
      await Promise.all([
        redis.set(
          redisKeys.committee(newCommittee.id),
          JSON.stringify(newCommittee)
        ),
        redis.hset(
          ...redisKeys.committeeByCode(newCommittee.code),
          newCommittee.id
        ),
      ]);

      return newCommittee;
    }),
  deleteCommittee: chairProcedure
    .input(committeeSchema.pick({ id: true }))
    .mutation(async ({ ctx: { session } }) => {
      const { committeeId } = session;
      const votingSessions =
        await redis.operations.getVotingSessions(committeeId);

      await Promise.all([
        redis.del([
          redisKeys.participants(committeeId),
          redisKeys.votingSessions(committeeId),

          redisKeys.committee(committeeId),
        ]),
        Promise.all(
          Object.entries(votingSessions).map(([id]) =>
            redis.del(redisKeys.votingRecords(committeeId, id))
          )
        ),
      ]);
    }),
  updateCommittee: chairProcedure
    .input(updateCommitteeSchema)
    .mutation(async ({ input, ctx }) => {
      const currentCommittee = ctx.committee;
      const updatedCommittee = {
        ...currentCommittee,
        ...input,
      } satisfies Committee;

      await redis.set(
        redisKeys.committee(currentCommittee.id),
        JSON.stringify(updatedCommittee)
      );
      io.to(getSocketRoomFullPath(currentCommittee.id)).emit(
        socketEvents.committee.updated,
        updatedCommittee
      );
    }),

  createVotingSession: chairProcedure
    .input(createVotingSessionSchema)
    .mutation(async ({ input, ctx }) => {
      const votingSessionId = uuid();
      const newVotingSession = {
        id: votingSessionId,
        name: input.name,
        description: input.description,
        wasOpen: false,
      } satisfies VotingSession;
      await redis.hset(
        ...redisKeys.votingSession(ctx.committee.id, votingSessionId),
        JSON.stringify(newVotingSession)
      );
      io.to(getSocketRoomFullPath(ctx.committee.id)).emit(
        socketEvents.voting.created,
        newVotingSession
      );
      return newVotingSession;
    }),
  deleteVotingSession: chairProcedure
    .input(votingSessionSchema.pick({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const currentVotingSessionId =
        await redis.operations.getCurrentVotingSessionId(ctx.committee.id);
      if (currentVotingSessionId === input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete current voting session.",
        });
      }
      await redis.hdel(...redisKeys.votingSession(ctx.committee.id, input.id));
      io.to(getSocketRoomFullPath(ctx.committee.id)).emit(
        socketEvents.voting.deleted,
        input.id
      );
    }),
  startVotingSession: chairProcedure
    .input(votingSessionSchema.pick({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const currentVotingSessionId =
        await redis.operations.getCurrentVotingSessionId(ctx.committee.id);
      if (currentVotingSessionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Voting session already started.",
        });
      }
      const votingSession = await redis.operations.getVotingSession(
        ctx.committee.id,
        input.id
      );
      if (!votingSession) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Voting session not found.",
        });
      }
      await Promise.all([
        redis.set(redisKeys.currentVotingSessionId(ctx.committee.id), input.id),
        redis.operations.setVotingSession(ctx.committee.id, input.id, {
          ...votingSession,
          wasOpen: true,
        }),
      ]);
      io.to(getSocketRoomFullPath(ctx.committee.id)).emit(
        socketEvents.voting.started,
        input.id
      );
    }),
  endVotingSession: votingSessionInProgressProcedure.mutation(
    async ({ ctx }) => {
      const votingSession = await redis.operations.getVotingSession(
        ctx.committee.id,
        ctx.votingSessionId
      );
      if (!votingSession) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Voting session not found.",
        });
      }
      await redis.operations.deleteCurrentVotingSession(ctx.committee.id);
      io.to(getSocketRoomFullPath(ctx.committee.id)).emit(
        socketEvents.voting.ended,
        ctx.votingSessionId
      );
    }
  ),
  banParticipant: chairProcedure
    .input(z.object({ countryCode: z.string() }))
    .mutation(async ({ input: { countryCode }, ctx }) => {
      const deviceId = await redis.operations.getParticipantDeviceId(
        ctx.committee.id,
        countryCode
      );
      if (!deviceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Participant not found.",
        });
      }
      await Promise.all([
        redis.operations.addBannedDeviceId(ctx.committee.id, deviceId),
        redis.hdel(...redisKeys.participant(ctx.committee.id, countryCode)),
      ]);
      io.to(getSocketRoomFullPath(ctx.committee.id)).emit(
        socketEvents.participants.left,
        countryCode
      );
      const socket = (
        await io.in(getSocketRoomFullPath(ctx.committee.id)).fetchSockets()
      ).find((socket) => socket.data.session.countryCode === countryCode);
      if (socket) {
        socket.emit(socketEvents.moderation.banned);
      }
    }),
  deleteParticipant: chairProcedure
    .input(z.object({ countryCode: z.string() }))
    .mutation(async ({ input: { countryCode }, ctx }) => {
      await redis.hdel(...redisKeys.participant(ctx.committee.id, countryCode));
      io.to(getSocketRoomFullPath(ctx.committee.id)).emit(
        socketEvents.participants.left,
        countryCode
      );
    }),
});
