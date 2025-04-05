import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import http from "http";
import { PORT } from "./constants";

import { initializeSocketIO } from "./io";
import { createContext } from "./routes/context";
import { appRouter } from "./routes/index";
const app = express();
app.use(cookieParser());
export const server = http.createServer(app);
initializeSocketIO(server);
const handler = trpcExpress.createExpressMiddleware({
  onError(e) {
    console.error(e);
  },
  router: appRouter,
  middleware: cors({
    origin: "http://localhost:3001",
    credentials: true,
  }),

  createContext,
});
app.use("/trpc", handler);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
