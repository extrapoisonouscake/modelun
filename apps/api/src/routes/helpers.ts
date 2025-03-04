import * as jose from "jose";
import { v4 as uuidv4 } from "uuid";
export const generateSessionToken = async (committeeId: string) => {
  return await new jose.SignJWT({
    committeeId,
    id: uuidv4(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
};
