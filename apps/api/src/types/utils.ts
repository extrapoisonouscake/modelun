import type { inferRouterOutputs } from "@trpc/server";
import type { appRouter } from "../routes/index";

export type AppRouter = typeof appRouter;
export type AppRouterOutput = inferRouterOutputs<AppRouter>;
export type FirstElementOfUnion<T> = T extends [infer U, ...any[]] ? U : never;
