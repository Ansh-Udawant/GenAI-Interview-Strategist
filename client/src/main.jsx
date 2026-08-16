import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App.jsx";
import { ThemeProvider } from "./components/common/ThemeContext";
import { store } from "./redux/store";
import "./index.css";

/**
 * Application Entry Point.
 * Mounts Redux Provider, ThemeProvider, and Root App component.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

