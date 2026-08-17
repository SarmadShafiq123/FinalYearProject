import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#18181b",
            color: "#ffffff",
            border: "1px solid #27272a",
            borderRadius: "10px",
            fontSize: "14px",
            padding: "12px 16px",
            maxWidth: "380px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#18181b",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#18181b",
            },
          },
        }}
      />
    </GoogleOAuthProvider>
  </StrictMode>
);
