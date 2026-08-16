import { Router } from "express";

import { authenticate } from "../middlewares/authenticate.middleware.js";
import { upload } from "../middlewares/file.middleware.js";
import * as interviewController from "../controllers/interview.controller.js";

/**
 * Router handling AI interview report generation, retrieval, and ATS resume PDF exports.
 */
export const interviewRouter = Router();

// Generate new interview report
interviewRouter.post("/", authenticate, upload.single("resume"), interviewController.createReport);

// Get all reports for user
interviewRouter.get("/", authenticate, interviewController.getReports);

// Get single report by ID
interviewRouter.get("/report/:interviewId", authenticate, interviewController.getReport);

// Download ATS Resume PDF
interviewRouter.post("/resume-pdf/:interviewId", authenticate, interviewController.downloadResumePdf);

