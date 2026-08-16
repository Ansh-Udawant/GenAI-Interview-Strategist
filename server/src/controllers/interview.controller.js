import { PDFParse } from "pdf-parse";

import { generateInterviewReport, generateResumePDF } from "../services/ai.service.js";
import { interviewReportModel } from "../models/interviewReport.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Creates a new AI interview report based on job description, self description, and uploaded resume.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function createReport(req, res, next) {
  try {
    const { selfDescription, jobDescription } = req.body;

    if (!jobDescription) {
      throw new ApiError(400, "Please provide a job description");
    }

    let resumeContent = "";
    if (req.file) {
      const parser = new PDFParse({ data: req.file.buffer });
      const pdfTextResult = await parser.getText();
      resumeContent = pdfTextResult.text;
    }

    if (!req.file && (!selfDescription || !selfDescription.trim())) {
      throw new ApiError(400, "Please upload a resume PDF or provide a self-description");
    }

    const interViewReportByAi = await generateInterviewReport({
      resume: resumeContent,
      selfDescription: selfDescription || "",
      jobDescription
    });

    const interViewReport = await interviewReportModel.create({
      user: req.user._id,
      resume: resumeContent,
      selfDescription,
      jobDescription,
      ...interViewReportByAi
    });

    res.status(201).json(new ApiResponse(201, { interViewReport }, "Interview report generated successfully"));
  } catch (error) {
    next(error);
  }
}

/**
 * Fetches a single interview report by ID for the logged in user.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function getReport(req, res, next) {
  try {
    const { interviewId } = req.params;
    const interViewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user._id });

    if (!interViewReport) {
      throw new ApiError(404, "Interview report not found");
    }

    res.status(200).json(new ApiResponse(200, { interViewReport }, "Interview report fetched successfully"));
  } catch (error) {
    next(error);
  }
}

/**
 * Fetches all interview report summaries for the logged in user.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function getReports(req, res, next) {
  try {
    const interViewReport = await interviewReportModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-resume -selfDescription -jobDescription -technicalQuestions -behavioralQuestion -__v -skillGaps -preparationPlan");

    res.status(200).json(new ApiResponse(200, { interViewReport }, "Interview reports fetched successfully"));
  } catch (error) {
    next(error);
  }
}

/**
 * Generates and downloads ATS Resume PDF for a specific interview report.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function downloadResumePdf(req, res, next) {
  try {
    const { interviewId } = req.params;
    const interViewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user._id });

    if (!interViewReport) {
      throw new ApiError(404, "Interview report not found");
    }

    const { resume, jobDescription, selfDescription } = interViewReport;
    const pdfBuffer = await generateResumePDF({ resume, jobDescription, selfDescription });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interViewReport.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
    });

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

