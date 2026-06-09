# SuccessionAI — 8x H100 Hackathon Battle Plan

## Vision

An AI-powered **talent continuity platform** with two core AI systems:

1. **The AI Interviewer** — A GRPO-trained agent that conducts real-time knowledge extraction sessions with departing experts. It asks the RIGHT questions to uncover undocumented tribal knowledge.

2. **The Digital Twin** — A fine-tuned model that absorbs all captured knowledge and becomes a permanent, queryable knowledge base. Anyone in the org can ask it questions and get answers grounded in what the expert actually knew. Not a clone of a person's identity — a conversational interface to institutional knowledge.

Together: the Interviewer captures knowledge → feeds the Digital Twin → which coaches new hires, evaluates candidates, and ensures knowledge never dies when people leave.

> "SuccessionAI: The AI Interviewer that captures what your best people know — and the Digital Twin that makes sure no one ever has to figure it out alone again."

**What it's NOT:** A creepy clone of a person. The twin doesn't have their face, voice, or identity.
**What it IS:** "Hey Digital Twin, how does token refresh work?" → gets the expert's actual answer, with context, tradeoffs, and failure modes.

---

## The Two AI Systems

### System 1: AI Interviewer (Real-Time, GRPO-Trained)
- **When:** Before the expert leaves
- **Who it talks to:** The departing expert
- **What it does:** Conducts structured knowledge extraction via voice/video
- **How it's special:** RL-trained to ask progressively better questions (3x more insights than vanilla LLM)
- **Tech:** GRPO-trained small model (Qwen3-1.7B) generating questions, served on 1 GPU
- **UI:** Interview Room screen — avatar, live transcript, insight flags

### System 2: Digital Twin (Fine-Tuned Knowledge Model)
- **When:** After capture is complete (and forever after)
- **Who it talks to:** New hires, team members, hiring managers, the onboarding coach
- **What it does:** Answers any question about the systems/domains the expert owned
- **How it's special:** Fine-tuned on captured interview transcripts + PRs + incidents + code context via LoRA
- **Tech:** Llama 3 70B + LoRA adapter, served on 2 GPUs via vLLM
- **UI:** "Ask the Twin" interface — chat/voice, cites sources ("from interview session 3, captured June 2026")

### How They Connect

```
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│   PHASE 1: CAPTURE (while expert is still here)              │
│                                                                │
│   ┌──────────────┐        ┌─────────────────┐               │
│   │ AI           │ asks   │  Departing      │               │
│   │ INTERVIEWER  │───────▶│  Expert         │               │
│   │ (GRPO-trained)│◀──────│  (human)        │               │
│   └──────┬───────┘answers └─────────────────┘               │
│          │                                                    │
│          │ captured insights                                  │
│          ▼                                                    │
│   ┌──────────────┐                                           │
│   │ Knowledge    │ (structured insights, failure modes,      │
│   │ Corpus       │  architecture decisions, edge cases)      │
│   └──────┬───────┘                                           │
│          │                                                    │
│          │ fine-tune data                                     │
│          ▼                                                    │
│   ┌──────────────┐                                           │
│   │ DIGITAL TWIN │ (Llama 70B + LoRA on captured knowledge) │
│   │ (fine-tuned) │                                           │
│   └──────────────┘                                           │
│                                                                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                                                                │
│   PHASE 2: USE (after expert has left)                       │
│                                                                │
│   ┌──────────────┐        ┌─────────────────┐               │
│   │ DIGITAL TWIN │answers │  New Hire       │               │
│   │              │───────▶│  "How does      │               │
│   │              │◀───────│  token refresh  │               │
│   │              │  asks  │  work?"         │               │
│   └──────────────┘        └─────────────────┘               │
│          │                                                    │
│          ├──▶ Candidate evaluation ("covers 8/12 gaps")      │
│          ├──▶ Interview question generation                   │
│          ├──▶ Onboarding coaching (personalized)             │
│          └──▶ Time-to-competency prediction                  │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Strategy: Option B + C Combined

**Option B (The Infrastructure):** Real AIDev data, 3 parallel agents on vLLM, video avatar interviewer, RAG over real PR/review/commit data, live knowledge graph.

**Option C (The Differentiator):** The Knowledge Capturer agent is GRPO-trained (reinforcement learning) to ask progressively better questions. Demonstrably 3x better at extraction than a vanilla LLM.

If GRPO doesn't converge → Option B alone still wins.
If GRPO works → you have something no other team has.

---

## GPU Allocation (8x H100 = 640 GB VRAM)

| GPUs | System | Purpose | Model / Service |
|------|--------|---------|-----------------|
| 2 | **Digital Twin** | Answers questions with captured expert knowledge | Llama 3 70B + LoRA adapter, vLLM tensor parallel |
| 1 | **AI Interviewer** | GRPO-trained question asker (extracts knowledge) | Qwen3-1.7B or Llama 3 8B (RL-optimized) |
| 1 | **Agent Brain** | Knowledge Mapper + Talent Strategist (parallel) | Shared vLLM instance |
| 1 | **Speech Pipeline** | Real-time voice for both interviewer AND twin | Whisper Large v3 (STT) + XTTS-v2 (TTS) |
| 1 | **Video Avatar** | Face for the AI Interviewer during capture sessions | LivePortrait — generic professional AI face |
| 1 | **Code Intelligence** | Understands codebase during interview + coaching | DeepSeek Coder 33B |
| 1 | **RAG + Embedding** | Retrieval over captured knowledge + signals + code | BGE-large + FAISS GPU index |

---

## The Demo Flow (What Judges See)

| Step | Screen | What Happens | Emotion |
|------|--------|--------------|---------|
| 1 | Command Center | Dashboard shows "CRITICAL — Auth domain, bus factor = 1, Sarah departing in 2 weeks" | Tension |
| 2 | Command Center | Agent status dots pulsing — all 3 agents are live, analyzing signals | "This is alive" |
| 3 | Interview Room | Click "Start Knowledge Capture" → AI interviewer avatar appears | Curiosity |
| 4 | Interview Room | AI asks surgical questions about undocumented systems. Flags insights live. | Impressed |
| 5 | Knowledge Graph | Knowledge nodes appear in real-time as capture happens | Visual wow |
| 6 | Interview Room | "47 critical insights captured. 12 architecture decisions documented." | Relief |
| 7 | Hiring Spec | **Auto-generated hiring spec** from REAL gaps — not a generic JD | "This is specific" |
| 8 | Candidate Eval | Upload candidate resume → scored against actual knowledge gaps: "8/12 covered" | Useful |
| 9 | Candidate Eval | Generated interview questions tailored to THIS candidate's missing gaps | Practical |
| 10 | Onboarding Coach | **Candidate hired.** AI coach walks them through their specific gaps | Future value |
| 11 | Metrics | Knowledge score: **34% → 87%.** Time to competency: **6 months → 6 weeks.** | The payoff |
| 12 | Comparison | Side-by-side: vanilla interviewer vs GRPO-trained (3x more insights found) | Technical depth |

---

## Workstreams

### 1. Knowledge Capture Engine (GPUs 1-2 + GRPO on GPU 3)

**Goal:** AI interviewer that extracts institutional knowledge from departing experts.

**How it works:**
- GRPO-trained small model generates QUESTIONS (the interviewer)
- 70B model simulates expert responses for training / provides RAG-grounded answers
- Reward: +1 for new insight not in docs, +2 for critical undocumented failure mode, -0.5 for redundant question

**Training data (from HuggingFace):**
- `hao-li/AIDev` — 1M PRs, reviews, commit diffs (real developer communication)
- `Suzhen/AgentReviewChat` — 278K code review conversations
- `ronantakizawa/github-codereview` — 167K reviews with before/after code

**GRPO Setup:**
```python
from trl import GRPOTrainer, GRPOConfig

def extraction_reward(completions, environment_state):
    """
    +1 for each question that extracts info NOT in public docs
    +0.5 for follow-up probes ("what file?" "what happens when?")
    -0.5 for redundant questions (info already captured)
    +2 bonus for critical insight (undocumented failure mode)
    """
    ...

trainer = GRPOTrainer(
    model="Qwen/Qwen3-1.7B",
    args=GRPOConfig(num_generations=8, max_steps=100),
    train_dataset=interview_episodes,
    reward_funcs=extraction_reward,
)
```

**Files:**
- `gpu/grpo/environment.py` — simulated expert with hidden knowledge
- `gpu/grpo/reward.py` — extraction quality reward function
- `gpu/grpo/train.py` — GRPO training script
- `gpu/grpo/eval.py` — before/after comparison

---

### 2. Multi-Agent System (GPU 1-2, shared)

**Goal:** 3 agents run simultaneously, each with a distinct role.

```
┌─────────────────────────────────────────────────────┐
│                   ORCHESTRATOR                        │
├──────────┬──────────────────┬───────────────────────┤
│ Agent 1  │     Agent 2      │      Agent 3          │
│ Knowledge│   Knowledge      │    Talent             │
│ Mapper   │   Capturer       │    Strategist         │
│          │   (GRPO-trained) │                       │
│ Scores   │   Asks questions │   Generates plans     │
│ risk in  │   that uncover   │   from captured       │
│ real-time│   hidden gaps    │   knowledge           │
└──────────┴──────────────────┴───────────────────────┘
     ↕              ↕                    ↕
        [Shared State — knowledge graph + scores]
```

Agents communicate via shared state. Mapper re-scores as Capturer discovers new info. Strategist updates plans live.

**Files:**
- `gpu/agents/orchestrator.py` — parallel agent coordinator
- `gpu/agents/serve.py` — vLLM multi-request serving
- `gpu/agents/shared_state.py` — knowledge graph + inter-agent bus

---

### 3. Speech Pipeline (GPU 4)

**Goal:** Real-time voice for both interview and coaching. <500ms latency.

```
User speaks → Whisper (STT, ~200ms) → Agent → TTS (~200ms) → Speaker
```

- STT: `openai/whisper-large-v3` via faster-whisper
- TTS: `coqui/XTTS-v2` — professional AI voice (NOT cloning a real person)

**Files:**
- `gpu/speech/stt_server.py` — streaming speech-to-text
- `gpu/speech/tts_server.py` — text-to-speech API

---

### 4. Video Avatar (GPU 5)

**Goal:** A professional, generic AI avatar that conducts the interview. NOT a clone of anyone.

**Avatar options:**
- Abstract/geometric AI face (safest, clearly artificial)
- Professional synthetic person (generated by StyleGAN, no real person)
- Simple animated waveform + text (fallback if avatar tech is flaky)

**Tech:** LivePortrait or SadTalker driven by TTS audio output.

**Files:**
- `gpu/avatar/serve_avatar.py` — face animation from audio
- `gpu/avatar/stream.py` — WebRTC to frontend
- `gpu/avatar/assets/` — AI-generated avatar image

---

### 5. Code Intelligence (GPU 6)

**Goal:** During interview, AI understands the actual codebase and asks code-specific questions.

- Expert mentions "token refresh" → AI finds the exact function
- AI: "I see `refreshToken()` has no retry logic — what's the failure mode?"
- Generates documentation from captured insights + code

**Files:**
- `gpu/code-intel/serve_coder.py` — DeepSeek Coder 33B on vLLM
- `gpu/code-intel/index_repo.py` — embed and index the codebase

---

### 6. RAG Engine (GPU 7)

**Goal:** Instant retrieval over all captured knowledge + source signals.

- FAISS GPU index = microsecond retrieval
- Corpus: AIDev PR data + synthesized institutional docs + captured interview insights
- Feeds into all 3 agents for grounded responses

**Files:**
- `gpu/rag/embed_corpus.py` — document embedding pipeline
- `gpu/rag/serve_retrieval.py` — retrieval API
- `gpu/rag/corpus/` — preprocessed documents

---

## UI Plan

### Design Direction
- **Dark mode, glassmorphism, ambient gradients** (Linear/Raycast aesthetic)
- **Real-time updates** — cards animate as agents produce insights
- **Knowledge score as hero metric** — big, animated, front-and-center
- **Avatar is clearly AI** — not pretending to be a person

### Screens

| Screen | Purpose | Hero Element |
|--------|---------|--------------|
| **Command Center** | Risk dashboard | Pulsing agent dots, risk heatmap, "Sarah departing" alert |
| **Interview Room** | Knowledge capture | AI avatar asking questions, live insight flags, knowledge graph building |
| **Onboarding Coach** | Knowledge transfer | Personalized learning path, knowledge score rising in real-time |
| **Knowledge Graph** | Visual exploration | Force-directed graph, nodes = captured insights, edges = dependencies |
| **Metrics / Results** | The payoff | Before/after: 6 months → 6 weeks, knowledge score 34% → 87% |
| **GRPO Comparison** | Technical depth | Side-by-side: vanilla vs trained interviewer, extraction metrics |

### Tech Stack (Frontend)
- Next.js + TypeScript (already set up)
- Tailwind CSS (dark mode redesign)
- Framer Motion (already installed — animations)
- `@xyflow/react` (already installed — knowledge graph)
- WebSocket (real-time agent updates)
- WebRTC (video avatar stream)

---

## 2-Week Implementation Schedule

> Goal: Everything works end-to-end on Claude API. Hackathon day = swap env var to vLLM.

### Week 1: Core Product (Fully Functional on Laptop)

#### Day 1 (June 9) — Design System + Foundation
- [ ] Dark mode CSS variables, glassmorphism utilities, new color palette
- [ ] Update `globals.css` with design tokens
- [ ] Create shared UI components (GlassCard, PulsingDot, ProgressRing, Badge)
- [ ] Update Sidebar with new dark theme

#### Day 2 (June 10) — Command Center Dashboard
- [ ] Redesign Dashboard.tsx (dark mode, risk heatmap, agent status dots)
- [ ] Real-time signal feed component
- [ ] "Sarah departing" critical alert with countdown
- [ ] Quick action cards with hover states + micro-animations

#### Day 3 (June 11) — Interview Room
- [ ] New InterviewRoom.tsx screen
- [ ] AI avatar placeholder (animated waveform or abstract face)
- [ ] Live transcript panel (messages stream in)
- [ ] Insight flag notifications ("⚡ CRITICAL INSIGHT CAPTURED")
- [ ] Mini knowledge graph building in sidebar as insights are captured

#### Day 4 (June 12) — Onboarding Coach
- [ ] New OnboardingCoach.tsx screen
- [ ] Knowledge score hero metric (big animated number, 34% → 87%)
- [ ] Personalized learning path (list of gaps with progress bars)
- [ ] AI coach chat interface (personalized to new hire's gaps)
- [ ] "What you still need to learn" radar chart

#### Day 5 (June 13) — Knowledge Graph + Animations
- [ ] Full-page knowledge graph using @xyflow/react
- [ ] Nodes = captured insights, color-coded by domain
- [ ] Edges = dependencies between knowledge areas
- [ ] Animate: nodes appear as knowledge is captured
- [ ] "AI thinking" particle/pulse effects across all screens
- [ ] Page transitions with framer-motion

#### Day 6 (June 14) — Backend Wiring
- [ ] `lib/llm.ts` — abstract provider (Claude API now, vLLM later via `LLM_PROVIDER` env var)
- [ ] `lib/knowledge-score.ts` — define rubric, compute scores
- [ ] WebSocket server (or SSE) for real-time agent updates
- [ ] New API route: `/api/onboarding-coach` — personalized coaching agent
- [ ] `useAgentStream()` React hook — connects to WebSocket, provides live state

#### Day 7 (June 15) — Integration + Test Full Flow
- [ ] Wire Interview Room to real Knowledge Capturer agent
- [ ] Wire Onboarding Coach to real coaching agent
- [ ] Knowledge graph updates from agent output
- [ ] Knowledge score updates live during coaching session
- [ ] Test full demo flow: Dashboard → Interview → Capture → Coach → Metrics
- [ ] Fix any bugs, polish transitions

---

### Week 2: GPU-Ready + Polish

#### Day 8 (June 16) — Data Pipeline
- [ ] Script: download AIDev subset from HuggingFace
- [ ] Script: filter to 1 prolific dev (500+ PRs in auth/security)
- [ ] Script: format into fine-tuning JSONL (system + user + assistant)
- [ ] Script: synthesize institutional data (Slack messages, incident reports, ADRs)
- [ ] Build RAG corpus from combined data

#### Day 9 (June 17) — GRPO Environment
- [ ] `gpu/grpo/environment.py` — simulated expert with hidden knowledge
- [ ] `gpu/grpo/reward.py` — extraction quality scoring
- [ ] `gpu/grpo/train.py` — GRPO training loop using TRL
- [ ] `gpu/grpo/eval.py` — before/after comparison metrics
- [ ] Test training loop on CPU with tiny model (Qwen 0.5B) — verify code runs

#### Day 10 (June 18) — GPU Deployment Scripts
- [ ] `gpu/docker-compose.yaml` — all services with CUDA_VISIBLE_DEVICES pinning
- [ ] `gpu/download_models.sh` — download Llama 3 70B, Whisper, DeepSeek, XTTS, BGE
- [ ] `gpu/agents/serve.py` — vLLM config (tensor parallel, port allocation)
- [ ] `gpu/speech/stt_server.py` — faster-whisper streaming endpoint
- [ ] `gpu/speech/tts_server.py` — XTTS-v2 server
- [ ] `gpu/rag/serve_retrieval.py` — FAISS GPU retrieval endpoint
- [ ] `gpu/health_check.py` — verify all services are up

#### Day 11 (June 19) — Fine-Tune Config + Comparison UI
- [ ] `gpu/fine-tune/config.yaml` — axolotl QLoRA config for Llama 3 70B
- [ ] `gpu/fine-tune/train.sh` — one-command training launch
- [ ] GRPO comparison UI screen (vanilla vs trained, side-by-side metrics)
- [ ] Metrics visualization (extraction count, insight quality, reward curve)

#### Day 12 (June 20) — Presentation Prep
- [ ] Write 3-minute pitch script (memorize opener)
- [ ] Design 5-7 slides (Problem → Solution → Architecture → Demo → Results → Vision)
- [ ] Define exact demo click-path (what to click, what to say at each step)
- [ ] Record fallback demo video (in case GPU box is slow)
- [ ] Write judge Q&A answers (privacy? scale? how is this different from docs?)

#### Day 13 (June 21) — Polish + Edge Cases
- [ ] Error states (what if agent is slow? loading states everywhere)
- [ ] Mobile responsive (in case presenting on laptop)
- [ ] Performance optimize (no jank in animations)
- [ ] Add "demo mode" flag that uses pre-computed responses for reliability
- [ ] Test with slow network simulation

#### Day 14 (June 22) — Dress Rehearsal
- [ ] Practice full demo 3x with timer
- [ ] Verify GPU swap works: `LLM_PROVIDER=vllm npm run dev` 
- [ ] Test docker-compose on a cloud GPU if possible (RunPod/Lambda spot instance for 1hr)
- [ ] Final commit, tag `v1.0-hackathon-ready`
- [ ] Sleep well

---

### Hackathon Day Checklist
```bash
# 1. SSH into GPU box
ssh user@gpu-box

# 2. Clone and setup
git clone https://github.com/NatiSeifu/talent-support-hackathon.git
cd talent-support-hackathon

# 3. Download models (~20 min)
cd gpu && bash download_models.sh

# 4. Start all GPU services
docker compose up -d

# 5. Verify everything is healthy
python health_check.py

# 6. Run GRPO training (optional, ~1-2 hrs)
cd grpo && python train.py

# 7. Start frontend pointed at GPU backend
cd ../.. && LLM_PROVIDER=vllm GPU_HOST=localhost npm run dev

# 8. Open browser, run through demo once
# 9. Present
```

---

## File Structure

```
.cursor/
├── DECISIONS.md             # All strategic decisions (this convo's history)
├── PLAN.md                  # This file
├── rules/
│   └── project.mdc          # Cursor rules for coding standards

gpu/
├── grpo/
│   ├── environment.py       # Simulated expert for RL training
│   ├── reward.py            # Extraction quality reward function
│   ├── train.py             # GRPO training script (TRL)
│   └── eval.py              # Before/after comparison
├── agents/
│   ├── orchestrator.py      # Multi-agent coordinator
│   ├── serve.py             # vLLM serving config
│   └── shared_state.py      # Knowledge graph + inter-agent state
├── speech/
│   ├── stt_server.py        # Whisper streaming
│   └── tts_server.py        # XTTS-v2
├── avatar/
│   ├── serve_avatar.py      # LivePortrait animation
│   ├── stream.py            # WebRTC output
│   └── assets/              # AI-generated avatar image
├── code-intel/
│   ├── serve_coder.py       # DeepSeek Coder
│   └── index_repo.py        # Codebase indexer
├── rag/
│   ├── embed_corpus.py      # Embedding pipeline
│   ├── serve_retrieval.py   # Retrieval API
│   └── corpus/              # Documents
├── data/
│   ├── download_aidev.py    # Download from HuggingFace
│   ├── prepare_training.py  # Format → JSONL
│   └── synthesize.py        # Generate institutional data
├── docker-compose.yaml      # All services orchestrated
├── download_models.sh       # Pre-download all models
└── health_check.py          # Verify all services are up
```

---

## Key Differentiators

1. **Not a person clone** — ethical AI that captures knowledge, not identity
2. **Self-improving** — GRPO-trained interviewer provably gets better at extraction
3. **Evidence-based** — every expertise score traced to real signals (AIDev dataset)
4. **Multi-modal** — voice, video, code understanding, all working together in real-time
5. **Measurable ROI** — knowledge score 34% → 87%, time to competency 6mo → 6wk
6. **Self-hosted** — all data stays on-prem, zero API dependencies in production

---

## The Pitch (3 minutes)

**[0:00-0:30] The Problem**
"Every year, companies lose $1M+ when critical engineers leave — not because of their code, but because of what's in their HEAD. Tribal knowledge. Undocumented decisions. Failure modes only they know. Mercor solves WHO to hire — but how do you write the job spec when the knowledge isn't documented? And how do you evaluate if a candidate can actually fill the gap?"

**[0:30-1:00] The Solution**
"SuccessionAI completes the talent lifecycle. It captures what the departing expert knows — generating the most precise hiring spec possible because it knows EXACTLY what's being lost. Then it evaluates candidates against that real knowledge gap. Then it coaches the new hire to competency in weeks, not months."

**[1:00-2:30] Live Demo**
[Dashboard → show risk → capture knowledge → auto-generate hiring spec from REAL gaps → evaluate candidate fit against captured knowledge → onboarding coach → knowledge score rising]

**[2:30-3:00] The Results + Technical Depth**
"Knowledge score from 34% to 87% in one session. Hiring specs grounded in actual institutional knowledge — not guesswork. Candidate evaluation against the REAL gap, not a generic JD. Our RL-trained interviewer captures 3x more undocumented insights than a vanilla LLM. Running self-hosted on 8 H100s. This is the missing piece of the talent lifecycle."

---

## How It's a Hiring Tool (The Full Talent Lifecycle)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    THE SUCCESSIONAI LOOP                              │
│                                                                       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ DETECT   │───▶│ CAPTURE  │───▶│  HIRE    │───▶│  COACH   │      │
│  │          │    │          │    │          │    │          │      │
│  │ Who's a  │    │ Extract  │    │ Generate │    │ Ramp up  │      │
│  │ risk to  │    │ tribal   │    │ precise  │    │ new hire │      │
│  │ leave?   │    │ knowledge│    │ job spec │    │ in weeks │      │
│  │          │    │ before   │    │ + eval   │    │ not      │      │
│  │ Bus      │    │ they go  │    │ candidates│   │ months   │      │
│  │ factor=1 │    │          │    │ vs REAL  │    │          │      │
│  └──────────┘    └──────────┘    │ gaps     │    └──────────┘      │
│                                   └──────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
```

### The Hiring Features

**1. Evidence-Based Hiring Specs (not generic JDs)**
- Traditional: "Looking for a Senior Auth Engineer, 5+ years experience"
- SuccessionAI: "Need someone who understands OAuth token refresh with Redis failover (no retry logic exists), has led incident response for SSO systems serving 200+ enterprise clients, and can architect SAML integration from scratch because there's zero documentation"

**2. Candidate Gap Scoring**
- Upload a candidate's resume/GitHub → system scores them AGAINST the specific knowledge gaps
- "This candidate covers 8/12 critical gaps. Missing: Redis failover, SSO enterprise patterns, incident response for auth"
- Hiring managers know EXACTLY what onboarding needs to cover for each candidate

**3. Interview Question Generation**
- Generates interview questions from the CAPTURED knowledge
- "Ask them: 'What happens if your token refresh service loses its cache layer during peak traffic?' — if they can answer this, they understand the most critical undocumented system"
- These aren't generic LeetCode questions — they're probes for the SPECIFIC knowledge that matters

**4. Time-to-Productivity Prediction**
- "Candidate A: estimated 3 weeks to full competency (covers 8/12 gaps)"
- "Candidate B: estimated 8 weeks (covers 4/12 gaps, but strong fundamentals)"
- Hiring managers can factor ramp time into their decision
