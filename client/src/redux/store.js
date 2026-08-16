import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import interviewReducer from "./slices/interviewSlice";

/**
 * Global Redux Toolkit Store configured with auth and interview slices.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    interview: interviewReducer
  }
});

