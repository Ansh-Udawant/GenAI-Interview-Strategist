import crypto from "crypto";

/**
 * Generates a cryptographically secure 6-digit numeric OTP string.
 * @returns {string} 6-digit OTP string
 */
export function generateOTP() {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  return otp;
}
