import { CookiesProvider } from "react-cookie";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./index.css";
const el = document.getElementById("root");
if (el) {
  const root = createRoot(el);
  root.render(
    // <React.StrictMode>
    <CookiesProvider>
      <App />
    </CookiesProvider>
    // </React.StrictMode>
  );
} else {
  throw new Error("Could not find root element");
}
