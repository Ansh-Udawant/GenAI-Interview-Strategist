# Project Screenshots & UI Gallery

A curated collection of interface screenshots and visual assets showcasing the **GenAI Interview Strategist** application — a full-stack MERN & Google Gemini AI platform designed to analyze target job descriptions against candidate resumes, generate role-specific interview strategies, compute skill gap matrices, create 5-day action plans, and export ATS-optimized PDF resumes.

---

## 🎨 Landing Page & Theme Customization

Visual overview of the application landing page highlighting core features, value proposition, and dark/light theme support.

### Home Screen (Dark Mode)
![Home Screen - Dark Mode](./1.Home%20Screen.png)
*Landing page hero section displaying core application features including Resume ATS Parsing, Technical Questions, STAR Behavioral Method, and 5-Day Action Plan in dark mode.*

### Home Screen (Light Mode)
![Home Screen - Light Mode](./2.%20Home%20Screen%20Light%20Mode.png)
*Landing page rendered in light mode, demonstrating seamless theme customization across the interface.*

---

## 🔐 User Authentication & Security Workflow

Step-by-step authentication flow including account registration, secure login, Two-Factor Authentication (2FA), and email verification.

### Account Registration
![Sign Up Page](./3.%20Sign%20up%20Page.png)
*User registration page with input fields for Username, Email, and Password.*

### Account Login
![Log In Page](./4.%20Log%20in%20Page.png)
*User login screen supporting JWT-based authentication, password recovery, and theme controls.*

### Two-Factor Authentication (OTP Verification)
![OTP Verification Screen](./5.%20OTP%20Screen.png)
*2FA verification interface prompting for a 6-digit email OTP with an active resend countdown timer.*

### Automated Verification Email
![Login Email Notification](./6.%20Login%20Mail%20Page.png)
*Transactional email template delivered via Brevo / Nodemailer containing the secure 6-digit login verification code.*

---

## 📊 Strategy Dashboard & Preparation Workflow

Main dashboard where users submit job descriptions and candidate profiles to trigger AI analysis.

### Strategy Creation Dashboard
![Strategy Dashboard](./7.%20Dashboard.png)
*Main dashboard allowing users to input job descriptions (up to 5,000 chars), upload PDF resumes for ATS text extraction, provide self-descriptions, generate strategy plans, and manage saved report history.*

---

## 📈 AI Analysis & Generated Exports

AI-generated interview strategy reports and server-side Puppeteer PDF exports.

### AI Strategy Report & Match Analytics
![Detailed Strategy Report](./8.%20Report.png)
*Comprehensive strategy report screen displaying Profile Fit Match Score gauge (25% match), identified skill gaps (High/Medium/Low priority tags), interviewer intentions, STAR-formatted behavioral responses, and tabbed 5-day preparation checklists.*

### Generated ATS Resume PDF
![ATS Resume Export](./9.%20Resume%20PDF.png)
*Sample downloadable ATS-compliant resume generated dynamically on the backend using Puppeteer.*

---

## 🛡️ Session & Account Security

Active session management controls across devices.

### Multi-Device Session Revocation
![Logout All Devices Confirmation](./10.%20LogoutAll.png)
*Confirmation modal prompting users before invalidating and logging out active sessions across all connected devices.*
