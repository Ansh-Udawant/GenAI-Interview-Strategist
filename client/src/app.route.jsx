import { createBrowserRouter, Navigate } from "react-router";

import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import InterviewDetail from "./pages/InterviewDetail";
import Login from "./pages/Login";
import LoginOTP from "./pages/LoginOTP";
import Register from "./pages/Register";
import ResetOTP from "./pages/ResetOTP";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmailOTP from "./pages/VerifyEmailOTP";

/**
 * Client-side React Router configuration mapping application paths to page components.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/login-otp",
    element: <LoginOTP />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/verify-email-otp",
    element: <VerifyEmailOTP />
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />
  },
  {
    path: "/reset-otp",
    element: <ResetOTP />
  },
  {
    path: "/reset-password",
    element: <ResetPassword />
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  {
    path: "/interview/:interviewID",
    element: (
      <ProtectedRoute>
        <InterviewDetail />
      </ProtectedRoute>
    )
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);