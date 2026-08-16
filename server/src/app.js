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

// Body Parser & Cookie Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// CORS Configuration
app.use(
  cors({
    origin: [env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"],
    credentials: true
  })
);

// Application Routes
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

/**
 * Health Check Endpoint
 */
app.get(["/health", "/healthcheck", "/api/health", "/api/healthcheck"], (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

