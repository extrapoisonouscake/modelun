import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

import { type SessionTokenPayload, verifySessionToken } from "./helpers";
export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions) => {
  let session: SessionTokenPayload | null = null;
  const sessionToken = req.cookies.session;
  if (sessionToken) {
    session = await verifySessionToken(sessionToken);
  }
  return {
    session,
    res,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
