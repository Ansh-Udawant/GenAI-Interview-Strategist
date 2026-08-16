import { GoogleGenAI } from "@google/genai";
import puppeteer from "puppeteer";
import { z } from "zod";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const ai = new GoogleGenAI({
  apiKey: env.GOOGLE_GENAI_API_KEY
});

// Zod schema defining the expected structured JSON response from Gemini for interview reports
const interviewReportSchema = z.object({
  matchScore: z.number().describe("A score between 0 to 100 indicating how well the candidate's profile matches the job description"),
  
  technicalQuestions: z.array(z.object({
    question: z.string().describe("The technical questions asked in the interview"),
    intention: z.string().describe("The intention of the interviewer behind asking this question"),
    answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
  })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),

  behavioralQuestion: z.array(z.object({
    question: z.string().describe("The behavioral questions asked in the interview"),
    intention: z.string().describe("The intention of the interviewer behind asking this question"),
    answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
  })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),

  skillGaps: z.array(z.object({
    skill: z.string().describe("The skill which the candidate is lacking"),
    severity: z.enum(["low", "medium", "high"]).describe("The severity of the skill gap, i.e., how important is the skill for the job")
  })).describe("List of skill gaps in the candidate's profile along with their severity"),

  preparationPlan: z.array(z.object({
    day: z.number().describe("The day number in the preparation plan, starting from 1"),
    focus: z.string().describe("The main focus of this day in the preparation plan, e.g., data structures, system design, mock interview"),
    task: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan")
  })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
  title: z.string().describe("The title of the job for which interview report is being generated")
});

/**
 * Generates structured interview report using Gemini AI based on candidate resume and target job description.
 *
 * @param {Object} params
 * @param {string} [params.resume] - Extracted text content of candidate's resume PDF.
 * @param {string} [params.selfDescription] - Optional self-description text.
 * @param {string} params.jobDescription - Target job description text.
 * @returns {Promise<Object>} Parsed interview report object matching interviewReportSchema.
 * @throws {ApiError} When AI generation fails.
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
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "0",
      bottom: "0",
      left: "0",
      right: "0"
    }
  });
  await browser.close();
  return pdfBuffer;
}

/**
 * Generates an ATS-optimized, single-page resume HTML using Gemini AI and renders it to PDF via Puppeteer.
 *
 * @param {Object} params
 * @param {string} [params.resume] - Existing resume text.
 * @param {string} [params.selfDescription] - Candidate's self-description.
 * @param {string} params.jobDescription - Target job description.
 * @returns {Promise<Buffer>} Generated resume PDF binary buffer.
 * @throws {ApiError} When ATS resume generation fails.
 */
export async function generateResumePDF({ resume, selfDescription, jobDescription }) {

  const resumePdfSchema = z.object({
    html: z.string().describe("html content of the resume which can be converted to pdf using puppeteer")
  });

  const prompt = `Generate a highly professional, clean, and ATS-friendly (Applicant Tracking System compatible) resume in HTML format.
  Use embedded CSS within a <style> tag to style the resume.
  
  Design, Border & Spacing Guidelines:
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
  
  Candidate Details:
  Resume Context: ${resume}
  Self Description: ${selfDescription}
  Target Job Description: ${jobDescription}

  The response MUST be a JSON object with a single key 'html' containing the complete raw HTML code.
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
