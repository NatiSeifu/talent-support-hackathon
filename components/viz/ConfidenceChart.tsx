"use client";

import { motion } from "framer-motion";

interface ConfidencePoint {
  agent: string;
  round: number;
  confidence: number;
}

interface Props {
  data: ConfidencePoint[];
  visibleRound: number;
}

const agentColors: Record<string, string> = {
  Evidence: "#64748b",
  Expertise: "#5eead4",
  Risk: "#fda4af",
  Skeptic: "#fbbf24",
  Question: "#6ee7b7",
  Judge: "#818cf8",
};

export default function ConfidenceChart({ data, visibleRound }: Props) {
  const visibleData = data.filter((d) => d.round <= visibleRound);
  const agentLatest = new Map<string, number>();
  visibleData.forEach((d) => {
    const current = agentLatest.get(d.agent) || 0;
    if (d.confidence > current) agentLatest.set(d.agent, d.confidence);
  });

  const sortedAgents = [...agentLatest.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col h-full p-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          Confidence
        </span>
        <span className="text-[9px] text-[var(--color-text-muted)]">
          Round {visibleRound}
        </span>
      </div>

      {/* Consensus threshold */}
      <div className="relative mb-3 flex items-center">
        <div className="flex-1 border-t border-dashed border-indigo-200" />
        <span className="ml-2 text-[8px] text-indigo-400">90% consensus</span>
      </div>

      {/* Bars */}
      <div className="flex-1 flex flex-col justify-center gap-2">
        {sortedAgents.map(([agent, confidence], i) => (
          <div key={agent} className="flex items-center gap-2">
            <span
              className="text-[9px] font-medium w-14 text-right truncate"
              style={{ color: agentColors[agent] }}
            >
              {agent}
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-zinc-50 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: agentColors[agent] }}
                initial={{ width: "0%" }}
                animate={{ width: `${confidence}%` }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: i * 0.08,
                }}
              />
            </div>
            <motion.span
              className="text-[9px] font-semibold tabular-nums w-8"
              style={{ color: agentColors[agent] }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              {confidence}%
            </motion.span>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {sortedAgents.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-[var(--color-text-muted)]">
            Waiting for agents...
          </span>
        </div>
      )}
    </div>
  );
}
