// ─────────────────────────────────────────────
//  main.jsx
//  Entry point of the React app
//  This file mounts the App component into index.html
// ─────────────────────────────────────────────

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";   // ← .jsx extension explicitly added (fixes Vite resolve issue)
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
