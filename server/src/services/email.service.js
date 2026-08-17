import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import dns from "dns";

import { env } from "../config/env.js";
import { LoginOTPTemplate } from "../templates/loginOTPTemplate.js";
import { ResetPasswordTemplate } from "../templates/resetPasswordTemplate.js";
import { VerifyEmailTemplate } from "../templates/verifyEmailTemplate.js";

// Force IPv4 DNS resolution for cloud servers (Render / AWS / Railway)
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // Ignore in older environments
}

/**
 * Creates and returns a Nodemailer transporter configured for Gmail OAuth2 or SMTP,
 * or returns null if credentials are not present (enabling dev mock mode).
 *
 * @returns {import("nodemailer").Transporter | null}
 */
function createTransporter() {
  const isGoogleOAuth2Configured = Boolean(
    env.GOOGLE_MAIL_CLIENT_ID &&
    env.GOOGLE_MAIL_CLIENT_SECRET &&
    env.GOOGLE_MAIL_REFRESH_TOKEN &&
    env.GOOGLE_MAIL_USER
  );

  if (isGoogleOAuth2Configured) {
    return nodemailer.createTransport({
      service: "gmail",
      family: 4,
      auth: {
        type: "OAuth2",
        user: env.GOOGLE_MAIL_USER,
        clientId: env.GOOGLE_MAIL_CLIENT_ID,
        clientSecret: env.GOOGLE_MAIL_CLIENT_SECRET,
        refreshToken: env.GOOGLE_MAIL_REFRESH_TOKEN,
      },
    });
  }

  const isSMTPConfigured = Boolean(
    (process.env.SMTP_USER || process.env.GMAIL_USER) &&
    (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD)
  );

  if (isSMTPConfigured) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // STARTTLS
      family: 4,
      auth: {
        user: process.env.SMTP_USER || process.env.GMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  return null; // Dev mock mode fallback
}

const transporter = createTransporter();

/**
 * Sends an email using Nodemailer with a rendered React Email template.
 *
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject line.
 * @param {React.ReactElement} templateElement - React Email template element.
 * @returns {Promise<any>} Sent mail info or void in dev mock mode.
 */
async function sendMail(to, subject, templateElement) {
  try {
    const html = await render(templateElement);

    const from =
      env.SUPPORT_EMAIL ||
      env.GOOGLE_MAIL_USER ||
      process.env.GMAIL_USER ||
      "noreply@genai-strategist.com";

    // Log in development mode if email credentials are not set
    if (!transporter) {
      console.log(`\n📧 [DEV EMAIL MOCK] To: ${to} | Subject: ${subject}`);
      console.log(`📧 HTML preview compiled successfully.\n`);
      return;
    }

    const mailOptions = {
      from,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
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
