"use client";

import {
  AlertTriangle,
  ArrowRight,
  GitBranch,
  MessageSquare,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import type { View } from "@/app/page";
import { companyData } from "@/lib/expertise";

export default function Dashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="px-10 py-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Hiring Intelligence
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          AI-powered analysis of your team&apos;s expertise gaps
        </p>
      </div>

      {/* Alert */}
      <div className="mt-8 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-red-900">
                Critical Hiring Gap — Authentication
              </div>
              <p className="mt-1 text-[13px] text-red-700">
                Sarah Chen is a single point of failure across 4 critical systems. No qualified successor exists.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("hiring")}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
          >
            View Hiring Spec <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="mt-8 grid grid-cols-[1fr_320px] gap-6">
        {/* Left — Expertise Visualization */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Knowledge Concentration
            </h3>
            <span className="badge badge-purple">
              <Sparkles size={10} /> AI-Analyzed
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Who owns critical knowledge — and where you have dangerous gaps
          </p>

          <div className="mt-6 space-y-5">
            <DomainRow
              domain="Authentication"
              experts={[{ name: "Sarah Chen", initials: "SC", score: 94, primary: true }]}
              risk="critical"
              description="4 systems, 0 backup, 12 incidents led solo"
            />
            <DomainRow
              domain="SSO / Enterprise"
              experts={[
                { name: "Sarah Chen", initials: "SC", score: 91, primary: true },
                { name: "Mike Rodriguez", initials: "MR", score: 62, primary: false },
              ]}
              risk="high"
              description="200+ enterprise clients depend on this"
            />
            <DomainRow
              domain="OAuth Token Flow"
              experts={[{ name: "Sarah Chen", initials: "SC", score: 96, primary: true }]}
              risk="critical"
              description="Zero documentation, zero backup"
            />
            <DomainRow
              domain="Platform APIs"
              experts={[
                { name: "Mike Rodriguez", initials: "MR", score: 85, primary: true },
                { name: "Alex Kim", initials: "AK", score: 72, primary: false },
              ]}
              risk="ok"
              description="Good coverage — 2 experts above threshold"
            />
            <DomainRow
              domain="Infrastructure"
              experts={[{ name: "Alex Kim", initials: "AK", score: 92, primary: true }]}
              risk="high"
              description="Single owner for K8s and deployment"
            />
          </div>
        </div>

        {/* Right — Data Sources + Actions */}
        <div className="space-y-6">
          {/* Data Sources */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Signal Sources
            </h3>
            <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
              Where expertise scores come from
            </p>
            <div className="mt-4 space-y-3">
              <SourceRow icon={GitBranch} name="GitHub" detail="PRs, reviews, commits" count="2,413" connected />
              <SourceRow icon={Target} name="Jira" detail="Tickets, ownership" count="891" connected />
              <SourceRow icon={AlertTriangle} name="PagerDuty" detail="Incidents, on-call" count="48" connected />
              <SourceRow icon={MessageSquare} name="Confluence" detail="Docs authored" count="83" connected />
            </div>
            <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <p className="text-[10px] leading-relaxed text-[var(--color-text-muted)]">
                Scores are computed from real activity signals — not self-reported. Updated continuously.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Recommended Actions
            </h3>
            <div className="mt-4 space-y-2">
              <QuickAction
                label="Generate Hiring Spec"
                onClick={() => onNavigate("hiring")}
              />
              <QuickAction
                label="Start Knowledge Capture"
                onClick={() => onNavigate("capture")}
              />
              <QuickAction
                label="View Onboarding Plan"
                onClick={() => onNavigate("onboarding")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DomainRow({
  domain,
  experts,
  risk,
  description,
}: {
  domain: string;
  experts: { name: string; initials: string; score: number; primary: boolean }[];
  risk: "critical" | "high" | "ok";
  description: string;
}) {
  return (
    <div className="flex items-center gap-4">
      {/* Risk indicator */}
      <div
        className="h-10 w-1.5 rounded-full"
        style={{
          background:
            risk === "critical" ? "var(--color-danger)" :
            risk === "high" ? "var(--color-warning)" :
            "var(--color-success)",
        }}
      />

      {/* Domain info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">{domain}</span>
          {risk === "critical" && (
            <span className="badge badge-critical text-[9px]">No backup</span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{description}</p>
      </div>

      {/* Expert avatars */}
      <div className="flex items-center -space-x-2">
        {experts.map((expert) => (
          <div
            key={expert.initials}
            className={`grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[10px] font-bold ${
              expert.primary
                ? "bg-[var(--color-primary-100)] text-[var(--color-primary-700)]"
                : "bg-gray-100 text-gray-600"
            }`}
            title={`${expert.name} — ${expert.score}%`}
          >
            {expert.initials}
          </div>
        ))}
        {experts.length === 1 && (
          <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-dashed border-red-300 bg-red-50 text-[10px] text-red-400">
            ?
          </div>
        )}
      </div>
    </div>
  );
}

function SourceRow({
  icon: Icon,
  name,
  detail,
  count,
  connected,
}: {
  icon: typeof GitBranch;
  name: string;
  detail: string;
  count: string;
  connected: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
        <Icon size={14} />
      </div>
      <div className="flex-1">
        <div className="text-xs font-semibold text-[var(--color-text-primary)]">{name}</div>
        <div className="text-[10px] text-[var(--color-text-muted)]">{detail}</div>
      </div>
      <div className="text-right">
        <div className="text-xs font-bold text-[var(--color-primary-700)]">{count}</div>
        <div className="text-[9px] text-emerald-600">{connected ? "Connected" : "—"}</div>
      </div>
    </div>
  );
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border)] p-3 text-left text-xs font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-primary-200)] hover:bg-[var(--color-surface-hover)]"
    >
      {label}
      <ArrowRight size={12} className="text-[var(--color-text-muted)]" />
    </button>
  );
}
