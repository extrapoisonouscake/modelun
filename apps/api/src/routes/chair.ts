import { redis } from "../db/redis";
import { committeeSchema } from "../types/schemas";
import { publicProcedure, router } from "./trpc";
const chairProcedure = publicProcedure.use(async ({ ctx, next }) => {});
export const chairRouter = router({
  createCommittee: chairProcedure
    .input(committeeSchema.pick({ name: true, passphrase: true }))
    .mutation(async ({ ctx, input }) => {
      const committee = await redis.operations.getCommittee(input.name);
      if (committee) {
        throw new Error("Committee already exists");
      }
      await redis.set.setCommittee(input.name, input);
      return;
    }),
});
