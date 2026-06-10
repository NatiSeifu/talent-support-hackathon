"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import CommandCenter from "@/components/screens/CommandCenter";
import AgentAudit from "@/components/screens/AgentAudit";
import InterviewRoom from "@/components/screens/InterviewRoom";
import KnowledgeRecovery from "@/components/screens/KnowledgeRecovery";
import HiringIntelligence from "@/components/screens/HiringIntelligence";

export type View = "command" | "audit" | "interview" | "recovery" | "hiring";

export default function Home() {
  const [view, setView] = useState<View>("command");

  const navigate = (v: string) => setView(v as View);

  return (
    <main className="flex min-h-screen bg-[var(--color-surface)]">
      <Sidebar view={view} setView={setView} />
      <div className="min-w-0 flex-1 overflow-y-auto">
        {view === "command" && <CommandCenter onNavigate={navigate} />}
        {view === "audit" && <AgentAudit onNavigate={navigate} />}
        {view === "interview" && <InterviewRoom onNavigate={navigate} />}
        {view === "recovery" && <KnowledgeRecovery onNavigate={navigate} />}
        {view === "hiring" && <HiringIntelligence onNavigate={navigate} />}
      </div>
    </main>
  );
}
