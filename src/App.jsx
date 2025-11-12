import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import OreosSidebar from "./OreosSidebar.jsx";
import HomePage from "./HomePage.jsx";
import SessionPage from "./SessionPage.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50">
      {/* Left sidebar with history */}
      <OreosSidebar />

      {/* Right side: routed content */}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/session/:sessionId" element={<SessionPage />} />
          {/* fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
