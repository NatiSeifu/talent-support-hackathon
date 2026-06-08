"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import HiringSpec from "@/components/HiringSpec";
import KnowledgeCapture from "@/components/KnowledgeCapture";
import Onboarding from "@/components/Onboarding";

export type View = "dashboard" | "hiring" | "capture" | "onboarding";

export default function Home() {
  const [view, setView] = useState<View>("dashboard");

  return (
    <main className="flex min-h-screen bg-[var(--color-surface)]">
      <Sidebar view={view} setView={setView} />
      <div className="min-w-0 flex-1 overflow-y-auto">
        {view === "dashboard" && <Dashboard onNavigate={setView} />}
        {view === "hiring" && <HiringSpec onNavigate={setView} />}
        {view === "capture" && <KnowledgeCapture onNavigate={setView} />}
        {view === "onboarding" && <Onboarding onNavigate={setView} />}
      </div>
    </main>
  );
}
