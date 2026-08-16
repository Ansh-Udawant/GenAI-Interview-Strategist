import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api } from "../../services/api";

/**
 * Async thunk fetching all interview report summaries for logged in user.
 */
export const fetchReports = createAsyncThunk("interview/fetchReports", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/interview");
    return response.data.data.interViewReport;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch reports");
  }
});

/**
 * Async thunk fetching full interview report by ID.
 */
export const fetchReportById = createAsyncThunk("interview/fetchReportById", async (interviewId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response.data.data.interViewReport;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Report not found");
  }
});

/**
 * Async thunk creating new AI interview report from multipart FormData.
 */
export const createInterviewReport = createAsyncThunk("interview/createInterviewReport", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post("/api/interview", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data.data.interViewReport;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to generate report");
  }
});


const interviewSlice = createSlice({
  name: "interview",
  initialState: {
    reports: [],
    currentReport: null,
    loading: false,
    error: null
  },
  reducers: {
    clearCurrentReport: (state) => {
      state.currentReport = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchReports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reports = action.payload;
        state.loading = false;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchReportById
      .addCase(fetchReportById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.currentReport = action.payload;
        state.loading = false;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createInterviewReport
      .addCase(createInterviewReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInterviewReport.fulfilled, (state, action) => {
        state.currentReport = action.payload;
        state.reports = [action.payload, ...state.reports];
        state.loading = false;
      })
      .addCase(createInterviewReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentReport } = interviewSlice.actions;
export default interviewSlice.reducer;
