# 🎯 GenAI Interview Strategist

> An AI-powered full-stack career preparation platform designed to help job seekers master technical and behavioral interviews through personalized strategy reports, skill gap analysis, and ATS-optimized PDF resumes.

**GenAI Interview Strategist** is an intelligent web application built for candidates, job seekers, and developers preparing for technical roles. By analyzing target job descriptions against candidate resumes and self-descriptions using **Google Gemini AI**, the application eliminates guess-work in interview preparation by delivering role-specific technical questions, STAR behavioral frameworks, prioritized skill gap matrices, 5-day preparation roadmaps, and downloadable ATS-compliant PDF resumes.

---

## 🚀 Live Demo & Repository

- **GitHub Repository**: [https://github.com/Ansh-Udawant/GenAI-Interview-Strategist](https://github.com/Ansh-Udawant/GenAI-Interview-Strategist)
- **Live Application Demo**: `https://genai-interview-strategist.vercel.app` *(Replace with your live production URL if deployed)*

---

## 📸 Project Preview

Visual walkthrough of the key user flows and features in **GenAI Interview Strategist**:

### 1. Home Screen (Dark Mode)
![Home Screen - Dark Mode](./Images/1.Home%20Screen.png)
*Hero section and feature highlights in default dark mode, presenting core AI interview preparation features including Resume ATS Parsing, Technical Questions, STAR Behavioral Method, and 5-Day Action Plan.*

---

### 2. Home Screen (Light Mode)
![Home Screen - Light Mode](./Images/2.%20Home%20Screen%20Light%20Mode.png)
*Landing page rendered in light mode, demonstrating seamless dark/light theme customizability across the application.*

---

### 3. Account Registration
![Sign Up Page](./Images/3.%20Sign%20up%20Page.png)
*Account creation modal requesting Username, Email, and Password with frontend and backend Zod schema validation.*

---

### 4. Account Login
![Log In Page](./Images/4.%20Log%20in%20Page.png)
*User login screen supporting credential authentication, password recovery option, and theme controls.*

---

### 5. Two-Factor Authentication (OTP Verification)
![OTP Verification Screen](./Images/5.%20OTP%20Screen.png)
*6-digit email OTP verification screen prompting users for two-factor authentication, complete with an active 45-second resend countdown timer.*

---

### 6. Transactional Verification Email
![Login Email Notification](./Images/6.%20Login%20Mail%20Page.png)
*Inbox preview of the transactional verification email template sent via Brevo / Nodemailer containing the secure 6-digit login verification code.*

---

### 7. Strategy Creation Dashboard
![Strategy Dashboard](./Images/7.%20Dashboard.png)
*Main dashboard allowing candidates to paste job descriptions (up to 5,000 chars), upload resume files (PDF/DOCX) for text extraction, provide self-descriptions, generate strategy plans, and manage saved report history.*

---

### 8. AI Strategy Report & Match Analytics
![Detailed Strategy Report](./Images/8.%20Report.png)
*Comprehensive strategy report displaying candidate fit score gauge (25% match), identified skill gap priority matrix (High/Medium/Low tags), technical questions, interviewer intentions, and STAR-formatted behavioral responses.*

---

### 9. Generated ATS Resume PDF Export
![ATS Resume Export](./Images/9.%20Resume%20PDF.png)
*Sample downloadable ATS-optimized PDF resume generated dynamically on the backend using Puppeteer based on candidate experience and AI analysis.*

---

### 10. Multi-Device Session Revocation
![Logout All Devices Confirmation](./Images/10.%20LogoutAll.png)
*Security confirmation prompt allowing users to invalidate active JWT refresh sessions across all logged-in devices.*

---

## ✨ Key Features

### 🔐 Security & Authentication
- **Two-Factor Authentication (2FA)**: Mandatory 6-digit OTP verification sent via email for both account registration and user login.
- **Dual JWT Token Architecture**: Short-lived Access Tokens (15m) + secure HttpOnly Refresh Tokens (7d).
- **Refresh Token Rotation & Reuse Detection**: Automatic detection of token replay attacks; instantly revokes all active sessions for the user if a revoked refresh token is replayed.
- **Multi-Device Session Invalidation**: User option to log out from all active device sessions (`Logout All`).
- **OTP Cooldown & Brute-Force Rate Limiting**: 45-second resend cooldown timer, 3 maximum OTP validation attempts, and `express-rate-limit` middleware on auth endpoints.
- **Password Security**: Password hashing using `bcryptjs` (10 salt rounds) and single-use password reset authorization tokens.

### 🤖 AI Strategy & Resume Engine
- **Google Gemini API Integration**: Uses `@google/genai` with strict Zod JSON schemas (`zod-to-json-schema`) for predictable response parsing.
- **Resilient Model Fallback**: Primary request execution via `gemini-2.5-flash` with automatic fallback to `gemini-3.5-flash-lite` during transient API errors (503, 429, 500).
- **Resume ATS Parsing**: Upload candidate resume PDFs (`multer` memory storage + `pdf-parse`) to automatically extract text for AI analysis.
- **5 Technical Interview Questions**: Includes interviewer intentions and detailed model answer responses.
- **3 STAR Behavioral Questions**: Structured sample responses broken into Situation, Task, Action, and Result.
- **Skill Gap Matrix**: Categorizes missing technical skills by severity level (**High**, **Medium**, **Low**).
- **5-Day Action Plan**: Structured preparation roadmap with daily actionable task checklists.

### 📄 Server-Side PDF Compilation
- **Puppeteer Headless Printing**: Compiles custom HTML/CSS resumes into A4 PDF buffers formatted specifically for ATS scanners.
- **Smart Link Formatting**: Automatically post-processes GitHub and Live project URLs onto individual lines with blue hyperlink styling.

---

## 🛠️ Tech Stack

| Category | Technology | Usage in Project |
|---|---|---|
| **Frontend UI** | React 19, Vite 8 | Single Page Application (SPA) framework |
| **State & Navigation** | Redux Toolkit, React Router v8 | Global authentication state & client routing |
| **Styling** | Tailwind CSS v4, Lucide React | Modern dark/light theme responsive UI |
| **Backend Runtime** | Node.js, Express.js v5 | RESTful API server architecture (ES Modules) |
| **Database & ODM** | MongoDB, Mongoose v9 | Persistence for Users, Pending Users, OTPs, Sessions & Reports |
| **AI Platform** | Google Gemini API (`@google/genai`) | AI interview question & report generation |
| **PDF Generation** | Puppeteer v25 | Server-side HTML to A4 PDF conversion |
| **Email Service** | Nodemailer, Brevo API | Transactional 2FA OTP email dispatch |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` | Access/Refresh JWT token management & password hashing |
| **Validation & Rate Limit**| Zod, `express-rate-limit` | Input validation schemas & rate limiting |

---

## 🏗️ Architecture

The application follows a decoupled client-server architecture with clear separation of concerns:

```text
[ React 19 SPA Frontend ]
       │
       ▼ (HTTP / REST API + Credentials)
[ Express.js v5 REST API Server ]
       ├── Auth Router & Rate Limiter Middleware
       ├── Interview Router & Multer File Upload Middleware
       │
       ├──► [ Mongoose ODM ] ────► [ MongoDB Database ]
       │
       ├──► [ Auth Service ] ─────► [ Brevo Email API / Nodemailer ]
       │
       ├──► [ AI Service ] ───────► [ Google Gemini AI API ]
       │
       └──► [ PDF Engine ] ───────► [ Puppeteer Headless Chrome ]
```

---

## 🔐 Authentication & Security Flow

### 1. Account Registration Flow
```text
User Submits Registration Form
       │
       ▼
Input Validation via Zod Schema (`registerSchema`)
       │
       ▼
Check Existing User in MongoDB (`userModel`)
       │
       ▼
Hash Password (`bcryptjs`) & Generate 6-Digit OTP (`generateOTP`)
       │
       ▼
Store Pending Registration in MongoDB (`pendingUserModel`)
       │
       ▼
Send Verification Email via Brevo API (`sendVerificationEmail`)
       │
       ▼
User Submits OTP ──► Verify OTP Hash ──► Create Active User Record (`userModel`) & Issue JWTs
```

### 2. Two-Factor Authentication (2FA) Login & Token Refresh Flow
```text
Login Request (Email & Password)
       │
       ▼
Verify Credentials (`bcrypt.compare`)
       │
       ▼
Generate 6-Digit OTP ──► Save in `otpRequestModel` ──► Dispatch Email (`sendLoginOTPEmail`)
       │
       ▼
User Submits OTP (`verifyLoginOTP`)
       │
       ▼
Issue Access Token (15m in Header) & Refresh Token (7d in HttpOnly Cookie)
       │
       ▼
Create Refresh Session Record in MongoDB (`refreshSessionModel` with SHA-256 Token Hash)
```

### 3. Refresh Token Rotation & Token Reuse Detection
```text
Client Requests `/api/auth/refresh`
       │
       ▼
Verify Refresh Token Signature & SHA-256 Hash in `refreshSessionModel`
       │
       ├──► IF Session Missing or Already Revoked:
       │      🚨 REUSE DETECTED! Instantly revoke ALL sessions for user & return 401.
       │
       └──► IF Session Valid:
              Revoke current session ──► Issue new Access & Refresh Token pair.
```

---

## 📂 Project Structure

```text
GenAI-Interview-Strategist/
├── client/                      # React 19 Frontend
│   ├── public/                  # Public static assets
│   ├── src/
│   │   ├── components/          # Navigation, Modals, Cards
│   │   ├── pages/               # Home, Login, Register, Dashboard, Report, OTP
│   │   ├── redux/               # authSlice, themeSlice, store configuration
│   │   ├── services/            # Axios instance with credentials
│   │   ├── App.jsx              # Main App component
│   │   ├── app.route.jsx        # Protected & public routing logic
│   │   ├── index.css            # Tailwind CSS rules
│   │   └── main.jsx             # React entry file
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Express v5 Backend
│   ├── src/
│   │   ├── config/              # env.js & Zod env validation
│   │   ├── controllers/         # authController, interviewController
│   │   ├── middlewares/         # authenticate, validate, rateLimiter, error, file
│   │   ├── models/              # User, PendingUser, OtpRequest, RefreshSession, InterviewReport
│   │   ├── routes/              # auth.route.js, interview.route.js
│   │   ├── services/            # ai.service.js, auth.service.js, email.service.js
│   │   ├── utils/               # ApiError, JWT, token hash, OTP generator
│   │   ├── validators/          # Zod request validation schemas
│   │   └── app.js               # Express application configuration
│   ├── .env.example             # Server environment variables template
│   ├── .puppeteerrc.cjs         # Puppeteer deployment configuration
│   ├── package.json
│   └── server.js                # Server entry point & DB connection
│
├── Images/                      # Project visual assets & screenshots
│   └── README.md
├── vercel.json                  # Client SPA deployment rewrites
└── Readme.md                    # Root project README
```

---

## 🔑 Environment Variables

Create a `.env` file in the `server/` root directory using the template below:

```env
# Node Environment & Port
NODE_ENV=development
PORT=3000

# Database Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/genai_interview_db

# JWT Configuration (Minimum 32 Characters)
ACCESS_TOKEN_SECRET=your_access_token_secret_here_min_32_chars
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_refresh_token_secret_here_min_32_chars
REFRESH_TOKEN_EXPIRY=7d

RESET_PASSWORD_SECRET=your_reset_password_secret_here_min_32_chars
RESET_PASSWORD_EXPIRY=15m

# Google Gemini AI Key
GOOGLE_GENAI_API_KEY=your_google_genai_api_key

# Brevo Transactional Email Config (HTTP API / SMTP)
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=genaiinterviewstrategist@gmail.com

# Client Origin URL for CORS
CLIENT_URL=http://localhost:5173
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher installed
- **MongoDB**: Local MongoDB instance or a MongoDB Atlas cloud database
- **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/)
- **Brevo API Key**: Free account key from [Brevo](https://www.brevo.com/) for email delivery

### Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Ansh-Udawant/GenAI-Interview-Strategist.git
   cd GenAI-Interview-Strategist
   ```

2. **Setup Server**:
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in `server/` with your credentials and start the dev server:
   ```bash
   npm run dev
   ```
   *The server will start at `http://localhost:3000`.*

3. **Setup Client**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   *The frontend will start at `http://localhost:5173`.*

---

## ☁️ Deployment

- **Frontend Deployment (Vercel)**:
  The client contains `client/vercel.json` configured with SPA fallback rewrites. Deploy directly to Vercel by selecting the `client` directory as the project root.

- **Backend Deployment (Render / Railway / AWS)**:
  The backend includes `.puppeteerrc.cjs` and a `postinstall` script (`npx puppeteer browsers install chrome`) to ensure Chrome binaries are installed during cloud builds.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
