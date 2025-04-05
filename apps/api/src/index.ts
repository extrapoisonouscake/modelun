import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import http from "http";
import { isProd, PORT } from "./constants";

import { initializeSocketIO } from "./io";
import { createContext } from "./routes/context";
import { appRouter } from "./routes/index";
const app = express();
app.use(cookieParser());
export const server = http.createServer(app);
initializeSocketIO(server);
const CLIENT_DOMAIN = process.env.CLIENT_DOMAIN;
if (isProd && !CLIENT_DOMAIN) {
  throw new Error("CLIENT_DOMAIN is not set");
}
const handler = trpcExpress.createExpressMiddleware({
  onError(e) {
    console.error(e);
  },
  router: appRouter,
  middleware: cors({
    origin: CLIENT_DOMAIN || "http://localhost:3001",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),

  createContext,
});
app.use("/trpc", handler);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
