import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { LibraryProvider } from "./context/LibraryContext";
import { PlayerProvider } from "./context/PlayerContext";
import "./styles.css";
createRoot(document.getElementById("root")).render(
  <AuthProvider><LibraryProvider><PlayerProvider><App /></PlayerProvider></LibraryProvider></AuthProvider>
);
