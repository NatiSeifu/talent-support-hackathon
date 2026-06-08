# SuccessionAI — 8x H100 Hackathon Battle Plan

## Vision

An AI-powered **knowledge transfer coach** that captures institutional expertise from departing engineers and accelerates successors to competency in weeks instead of months — powered by parallel agents, RL-trained interviewing, and real-time knowledge mapping on 8x H100 GPUs.

> "SuccessionAI: Turn 6 months of tribal knowledge transfer into 6 weeks — with an AI coach that knows exactly what your team still needs to learn."

**What it's NOT:** A digital clone of a person. No one's identity is replicated.
**What it IS:** An intelligent system that captures knowledge, organizes it, and coaches the next person through their gaps.

---

## Strategy: Option B + C Combined

**Option B (The Infrastructure):** Real AIDev data, 3 parallel agents on vLLM, video avatar interviewer, RAG over real PR/review/commit data, live knowledge graph.

**Option C (The Differentiator):** The Knowledge Capturer agent is GRPO-trained (reinforcement learning) to ask progressively better questions. Demonstrably 3x better at extraction than a vanilla LLM.

If GRPO doesn't converge → Option B alone still wins.
If GRPO works → you have something no other team has.

---

## GPU Allocation (8x H100 = 640 GB VRAM)

| GPUs | Purpose | Model / Service |
|------|---------|-----------------|
| 2 | **Knowledge Brain** (serves all 3 agents) | Llama 3 70B via vLLM, tensor parallel |
| 1 | **GRPO-Trained Capturer** | Qwen3-1.7B or Llama 3 8B (RL-optimized question asker) |
| 1 | **Speech Pipeline** | Whisper Large v3 (STT) + XTTS-v2 (TTS) |
| 1 | **Video Avatar** (AI interviewer face) | LivePortrait — generic professional avatar, not a real person |
| 1 | **Code Intelligence** | DeepSeek Coder 33B for codebase understanding |
| 1 | **RAG + Embedding** | BGE-large + FAISS GPU index |
| 1 | **Spare / Training** | GRPO training runs, or overflow for 70B serving |

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
| 7 | Onboarding Coach | **New hire arrives.** Click "Start Coaching Session" | Transition |
| 8 | Onboarding Coach | AI coach walks new hire through gaps, personalized to what THEY don't know | "I need this" |
| 9 | Metrics | Knowledge score: **34% → 87%.** Time to competency: **6 months → 6 weeks.** | The payoff |
| 10 | Comparison | Side-by-side: vanilla interviewer vs GRPO-trained (3x more insights found) | Technical depth |

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

## Pre-Hackathon Checklist (No GPUs Needed)

### Day 1: UI (What Judges SEE)
- [ ] Dark mode design system (CSS variables, glassmorphism)
- [ ] Command Center dashboard redesign
- [ ] Interview Room screen (avatar placeholder + live transcript)
- [ ] Onboarding Coach screen (knowledge score + learning path)
- [ ] "AI Thinking" animations

### Day 2: Data + Backend
- [ ] Download AIDev dataset from HuggingFace
- [ ] Pick target developer, format training data (JSONL)
- [ ] Synthesize institutional data (Slack, incidents, ADRs)
- [ ] Abstract LLM provider (`lib/llm.ts` — Claude for dev, vLLM for prod)
- [ ] WebSocket server for real-time agent updates

### Day 3: GPU Scripts + Presentation
- [ ] `docker-compose.yaml` for all GPU services
- [ ] Model download script
- [ ] GRPO environment + reward function (test on CPU with tiny model)
- [ ] axolotl fine-tune config
- [ ] 3-minute pitch script
- [ ] Demo click-path (exact sequence)
- [ ] Judge Q&A prep
- [ ] Fallback: pre-recorded demo video

### Hackathon Day: Execute
- [ ] Boot GPU box, run model downloads
- [ ] `docker compose up`
- [ ] Run GRPO training (~1-2 hrs)
- [ ] End-to-end test
- [ ] Demo

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
"Every year, companies lose $1M+ when critical engineers leave — not because of their code, but because of what's in their HEAD. Tribal knowledge. Undocumented decisions. Failure modes only they know."

**[0:30-1:00] The Solution**
"SuccessionAI captures that knowledge before it walks out the door — with an AI interviewer that's been trained to ask the RIGHT questions — and then coaches the next person through exactly what they need to learn."

**[1:00-2:30] Live Demo**
[Run through the demo flow — dashboard → interview → capture → onboarding coach → metrics]

**[2:30-3:00] The Results**
"6 months of tribal knowledge transfer → 6 weeks. Knowledge score from 34% to 87%. And our RL-trained interviewer captures 3x more undocumented insights than a standard LLM. Running entirely on our own GPUs, zero data leaves the building."
