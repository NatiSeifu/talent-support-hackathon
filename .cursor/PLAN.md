# SuccessionAI — Build Plan

## What We're Building

An AI-powered organizational knowledge audit. When a key engineer is leaving, we ingest company signals (PRs, incidents, tickets, docs) and run a multi-agent debate system that discovers what undocumented knowledge is about to be lost — then interviews the expert to resolve uncertainty and converts it all into hiring intelligence.

---

## Architecture

```
Frontend (Next.js + Tailwind + shadcn/ui + Framer Motion)
    │
    │ HTTP + SSE
    │
    ▼
Agent Backend (Python + FastAPI + Pydantic)
    │
    ├── Deterministic orchestrator + shared AuditState
    ├── Agent tools, schemas, retries, and evaluation harness
    │
    ▼
LLM Provider Adapter (OpenAI-compatible endpoint)
    │
    ├── Local: Ollama (quantized Qwen3 8B)
    ├── Dev/fallback: hosted model API
    └── Hackathon: vLLM on 8 H100s (Llama 3.3 70B)

Video Interview: Tavus (external — no GPU needed from us)
```

```
GPU Allocation (all 8 H100s → reasoning brain):

  vLLM → Llama 3.3 70B
  tensor_parallel_size = 2 (2 GPUs per replica)
  data_parallel_size = 4   (4 replicas)
  Total: 8 H100s

  Powers: all 5 agents, debate rounds, question generation,
          post-interview synthesis, hiring spec, candidate scoring

The Full Loop:
  8 H100s  → multi-agent audit → unresolved questions
  Tavus    → video interview → employee answers
  8 H100s  → synthesize answers → update risk → hiring spec

  Tavus = interview face. H100s = reasoning brain.
```

---

## 7-Day Build Plan

### Day 1 (June 9) — Dataset ✅ IN PROGRESS
- [x] `data/company.json` — Nexus SaaS company, 8-person platform team
- [x] `data/incidents.json` — 20 incidents, Sarah solo on all auth P0s
- [x] `data/jira.json` — 46 tickets, "ask Sarah" patterns
- [x] `data/docs.json` — Auth critically underdocumented
- [x] `data/candidates.json` — 3 candidates with different profiles
- [ ] `data/prs.json` — 60-80 PRs showing Sarah's dominance
- [ ] Python OpenAI-compatible model adapter
- [ ] FastAPI health endpoint and OpenAPI contract
- [ ] Initial evaluation cases and deterministic graders
- [x] `.env.example` — Updated with LLM_BASE_URL config

### Day 2 (June 10) — UI Skeleton
- [ ] Install and configure shadcn/ui
- [ ] Screen 1: Command Center (risk score, alert, signal feed)
- [ ] Screen 2: Agent Audit (cards sliding in, debate view)
- [ ] Screen 3: Interview Room (Tavus embed, transcript, insight flags)
- [ ] Screen 4: Knowledge Recovery (before/after score, gaps disappearing)
- [ ] Screen 5: Hiring Intelligence (spec, candidate gap analysis, readiness report)
- [ ] Navigation/layout between screens
- [ ] All screens with FAKE data first — make it beautiful before real

### Day 3 (June 11) — Agent Backend
- [ ] Create Python/FastAPI backend with Pydantic schemas
- [ ] Define shared `AuditState` with evidence, claims, challenges, and questions
- [ ] Agent 1: Evidence Agent (prompt + structured JSON output)
- [ ] Agent 2: Expertise Agent (confidence scoring)
- [ ] Agent 3: Risk Agent (bus factor, documentation gap, criticality)
- [ ] Agent 4: Skeptic Agent (challenges, contradictions)
- [ ] Agent 5: Question Agent (targeted interview questions)
- [ ] Deterministic Python debate loop (Round 1 → Skeptic challenge → revision → synthesis)
- [ ] All agents return structured JSON with confidence levels + evidence citations
- [ ] Run role-level evals locally with quantized Qwen3 8B
- [ ] Run one complete workflow sequentially

### Day 4 (June 12) — Connect Backend → UI
- [ ] Add thin Next.js proxy/client for the FastAPI contract
- [ ] Stream agent findings to frontend (SSE or polling)
- [ ] Cards slide in as agents produce findings
- [ ] Highlight disagreements (Skeptic vs others)
- [ ] Show confidence scores updating across rounds
- [ ] Show "UNRESOLVED — requires interview" status
- [ ] Evidence citations clickable/expandable

### Day 5 (June 13) — Tavus Video Interview
- [ ] Connect Tavus API to interview flow
- [ ] Feed UNRESOLVED questions from Agent 5 (disputes agents can't settle from data alone)
- [ ] Tavus delivers questions as live Mercor-style video interview
- [ ] Capture transcript from Tavus
- [ ] Feed answers BACK into agents → recalculate confidence scores
- [ ] Show "⚡ Critical insight captured" animation when a gap resolves
- [ ] Show confidence scores updating after interview answers land
- [ ] Even ONE great targeted question resolving a dispute is enough for the demo

### Day 6 (June 14) — Hiring Intelligence
- [ ] Generate hiring spec from confirmed knowledge gaps
- [ ] Candidate gap analysis (upload resume → coverage score)
- [ ] Adaptability assessment (generate domain-specific challenge)
- [ ] Candidate Readiness Report (coverage, adaptability, ramp time)
- [ ] This is the money screen — polish it

### Day 7 (June 15) — Polish + Pitch
- [ ] Framer Motion transitions between screens
- [ ] Loading/thinking states (agents reasoning animation)
- [ ] The "holy shit" moment: critical knowledge recovered animation
- [ ] Practice demo 3x with timer (target: 3 minutes)
- [ ] Record fallback demo video
- [ ] No new features

---

## Pre-Hackathon Prep (Days 8-14)

### Week 2: Hardening + Presentation
- [ ] Write 3-min pitch script (memorize opener and closer)
- [ ] Design 7 slides (see SPEC.md for structure)
- [ ] Judge Q&A prep (see DECISIONS.md for answers)
- [ ] Test with slower LLMs (simulate GPU latency)
- [ ] Prepare `gpu/` folder with vLLM docker config
- [ ] Test OpenAI-compatible endpoint swap
- [ ] Run identical eval suite against local, hosted, and vLLM endpoints
- [ ] Rent 2x H100 for a focused vLLM integration session
- [ ] Study: vLLM, tensor parallelism, data parallelism
- [ ] Study: Tavus conversation API
- [ ] Study: SSE streaming patterns
- [ ] Final commit: tag `v1.0-hackathon-ready`

### Hackathon Day Checklist
```bash
# 1. SSH into GPU box
ssh user@gpu-box

# 2. Start vLLM with 8 H100s (ALL reasoning, Tavus handles video externally)
docker run --gpus all --ipc=host -p 8000:8000 \
  -e HUGGING_FACE_HUB_TOKEN=$HF_TOKEN \
  vllm/vllm-openai:latest \
  --model meta-llama/Llama-3.3-70B-Instruct \
  --tensor-parallel-size 2 \
  --data-parallel-size 4 \
  --max-model-len 32768 \
  --gpu-memory-utilization 0.90 \
  --host 0.0.0.0 --port 8000

# 3. Update env
export LLM_BASE_URL=http://gpu-box:8000/v1
export LLM_MODEL=meta-llama/Llama-3.3-70B-Instruct
export TAVUS_API_KEY=your-tavus-key

# 4. Run app
npm run dev

# 5. Increase debate rounds (more compute = deeper audit)
# Set AUDIT_MAX_ROUNDS=6 (vs 3 in dev mode)

# The loop:
# H100s audit → unresolved questions → Tavus interview →
# answers back → H100s synthesize → hiring spec
```

---

## File Structure

```
.cursor/
├── DECISIONS.md        # Decision history
├── PLAN.md             # This file
├── SPEC.md             # Full implementation spec
└── rules/project.mdc   # Cursor coding rules

app/
├── page.tsx            # Main app (screen navigation)
├── layout.tsx          # Root layout
├── globals.css         # Global styles
└── api/
    ├── audit/
    │   ├── run/route.ts        # Kick off multi-agent audit
    │   └── status/route.ts     # Get current findings
    ├── interview/
    │   ├── questions/route.ts  # Get targeted questions
    │   └── capture/route.ts    # Submit interview answers
    ├── hiring/
    │   ├── spec/route.ts       # Generate hiring spec
    │   └── evaluate/route.ts   # Score candidate
    └── demo/
        └── reset/route.ts      # Reset demo state

components/
├── CommandCenter.tsx    # Screen 1: Risk dashboard
├── AgentAudit.tsx       # Screen 2: Live agent debate
├── InterviewRoom.tsx    # Screen 3: Tavus + transcript
├── KnowledgeRecovery.tsx # Screen 4: Before/after
├── HiringIntelligence.tsx # Screen 5: Spec + candidate
└── ui/                  # shadcn/ui components

backend/
├── app/
│   ├── main.py          # FastAPI application
│   ├── models.py        # Pydantic API and AuditState schemas
│   ├── llm.py           # Ollama / hosted / vLLM provider adapter
│   ├── orchestrator.py  # Deterministic debate workflow
│   ├── agents/
│   │   ├── evidence.py
│   │   ├── expertise.py
│   │   ├── risk.py
│   │   ├── skeptic.py
│   │   ├── question.py
│   │   └── synthesis.py
│   └── tools/           # Deterministic evidence retrieval
├── evals/
│   ├── cases/           # Versioned representative scenarios
│   ├── graders/         # Deterministic and qualitative graders
│   └── reports/         # Ignored generated run reports
└── pyproject.toml

lib/
└── api-client/          # Generated/derived FastAPI client types

data/
├── company.json        # Team + services
├── prs.json            # Pull requests
├── incidents.json      # Incidents/outages
├── jira.json           # Tickets
├── docs.json           # Documentation coverage
└── candidates.json     # Sample candidates

gpu/
├── docker-compose.yml  # vLLM setup
├── start-vllm.sh       # Launch script
└── test-endpoint.py    # Verify connection
```

---

## What NOT to Build

- ❌ Digital twin / fine-tuning / LoRA
- ❌ GRPO / RL training
- ❌ Video avatar infra (use Tavus as-is)
- ❌ Voice cloning
- ❌ Dark mode
- ❌ Real Jira/GitHub OAuth integration
- ❌ User accounts / admin settings
- ❌ 3D knowledge graph (cut if time-tight)
- ❌ Onboarding coach

---

## Success = Clean Demo + Real Reasoning + Emotional Story + Hiring Payoff
