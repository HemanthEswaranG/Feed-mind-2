import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Providers } from "@/app/providers";
import App from "./App";
import "@/app/globals.css";

type ErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};

class AppErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || "Unknown runtime error",
    };
  }

  componentDidCatch(error: Error) {
    console.error("App crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            background: "#0b1020",
            color: "#e5e7eb",
            fontFamily: "ui-sans-serif, system-ui, -apple-system",
          }}
        >
          <div style={{ maxWidth: "760px", width: "100%", background: "#111827", border: "1px solid #374151", borderRadius: "12px", padding: "20px" }}>
            <h1 style={{ margin: 0, fontSize: "20px" }}>Frontend Runtime Error</h1>
            <p style={{ marginTop: "10px", color: "#9ca3af" }}>
              The app hit an exception while rendering. See browser console for stack trace.
            </p>
            <pre style={{ marginTop: "12px", whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#0f172a", padding: "12px", borderRadius: "8px", border: "1px solid #334155" }}>
              {this.state.errorMessage}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <Providers>
          <App />
        </Providers>
      </BrowserRouter>
    </AppErrorBoundary>
  </React.StrictMode>
);
