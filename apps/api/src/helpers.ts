import crypto from "crypto";

export function generateSixDigitCode() {
  const randomNumber = crypto.randomInt(0, 1000000); // Generate random number between 0-999999
  const code = randomNumber.toString().padStart(6, "0"); // Convert to string and pad with leading zeros if needed
  return code;
}
