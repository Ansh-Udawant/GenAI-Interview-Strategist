import React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Img
} from "@react-email/components";
import { env } from "../config/env.js";

const logoUrl = env.CLOUDINARY_URL || "https://res.cloudinary.com/rcq9ypim/image/upload/v1786791966/ChatGPT_Image_Aug_15_2026_04_34_12_PM.svg";

/**
 * React Email Template for 2FA Login Verification OTP.
 *
 * @param {Object} props
 * @param {string} [props.username]
 * @param {string} props.otp
 * @returns {React.ReactElement}
 */
export function LoginOTPTemplate({ username, otp }) {

  return React.createElement(
    Html,
    null,
    React.createElement(Head, null),
    React.createElement(
      Body,
      { style: { fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f5", padding: "20px" } },
      React.createElement(
        Container,
        { style: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "32px", maxWidth: "480px", margin: "0 auto", border: "1px solid #e4e4e7", textAlign: "center" } },
        React.createElement(
          "div",
          { style: { backgroundColor: "#09090b", border: "1px solid #27272a", padding: "8px", borderRadius: "14px", display: "inline-block", margin: "0 auto 16px", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" } },
          React.createElement(Img, { src: logoUrl, width: "64", height: "64", alt: "GenAI Logo", style: { display: "block", borderRadius: "10px" } })
        ),
        React.createElement(Heading, { style: { color: "#18181b", fontSize: "20px", marginBottom: "16px" } }, "Login Verification Code"),
        React.createElement(Text, { style: { color: "#3f3f46", fontSize: "14px", lineHeight: "20px", textAlign: "left" } }, `Hello ${username || "User"},`),
        React.createElement(Text, { style: { color: "#3f3f46", fontSize: "14px", lineHeight: "20px", textAlign: "left" } }, "Use the 6-digit code below to complete your login to GenAI Interview Strategist:"),
        React.createElement(
          Section,
          { style: { backgroundColor: "#f4f4f5", borderRadius: "8px", padding: "16px", textAlign: "center", margin: "24px 0" } },
          React.createElement(Text, { style: { fontSize: "32px", fontWeight: "bold", letterSpacing: "6px", color: "#18181b", margin: 0 } }, otp)
        ),
        React.createElement(Text, { style: { color: "#71717a", fontSize: "12px", textAlign: "center" } }, "This OTP is valid for 5 minutes. If you did not attempt to log in, please secure your account immediately.")
      )
    )
  );
}
