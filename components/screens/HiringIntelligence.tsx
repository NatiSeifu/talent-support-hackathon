"use client";

import { motion } from "framer-motion";

interface Props {
  onNavigate: (view: string) => void;
}

export default function HiringIntelligence({ onNavigate }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Hiring Intelligence
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Generated from confirmed knowledge gaps
        </p>
      </div>

      {/* Hiring Spec */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-10 rounded-lg border border-[var(--color-border)] p-6"
      >
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
          Senior Authentication Engineer
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-5">
          Based on 4 confirmed knowledge gaps from audit
        </p>

        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Requirements</p>
          <ol className="space-y-2 list-decimal list-inside text-sm text-[var(--color-text-primary)]">
            <li>Deep understanding of OAuth 2.0 token refresh flows</li>
            <li>Experience with Redis as session/token store (including failover)</li>
            <li>Incident response experience for authentication systems</li>
            <li>SAML/SSO enterprise integration</li>
          </ol>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Nice to Have</p>
          <ul className="space-y-1.5 text-sm text-[var(--color-text-secondary)]">
            <li>Experience debugging token expiration edge cases</li>
            <li>Redis cluster management</li>
          </ul>
        </div>

        <p className="mt-5 text-xs text-[var(--color-text-muted)]">
          Generated from: 47 PRs, 4 incidents, 3 interview answers
        </p>
      </motion.div>

      {/* Candidate */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mb-10"
      >
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          Candidate Assessment
        </h2>

        <div className="rounded-lg border border-[var(--color-border)] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Alex Park</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Senior Backend Engineer &middot; 6 years</p>
            </div>
            <span className="text-2xl font-semibold text-[var(--color-text-primary)]">82%</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-zinc-100 mb-5">
            <div className="h-1.5 rounded-full bg-[var(--color-accent)]" style={{ width: "82%" }} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="text-sm text-[var(--color-text-primary)]">
              <span className="text-[var(--color-success)]">&#10003;</span> OAuth token flows
            </div>
            <div className="text-sm text-[var(--color-text-primary)]">
              <span className="text-[var(--color-success)]">&#10003;</span> Redis caching patterns
            </div>
            <div className="text-sm text-[var(--color-text-primary)]">
              <span className="text-[var(--color-success)]">&#10003;</span> Incident response
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">
              <span className="text-[var(--color-danger)]">&#10007;</span> SAML enterprise onboarding
            </div>
          </div>

          <div className="flex items-center gap-6 border-t border-[var(--color-border)] pt-4">
            <div>
              <span className="text-xs text-[var(--color-text-muted)]">Adaptability</span>
              <p className="text-sm font-medium">High</p>
            </div>
            <div>
              <span className="text-xs text-[var(--color-text-muted)]">Ramp Time</span>
              <p className="text-sm font-medium">3 weeks</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="rounded-lg border border-[var(--color-border)] p-5">
          <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Generic JD</p>
          <p className="text-sm text-[var(--color-text-secondary)] italic">
            "5+ years backend experience, knowledge of auth systems preferred"
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-accent)]/30 bg-indigo-50/20 p-5">
          <p className="text-xs font-medium text-[var(--color-accent)] mb-2">AI-Generated Spec</p>
          <p className="text-sm text-[var(--color-text-primary)]">
            "Must have operated Redis token stores under failure conditions, handled auth P0 incidents, understands PKCE flows"
          </p>
        </div>
      </motion.div>

      {/* Assessment Questions */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mt-10"
      >
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          Candidate Assessment Questions
        </h2>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          Scenario-based puzzles to test how quickly a candidate can learn the missing knowledge.
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border border-[var(--color-border)] px-5 py-4">
            <p className="text-sm text-[var(--color-text-primary)]">
              &ldquo;You discover token refreshes are failing. Redis recently had packet loss. No documentation exists. Users report random logouts. What would you investigate first?&rdquo;
            </p>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">Tests: debugging approach, hypothesis generation</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] px-5 py-4">
            <p className="text-sm text-[var(--color-text-primary)]">
              &ldquo;A service is bypassing Redis and writing directly to Postgres. You don&rsquo;t know why. How would you determine if this is intentional or a bug?&rdquo;
            </p>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">Tests: code archaeology, reasoning under uncertainty</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] px-5 py-4">
            <p className="text-sm text-[var(--color-text-primary)]">
              &ldquo;You&rsquo;re on-call. Auth is failing for 5% of users. The last person who understood this system left 2 weeks ago. Walk me through your first 30 minutes.&rdquo;
            </p>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">Tests: incident response, knowledge acquisition speed</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
