import { chairRouter } from "./chair";
import { committeeRouter } from "./committee";
import { router } from "./trpc";

export const appRouter = router({
  chair: chairRouter,
  committee: committeeRouter,
});
