import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppRoutes } from "./providers/app-routes";
import { QueryProvider } from "./providers/query-provider";

const el = document.getElementById("root");
if (el) {
  const root = createRoot(el);
  root.render(
    <React.StrictMode>
      <QueryProvider>
        <AppRoutes />
      </QueryProvider>
    </React.StrictMode>
  );
} else {
  throw new Error("Could not find root element");
}
