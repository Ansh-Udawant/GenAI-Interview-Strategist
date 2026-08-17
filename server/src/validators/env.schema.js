import { z } from "zod";

/**
 * Environment Variables Schema
 * Uses Zod preprocessing for type conversion and default value fallback.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.preprocess(
    (val) => parseInt(val || "3000", 10),
    z.number().positive()
  ),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  
  ACCESS_TOKEN_SECRET: z.string().default("default_access_token_secret_for_dev_min_32_chars_long!"),
  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
  
  REFRESH_TOKEN_SECRET: z.string().default("default_refresh_token_secret_for_dev_min_32_chars_long!"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
  
  RESET_PASSWORD_SECRET: z.string().default("default_reset_password_secret_for_dev_min_32_chars!"),
  RESET_PASSWORD_EXPIRY: z.string().default("15m"),
  
  GOOGLE_GENAI_API_KEY: z.string().optional().default(""),
  
  // Brevo Transactional Email Config
  BREVO_API_KEY: z.string().optional().default(""),
  BREVO_SENDER_EMAIL: z.string().optional().default("genaiinterviewstrategist@gmail.com"),

  GOOGLE_MAIL_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_MAIL_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_MAIL_REFRESH_TOKEN: z.string().optional().default(""),
  GOOGLE_MAIL_USER: z.string().optional().default(""),
  SUPPORT_EMAIL: z.string().optional().default(""),
  CLOUDINARY_URL: z.string().optional().default("https://res.cloudinary.com/rcq9ypim/image/upload/v1786791966/ChatGPT_Image_Aug_15_2026_04_34_12_PM.svg"),
  
  CLIENT_URL: z.string().default("http://localhost:5173")
});
