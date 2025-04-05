import crypto from "crypto";
const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export function generateSixDigitCode() {
  let code = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, charset.length); // Generate random index
    code += charset[randomIndex]; // Append corresponding character to the code
  }

  return code;
}
