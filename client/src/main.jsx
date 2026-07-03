import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.jsx";
import "./styles/index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Only use StrictMode in development
if (import.meta.env.DEV) {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
} else {
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}
