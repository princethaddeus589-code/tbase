import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";
import "./styles.css";
createRoot(document.getElementById("root")).render(
  <AuthProvider><PlayerProvider><App /></PlayerProvider></AuthProvider>
);
