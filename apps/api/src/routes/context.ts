import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

import { TRPCError } from "@trpc/server";
import { redis } from "../db/redis";
import { type SessionTokenPayload, verifySessionToken } from "./helpers";
export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions) => {
  let session: SessionTokenPayload | null = null;
  const sessionToken = req.cookies.session;
  if (sessionToken) {
    session = await verifySessionToken(sessionToken);
    if (!session.isChair) {
      const deviceId = await redis.operations.getParticipantDeviceId(
        session.committeeId,
        session.countryCode
      );
      if (!deviceId || req.cookies.deviceId !== deviceId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid session",
        });
      }
    }
  }
  return {
    session,
    res,
    cookies: req.cookies,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
