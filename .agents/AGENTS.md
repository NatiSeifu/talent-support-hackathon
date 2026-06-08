# Expertise Risk AI

## Project

Expertise Risk AI is a hackathon demo that identifies where critical expertise
lives, simulates the impact of an expert leaving, captures undocumented
knowledge, and converts remaining gaps into successor or hiring plans.

## Stack

- Next.js App Router
- TypeScript
- React 19
- Tailwind CSS
- Anthropic and OpenAI SDKs
- React Flow and D3
- JSON files as the synthetic data store

## Commands

```bash
npm install
npm run dev
npm run build
```

## Architecture

- `app/api/agents/`: API routes for the three product agents
- `lib/agents/`: prompts, tool definitions, and agent orchestration
- `lib/expertise.ts`: deterministic expertise, risk, and planning logic
- `data/`: synthetic company and organizational signal data
- `components/`: dashboard, capture, onboarding, and hiring UI

The three product agents are:

1. Knowledge Mapper: determines who knows what and why.
2. Knowledge Capturer: interviews experts to extract undocumented knowledge.
3. Talent Strategist: creates successor, cross-training, and hiring plans.

## Engineering Rules

- Keep risk scores and successor thresholds deterministic.
- Use LLMs to extract, summarize, and explain; do not let them invent company data.
- Ground expertise claims in source-linked evidence.
- Validate API request bodies with Zod.
- Keep provider credentials in environment variables.
- Preserve deterministic fallbacks so the hackathon demo works without an API.
- Prefer focused changes over broad refactors.
- Do not commit `.env` files, generated output, `.next`, or `node_modules`.

## Product Priority

The most important product chain is:

```text
organizational signals
-> evidence-backed expertise graph
-> departure risk
-> internal successor gaps
-> knowledge transfer or hiring plan
```

For hackathon work, optimize for a reliable and understandable end-to-end demo.
