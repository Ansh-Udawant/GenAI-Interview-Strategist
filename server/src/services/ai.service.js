import { GoogleGenAI } from "@google/genai";
import puppeteer from "puppeteer";
import { z } from "zod";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const ai = new GoogleGenAI({ apiKey: env.GOOGLE_GENAI_API_KEY });

const technicalQuestionSchema = z.object({
  question: z.string().describe("The interview question"),
  intention: z.string().describe("Why the interviewer is asking this question"),
  answerFormat: z.string().describe("How the candidate should structure their response"),
  sampleAnswer: z.string().describe("A high-scoring sample answer"),
  topic: z.string().describe("The core technical skill or topic area evaluated")
});

const behavioralQuestionSchema = z.object({
  question: z.string().describe("The behavioral scenario question"),
  intention: z.string().describe("What competency or soft skill is being evaluated"),
  starBreakdown: z.object({
    situation: z.string().describe("Setting the context"),
    task: z.string().describe("The challenge or goal"),
    action: z.string().describe("Specific actions taken by the candidate"),
    result: z.string().describe("Quantifiable outcome and learnings")
  })
});

const interviewReportSchema = z.object({
  title: z.string().describe("A descriptive title for this interview preparation report"),
  companyProfile: z.string().describe("Overview of the target role, expected tech stack, and evaluation focus"),
  technicalQuestions: z.array(technicalQuestionSchema).describe("Tailored technical questions covering core requirements"),
  behavioralQuestions: z.array(behavioralQuestionSchema).describe("STAR-format behavioral questions tailored to past experience"),
  preparationStrategy: z.array(z.string()).describe("Actionable preparation tips for the 24-48 hours before the interview")
});

const resumePdfSchema = z.object({
  html: z.string().describe("Complete, beautiful HTML page with inline CSS tailored for A4 PDF printing")
});

/**
 * Generates structured technical and behavioral interview preparation report using Google Gemini AI.
 *
 * @param {Object} params
 * @param {string} params.resume - Extracted text content from resume or candidate overview.
 * @param {string} params.selfDescription - Candidate's self-written background and goals.
 * @param {string} params.jobDescription - Target job posting details.
 * @returns {Promise<Object>} Validated report matching interviewReportSchema.
 */
export async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

  console.log("Generating interview report via Gemini AI...");
  const prompt = `generate an interview report for candidate with the following details:
  Resume: ${resume}
  Self Description: ${selfDescription}
  Job Description: ${jobDescription}
  `;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: z.toJSONSchema(interviewReportSchema)
      }
    });

    const parsedReport = JSON.parse(res.text);
    return parsedReport;
  } catch (error) {
    console.error("AI Report Generation Error:", error);
    throw new ApiError(500, "Failed to generate interview report from AI: " + error.message);
  }
}

/**
 * Renders HTML string into an A4 PDF Buffer using headless Puppeteer.
 *
 * @param {Object} params
 * @param {string} params.html - Complete HTML string containing CSS styles.
 * @returns {Promise<Buffer>} Binary PDF buffer.
 */
export async function generatePdfFromHtml({ html }) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
  });
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.4in",
        right: "0.4in",
        bottom: "0.4in",
        left: "0.4in"
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Generates an ATS-optimized, modern A4 Resume PDF based on user background, target role, and past experience.
 *
 * @param {Object} params
 * @param {string} params.resume - Raw resume or background notes.
 * @param {string} params.selfDescription - Candidate summary.
 * @param {string} params.jobDescription - Target job requirements.
 * @returns {Promise<Buffer>} Binary A4 PDF Buffer.
 */
export async function generateResumePDF({ resume, selfDescription, jobDescription }) {
  console.log("Generating tailored resume PDF via Gemini AI...");

  const prompt = `You are an expert ATS resume writer and professional designer. Generate a complete, elegant, and highly professional HTML resume with inline CSS for a candidate targeting the following job position.

Candidate Resume / Notes:
${resume}

Candidate Background & Self Description:
${selfDescription}

Target Job Description:
${jobDescription}

HTML & CSS Requirements:
- Return ONLY a JSON object matching the schema with the 'html' field containing valid HTML5 markup (\`<!DOCTYPE html><html>...\`).
- Design, Border & Spacing Guidelines:
  - MUST fit perfectly onto a SINGLE A4 page. Adjust font-sizes, line-heights, and vertical margins to ensure all content fits without creating a second page or large white gaps.
  - DO NOT use outer card containers, border outlines, box shadows, grey page margins, or nested background cards. The entire document body must be flat, pure white (#ffffff) with black/dark-gray text.
  - Set the CSS print margins: use \`@page { size: A4; margin: 0; }\` and \`body { margin: 0; padding: 0.5in; font-family: Arial, Helvetica, sans-serif; box-sizing: border-box; background: #ffffff; }\`.
  - MUST be a single-column layout (NO multi-columns, NO sidebars, NO tables).
  - HYPERLINKS & URLs FORMATTING REQUIREMENT:
    * All contact links (Email, LinkedIn, GitHub profile) MUST be wrapped in <a> tags and styled in vibrant blue color (#2563eb).
    * For Projects: Each link (GitHub link and Live Demo link) MUST be placed on its own separate NEXT LINE (using <div> or <br/>). DO NOT put GitHub and Live links side-by-side on the same line!
    * DO NOT turn the word 'GitHub' or 'Live' into a link button! Output the bold label followed by the FULL actual URL string in blue color (#2563eb).
      Example format:
      <div><strong>GitHub:</strong> <a href="https://github.com/User/Repo" style="color: #2563eb; text-decoration: underline;">https://github.com/User/Repo</a></div>
      <div><strong>Live:</strong> <a href="https://app.vercel.app" style="color: #2563eb; text-decoration: underline;">https://app.vercel.app</a></div>
  - Typography & Sizing:
    * Name: 20px - 22px (Bold, centered or left-aligned)
    * Job Title: 14px (Centered or left-aligned, muted gray)
    * Contact info: 10px - 11px (Centered or left-aligned, inline separated by pipes '|' or bullet dots, with all links in blue #2563eb)
    * Section headings: 12px - 13px (Bold, Uppercase, with a thin bottom border: border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-top: 15px; margin-bottom: 8px)
    * Body text & bullet points: 10px - 11px (line-height: 1.3, list margins: 3px)
  - Apply \`page-break-inside: avoid; break-inside: avoid;\` to each individual section block (e.g. .experience-item, .project-item) to prevent weird section splitting.
  - Use bullet points for experience and project tasks.
`;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: z.toJSONSchema(resumePdfSchema)
      }
    });

    const parsedReport = JSON.parse(res.text);
    let html = parsedReport.html || "";

    // Post-process HTML to expand shortened anchor links like <a href="URL">GitHub</a> into full URL blocks on separate lines
    html = html.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(GitHub|Live|Live Demo)<\/a>/gi, (match, url, text) => {
      return `<div style="margin-top: 2px;"><strong>${text}:</strong> <a href="${url}" style="color: #2563eb; text-decoration: underline;">${url}</a></div>`;
    });

    // Ensure GitHub and Live links on the same line get split onto separate lines with <br/>
    html = html.replace(/(<strong>(?:GitHub|Live|Live Demo):<\/strong>\s*<a[^>]*>[^<]+<\/a>)\s*(?:\||&nbsp;|\s)+\s*(<strong>(?:Live|Live Demo|GitHub):<\/strong>\s*<a[^>]*>[^<]+<\/a>)/gi, "$1<br/>$2");

    // Inject blue link styling guarantee
    const blueLinkStyle = `<style>a, a:visited, a:hover, a:active { color: #2563eb !important; text-decoration: underline !important; font-weight: 500; word-break: break-all; }</style>`;
    if (html.includes("</head>")) {
      html = html.replace("</head>", `${blueLinkStyle}</head>`);
    } else {
      html = blueLinkStyle + html;
    }

    const pdfBuffer = await generatePdfFromHtml({ html });
    return pdfBuffer;
  } catch (error) {
    console.error("AI Resume PDF Generation Error:", error);
    throw new ApiError(500, "Failed to generate resume PDF: " + error.message);
  }
}
