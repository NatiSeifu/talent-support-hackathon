# Expertise Risk AI

## Mission

Build a convincing hackathon product that answers:

> What happens if our most important expert leaves, and what should we do next?

The system should make expertise measurable, knowledge risk visible, and talent
decisions evidence-based.

## Technical Context

- Framework: Next.js App Router with TypeScript
- UI: React, Tailwind CSS, React Flow, D3, Framer Motion
- Agents: Anthropic/OpenAI SDKs with deterministic local tools
- Data: synthetic JSON under `data/`
- Core domain logic: `lib/expertise.ts`
- Agent orchestration: `lib/agents/`

## Agent Responsibilities

### Knowledge Mapper

Find experts, explain the supporting signals, map system ownership, and identify
single points of failure.

### Knowledge Capturer

Conduct focused interviews that extract architecture decisions, failure modes,
incident procedures, edge cases, and undocumented operational knowledge.

### Talent Strategist

Turn uncovered gaps into internal successor plans, cross-training priorities,
hiring specifications, interview assessments, and onboarding plans.

## Development Guidance

- Read the relevant route, component, domain logic, and synthetic data before editing.
- Keep important calculations deterministic and testable.
- Require evidence for claims about expertise or risk.
- Use structured model outputs for data consumed by application logic.
- Validate external input and avoid returning internal errors to clients.
- Keep secrets server-side and read them from environment variables.
- Maintain a demo-safe fallback for every external AI or video provider.
- Match existing UI patterns and avoid unrelated redesigns.

## Verification

Before completing a code change:

```bash
npm run build
```

Exercise affected API routes or UI flows when practical.

## Hackathon Scope

Favor one polished end-to-end workflow over production infrastructure:

```text
search expertise
-> inspect evidence
-> simulate departure
-> capture knowledge
-> evaluate successor
-> generate hiring or onboarding plan
```
