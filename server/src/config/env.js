import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { envSchema } from "../validators/env.schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from server root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

let validatedEnv;

try {
  validatedEnv = envSchema.parse(process.env);
} catch (error) {
  console.error("❌ Environment validation failed:");
  if (error.errors) {
    error.errors.forEach((err) => {
      console.error(`   - ${err.path.join(".")}: ${err.message}`);
    });
  } else {
    console.error(error);
  }
  process.exit(1);
}

/**
 * Validated, strongly-typed environment variables object.
 */
export const env = validatedEnv;

