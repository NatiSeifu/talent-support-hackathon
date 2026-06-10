"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Pause, Search, Brain, ShieldAlert, HelpCircle, MessageSquare, Scale } from "lucide-react";

interface Props {
  onNavigate: (view: string) => void;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const agentStyles: Record<string, { icon: string; name: string }> = {
  Evidence: { icon: "text-slate-400", name: "text-slate-600" },
  Expertise: { icon: "text-teal-400", name: "text-teal-600" },
  Risk: { icon: "text-rose-300", name: "text-rose-500" },
  Skeptic: { icon: "text-amber-400", name: "text-amber-600" },
  Question: { icon: "text-emerald-400", name: "text-emerald-600" },
  Judge: { icon: "text-indigo-400", name: "text-indigo-600" },
};

const agentIconMap: Record<string, typeof Search> = {
  Evidence: Search,
  Expertise: Brain,
  Risk: ShieldAlert,
  Skeptic: HelpCircle,
  Question: MessageSquare,
  Judge: Scale,
};

interface Message {
  agent: string;
  text: string;
  confidence?: number;
  prevConfidence?: number;
  tag?: string;
  round: number;
}

const debateMessages: Message[] = [
  { agent: "Evidence", round: 1, confidence: 88,
    text: "Sarah authored 82% of auth-service commits weighted by complexity. Sole reviewer on 14 critical PRs. Code ownership in auth-service/src/token.ts: 94%." },
  { agent: "Expertise", round: 1, confidence: 91,
    text: "Sarah is primary knowledge holder for OAuth token refresh. Mike Rodriguez has surface-level exposure — reviewed but never authored." },
  { agent: "Risk", round: 1, confidence: 85,
    text: "Initial assessment: bus factor likely 1. Documentation freshness in auth domain: 18%. Sarah sole responder on 4 P0 incidents." },
  { agent: "Skeptic", round: 2, tag: "CHALLENGE",
    text: "Mike reviewed 40% of auth PRs. Does review activity indicate shared knowledge? Risk Agent is assuming correlation = causation." },
  { agent: "Evidence", round: 2, confidence: 93, prevConfidence: 88,
    text: "Revising. Mike's reviews were \"LGTM\" with 0 substantive comments. 0 commits to auth-service/src/. 0 incident responses. Review ≠ ownership." },
  { agent: "Skeptic", round: 2, tag: "CHALLENGE",
    text: "Documentation is 18% fresh — but what about tribal knowledge in Slack? Are we missing informal channels?" },
  { agent: "Evidence", round: 3, confidence: 95, prevConfidence: 93,
    text: "Searched Slack: Sarah answered 23 auth-related questions in #platform-help. Next highest: 2 answers (Mike). Informal knowledge is also concentrated." },
  { agent: "Risk", round: 3, confidence: 94, prevConfidence: 85, tag: "CRITICAL",
    text: "Bus factor CONFIRMED = 1. All evidence channels converge. Mike is surface-level only. No backup exists in any form — code, docs, or tribal." },
  { agent: "Skeptic", round: 3, tag: "UNRESOLVED",
    text: "Concede code ownership and tribal knowledge. But UNRESOLVED: What specifically fails during Redis outages? Evidence is correlational, not causal. Need Sarah's mental model." },
  { agent: "Question", round: 4, tag: "INTERVIEW",
    text: "3 unresolved questions identified. Generating targeted interview questions from disputes the agents could not resolve." },
  { agent: "Judge", round: 4, confidence: 96,
    text: "Verdict: Knowledge risk confirmed. Bus factor = 1 with 94% confidence across all evidence channels. 3 questions require human input — proceeding to exit interview." },
];

function TypingIndicator({ agent }: { agent: string }) {
  const Icon = agentIconMap[agent] || Search;
  const style = agentStyles[agent] || agentStyles.Evidence;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-3 px-5 py-3"
    >
      <Icon size={13} className={style.icon} />
      <span className={`text-xs font-medium ${style.name}`}>{agent}</span>
      <div className="flex gap-1">
        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="h-1 w-1 rounded-full bg-zinc-300" />
        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="h-1 w-1 rounded-full bg-zinc-300" />
        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="h-1 w-1 rounded-full bg-zinc-300" />
      </div>
    </motion.div>
  );
}

function ConfidenceBar({ value, prev }: { value: number; prev?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 rounded-full bg-zinc-100 overflow-hidden">
        <motion.div
          initial={{ width: prev ? `${prev}%` : "0%" }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-zinc-400"
        />
      </div>
      <span className="text-[10px] tabular-nums text-[var(--color-text-muted)]">
        {prev && prev !== value && (
          <span className="line-through mr-1">{prev}%</span>
        )}
        {value}%
      </span>
    </div>
  );
}

export default function AgentAudit({ onNavigate }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [typingAgent, setTypingAgent] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying || visibleCount >= debateMessages.length) return;

    const nextMsg = debateMessages[visibleCount];
    setTypingAgent(nextMsg.agent);

    const thinkTime = setTimeout(() => {
      setTypingAgent(null);
      setVisibleCount((c) => c + 1);
    }, 1200 + Math.random() * 800);

    return () => clearTimeout(thinkTime);
  }, [visibleCount, isPlaying]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [visibleCount, typingAgent]);

  const currentRound = visibleCount > 0 ? debateMessages[visibleCount - 1].round : 1;
  const unresolvedCount = debateMessages.slice(0, visibleCount).filter((m) => m.tag === "UNRESOLVED" || m.tag === "CHALLENGE").length;
  const resolvedChallenges = debateMessages.slice(0, visibleCount).filter((m) => m.prevConfidence && m.confidence && m.confidence > m.prevConfidence).length;
  const activeDisputes = Math.max(0, unresolvedCount - resolvedChallenges);

  return (
    <div className="mx-auto max-w-2xl px-8 py-14 flex flex-col h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring }}
        className="mb-4 shrink-0"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
          Agent Audit
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Multi-agent deliberation
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          6 agents &middot; Debate until convergence or stalemate
        </p>
      </motion.div>

      {/* Controls bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4 flex items-center gap-4 shrink-0"
      >
        <button
          onClick={() => {
            if (visibleCount >= debateMessages.length) {
              setVisibleCount(0);
            }
            setIsPlaying(!isPlaying);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] transition hover:bg-zinc-50"
        >
          {isPlaying && visibleCount < debateMessages.length ? <Pause size={11} /> : <Play size={11} />}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
              Round {currentRound} &middot; {activeDisputes > 0 ? `${activeDisputes} dispute${activeDisputes > 1 ? "s" : ""} open` : "converging"}
            </span>
          </div>
          <div className="h-1 rounded-full bg-zinc-100 overflow-hidden">
            <motion.div
              animate={{ width: `${(visibleCount / debateMessages.length) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-full bg-zinc-900"
            />
          </div>
        </div>
      </motion.div>

      {/* Scrollable debate feed */}
      <div
        ref={feedRef}
        className="flex-1 min-h-0 max-h-[560px] overflow-y-auto rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]"
      >
        <AnimatePresence mode="popLayout">
          {debateMessages.slice(0, visibleCount).map((msg, i) => {
            const Icon = agentIconMap[msg.agent] || Search;
            const style = agentStyles[msg.agent] || agentStyles.Evidence;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                layout
                className={`px-5 py-4 ${msg.agent === "Judge" ? "bg-indigo-50/50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <Icon size={14} strokeWidth={1.5} className={`mt-0.5 shrink-0 ${style.icon}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${style.name}`}>{msg.agent}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">R{msg.round}</span>
                      {msg.tag && (
                        <span className={`text-[10px] font-medium ${
                          msg.tag === "CRITICAL" ? "text-[var(--color-danger)]" :
                          msg.tag === "CHALLENGE" || msg.tag === "UNRESOLVED" ? "text-[var(--color-warning)]" :
                          "text-[var(--color-text-muted)]"
                        }`}>
                          {msg.tag}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${msg.agent === "Judge" ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-secondary)]"}`}>
                      {msg.text}
                    </p>
                    {msg.confidence && (
                      <div className="mt-2">
                        <ConfidenceBar value={msg.confidence} prev={msg.prevConfidence} />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typingAgent && visibleCount < debateMessages.length && (
            <TypingIndicator agent={typingAgent} />
          )}
        </AnimatePresence>
      </div>

      {/* CTA — always visible below the box */}
      <div className="shrink-0 pt-5">
        <AnimatePresence>
          {visibleCount >= debateMessages.length ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-[var(--color-text-muted)]">
                  Deliberation complete &middot; 3 unresolved questions
                </p>
                <p className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">96% consensus</p>
              </div>
              <button
                onClick={() => onNavigate("interview")}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
              >
                Proceed to Exit Interview
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-center text-[var(--color-text-muted)]"
            >
              Agents are deliberating...
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
