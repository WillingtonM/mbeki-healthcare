import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupGlobalErrorHandler } from "./lib/error-handler";

// Set up global error handling for automatic error reporting
setupGlobalErrorHandler();

createRoot(document.getElementById("root")!).render(<App />);
