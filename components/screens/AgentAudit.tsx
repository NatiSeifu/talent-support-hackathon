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
  summary: string;
  full?: string;
  confidence?: number;
  prevConfidence?: number;
  tag?: string;
  round: number;
}

const debateMessages: Message[] = [
  { agent: "Evidence", round: 1, confidence: 88,
    summary: "Sarah authored 82% of auth-service commits weighted by complexity. Sole reviewer on 14 critical PRs.",
    full: "Analyzed 57 pull requests in auth-service over the last 18 months. Sarah Chen is the author on 47 of these (82.4%), weighted by lines of code and cyclomatic complexity — not raw commit count. She is listed as sole reviewer on 14 PRs tagged as critical (security patches, token logic changes, SSO integration). File-level ownership: auth-service/src/token.ts shows 94% authorship, auth-service/src/oauth-provider.ts shows 89% authorship. No other contributor exceeds 8% on any critical auth file." },
  { agent: "Expertise", round: 1, confidence: 91,
    summary: "Sarah is primary knowledge holder for OAuth token refresh. Mike has surface-level exposure only.",
    full: "Cross-referencing commit history with Jira assignments and incident response logs: Sarah Chen has operational expertise in OAuth 2.0 token refresh flows, PKCE implementation, and Redis token store management. Mike Rodriguez appears in 40% of PR reviews but has 0 authored commits in auth-service/src/. His review comments average 4 words (\"LGTM\", \"Looks good to me\") with 0 substantive code suggestions. Classification: Mike = awareness level. Sarah = deep operational expertise. No other team member has any exposure to auth domain." },
  { agent: "Risk", round: 1, confidence: 85,
    summary: "Initial assessment: bus factor likely 1. Documentation 18% fresh. Sarah sole responder on 4 P0 incidents.",
    full: "Bus factor analysis for authentication domain: Only 1 engineer (Sarah Chen) has committed code, responded to incidents, and answered questions in this domain. Documentation audit: 6 docs exist for auth — 1 is current (18%), 4 are stale (>6 months without update), 1 references deprecated APIs. Incident history: 4 P0 incidents involving auth in the last 6 months. Sarah was sole responder on all 4. Mean time to resolution: 23 minutes (indicating deep familiarity). No runbook exists for any of these scenarios." },
  { agent: "Skeptic", round: 2, tag: "CHALLENGE",
    summary: "Mike reviewed 40% of auth PRs. Does review activity indicate shared knowledge?",
    full: "Challenging Risk Agent's assumption that bus factor = 1. Evidence shows Mike Rodriguez reviewed 40% of auth PRs. In many organizations, code review implies understanding of the system. Questions: (1) Did Mike's reviews contain substantive feedback suggesting comprehension? (2) Could Mike operate auth independently in an incident? (3) Are we conflating code authorship with knowledge — could Mike have acquired knowledge through review without authoring? Risk Agent should provide evidence that review ≠ knowledge rather than assuming it." },
  { agent: "Evidence", round: 2, confidence: 93, prevConfidence: 88,
    summary: "Revising. Mike's reviews were \"LGTM\" — 0 substantive comments, 0 commits, 0 incident responses.",
    full: "Responding to Skeptic's challenge. Deep analysis of Mike's 23 PR reviews in auth-service: Average comment length: 4.2 words. Most common comments: \"LGTM\" (14 times), \"Looks good\" (6 times), \"Approved\" (3 times). Substantive technical comments: 0. Comments referencing auth logic, token flows, or security implications: 0. Mike has 0 commits to auth-service/src/. Mike has responded to 0 auth incidents. Mike has answered 0 auth-related questions in Slack. Conclusion: Review activity does NOT indicate shared knowledge in this case. Confidence revised upward from 88% to 93%." },
  { agent: "Skeptic", round: 2, tag: "CHALLENGE",
    summary: "Documentation is 18% fresh — but what about tribal knowledge in Slack? Are we missing informal channels?",
    full: "Second challenge: Evidence and Risk agents are measuring knowledge transfer through formal channels only (docs, code, PRs). But much engineering knowledge lives in informal channels — Slack messages, verbal conversations, whiteboard sessions, pair programming. If Sarah has been explaining auth concepts informally, the bus factor might be higher than 1. We need to search Slack, meeting notes, and any other informal knowledge repositories before concluding bus factor = 1 with high confidence." },
  { agent: "Evidence", round: 3, confidence: 95, prevConfidence: 93,
    summary: "Searched Slack: Sarah answered 23 auth questions in #platform-help. Next highest: 2 (Mike).",
    full: "Responding to Skeptic's informal knowledge challenge. Searched all public Slack channels for auth-related discussions over 18 months. Results: #platform-help channel: 23 auth questions answered by Sarah Chen. Next highest contributor to auth answers: Mike Rodriguez with 2 answers (both were links to Sarah's earlier answers). #incidents channel: Sarah is sole responder in all auth threads. DMs: Not searchable, but Slack analytics show Sarah received 47 DMs containing keywords 'auth', 'token', 'oauth', 'login' — suggesting she is the known go-to person even through informal channels. Conclusion: Informal knowledge is ALSO concentrated in Sarah. Confidence revised to 95%." },
  { agent: "Risk", round: 3, confidence: 94, prevConfidence: 85, tag: "CRITICAL",
    summary: "Bus factor CONFIRMED = 1. All evidence channels converge. No backup exists in any form.",
    full: "Synthesizing all evidence streams: Formal channels (code, PRs, docs) → Sarah is sole owner. Informal channels (Slack, incidents) → Sarah is sole responder and knowledge source. Documentation → 82% stale or missing. Team member analysis → Mike has awareness only, no operational capability. Conclusion: Bus factor = 1 across ALL measurable dimensions. This is not a borderline case. There is zero redundancy in the authentication domain. Risk level: CRITICAL. If Sarah departs without knowledge transfer, the team has no capability to operate, debug, or extend the auth system." },
  { agent: "Skeptic", round: 3, tag: "UNRESOLVED",
    summary: "Concede ownership. But UNRESOLVED: What specifically fails during Redis outages? Need Sarah's mental model.",
    full: "I concede the bus factor argument. Evidence across all channels is overwhelming — Sarah is the sole knowledge holder. However, I identify a remaining gap that no amount of data analysis can resolve: We can see THAT Redis outages correlate with auth failures, but we cannot determine from code/logs alone WHAT specifically happens and WHY the current architecture handles it this way. The Redis bypass in AUTH-4831 is undocumented. We need Sarah's mental model of the failure modes — this is tacit knowledge that exists only in her head. This requires human input." },
  { agent: "Question", round: 4, tag: "INTERVIEW",
    summary: "3 unresolved questions identified. Generating targeted interview questions from agent disputes.",
    full: "Based on the deliberation, 3 questions could not be resolved through data analysis alone and require direct human input from Sarah Chen: (1) Why was Redis bypassed in AUTH-4831? What failure mode prompted this, and is it a permanent fix or temporary workaround? (2) Has Mike ever handled an auth incident independently — confirming bus factor from her perspective? (3) What causes silent token expiration during Redis failover — what is the causal mechanism? These questions are being formatted for the Tavus AI interviewer with appropriate context and follow-up prompts." },
  { agent: "Judge", round: 4, confidence: 96,
    summary: "Verdict: Bus factor = 1 confirmed at 94% confidence. 3 questions require human input — proceeding to interview.",
    full: "Final synthesis of 4-round deliberation. The evidence is conclusive across all dimensions: Sarah Chen is the sole knowledge holder for the authentication domain at Stratify. Bus factor = 1 with 94% confidence (consensus across Evidence, Expertise, and Risk agents). The Skeptic agent raised valid challenges in rounds 2–3 which were addressed with additional evidence, strengthening the conclusion. However, 3 questions remain that cannot be resolved through data analysis — they require Sarah's tacit knowledge. Recommending: Proceed to exit interview via Tavus AI to capture answers before her departure on June 20. Time remaining: 11 days." },
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
  const [expandedMsg, setExpandedMsg] = useState<number | null>(null);
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

      {/* Agent status bar — who's spoken, current confidence */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="mb-4 flex gap-2 shrink-0"
      >
        {Object.entries(agentStyles).map(([name, style]) => {
          const lastMsg = debateMessages
            .slice(0, visibleCount)
            .filter((m) => m.agent === name)
            .pop();
          const isTyping = typingAgent === name;
          const hasSpoken = !!lastMsg;

          return (
            <div
              key={name}
              className={`flex-1 rounded-lg border px-2.5 py-2 transition-all duration-300 ${
                isTyping
                  ? "border-zinc-300 bg-zinc-50"
                  : hasSpoken
                  ? "border-[var(--color-border)]"
                  : "border-transparent bg-zinc-50/50"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-semibold ${hasSpoken ? style.name : "text-zinc-300"}`}>
                  {name}
                </span>
                {isTyping && (
                  <span className="flex gap-0.5">
                    <span className="h-1 w-1 rounded-full bg-zinc-400 animate-pulse" />
                    <span className="h-1 w-1 rounded-full bg-zinc-400 animate-pulse [animation-delay:0.15s]" />
                  </span>
                )}
              </div>
              {lastMsg?.confidence && (
                <div className="mt-1 h-1 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-zinc-400 transition-all duration-700"
                    style={{ width: `${lastMsg.confidence}%` }}
                  />
                </div>
              )}
              {!lastMsg?.confidence && hasSpoken && (
                <div className="mt-1 h-1 rounded-full bg-zinc-100 overflow-hidden">
                  <div className="h-full rounded-full bg-zinc-300 w-full" />
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Scrollable debate feed */}
      <div
        ref={feedRef}
        className="flex-1 min-h-0 max-h-[520px] overflow-y-auto rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]"
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
                        <span className={`text-[10px] font-medium tracking-wide ${
                          msg.tag === "CRITICAL" ? "text-zinc-900" :
                          msg.tag === "UNRESOLVED" ? "text-zinc-600" :
                          msg.tag === "CHALLENGE" ? "text-zinc-500" :
                          msg.tag === "INTERVIEW" ? "text-zinc-500" :
                          "text-zinc-400"
                        }`}>
                          {msg.tag === "CRITICAL" && "● "}{msg.tag}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${msg.agent === "Judge" ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-secondary)]"}`}>
                      {msg.summary}
                    </p>
                    {msg.full && (
                      <button
                        onClick={() => setExpandedMsg(expandedMsg === i ? null : i)}
                        className="mt-1 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition"
                      >
                        {expandedMsg === i ? "collapse" : "show reasoning →"}
                      </button>
                    )}
                    <AnimatePresence>
                      {expandedMsg === i && msg.full && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2 text-xs text-[var(--color-text-muted)] leading-relaxed border-l-2 border-zinc-100 pl-3"
                        >
                          {msg.full}
                        </motion.p>
                      )}
                    </AnimatePresence>
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
