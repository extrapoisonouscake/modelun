import { TRPCError } from "@trpc/server";
import { redis } from "../db/redis";
import { publicProcedure } from "./trpc";

export const authenticatedProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
    const committee = await redis.operations.getCommittee(
      ctx.session.committeeId
    );

    if (!committee) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { session: ctx.session, committee } });
  }
);
export const votingSessionInProgressProcedure = authenticatedProcedure.use(
  async ({ ctx, next }) => {
    const votingSessionId = await redis.operations.getCurrentVotingSessionId(
      ctx.session.committeeId
    );
    if (!votingSessionId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Voting session not found.",
      });
    }
    return next({
      ctx: { ...ctx, votingSessionId },
    });
  }
);
