import jwt from "jsonwebtoken";

export type SessionTokenPayload = {
  committeeId: string;
} & (
  | { isChair: false; countryCode: string }
  | { isChair: true; countryCode?: never }
);

const isNode = typeof process !== "undefined";
const secret = isNode ? (process.env.JWT_SECRET ?? "") : "";

if (isNode && !secret) {
  throw new Error("JWT_SECRET is not set");
}

export const generateSessionToken = async ({
  committeeId,
  isChair,
  countryCode,
}: {
  committeeId: string;
  isChair: boolean;
  countryCode?: string;
}) => {
  return jwt.sign({ committeeId, isChair, countryCode }, secret, {
    expiresIn: "1d",
    algorithm: "HS256",
  });
};

export const verifySessionToken = async (token: string) => {
  return jwt.verify(token, secret) as SessionTokenPayload;
};
