import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api } from "../../services/api";

/**
 * Async thunk verifying current user authentication status.
 */
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/auth/me");
    return response.data.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Not authenticated");
  }
});

/**
 * Async thunk logging in user with email & password and requesting 2FA OTP.
 */
export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post("/api/auth/login", credentials);
    return response.data.message;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

/**
 * Async thunk verifying 2FA login OTP code.
 */
export const verifyLoginOTP = createAsyncThunk("auth/verifyLoginOTP", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("/api/auth/verify-login-otp", payload);
    return response.data.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Invalid OTP");
  }
});

/**
 * Async thunk initiating new user registration.
 */
export const registerUser = createAsyncThunk("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post("/api/auth/register", userData);
    return response.data.message;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Registration failed");
  }
});

/**
 * Async thunk verifying email registration OTP code.
 */
export const verifyEmailOTP = createAsyncThunk("auth/verifyEmailOTP", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("/api/auth/verify-email", payload);
    return response.data.data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Verification failed");
  }
});

/**
 * Async thunk logging out current session.
 */
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    await api.post("/api/auth/logout");
    return null;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Logout failed");
  }
});

/**
 * Async thunk logging out all active sessions across devices.
 */
export const logoutAllDevices = createAsyncThunk("auth/logoutAllDevices", async (_, { rejectWithValue }) => {
  try {
    await api.post("/api/auth/logout-all");
    return null;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Logout all failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true,
    loading: false,
    error: null,
    pendingEmail: "",
    resetToken: null
  },
  reducers: {
    setPendingEmail: (state, action) => {
      state.pendingEmail = action.payload;
    },
    setResetToken: (state, action) => {
      state.resetToken = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isCheckingAuth = false;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isCheckingAuth = false;
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // verifyLoginOTP
      .addCase(verifyLoginOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyLoginOTP.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isCheckingAuth = false;
        state.loading = false;
        state.pendingEmail = "";
      })
      .addCase(verifyLoginOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // verifyEmailOTP
      .addCase(verifyEmailOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailOTP.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isCheckingAuth = false;
        state.loading = false;
        state.pendingEmail = "";
      })
      .addCase(verifyEmailOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // logoutUser / logoutAllDevices
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isCheckingAuth = false;
        state.loading = false;
      })
      .addCase(logoutAllDevices.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isCheckingAuth = false;
        state.loading = false;
      });
  }
});

export const { setPendingEmail, setResetToken, clearError } = authSlice.actions;
export default authSlice.reducer;
