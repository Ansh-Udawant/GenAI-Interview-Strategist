import { render } from "@react-email/render";

import { env } from "../config/env.js";
import { LoginOTPTemplate } from "../templates/loginOTPTemplate.js";
import { ResetPasswordTemplate } from "../templates/resetPasswordTemplate.js";
import { VerifyEmailTemplate } from "../templates/verifyEmailTemplate.js";

/**
 * Sends a transactional email using Brevo's HTTP API with a rendered React Email template.
 *
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject line.
 * @param {React.ReactElement} templateElement - React Email template element.
 * @returns {Promise<any>} Sent mail info or void in dev mock mode.
 */
async function sendMail(to, subject, templateElement) {
  try {
    const html = await render(templateElement);

    // Log in development mode if Brevo API Key is not set
    if (!env.BREVO_API_KEY) {
      console.log(`\n📧 [DEV EMAIL MOCK] To: ${to} | Subject: ${subject}`);
      console.log(`📧 HTML preview compiled successfully.\n`);
      return;
    }

    const senderEmail = env.BREVO_SENDER_EMAIL || "genaiinterviewstrategist@gmail.com";

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: "GenAI Interview Strategist",
          email: senderEmail
        },
        to: [
          {
            email: to
          }
        ],
        subject,
        htmlContent: html
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Brevo HTTP API returned status ${response.status}: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log(`✉️ Email sent via Brevo HTTP API to ${to}: ${result.messageId || "success"}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send email via Brevo HTTP API to ${to}:`, error.message || error);
    if (env.NODE_ENV === "development") {
      console.warn("⚠️ Continuing in dev mode despite email send failure.");
    } else {
      throw error;
    }
  }
}

/**
 * Sends Email Verification OTP.
 *
 * @param {string} email
 * @param {string} username
 * @param {string} otp
 */
export async function sendVerificationEmail(email, username, otp) {
  return sendMail(
    email,
    "Verify your email - GenAI Interview Strategist",
    VerifyEmailTemplate({ username, otp })
  );
}

/**
 * Sends 2FA Login Verification OTP.
 *
 * @param {string} email
 * @param {string} username
 * @param {string} otp
 */
export async function sendLoginOTPEmail(email, username, otp) {
  return sendMail(
    email,
    "Your Login Code - GenAI Interview Strategist",
    LoginOTPTemplate({ username, otp })
  );
}

/**
 * Sends Password Reset OTP.
 *
 * @param {string} email
 * @param {string} username
 * @param {string} otp
 */
export async function sendResetPasswordEmail(email, username, otp) {
  return sendMail(
    email,
    "Password Reset Request - GenAI Interview Strategist",
    ResetPasswordTemplate({ username, otp })
  );
}
