import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.route.js";
import { interviewRouter } from "./routes/interview.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

/**
 * Express application instance configured with global middleware, routes, and error handling.
 */
export const app = express();

// Trust reverse proxy (Render / Cloud platforms) for HTTPS cookie headers
app.set("trust proxy", 1);

// Body Parser & Cookie Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      if (
        cleanOrigin === (env.CLIENT_URL || "").replace(/\/$/, "") ||
        cleanOrigin === "http://localhost:5173" ||
        cleanOrigin === "http://localhost:3000" ||
        cleanOrigin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);

// Application Routes
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

/**
 * Health Check Endpoint
 */
app.get(["/health", "/healthcheck", "/healthz", "/api/health", "/api/healthcheck"], (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);
