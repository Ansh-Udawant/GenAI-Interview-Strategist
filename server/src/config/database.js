import mongoose from "mongoose";

import { env } from "./env.js";

/**
 * Connects to MongoDB database instance using Mongoose.
 * Logs connection success or terminates process on connection failure.
 *
 * @returns {Promise<void>}
 */

export async function connectToDB() {

  try {

    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

