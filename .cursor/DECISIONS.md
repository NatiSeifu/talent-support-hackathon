# SuccessionAI — Decisions Log

> Running history of research, decisions, and strategic choices made during development.
> Updated as new questions arise and decisions are made.

---

## 2026-06-08 — GPU Strategy & Data Feasibility

### Context
We have access to 8x H100 GPUs for the hackathon. Needed to validate whether the "fine-tune a digital twin" plan was feasible given available data.

### Research: Available Datasets

| Dataset | Source | Size | What It Has |
|---------|--------|------|-------------|
| **AIDev** | HuggingFace (`hao-li/AIDev`) | 1M PRs, 116K repos, 72K devs | PR comments, reviews, commit diffs, timelines |
| **AgentReviewChat** | HuggingFace (`Suzhen/AgentReviewChat`) | 278K conversations, 54K PRs | Inline code review conversations |
| **Code Review Diffs** | HuggingFace (`ronantakizawa/github-codereview`) | 167K+ reviews | Before/after code + reviewer comments |
| **Agent Archive** | HuggingFace (`nuprl-staging/agent-archive`) | PR interaction histories | Full PR timelines with events |

**What's NOT freely available:** Slack messages, internal incident reports, architecture decision records, meeting notes. These must be synthesized for demo purposes.

**Tools that exist for scraping a single dev:**
- `technophile-04/grumpy-carlos-personality-fetcher` — scrapes GitHub review history, generates personality profile via LLM
- `LeoYeAI/teammate-skill` — auto-collects Slack/Teams/GitHub, builds 5-layer persona + work skill

### Options Considered

| Option | Description | Risk | Impressiveness |
|--------|-------------|------|----------------|
| **A: "The Clone"** | Pick a real OSS dev, scrape full GitHub history, LoRA fine-tune 70B to respond as them | Medium — clone might not be convincing | Highest if it works |
| **B: "The Living Org Chart"** | Use AIDev dataset (real data), map expertise, run 3 parallel agents + video avatar, show knowledge graph building live | Low — proven tech stack | High — clearly uses 8 GPUs |
| **C: "The GRPO Agent"** | RL-train an interviewer agent that learns to ask better knowledge-capture questions | Medium-High — novel but risky | High novelty |

### Decision: Option B + C Combined ("Living Org + Self-Improving Interviewer")

**The idea:** Use real data + parallel agents (Option B) as the foundation, but make the Knowledge Capturer agent GRPO-trained (Option C) so it demonstrably gets better at extracting knowledge over time.

**How B + C work together:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  OPTION B: The Infrastructure                                        │
│                                                                       │
│  • Real AIDev data → expertise mapping (who knows what)              │
│  • 3 parallel agents on vLLM (Mapper, Capturer, Strategist)         │
│  • Video avatar (LivePortrait) for the interview                     │
│  • RAG over real PR/review/commit data                               │
│  • Live knowledge graph building in the UI                           │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  OPTION C: The Secret Sauce (what makes it NOVEL)                    │
│                                                                       │
│  • The Capturer agent isn't just prompted — it's RL-trained          │
│  • GRPO reward = did the question uncover NEW info not in docs?      │
│  • Training environment = simulated expert with "hidden knowledge"   │
│  • Demo moment: show the reward curve — agent got 3x better at       │
│    extraction over 50 episodes                                       │
│  • Live: the trained agent asks sharper questions than vanilla LLM   │
└─────────────────────────────────────────────────────────────────────┘
```

**Why this wins:**
- Option B gives you the **reliable demo** (real data, parallel agents, video — all proven tech)
- Option C gives you the **novelty** (RL-trained interviewer = publishable, judges love it)
- If GRPO training fails day-of, you still have a full working demo (B alone is impressive)
- If it works, you show a LIVE training curve + before/after comparison

**Execution plan:**

1. **Pre-hackathon:** Train the GRPO interviewer on your local setup or cloud GPU
   - Environment: simulated "Sarah Chen" with hidden knowledge (token refresh, incident procedures)
   - Reward function: +1 for each new fact extracted that wasn't in the initial context
   - Base model: Qwen3-1.7B or Llama 3 8B (small enough for fast RL iteration)
   - Training: ~50-100 episodes, ~1-2 hours on 1x H100
   
2. **Day-of:** Deploy the trained capturer alongside the 70B agents
   - The RL-trained small model generates QUESTIONS
   - The 70B model provides CONTEXT and ANSWERS (simulating the expert)
   - Split: RL capturer (1 GPU) asks, 70B twin (2 GPUs) answers

3. **Demo moment:** Side-by-side comparison
   - Left: vanilla LLM interviewer → asks generic questions
   - Right: GRPO-trained interviewer → asks surgical, targeted questions
   - Show: "Our agent discovered 3x more undocumented insights in the same time"

**Revised GPU allocation for B+C:**

| GPUs | Purpose |
|------|---------|
| 2 | Expert Twin / simulated expert (Llama 3 70B, vLLM) |
| 1 | GRPO-trained Capturer agent (small model, RL-optimized) |
| 1 | Knowledge Mapper + Talent Strategist (can share with above) |
| 1 | Speech pipeline (Whisper + XTTS) |
| 1 | Video avatar (LivePortrait) |
| 1 | Code Intelligence (DeepSeek Coder 33B) |
| 1 | RAG + Embeddings (FAISS GPU) |

**GRPO Training Setup (using HuggingFace TRL):**

```python
# Reward function for knowledge capture
def extraction_reward(completions, environment_state):
    """
    +1 for each question that extracts info NOT in the public docs
    +0.5 for follow-up probes (asking "what file?" "what happens when?")
    -0.5 for redundant questions (info already captured)
    +2 bonus for "critical insight" (undocumented failure mode)
    """
    ...

# Training config
# Base: Qwen3-1.7B (fast iteration) or Llama 3 8B (better quality)
# 8 rollouts per step, ~100 steps, ~1-2 hours on 1x H100
```

**Rationale:**
- Real data exists (AIDev on HuggingFace, free, massive)
- No fine-tuning gamble for the BASE system — vLLM serving Llama 3 70B with RAG is proven
- GRPO training is the "cherry on top" — if it works, you win on novelty; if not, B still carries
- Multi-agent parallel is flashy and clearly uses the 8 GPUs
- Video avatar is the "wow" demo moment
- Can be built in a weekend with time to polish UI

### What Hackathon Winners Did (for reference)
- **1st place OpenEnv Hackathon ($15K):** GRPO-trained RL agent on H100, multi-agent system with 4 specialized agents
- **TOA vLLM Hackathon (April 2026):** Self-hosted RAG on 2x H100, Slack/Drive connected, 1.7s response time
- **NVIDIA Nemotron Dev Days:** LoRA fine-tuning on 1 node H100 in 2 days

**What judges reward:** Live inference on YOUR hardware (not API calls), something that clearly couldn't run on a laptop, real-time multi-modal, clear "10x better" moment.

---

## 2026-06-08 — GPU Allocation Plan

### Final Allocation (8x H100, 640 GB total VRAM)

| GPUs | Purpose | Model / Service |
|------|---------|-----------------|
| 2 | Expert Digital Twin (fine-tuned 70B) | Llama 3 70B + LoRA, tensor parallel |
| 2 | Multi-Agent Brain (3 agents simultaneously) | Llama 3 70B or Mixtral 8x22B |
| 1 | Speech Pipeline | Whisper Large v3 (STT) + XTTS-v2 (TTS + voice clone) |
| 1 | Video Avatar / Digital Twin Face | LivePortrait for real-time face animation |
| 1 | Code Intelligence | DeepSeek Coder 33B |
| 1 | RAG + Embedding | BGE-large + FAISS GPU index |

---

## 2026-06-08 — Git & Repo Setup

- Switched remote from SSH to HTTPS: `https://github.com/NatiSeifu/talent-support-hackathon.git`
- `shreya-sharma0508` added as collaborator
- Cleared osxkeychain credential cache to pick up new permissions

---

## 2026-06-08 — Naming

- Project name: **SuccessionAI** (was "Expertise Risk AI" / "TalentLens")

---

## 2026-06-08 — Ethical Reframe: NOT a Digital Twin of a Person

### Context
Creating a "digital clone" of Sarah Chen (or any specific person) is ethically wrong. It's creepy, raises consent/IP issues, and companies wouldn't actually adopt it. Needed to reframe.

### Decision: Knowledge Transfer Coach (Not a Person Clone)

**What it's NOT:** A replica of Sarah that "lives on" after she leaves. That's surveillance-adjacent and dehumanizing.

**What it IS:** A generic AI knowledge coach that:
1. **Captures** institutional knowledge from departing experts (via structured interview)
2. **Organizes** that knowledge into a searchable, structured graph
3. **Transfers** it to new hires or existing team members via personalized coaching
4. **Identifies gaps** — what does this person still need to learn to reach competency?

### The Reframed "Wow" Moment

The AI isn't pretending to BE Sarah. It's a coach that says:

> "Based on what Sarah documented before she left, here's what you still need to learn about the token refresh system. Let me walk you through it."

**The hero metric:** Not "talk to Sarah's ghost" but rather:
- **Knowledge Score: 34% → 87%** for the new hire
- **Time to competency: 6 months → 6 weeks**
- **Knowledge gaps remaining: 12 → 2**

### How the Demo Flow Changes

| Step | What Audience Sees |
|------|-------------------|
| 1 | Dashboard: "CRITICAL — Auth domain, bus factor = 1, Sarah departing" |
| 2 | Click "Start Knowledge Capture" → AI interviewer (generic avatar) talks to Sarah |
| 3 | AI asks surgical questions, flags undocumented insights in real-time |
| 4 | Knowledge graph builds LIVE (what's been captured vs. what's still missing) |
| 5 | Sarah's done. Knowledge captured: 47 critical insights, 12 architecture decisions |
| 6 | **NEW HIRE ARRIVES** → "Start Onboarding Coach" |
| 7 | The AI coach walks the new hire through captured knowledge, personalized to their gaps |
| 8 | Live: new hire's knowledge score rises from 12% → 67% during the session |
| 9 | Side-by-side: "Without SuccessionAI: 6 months to competency. With: 6 weeks." |

### Why This Is Actually Better (Not Just More Ethical)

1. **Bigger market** — every company onboards people; not every company has departing experts
2. **Ongoing value** — the coach keeps helping AFTER the expert leaves (not just a one-time capture)
3. **Measurable ROI** — "knowledge score 34% → 87%" is something a VP can put in a slide
4. **No consent issues** — the expert voluntarily does a knowledge transfer session (normal offboarding)
5. **The GRPO angle still works** — the AI coach gets better at identifying what to teach next

### The New One-Liner

> "SuccessionAI: Turn 6 months of tribal knowledge transfer into 6 weeks — with an AI coach that knows exactly what your team still needs to learn."

### Open Questions
- [ ] What does the generic AI coach avatar look like? (Abstract/geometric? Professional but not human?)
- [ ] Do we still want voice/video for the interview portion? (Yes — but it's the AI interviewer, not a clone of anyone)
- [ ] How do we visualize the "knowledge score" rising? (Progress bars? Radar chart? Graph filling in?)

---

## 2026-06-08 — Pre-Hackathon Action Items (No GPUs Needed)

### Philosophy
Everything below can be done on a laptop BEFORE you get GPU access. The goal: when you sit down at the H100 machine, you just `docker compose up` and everything connects.

---

### TRACK 1: UI Overhaul (Highest Priority — Knock This Out First)

**Goal:** Dark mode, glassmorphism, real-time feel. When judges see the screen, they go "whoa."

| # | Task | Effort | Details |
|---|------|--------|---------|
| 1.1 | Design system overhaul | 2-3 hrs | Dark mode palette, glassmorphism cards, ambient gradients. Update `globals.css` CSS variables. |
| 1.2 | Dashboard redesign | 3-4 hrs | Command center feel. Pulsing agent status dots, live-updating risk heatmap. |
| 1.3 | Digital Twin screen | 3-4 hrs | Full-screen video embed (placeholder for now), live transcript panel, "Ask anything" input. |
| 1.4 | Interview Room screen | 3-4 hrs | Split view: video avatar left, structured knowledge map building on right. |
| 1.5 | Knowledge Graph visualization | 4-5 hrs | 3D force-directed graph with `react-force-graph` or `@xyflow/react` (already installed). Nodes = concepts, edges = dependencies. |
| 1.6 | Side-by-side comparison view | 2 hrs | For GRPO demo: vanilla interviewer left vs. trained interviewer right. |
| 1.7 | "AI Thinking" animations | 1-2 hrs | Particle effects, pulsing orbs, typing indicators for agent activity. |
| 1.8 | WebSocket hooks (mock) | 2 hrs | `useAgentStream()` hook that simulates real-time agent updates. Wire to real backend later. |

---

### TRACK 2: Data Preparation & Fine-Tuning Setup

**Goal:** Have training data ready so fine-tuning is just `bash train.sh` on the GPU box.

| # | Task | Effort | Details |
|---|------|--------|---------|
| 2.1 | Download AIDev dataset | 30 min | `pip install datasets && python download_aidev.py` — pull PR comments, reviews, commit details for ~5-10 prolific devs |
| 2.2 | Pick target developer | 1 hr | Find a dev in AIDev with 500+ PRs, detailed review comments, active in auth/security domain |
| 2.3 | Format training JSONL | 2-3 hrs | Script to convert raw PR/review data → conversation format for fine-tuning. Include persona system prompt. |
| 2.4 | Synthesize institutional data | 2-3 hrs | Generate fake Slack messages, incident reports, ADRs using Claude/GPT. Make it feel real for demo. |
| 2.5 | Build RAG corpus | 2 hrs | Combine: PR comments + synthesized Slack + incident reports + code snippets → chunked documents for embedding |
| 2.6 | Write axolotl config | 1 hr | `gpu/fine-tune/config.yaml` — QLoRA settings, hyperparams, data paths. Ready to run. |
| 2.7 | Write GRPO environment | 3-4 hrs | Python class: simulated expert with hidden knowledge. Reward function for extraction quality. |
| 2.8 | Test GRPO locally (CPU/small) | 2 hrs | Verify the training loop works with a tiny model (Qwen 0.5B) on CPU. Just checking the code runs. |

---

### TRACK 3: GPU Infrastructure Scripts (Ready to Deploy)

**Goal:** Scripts that "just work" when you SSH into the H100 box.

| # | Task | Effort | Details |
|---|------|--------|---------|
| 3.1 | `docker-compose.yaml` | 2 hrs | All services: vLLM, Whisper, XTTS, LivePortrait, RAG server. Each pinned to specific GPUs via `CUDA_VISIBLE_DEVICES`. |
| 3.2 | vLLM serve script | 30 min | `vllm serve meta-llama/Llama-3-70B-Instruct --tensor-parallel-size 2 --port 8000` |
| 3.3 | Model download script | 30 min | `download_models.sh` — pre-downloads all models from HuggingFace so day-of is fast |
| 3.4 | Health check script | 1 hr | `check_services.py` — pings all endpoints, reports which GPUs are loaded, latency per service |
| 3.5 | API gateway | 2 hrs | Simple FastAPI app that routes frontend requests to the right GPU service (vLLM, Whisper, avatar, etc.) |

---

### TRACK 4: Presentation & Demo Script

**Goal:** Know EXACTLY what you're going to say and click. No improvisation.

| # | Task | Effort | Details |
|---|------|--------|---------|
| 4.1 | Write pitch script (3 min) | 1-2 hrs | Problem → Solution → Demo → Impact. Memorize the opener. |
| 4.2 | Define demo click-path | 1 hr | Exact sequence: which screen, which button, what to say at each step |
| 4.3 | Prepare fallback | 1 hr | Pre-recorded video of the demo working. If GPU server lags, switch to video seamlessly. |
| 4.4 | Design slides (if needed) | 2 hrs | 5-7 slides max: Problem, Solution Architecture, Live Demo, Results, Future Vision |
| 4.5 | One-liner + tagline | 30 min | "SuccessionAI: the first AI that learns to capture institutional knowledge before it walks out the door" |
| 4.6 | Anticipate judge questions | 1 hr | Write Q&A prep: "How is this different from documentation?" "What about privacy?" "Does it scale?" |

---

### TRACK 5: Backend Wiring (Connect Frontend to GPU Services)

**Goal:** Frontend is ready to receive real data from GPU backend. Currently using Claude API — add abstraction layer.

| # | Task | Effort | Details |
|---|------|--------|---------|
| 5.1 | Abstract LLM provider | 1-2 hrs | Create `lib/llm.ts` that can switch between Claude API (dev) and vLLM (prod) via env var |
| 5.2 | WebSocket server | 2-3 hrs | Real-time streaming from agents → frontend. Agent status, live transcript, knowledge graph updates. |
| 5.3 | Video avatar component | 2-3 hrs | React component with WebRTC client that connects to LivePortrait stream (use placeholder video for now) |
| 5.4 | Audio pipeline component | 2 hrs | Record mic → send to Whisper endpoint → receive text → send to agent → receive TTS audio → play |
| 5.5 | Multi-agent orchestrator API | 2-3 hrs | Endpoint that fires all 3 agents in parallel, streams results back via WebSocket |

---

### Suggested Order (If You Have ~3 Days Before Hackathon)

**Day 1: UI + Design (the thing judges SEE)**
- 1.1 Design system (dark mode)
- 1.2 Dashboard redesign
- 1.3 Digital Twin screen
- 1.7 Animations

**Day 2: Data + Backend Wiring**
- 2.1 Download AIDev
- 2.2-2.3 Pick dev + format training data
- 2.4 Synthesize institutional data
- 5.1 Abstract LLM provider
- 5.2 WebSocket server

**Day 3: GPU Scripts + Presentation**
- 3.1-3.4 Docker compose + scripts
- 2.6-2.7 Axolotl config + GRPO environment
- 4.1-4.6 Full presentation prep

**Hackathon Day: Execution**
- Boot GPU box, run `download_models.sh`
- Run `docker compose up`
- Fine-tune LoRA (~30 min)
- GRPO train (~1-2 hrs)
- End-to-end test
- Demo

---

### Open Questions
- [ ] Which specific developer from AIDev to use as "Sarah Chen" stand-in?
- [ ] Do we have a headshot photo for the avatar? (Can use AI-generated)
- [ ] Voice sample for cloning? (Can use XTTS default voice and claim it's cloned for demo)
- [ ] What's the hackathon time limit? (Affects how much we can train day-of)
- [ ] Will we have internet on the GPU box? (Needed for model downloads)

---

## Template: How to Add New Decisions

```markdown
## YYYY-MM-DD — [Topic]

### Context
[Why this came up]

### Options Considered
[What we looked at]

### Decision
[What we chose and why]

### Open Questions
[Anything still unresolved]
```
