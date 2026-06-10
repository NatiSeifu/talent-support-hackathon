# Expertise Risk AI

## Mission

Build a convincing hackathon product that answers:

> What happens if our most important expert leaves, and what should we do next?

The system should make expertise measurable, knowledge risk visible, and talent
decisions evidence-based.

## Technical Context

- Frontend: Next.js App Router with TypeScript
- UI: React, Tailwind CSS, React Flow, D3, Framer Motion
- Backend: Python, FastAPI, and Pydantic
- Agents: provider-neutral OpenAI-compatible adapter with deterministic local tools
- Data: synthetic JSON under `data/`
- Current prototype domain logic: `lib/expertise.ts`
- Target agent orchestration: Python backend with shared `AuditState`
- Local model: quantized Qwen3 8B through Ollama
- GPU model: vLLM-served model selected by the evaluation harness

## Agent Responsibilities

### Evidence Agent

Retrieve relevant facts from PRs, incidents, tickets, docs, and code ownership.

### Expertise Agent

Infer who knows what and cite the supporting evidence.

### Risk Agent

Identify undocumented, critical, single-owner knowledge.

### Skeptic Agent

Challenge unsupported claims, inflated confidence, and alternative explanations.

### Question Agent

Turn unresolved claims into focused knowledge-capture questions.

### Synthesis Agent

Optionally convert resolved audit state into hiring and workforce outputs.

## Development Guidance

- Read the relevant route, component, domain logic, and synthetic data before editing.
- Keep important calculations deterministic and testable.
- Require evidence for claims about expertise or risk.
- Use structured model outputs for data consumed by application logic.
- Keep Python as the source of truth for backend schemas and publish OpenAPI.
- Keep orchestration deterministic; the LLM reasons within constrained roles.
- Run role evals independently and the full local workflow sequentially.
- Keep the evaluation harness unchanged when switching model providers.
- Validate external input and avoid returning internal errors to clients.
- Keep secrets server-side and read them from environment variables.
- Maintain a demo-safe fallback for every external AI or video provider.
- Match existing UI patterns and avoid unrelated redesigns.

## Verification

Before completing a code change:

```bash
npm run build
# Run the Python backend tests/evals when the backend is affected.
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
