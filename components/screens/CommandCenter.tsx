"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, AlertTriangle, Clock } from "lucide-react";

interface Props {
  onNavigate?: (view: string) => void;
}

function CountUp({ target, duration = 1.2, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count}{suffix}</>;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

type ViewState = "monitoring" | "single" | "multiple";

const departures = [
  {
    name: "Sarah Chen",
    role: "Staff Engineer",
    team: "Platform Engineering",
    departingDate: "June 20",
    daysLeft: 11,
    domainsAtRisk: 3,
    busFactor: 1,
    signals: [
      { metric: "82%", label: "of auth-service PRs authored by Sarah" },
      { metric: "4", label: "P0 incidents — sole responder" },
      { metric: "1", label: "person can deploy auth to prod" },
    ],
  },
  {
    name: "Marcus Rivera",
    role: "Senior Engineer",
    team: "Data Pipeline",
    departingDate: "July 3",
    daysLeft: 24,
    domainsAtRisk: 2,
    busFactor: 1,
    signals: [
      { metric: "91%", label: "of ETL pipeline code authored solo" },
      { metric: "2", label: "undocumented cron jobs only he maintains" },
      { metric: "0", label: "other engineers with Kafka admin access" },
    ],
  },
  {
    name: "Priya Patel",
    role: "Engineering Manager",
    team: "Infrastructure",
    departingDate: "July 15",
    daysLeft: 36,
    domainsAtRisk: 1,
    busFactor: 2,
    signals: [
      { metric: "5", label: "vendor relationships she solely manages" },
      { metric: "1", label: "person who knows the AWS cost model" },
    ],
  },
];

const monitoringRisks = [
  { domain: "Authentication & OAuth", busFactor: 1, owner: "Sarah Chen" },
  { domain: "ETL Pipeline", busFactor: 1, owner: "Marcus Rivera" },
  { domain: "Payment Reconciliation", busFactor: 1, owner: "Anika Johal" },
  { domain: "Infrastructure Cost Mgmt", busFactor: 2, owner: "Priya Patel, DevOps" },
  { domain: "Search Indexing", busFactor: 2, owner: "Leo Park, Search Team" },
];

export default function CommandCenter({ onNavigate }: Props = {}) {
  const [viewState, setViewState] = useState<ViewState>("multiple");
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const [expandedSignal, setExpandedSignal] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-8 py-14">
      {/* State switcher (for demo purposes) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8 flex gap-1 rounded-lg border border-[var(--color-border)] p-1 w-fit"
      >
        {([
          ["monitoring", "No Departures"],
          ["single", "1 Departure"],
          ["multiple", "Multiple"],
        ] as [ViewState, string][]).map(([state, label]) => (
          <button
            key={state}
            onClick={() => { setViewState(state); setSelectedPerson(null); }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              viewState === state
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ===== MONITORING STATE ===== */}
        {viewState === "monitoring" && (
          <motion.div
            key="monitoring"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ ...spring }}
          >
            <div className="mb-10">
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                Knowledge Monitor
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                No active departures.
              </h1>
              <p className="mt-2 text-base text-[var(--color-text-secondary)]">
                Stratify &middot; Continuous knowledge risk monitoring
              </p>
            </div>

            {/* Healthy indicator */}
            <div className="mb-10 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-5 py-4">
              <Shield size={16} className="text-emerald-600" />
              <p className="text-sm text-[var(--color-text-primary)]">
                No imminent knowledge loss — <span className="font-medium">monitoring {monitoringRisks.length} concentration risks</span>
              </p>
            </div>

            {/* Bus factor risks (always present) */}
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
                Knowledge Concentration Risks
              </p>
              <div className="space-y-2">
                {monitoringRisks.map((risk, i) => (
                  <motion.div
                    key={risk.domain}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...spring, delay: 0.1 + i * 0.05 }}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-5 py-3.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{risk.domain}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{risk.owner}</p>
                    </div>
                    <span className={`text-xs font-medium ${risk.busFactor === 1 ? "text-amber-600" : "text-[var(--color-text-muted)]"}`}>
                      Bus factor: {risk.busFactor}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <p className="text-xs text-[var(--color-text-muted)] text-center">
              If any of these people leave, an audit will trigger automatically.
            </p>
          </motion.div>
        )}

        {/* ===== MULTIPLE DEPARTURES STATE ===== */}
        {viewState === "multiple" && selectedPerson === null && (
          <motion.div
            key="multiple"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ ...spring }}
          >
            <div className="mb-10">
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                Knowledge Audit
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                <CountUp target={3} duration={0.5} /> people are leaving.
              </h1>
              <p className="mt-2 text-base text-[var(--color-text-secondary)]">
                Stratify &middot; Platform Engineering &middot; Sorted by urgency
              </p>
            </div>

            {/* Pulsing alert */}
            <div className="mb-10 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/50 px-5 py-4">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              <p className="text-sm text-[var(--color-text-primary)]">
                <span className="font-semibold">6 knowledge domains</span> at risk across 3 departures
              </p>
            </div>

            {/* Departure cards */}
            <div className="space-y-3">
              {departures.map((person, i) => (
                <motion.div
                  key={person.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.15 + i * 0.08 }}
                  onClick={() => setSelectedPerson(i)}
                  className="cursor-pointer rounded-xl border border-[var(--color-border)] p-5 transition-all hover:border-zinc-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{person.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{person.role} · {person.team}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                      <Clock size={12} />
                      <span>{person.daysLeft} days</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      <span className="font-semibold text-[var(--color-text-primary)]">{person.domainsAtRisk}</span> domains at risk
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      Bus factor: <span className={`font-semibold ${person.busFactor === 1 ? "text-red-600" : "text-[var(--color-text-primary)]"}`}>{person.busFactor}</span>
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                    <ArrowRight size={10} />
                    <span>View audit details</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== SINGLE / DETAIL VIEW ===== */}
        {(viewState === "single" || selectedPerson !== null) && (
          <motion.div
            key="single"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ ...spring }}
          >
            {selectedPerson !== null && (
              <button
                onClick={() => setSelectedPerson(null)}
                className="mb-4 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                ← Back to all departures
              </button>
            )}

            {(() => {
              const person = selectedPerson !== null ? departures[selectedPerson] : departures[0];
              return (
                <>
                  <div className="mb-10">
                    <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                      Knowledge Audit
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                      {person.name} is leaving.
                    </h1>
                    <p className="mt-2 text-base text-[var(--color-text-secondary)]">
                      Stratify &middot; {person.team} &middot; Departing {person.departingDate}
                    </p>
                  </div>

                  {/* Pulsing signal */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...spring, delay: 0.1 }}
                    className="mb-10 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/50 px-5 py-4"
                  >
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                    </span>
                    <p className="text-sm text-[var(--color-text-primary)]">
                      <span className="font-semibold">{person.domainsAtRisk} domains</span> have no backup owner &middot; {person.daysLeft} days remaining
                    </p>
                  </motion.div>

                  {/* Signal Cards */}
                  <div className="mb-10">
                    <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
                      What the data shows
                    </p>
                    <div className="space-y-2">
                      {person.signals.map((signal, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ ...spring, delay: 0.2 + i * 0.07 }}
                          className="rounded-lg border border-[var(--color-border)] px-5 py-4"
                        >
                          <div className="flex items-baseline gap-3">
                            <motion.span
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ ...spring, delay: 0.4 + i * 0.1 }}
                              className="text-xl font-semibold text-[var(--color-text-primary)] tabular-nums"
                            >
                              {signal.metric}
                            </motion.span>
                            <span className="text-sm text-[var(--color-text-secondary)]">{signal.label}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.6 }}
                  >
                    <button
                      onClick={() => onNavigate?.("audit")}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
                    >
                      Run Knowledge Audit
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </motion.div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
