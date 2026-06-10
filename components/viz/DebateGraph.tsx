"use client";

import { motion } from "framer-motion";

interface DebateEdge {
  source: string;
  target: string;
  type: "challenge" | "agree" | "build";
  round: number;
}

interface Props {
  visibleRound: number;
  edges: DebateEdge[];
}

const agents = [
  { id: "Evidence", short: "Ev", x: 50, y: 8 },
  { id: "Expertise", short: "Ex", x: 88, y: 35 },
  { id: "Risk", short: "Ri", x: 78, y: 78 },
  { id: "Skeptic", short: "Sk", x: 22, y: 78 },
  { id: "Question", short: "Qu", x: 12, y: 35 },
  { id: "Judge", short: "J", x: 50, y: 48 },
];

const agentColors: Record<string, string> = {
  Evidence: "#64748b",
  Expertise: "#5eead4",
  Risk: "#fda4af",
  Skeptic: "#fbbf24",
  Question: "#6ee7b7",
  Judge: "#818cf8",
};

const edgeColors: Record<string, string> = {
  challenge: "#f59e0b",
  agree: "#6ee7b7",
  build: "#cbd5e1",
};

export default function DebateGraph({ visibleRound, edges }: Props) {
  const activeEdges = edges.filter((e) => e.round <= visibleRound);
  const activeAgentIds = new Set(
    activeEdges.flatMap((e) => [e.source, e.target])
  );

  return (
    <div className="relative w-full h-full">
      {/* SVG layer for edges */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        {activeEdges.map((edge, i) => {
          const source = agents.find((a) => a.id === edge.source)!;
          const target = agents.find((a) => a.id === edge.target)!;
          return (
            <motion.line
              key={`${edge.source}-${edge.target}-${edge.round}`}
              x1={`${source.x}%`}
              y1={`${source.y}%`}
              x2={`${target.x}%`}
              y2={`${target.y}%`}
              stroke={edgeColors[edge.type]}
              strokeWidth={edge.type === "challenge" ? 1.5 : 1}
              strokeDasharray={edge.type === "challenge" ? "4 3" : "none"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            />
          );
        })}
      </svg>

      {/* Agent nodes */}
      {agents.map((agent) => {
        const isActive = activeAgentIds.has(agent.id);
        const isJudge = agent.id === "Judge";
        const color = agentColors[agent.id];

        return (
          <motion.div
            key={agent.id}
            className="absolute flex flex-col items-center"
            style={{
              left: `${agent.x}%`,
              top: `${agent.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 1,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: agents.indexOf(agent) * 0.06 }}
          >
            {/* Pulse ring for Judge when complete */}
            {isJudge && visibleRound >= 4 && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: isJudge ? 44 : 32,
                  height: isJudge ? 44 : 32,
                  border: `1.5px solid ${color}`,
                }}
                animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}

            {/* Node circle */}
            <motion.div
              className="flex items-center justify-center rounded-full"
              style={{
                width: isJudge ? 36 : 26,
                height: isJudge ? 36 : 26,
                backgroundColor: color,
                opacity: isActive || isJudge ? 1 : 0.3,
              }}
              animate={{
                opacity: isActive ? 1 : 0.3,
                scale: isActive ? 1 : 0.9,
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-white text-[9px] font-bold">
                {agent.short}
              </span>
            </motion.div>

            {/* Label */}
            <span className="mt-1 text-[8px] text-[var(--color-text-muted)]">
              {agent.id}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
