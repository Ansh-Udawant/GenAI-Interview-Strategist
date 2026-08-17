import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/**
 * Configured Axios HTTP client instance with default base configuration and credentials support.
 */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json"
  }
});

let isRefreshing = false;
let failedQueue = [];

/**
 * Resolves or rejects queued request promises waiting for token refresh completion.
 *
 * @param {Error|null} error
 * @param {string|null} [token]
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor for 401 Automatic Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const authUrls = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/verify-email",
      "/api/auth/verify-login-otp",
      "/api/auth/refresh",
      "/api/auth/reset-password",
      "/api/auth/verify-reset-otp"
    ];

    const isAuthUrl = authUrls.some((url) => originalRequest?.url?.includes(url));

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthUrl) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true, timeout: 5000 });
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
