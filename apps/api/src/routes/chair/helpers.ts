import { randomBytes, scryptSync } from "crypto";

const encryptString = (password: string, salt: string) => {
  return scryptSync(password, salt, 32).toString("hex");
};
export const hashString = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  return encryptString(password, salt) + salt;
};
export const matchString = (password: string, hash: string) => {
  const salt = hash.slice(64);
  const originalPassHash = hash.slice(0, 64);
  const currentPassHash = encryptString(password, salt);
  return originalPassHash === currentPassHash;
};
