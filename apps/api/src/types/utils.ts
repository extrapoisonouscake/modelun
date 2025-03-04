import { appRouter } from "../index";

export type AppRouter = typeof appRouter;
export type FirstElementOfUnion<T> = T extends [infer U, ...any[]] ? U : never;
