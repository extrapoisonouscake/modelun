import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { CLIENT_ORIGIN, isDev, isProd } from "./constants";
import { verifySessionToken, type SessionTokenPayload } from "./routes/helpers";
import {
  socketEvents,
  type ClientToServerEvents,
  type InterServerEvents,
  type ServerToClientEvents,
} from "./types";

export interface SocketData {
  session: SessionTokenPayload;
}

export let io: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export const initializeSocketIO = (server: HttpServer) => {
  io = new Server(server, {
    connectionStateRecovery: {},
    cors: {
      origin: isDev
        ? ["http://localhost:3000", "http://localhost:3001"]
        : CLIENT_ORIGIN,
      credentials: true,
    },
    path: isProd ? "/api/" : undefined,
  });

  io.use(async (socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    const sessionToken = cookies
      ?.split(";")
      .find((cookie) => cookie.trim().startsWith("session="))
      ?.split("=")[1];

    if (!sessionToken) {
      return next(new Error("No session token"));
    }
    const session = await verifySessionToken(sessionToken);
    socket.data.session = session;
    next();
  });

  io.on("connection", (socket) => {
    const { countryCode, committeeId } = socket.data.session;
    const committeePath = getSocketRoomFullPath(committeeId);
    if (countryCode)
      io.to(committeePath).emit(socketEvents.participants.online, countryCode);
    socket.join(committeePath);
    socket.on("disconnect", () => {
      if (countryCode)
        io.to(committeePath).emit(
          socketEvents.participants.offline,
          countryCode
        );
    });
  });

  return io;
};

export const getSocketRoomFullPath = (id: string) => {
  return `committee-${id}`;
};
