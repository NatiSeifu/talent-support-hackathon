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

## 2026-06-08 — Backup/Pivot Ideas (Same Track, Same Hardware)

### Context
If we hit a blocker on SuccessionAI (data issues, GRPO not converging, avatar tech flaky), what ELSE can we build in the "talent marketplace + applied AI" track with 8x H100s that would be equally impressive?

### Pivot Options (Ranked by Impressiveness + Feasibility)

---

#### Pivot 1: "AI Technical Interviewer That Actually Learns" (Closest to Current)
**What:** An autonomous AI interviewer that conducts live coding + system design interviews via voice/video — and gets BETTER at evaluating candidates through RL.

**Why it's impressive with 8 GPUs:**
- GPU 1-2: 70B model for adaptive questioning (understands nuanced answers)
- GPU 3: GRPO-trained question selector (learns which questions best differentiate strong vs weak candidates)
- GPU 4: Code execution sandbox + evaluation (runs candidate's code, checks correctness)
- GPU 5: Speech pipeline (real-time voice conversation)
- GPU 6: Video avatar (AI interviewer face)
- GPU 7: Candidate body language/confidence analysis (video understanding model)
- GPU 8: RAG over company's codebase (asks questions about THEIR actual systems)

**Data available:** InterVU-AI and Owlyn (open source, full architectures), Gemini Live API patterns, LeetCode/HackerRank problem sets

**Killer demo moment:** Live side-by-side — AI interviews two candidates. One strong, one weak. Watch the AI adapt its questions in real-time, probe deeper on weak answers, and produce a scored evaluation that matches what a human panel would say.

**Overlap with current work:** ~70%. Same speech/video/multi-agent stack. Just different USE CASE.

---

#### Pivot 2: "Skills Graph — Real-Time Talent Marketplace Intelligence"
**What:** A system that ingests ALL public signals about developers (GitHub, Stack Overflow, blogs, talks, papers) and builds a real-time, queryable skills graph. Companies search "who can build auth systems in Rust at senior level in SF?" and get ranked results with EVIDENCE.

**Why it's impressive with 8 GPUs:**
- GPU 1-2: 70B model for deep skill inference (reading PRs/code to understand TRUE skill level)
- GPU 3-4: Embedding + indexing millions of developer profiles in real-time
- GPU 5: Query understanding (natural language → structured skill search)
- GPU 6: Explanation generation ("Here's WHY we ranked this person #1")
- GPU 7-8: Continuous crawling + re-scoring (always up to date)

**Data available:** AIDev (72K developers with full GitHub history), GitHub API, Stack Overflow data dump (free)

**Killer demo moment:** Type "Find me someone who can own our OAuth system — must have led incidents, written auth code in production, and mentored juniors" → System returns 5 ranked candidates with evidence links to their actual PRs, incident responses, and mentoring signals.

**Differentiator from existing tools:** N1AI, Kasp, etc. do keyword matching. You'd do SEMANTIC skill inference from actual code + communications. 8 H100s let you run inference over millions of profiles in real-time.

---

#### Pivot 3: "AI Onboarding Agent — 10x Faster Ramp"
**What:** A personal AI tutor for new hires that understands the ACTUAL codebase, knows what the new hire already knows (from their GitHub history), and creates a personalized learning path. Voice-interactive, can walk through code live.

**Why it's impressive with 8 GPUs:**
- GPU 1-2: 70B codebase-aware model (indexed the company's entire repo)
- GPU 3: Personalization model (understands what THIS person already knows vs. needs to learn)
- GPU 4: Speech pipeline
- GPU 5: Screen sharing understanding (watches what they're looking at, offers help)
- GPU 6-8: RAG over docs, Slack history, architecture decisions

**Data available:** Any large open-source repo (Linux kernel, Kubernetes, React) as the "company codebase"

**Killer demo moment:** New hire says "I'm looking at the auth module and I don't understand why token refresh works this way." AI: "Great question. That was an architecture decision from 2023 — here's the ADR, here's the incident that motivated it, and here's a 5-minute explanation tailored to your background in OAuth2 from your previous job."

**Overlap with current work:** ~80%. This is basically the "coaching" half of SuccessionAI without the capture half.

---

#### ~~Pivot 4: "Interview Debrief Agent — Kill the Hiring Committee"~~ ← CONFLICTS WITH MERCOR
**What:** After human interviewers conduct interviews, this AI watches/reads all the transcripts and produces a structured, bias-corrected evaluation. It catches when interviewers are inconsistent, asks for calibration, and recommends hire/no-hire with evidence.

**Why it's impressive with 8 GPUs:**
- GPU 1-2: 70B model for deep transcript understanding
- GPU 3: Bias detection model (flags gendered language, halo effects, etc.)
- GPU 4: Calibration model (compares this candidate's answers to historical hires)
- GPU 5-6: Multi-interviewer synthesis (combines 4-5 different interviewers' notes)
- GPU 7: Speech pipeline for voice interaction with the hiring manager
- GPU 8: RAG over company's interview rubrics and past hiring decisions

**Data available:** Would need synthetic interview transcripts (easy to generate with Claude/GPT)

**Killer demo moment:** "Your panel gave this candidate mixed reviews. Interviewer A said strong, B said weak. But my analysis shows B asked an irrelevant question — when I re-score on the actual job requirements, this candidate is a clear hire. Here's the evidence."

---

#### Pivot 5: "Talent Supply Chain — Workforce Planning AI"
**What:** Given your company's product roadmap + current team skills + market data, predict EXACTLY which roles you'll need to hire in 6/12/18 months. Then match against the talent market in real-time.

**Why it's impressive with 8 GPUs:**
- GPU 1-2: 70B for roadmap → skills requirement inference
- GPU 3-4: Market intelligence (process job postings, salary data, availability signals)
- GPU 5-6: Scenario simulation ("What if we lose 2 senior engineers? What if we pivot to AI?")
- GPU 7-8: Continuous re-forecasting

**Killer demo moment:** "Based on your Q3 roadmap, you'll need 2 ML engineers and 1 platform eng by August. The market has 23 qualified candidates in your salary range. 3 are likely open to moves based on LinkedIn activity signals. Here's your optimal hiring timeline."

---

### Recommendation: Keep SuccessionAI, But Know Pivot 3 Is a 1-Day Switch

Pivot 3 (Onboarding Coach) shares 80% of the same infrastructure as SuccessionAI. If you hit a blocker, you can pivot in a single day by just changing system prompts, UI framing, and demo script. The GPU stack stays identical.

---

## 2026-06-09 — CRITICAL FEEDBACK: Refocus on Inference-Time Compute

### Context
Received detailed feedback from someone who understands hackathon judging. The hackathon is called **"Inference-Time Compute"** — judges from **Etched, Cognition, and Mercor** will ask: "Why does this require inference-time compute?"

### The Problem With Our Current Plan
- Current version is a "well-designed SaaS product with AI components"
- It's mostly RAG + interviewing + fine-tuning
- Judges will ask: "Why can't this be built with GPT-4 and a vector database?"
- Avatar, voice cloning, GRPO, fine-tuning = demo candy, not inference-time innovation
- Risk: spend 18 hours making the avatar blink and 6 hours on the actual product

### What Judges Want to See
- **Reasoning** (not retrieval)
- **Investigation** (not storage)
- **Evidence gathering** (not summarization)
- **Verification** (not generation)
- **Multi-agent debate** (not single-shot prompting)
- **Recursive loops** (not one-pass answers)

### The Winning Reframe

**Old pitch:** "We create digital twins of employees"
**New pitch:** "We use inference-time compute to discover what nobody knows — not just store what someone said."

### What To CUT

| Cut This | Why |
|----------|-----|
| ❌ GRPO training | Cool but not the product |
| ❌ LoRA fine-tuning | Not inference-time compute |
| ❌ LivePortrait avatar | Demo candy |
| ❌ Voice cloning | Demo candy |
| ❌ 8-service GPU orchestration | Over-engineering |
| ❌ Digital Twin (fine-tuned model) | 2024 vibes |
| ❌ Knowledge graph 3D visualization | Nice-to-have at best |

### What To KEEP and AMPLIFY

| Keep This | Why It's Inference-Time Compute |
|-----------|-------------------------------|
| **Multi-agent knowledge audit** | Agents recursively debate, investigate, verify. This IS reasoning. |
| **Knowledge gap discovery** | System REASONS about what's undocumented — not retrieval, investigation. |
| **Targeted AI interviewer** | Driven by gap analysis, not generic. Asks questions humans can't. |
| **Hiring spec generation** | Strongest commercial feature. Mercor judges will love this. |
| **Candidate scoring vs real gaps** | Direct talent marketplace value. |
| **Before/after transformation** | The demo story. 34% → 87% coverage. |

### The New Core Loop

```
INPUT:
├── GitHub repo (PRs, reviews, commits, code ownership)
├── Jira export (tickets, ownership, complexity)
├── Incident logs (who responded, what broke, resolution)
└── Architecture docs (whatever exists)

MULTI-AGENT KNOWLEDGE AUDIT (inference-time compute):
│
├── Agent 1: EXPERTISE MAPPER
│   "What does Sarah know? What evidence proves it?"
│   Reasons over: PR patterns, review depth, incident response, code ownership
│
├── Agent 2: GAP DISCOVERER  
│   "What knowledge appears undocumented?"
│   Cross-references: code complexity vs documentation coverage
│   Finds: systems with high complexity + zero docs + single owner
│
├── Agent 3: EVIDENCE VERIFIER
│   "What evidence supports our claims? How confident are we?"
│   Challenges Agent 1 and 2's conclusions
│   Demands: "Show me the PR. Show me the incident. Prove it."
│
├── Agent 4: QUESTION GENERATOR
│   "What questions would extract the missing knowledge?"
│   NOT generic — targeted at specific undocumented systems
│   Uses code intelligence to ask about SPECIFIC functions/failures
│
└── Agent 5: COMPLETENESS EVALUATOR
    "After the interview, what gaps remain?"
    Scores coverage, identifies what still needs capturing
    Generates the hiring spec from remaining gaps

OUTPUT:
├── Knowledge Continuity Score (before: 34%, after: 87%)
├── Critical gaps identified (with evidence + confidence)
├── Targeted interview questions (not generic)
├── Hiring spec (hyper-specific to REAL gaps)
└── Candidate scoring (match resume against actual missing knowledge)
```

### Why This Is Inference-Time Compute

The agents don't just retrieve and summarize. They:
1. **Reason** — "Sarah touched 287 PRs in auth, but NONE have documentation. This is a critical gap."
2. **Investigate** — "In incident AUTH-431, she bypassed Redis. Why? Let me look at the code diff."
3. **Debate** — Agent 3 challenges Agent 1: "You said Mike knows SSO. Show me evidence beyond one PR."
4. **Verify** — "Cross-referencing code ownership with incident history. Confidence: 93%."
5. **Iterate** — Agents loop until consensus. Not one-shot. Recursive reasoning.

**The more compute you throw at this, the more gaps you find.** That's inference-time scaling.

### The Demo (What To Show in 3 Minutes)

1. Upload GitHub + Jira data for a team
2. Show: "Sarah has 94% expertise concentration in Auth. Bus factor = 1."
3. AI identifies undocumented knowledge (multi-agent audit runs LIVE — show reasoning)
4. AI generates 10 highly targeted questions (from code analysis + gap detection)
5. Run a mock interview (targeted questions → expert answers → knowledge captured)
6. Knowledge score jumps: **34% → 87%**
7. System auto-generates hiring spec from remaining gaps
8. Upload candidate → scored against REAL gaps: "Covers 8/12, missing Redis failover"

**The avatar can still exist** as a supporting character (a nice way to present the interviewer), but it's NOT the star. The star is the multi-agent reasoning that discovered what nobody knew was undocumented.

### Revised One-Liner

> "We measure organizational knowledge loss before it happens — and automatically recover missing expertise through inference-time reasoning."

### Value Ranking for Demo Time

| Feature | Demo Time | Value to Judges |
|---------|-----------|-----------------|
| Knowledge gap discovery (multi-agent audit) | 40% | Highest — this IS inference-time compute |
| Hiring spec generation | 25% | Highest — Mercor judges love this |
| Targeted AI interview (gap-driven) | 20% | High — shows the questions aren't generic |
| Candidate scoring vs gaps | 10% | High — direct marketplace value |
| Avatar/video | 5% or skip | Low — supporting character only |

### How This Uses 8 H100s

The question isn't "what services do we run?" — it's "how much REASONING can we do?"

With 8 H100s:
- Run a 70B model that can reason deeply (not a small model that pattern-matches)
- Run ALL 5 agents SIMULTANEOUSLY on the same input (parallel investigation)
- Agent debate/verification loops run multiple rounds (more compute = more gaps found)
- Process an ENTIRE org's GitHub/Jira/incident history (not just samples)
- Real-time: watch the audit happen live, agents finding gaps as you watch

**The pitch:** "On a laptop, this audit takes 20 minutes and finds 60% of gaps. On 8 H100s, it takes 30 seconds and finds 95%. That's inference-time scaling."

### Open Questions
- [x] Do we still do the avatar at all? → **YES. Video interviewer stays. But it's the DELIVERY mechanism for the reasoning, not the innovation itself.**
- [ ] How do we visualize the multi-agent debate? (Show agent reasoning in real-time on screen?)
- [ ] What data do we demo with? (AIDev subset? Synthetic? A real open-source project?)

### How the Video Interviewer Fits (Not the Star — the Delivery)

The AI video interviewer is still in the demo. But here's the difference:

**Generic AI interviewer (what judges have seen before):**
> "Tell me about your role. What systems do you own? Anything else?"

**OUR interviewer (powered by inference-time reasoning):**
> "In incident AUTH-431, you bypassed Redis and hotpatched token validation. The code shows no retry logic at token.ts:247. What happens under cache partition? Who else knows this?"

The interviewer doesn't think up questions itself. The multi-agent audit ALREADY ran — it ALREADY knows what's undocumented, ALREADY analyzed the code, ALREADY identified the gaps. The interviewer is just the interface that delivers those gap-driven questions via video/voice.

**Demo flow:**
```
1. Upload data → Multi-agent audit runs (show reasoning live) → gaps identified
2. Click "Start Exit Interview" → Video AI interviewer appears
3. Interviewer asks SURGICAL questions (generated by the audit, not generic)
4. Expert answers → knowledge captured → score jumps
5. Remaining gaps → auto-generate hiring spec + candidate scoring
```

**What judges see:**
- The inference-time compute = the multi-agent audit (the brain)
- The video interviewer = the impressive delivery (the face)
- Together = "holy shit, the AI figured out what to ask AND it's conducting the interview"

**Implementation: keep Tavus (already integrated) or a simple avatar. Don't build LivePortrait from scratch. The interviewer is a feature, not a workstream.**

---

## 2026-06-09 — Refined Direction (Final)

### Key Refinements from Follow-Up Feedback

**1. No made-up numbers.** Don't say "finds 95% of gaps in 30 seconds." Say: "We scale inference-time reasoning by running multiple specialized auditors in parallel, debating hypotheses, verifying evidence, and recursively generating follow-up questions."

**2. Video interviewer = makes reasoning VISIBLE.** The interviewer stays because demos are emotional. Agent logs changing risk scores = cool. Video AI saying "Sarah, in PR #4821 you added a Redis bypass — why was that necessary?" = memorable. The interviewer is how judges EXPERIENCE the reasoning.

**3. Interviewer tone = INVESTIGATOR, not HR.**

Bad (generic/boring):
- "Tell me about your role."
- "What should your replacement know?"

Good (investigative/intelligent):
- "You were the only reviewer on AUTH-4831. Why?"
- "This code path hasn't changed in 18 months but appears in 4 incidents. What's happening here?"
- "Three outages mention refresh token failures. Walk me through the root cause."

**4. Agent Debate = the thing that wins.** This is what Etched and Cognition get excited about:
```
Evidence Agent:     "Sarah appears to be sole owner of OAuth."
Verification Agent: "Not true. Mike reviewed 40% of auth PRs."
Risk Agent:         "Mike never participated in incidents."
Question Generator: "Ask Sarah about incident response procedures."
```
That's reasoning. That's inference-time compute. Not retrieval. Not summarization.

**5. The pitch (final version):**
> "Organizations don't know what knowledge they're about to lose. We built a multi-agent reasoning system that audits an organization's collective knowledge, identifies undocumented expertise, interviews the people who hold it, and converts that expertise into hiring and onboarding intelligence."

**6. Demo time allocation:**
- 40% — Multi-agent knowledge audit (show agents reasoning, debating, finding gaps)
- 30% — Hiring spec + candidate evaluation (Mercor judges care about this most)
- 20% — Targeted AI interviewer (makes the reasoning visible and emotional)
- 10% — Everything else (score changes, before/after)

**7. The complete story arc:**
```
Knowledge Risk → Knowledge Capture → Hiring Decision
```
- Sarah leaves → gaps identified → AI interviews her → gap coverage improves → hiring spec auto-generated → candidate uploaded → 82/100 match score → done.

### What We're Actually Building (Final Scope)

```
MUST HAVE (Core Product):
├── Multi-agent knowledge audit (5 agents: map, discover, verify, question, evaluate)
├── Agent debate visualization (show reasoning live in UI)
├── Targeted AI interviewer (video, gap-driven questions, investigator tone)
├── Knowledge continuity score (before/after transformation)
├── Hiring spec generator (hyper-specific, from real gaps)
└── Candidate scoring (resume vs actual knowledge gaps)

NICE TO HAVE (If Time):
├── Voice in/out for interview (Whisper + TTS)
├── Onboarding coach (digital twin coaching new hire)
└── Knowledge graph visualization

CUT (Not Building):
├── GRPO training
├── LoRA fine-tuning
├── LivePortrait from scratch
├── Voice cloning
└── 8-service GPU orchestration
```

### How to Think About GPUs Now

The GPUs serve ONE purpose: **run a large model that reasons better.**

- 70B model on 2 GPUs (tensor parallel) for the agent brain — reasons deeper than a small model
- Same model handles all 5 agents (different system prompts, same endpoint)
- Agents run IN PARALLEL (inference-time scaling — more agents = more gaps found)
- Multiple debate rounds (more compute = higher confidence in findings)
- Interview questions generated with full code context (long context window)
- Tavus handles the video avatar (external service, no GPU needed)

That's it. No 8-service orchestra. One brain, five personalities, running in parallel, debating until consensus.

---

## 2026-06-09 — End-to-End User Flow + Technical Architecture

### Complete User Journey (What Someone Actually Does)

---

#### SCREEN 1: Command Center (Dashboard)

**What the user sees:**
- Dark mode dashboard, subtle ambient gradients
- Top: Company health score (e.g., "Knowledge Resilience: 62%")
- Left: Risk heatmap — domains color-coded by bus factor (red = 1 person owns it)
- Right: Agent status panel — 3 dots pulsing (Mapper: active, Capturer: idle, Strategist: idle)
- Center alert: "🚨 CRITICAL — Authentication domain. Sarah Chen is sole knowledge holder. Departure confirmed: June 22."
- Bottom: Signal feed (live updates from GitHub/Jira/PagerDuty showing evidence)

**What the user does:**
- Clicks on "Authentication" domain in the heatmap
- Sees: expertise breakdown (Sarah: 94%, Mike: 32%, no one else)
- Sees: evidence cards (287 PRs, 12 incidents led, 4 systems owned, 0 docs written)
- Two CTAs: "Start Knowledge Capture" and "Generate Hiring Spec"

**Backend at this step:**
- Knowledge Mapper agent (Claude API / vLLM) has pre-analyzed `signals.json`
- Expertise scores: deterministic calculation from signal weights (`lib/expertise.ts`)
- Risk scores: bus factor formula (if top contributor has >70% and runner-up <40% → critical)
- No active inference needed — this screen is mostly pre-computed data visualization

**What to highlight to judges:**
- "These aren't self-reported skills. Every score is traced to real signals — PRs, incidents, code ownership. Click any score and you see the evidence."
- "The system detected this risk automatically. No human had to flag it."

---

#### SCREEN 2: Knowledge Capture (AI Interviewer in Action)

**What the user sees:**
- Split screen: Left = AI interviewer avatar (animated face, speaking), Right = live capture panel
- Top bar: Session info ("Capturing: Authentication Domain | Expert: Sarah Chen | Duration: 14:23")
- Left panel: Video avatar + voice waveform. The AI is speaking/asking questions.
- Right panel: 
  - Live transcript (streaming in, both AI questions and expert answers)
  - Insight flags appearing: "⚡ CRITICAL: Token refresh has no retry on Redis failure"
  - Knowledge completeness meter: "34/47 known gaps addressed"
  - Mini knowledge graph building in real-time (nodes appearing)

**What the user does:**
- In the demo, you PLAY the departing expert (type/speak answers)
- Or: use pre-scripted mode where the Digital Twin simulates the expert's answers
- Watch as the AI asks increasingly specific follow-ups:
  - AI: "You mentioned the token refresh has no retry. What happens in production if Redis is down for more than 30 seconds?"
  - Expert: "The tokens expire silently. Users get 401s. We've had 3 outages from this."
  - AI flags: "⚡ UNDOCUMENTED FAILURE MODE: Silent token expiry on Redis outage >30s"

**Backend at this step:**
```
User audio → [GPU: Whisper STT] → text
                                      ↓
                        [GPU: GRPO-trained Interviewer]
                        Generates next question based on:
                        - What's been captured so far
                        - What gaps remain (from knowledge map)
                        - What the expert just said (context)
                                      ↓
                        [GPU: Code Intelligence - DeepSeek]
                        Optionally pulls relevant code to inform question
                                      ↓
Question text → [GPU: XTTS TTS] → audio → [GPU: LivePortrait] → video frames
                                                                      ↓
                                                              WebRTC → browser
```

- **GRPO model** picks questions. It was trained to maximize extraction reward.
- **RAG** provides context: "What's already been asked? What gaps remain?"
- **Code Intelligence** optionally runs: "The code at auth-service/src/token.ts line 247 shows no retry — ask about this."
- **Knowledge Mapper agent** runs in background: re-scoring expertise as new facts emerge.
- **WebSocket** streams insights to the right panel in real-time.

**Key technical detail for judges:**
- The interviewer is a SEPARATE model from the one answering. It's small (1.7B) and RL-optimized.
- Reward signal during training: did the question uncover information NOT in any existing documentation?
- Show the training curve if asked: "Over 100 episodes, extraction rate improved from 12 insights/session to 38."

**What to highlight:**
- "This isn't a chatbot. It's been trained via reinforcement learning to ask questions that uncover UNDOCUMENTED knowledge. Watch it probe deeper on failure modes — things you'd never find in code or docs."
- "See that knowledge completeness meter? It knows what it DOESN'T know yet."

---

#### SCREEN 3: Knowledge Graph (Visual Proof)

**What the user sees:**
- Full-screen force-directed graph
- Nodes = captured knowledge items (color-coded: green = captured, red = gap, yellow = partial)
- Edges = dependencies ("Token refresh" → depends on → "Redis configuration" → depends on → "AWS ElastiCache setup")
- Cluster labels: "Authentication", "SSO", "OAuth", "Incident Response"
- Stats overlay: "47 critical items | 34 captured | 13 remaining gaps | 3 undocumented systems found"

**What the user does:**
- Click a node → see the source: "Captured from interview session 2, timestamp 14:23"
- Click a red node → "NOT YET CAPTURED — AI Interviewer will prioritize this in next session"
- Zoom into a cluster to see detail

**Backend at this step:**
- Graph built from structured extraction (Mapper agent parses interview transcripts → entities + relationships)
- Uses `@xyflow/react` for rendering
- Nodes update via WebSocket as interview progresses
- Stored as JSON graph in `lib/knowledge-graph.ts`

**What to highlight:**
- "This is the first time this organization has SEEN what knowledge lives only in one person's head. Before today, no one knew these 47 items existed — they were all tribal."

---

#### SCREEN 4: Hiring Spec Generator

**What the user sees:**
- Left: Auto-generated hiring spec (NOT a generic JD)
  - Title: "Senior Authentication Engineer — Knowledge Continuity Hire"
  - Section 1: "Critical Systems You'll Own" (with specifics from captured knowledge)
  - Section 2: "What You MUST Know Day 1" (gaps that can't be taught)
  - Section 3: "What We'll Coach You On" (gaps the twin can teach)
  - Section 4: "Interview Questions" (generated from captured tribal knowledge)
- Right: Candidate scoring panel
  - Upload resume → "Candidate gap score: 8/12 critical areas covered"
  - Missing areas highlighted in red
  - "Estimated time to competency: 4 weeks"

**What the user does:**
- Reviews the auto-generated spec
- Uploads a candidate resume
- Sees gap analysis: "This person has OAuth experience but has never dealt with Redis failover in auth context. They'll need 2 weeks of coaching on failure modes."
- Clicks "Generate Interview Questions for This Candidate" → gets questions targeting THEIR specific gaps

**Backend at this step:**
```
Captured knowledge + remaining gaps
          ↓
[Talent Strategist Agent - 70B on vLLM]
          ↓
├── Hiring spec (structured output, Zod-validated)
├── Interview questions (tailored to captured gaps)
└── Candidate scoring function (match resume → gaps)
```

- **Digital Twin** + **RAG** provide the context for spec generation
- Candidate resume parsed → embedded → compared against knowledge gap vectors
- Score = cosine similarity between candidate experience embeddings and gap embeddings

**What to highlight:**
- "This hiring spec is impossible to write without the AI capture session. No human could produce this level of specificity for a role that requires undocumented tribal knowledge."
- "The interview questions aren't LeetCode. They probe for things only someone with THIS specific experience would know."

---

#### SCREEN 5: Onboarding Coach (Digital Twin in Action)

**What the user sees:**
- Split: Left = chat/voice interface with the Digital Twin, Right = progress dashboard
- Top: "New Hire: Alex Park | Role: Senior Auth Engineer | Day 3 of onboarding"
- Left: Conversational UI where the new hire asks questions
  - Alex: "How does the token refresh work?"
  - Twin: "The refresh flow is triggered by... [detailed answer with context]. Important: there's no retry logic on Redis failure — this has caused 3 outages. See incident reports from March and July. Here's the code path: auth-service/src/token.ts → refreshToken() → line 247."
- Right: Knowledge score dashboard
  - Overall: 67% → rising
  - By domain: Auth (82%), SSO (45%), Incidents (71%), Architecture (34%)
  - "Recommended next: Ask about SSO enterprise patterns — your biggest gap"
  - Learning path: checklist of topics, some checked off

**What the user does:**
- Types/speaks questions to the Digital Twin
- Twin answers with captured knowledge + code references + source citations
- Watches knowledge score rise as they cover topics
- Gets personalized recommendations: "You've covered auth but haven't asked about incident response. Critical: learn the escalation path before your first on-call."

**Backend at this step:**
```
New hire question → [RAG: retrieve relevant captured knowledge]
                            ↓
                 [Digital Twin: Llama 70B + LoRA]
                 (fine-tuned on captured interview transcripts,
                  PRs, incidents, code context)
                            ↓
                 Answer (with citations to source)
                            ↓
[Knowledge Score System] tracks which topics covered
                            ↓
                 Update score + recommend next topic
```

- **Twin** is the fine-tuned model — it's been LoRA-tuned on everything captured
- **RAG** supplements with full docs/code that weren't in the fine-tune
- **Knowledge score** = (topics covered with demonstrated understanding) / (total critical topics)
- **Personalization**: system tracks what THIS user has asked, adjusts recommendations

**What to highlight:**
- "This is where Mercor's job ends and ours begins. They found Alex. We're making Alex productive in 6 weeks instead of 6 months."
- "The twin doesn't make things up. Every answer cites where the knowledge came from — interview session, PR, incident report."
- "Knowledge score isn't a test — it's tracking what they've been exposed to and what gaps remain."

---

#### SCREEN 6: Results / Metrics (The Payoff)

**What the user sees:**
- Big animated numbers:
  - "Knowledge captured: 47 critical insights"
  - "Knowledge score: 34% → 87%"
  - "Time to competency: 6 months → 6 weeks"
  - "Undocumented systems discovered: 3"
- Comparison panel (GRPO vs vanilla):
  - "Vanilla LLM interviewer: 12 insights/session"
  - "GRPO-trained interviewer: 38 insights/session (3.2x improvement)"
  - Training reward curve graph
- ROI calculation:
  - "Cost of 6-month ramp at $180K salary: $90K in lost productivity"
  - "Cost of SuccessionAI: 1 hour of expert time + GPU compute"
  - "Savings: $75K per critical hire"

---

### Judge Q&A Prep (Technical Deep Dives)

**Q: "How is this different from just recording a knowledge transfer meeting?"**
A: "Three ways. First, our AI knows what to ASK — it's been RL-trained to uncover things the expert wouldn't think to mention. Humans forget to document failure modes. The AI specifically probes for them. Second, the output isn't a video you have to watch — it's structured, queryable knowledge. Third, the Digital Twin makes that knowledge conversational and personalized. You ask YOUR question, get YOUR answer, in YOUR context."

**Q: "How do you ensure the Digital Twin doesn't hallucinate?"**
A: "Three layers. First, it's RAG-grounded — every answer is retrieval-augmented from captured content. Second, every response cites its source (interview timestamp, PR link, incident report). Third, we run confidence scoring — if the twin isn't confident, it says 'this wasn't covered in knowledge capture sessions' rather than guessing."

**Q: "What if the expert gives wrong information during capture?"**
A: "The Code Intelligence model cross-references answers against actual code. If the expert says 'there IS retry logic' but the code shows there isn't, the system flags the discrepancy: 'Code shows no retry at token.ts:247 — can you clarify?' This actually catches outdated mental models the expert might have."

**Q: "Why do you need 8 H100s? Can't you do this with API calls?"**
A: "For the demo, yes — it works on Claude API today. The 8 GPUs unlock three things: (1) The Digital Twin requires fine-tuning on captured knowledge — you can't LoRA-tune GPT-4. (2) Sub-500ms latency for real-time voice conversation — API round-trips add 2-3 seconds. (3) Data sovereignty — institutional knowledge never leaves the company's infrastructure. Enterprise customers won't send their tribal knowledge to OpenAI's servers."

**Q: "What's the GRPO reward function?"**
A: "We define 'good questions' as ones that extract information NOT present in any existing documentation or code comments. +1 for a new fact, +0.5 for a useful follow-up probe, +2 for an undocumented failure mode, -0.5 for asking something already captured. The model learns to prioritize the highest-value questions — failure modes, edge cases, undocumented decisions — over generic ones."

**Q: "How do you define and measure 'knowledge score'?"**
A: "We pre-define a knowledge map for each critical domain — a graph of required understanding. For auth, that's 47 items: how token refresh works, Redis failover behavior, SSO enterprise patterns, incident escalation, etc. The score is (items the new hire has demonstrably engaged with and shown understanding of) / (total items). It's not a quiz — it's tracked through their interactions with the Twin. If they ask about token refresh AND ask a follow-up about the failure mode, those items are marked as covered."

**Q: "How is this different from Confluence/documentation?"**
A: "Documentation is write-once, read-never. It goes stale. It doesn't know what YOU don't know. It can't ask follow-up questions. Our system is: (1) actively extracted (not passively written), (2) conversational (ask what YOU need), (3) personalized (knows YOUR gaps), (4) measurable (tracks what's covered), (5) living (updates as new knowledge is captured). Also — 80% of critical tribal knowledge is never written down in the first place. That's the whole point."

**Q: "What about privacy? You're recording expert interviews."**
A: "Three things. First, the expert consents — this is a voluntary offboarding session, like a normal knowledge transfer meeting. Second, everything runs on-prem on your GPUs — zero data goes to third parties. Third, the captured knowledge is attributed and auditable — the org owns it, not us. We're just the tool that captures and structures it."

---

## 2026-06-08 — Mercor Overlap Analysis (What NOT to Build)

### What Mercor Already Does
- **AI-led candidate interviews** (20 min, voice-based, role-specific questions)
- **Resume screening + semantic matching** (NL role brief → ranked shortlist)
- **Performance prediction** (RL-based, improves with data)
- **Candidate scoring + structured evaluation** (transcripts + scores for employers)
- **Talent marketplace** (4M+ vetted experts, matching, contracting, payments)
- **Enterprise AI agents** (organizational context graph, workflow mapping, agent specs)
- **AI-moderated interviews to surface institutional knowledge** (part of their Enterprise product)

### What Conflicts — DO NOT BUILD
| Idea | Why It Conflicts |
|------|-----------------|
| AI Technical Interviewer (Pivot 1) | This IS Mercor's core product. They do AI interviews already. |
| Skills matching / ranking marketplace (Pivot 2) | This IS their marketplace. Semantic matching is their moat. |
| Interview debrief / scoring (Pivot 4) | They already generate transcripts + structured evaluations. |
| Candidate assessment via AI | Their literal business model. |

### What Mercor Does NOT Have (Your White Space)

| Gap | Why Mercor Doesn't Do This | Opportunity |
|-----|---------------------------|-------------|
| **Post-hire knowledge transfer** | They stop at hiring. Once someone's placed, they're done. | SuccessionAI lives AFTER the hire — ramping them up. |
| **Departing employee knowledge capture** | They find new people. They don't extract knowledge from people leaving. | No one does this well with AI. |
| **Organizational knowledge resilience** | They match individuals to roles. They don't map/protect institutional knowledge. | "Bus factor" analysis is untouched. |
| **New hire competency acceleration** | They screen candidates. They don't help them BECOME competent once hired. | Onboarding coaching is post-Mercor. |
| **Knowledge graph of an org's expertise** | Their context graph maps WORKFLOWS, not WHO KNOWS WHAT. | Expertise concentration mapping is novel. |
| **RL-trained knowledge extraction** | Their RL optimizes candidate SCORING. Not knowledge CAPTURE. | GRPO for extraction is differentiated. |

### Updated Position: SuccessionAI Is PERFECTLY Positioned

SuccessionAI fills the gap Mercor doesn't touch:

```
MERCOR'S WORLD                    YOUR WORLD (SuccessionAI)
─────────────────                 ──────────────────────────
Source candidates        →→→→→    [gap]
Screen & interview       →→→→→    [gap]
Match to role            →→→→→    [gap]
Hire & onboard           →→→→→    Person starts... now what?
                                  │
                                  ▼
                                  WHO knows what? (expertise mapping)
                                  WHO is a risk to leave? (bus factor)
                                  HOW do we capture their knowledge? (AI interview)
                                  HOW do we ramp up replacements? (AI coach)
                                  WHAT's the knowledge score? (measurable competency)
```

**The pitch to Mercor judges:** "You solve WHO to hire. We solve what happens AFTER — making sure knowledge doesn't walk out the door, and new hires reach competency 3x faster."

### Revised One-Liner (Mercor-aware)

> "Mercor finds you the right person. SuccessionAI makes sure they — and your team — never lose critical knowledge again."

Or for the hackathon:

> "The talent lifecycle doesn't end at hiring. SuccessionAI picks up where the marketplace leaves off — capturing institutional knowledge and coaching new hires to competency in weeks, not months."

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

---

## 2026-06-09 — Final Product Identity (Locked)

### The Evolution

```
Version 1: "AI exit interview tool"
Version 2: "Knowledge capture + digital twin"
Version 3: "Multi-agent knowledge auditing + hiring intelligence"
Version 4 (FINAL): "Inference-time organizational knowledge auditing 
                     and workforce readiness evaluation"
```

### What Makes This Version Win

We moved from "Who knows stuff?" to "Who can become effective fastest?"

That's a harder, more valuable problem. And it's what Mercor's thesis is built on (measuring capability better).

### The Screen That Sells It

Not: `Candidate Match: 82/100` (boring, everyone has match scores)

Instead: **Candidate Readiness Report**
```
Candidate: Alex Park

Knowledge Gap Coverage:        82%
Critical Gaps Covered:         3/4
Adaptability:                  94%
Knowledge Acquisition Speed:   88%
Expected Ramp Time:            3 weeks

Generated Learning Challenge:  [View Response]
```

### Terminology (Defensible, Not Dangerous)

| Don't Say | Say Instead |
|-----------|-------------|
| IQ | Adaptability Assessment |
| Potential | Knowledge Acquisition Speed |
| Talent Score | Ramp-Time Simulation |
| Best Candidate | Candidate Readiness Report |

### The Remaining Challenge

The idea is locked. The biggest challenge is now 100% execution:
1. Make the audit pipeline BELIEVABLE (agents finding real insights from real-looking data)
2. Make generated challenges feel TAILORED (not generic interview questions)
3. Make the demo FLOW (tight, emotional, no dead air)

### Status: READY TO BUILD. No more planning. No more ideation. Build.

---

## 2026-06-09 — The Pitch (Final, Memorize This)

### The Idea (For Teammates / Anyone)

An AI-powered organizational knowledge audit.

When a key employee is leaving, we ingest company signals (PRs, incidents, tickets, docs) and run 5 specialized agents:

- **Evidence Agent** → finds raw signals
- **Expertise Agent** → determines who actually knows what
- **Risk Agent** → identifies undocumented/high-risk knowledge
- **Skeptic Agent** → challenges conclusions and finds contradictions
- **Question Agent** → generates targeted interview questions

The agents debate in multiple rounds until they either reach confidence or identify unresolved questions.

Those unresolved questions are handed to an **AI video interviewer** (Tavus). Instead of generic exit interview questions, it asks things like:

> "You were the only reviewer on AUTH-4831. Why?"

> "Four outages reference refresh token failures. What was the root cause?"

The answers resolve uncertainty, fill documentation gaps, and reduce organizational knowledge risk.

Finally, we convert captured knowledge into:
1. A hiring specification tailored to the exact missing expertise
2. Candidate gap analysis
3. Adaptability/ramp-up assessments generated from real organizational knowledge gaps

**Inference-time compute angle:** We use GPU budget for multi-agent investigation, debate, verification, and uncertainty reduction — not just a chatbot.

---

### How We Use 8 H100s (For Teammates / Judges)

We're not using the GPUs to run one chatbot. We're using them to scale inference-time investigation.

```
vLLM serving Llama 3.3 70B:
  tensor_parallel_size = 2  (2 GPUs per model replica)
  data_parallel_size = 4    (4 replicas)
  2 × 4 = 8 H100s fully utilized
```

Each replica handles different agent workloads in parallel:

| Replica | Workload |
|---------|----------|
| 1 | Evidence Agent — scans PRs, incidents, tickets, docs, code ownership |
| 2 | Expertise Agent — infers who knows what, assigns confidence levels |
| 3 | Risk Agent — finds undocumented, stale, single-owner, high-criticality knowledge |
| 4 | Skeptic Agent — challenges conclusions, searches for contradictory evidence |

Then additional rounds:
- Agents respond to Skeptic's objections
- Unresolved claims trigger deeper investigation
- Question Agent generates targeted interview questions
- Final synthesis produces: risk score, open questions, hiring spec, candidate challenges

**GPU budget is used for:**
- Parallel multi-agent reasoning
- More debate rounds
- More evidence verification
- Larger org-scale context
- More hypotheses tested before the interview
- Faster generation of targeted interview questions and hiring intelligence

**The sentence to memorize:**
> "We use 8 H100s as parallel inference lanes for multi-agent investigation, not as one giant chatbot."

**Implementation:**
```
vLLM → Llama 3.3 70B → tensor_parallel=2 → data_parallel=4 → 8 H100s
OpenAI-compatible endpoint → your app just calls one URL
```

---

## 2026-06-09 — Final Mercor Positioning + Demo Time Split

### The Core Distinction

**Mercor:** Starts with the CANDIDATE → evaluates capability → matches to job
**SuccessionAI:** Starts with KNOWLEDGE LEAVING → audits what's at risk → determines what's needed → evaluates candidates against that

Different starting point. Different category.

### If a Mercor Founder Challenges You

> "Mercor starts with the candidate and tries to understand capability. We start with the organization's missing knowledge and determine what capability is actually required."

### Where Our Moat Is

| Uniqueness | Feature |
|-----------|---------|
| **Highly unique** | Multi-agent organizational knowledge audit |
| **Highly unique** | Discovering undocumented expertise from signals |
| **Highly unique** | Converting knowledge loss into hiring requirements |
| **Highly unique** | Exit interview driven by evidence-based gaps |
| **Somewhat unique** | Adaptability challenges generated from real org gaps |
| **Not unique** | Resume scoring, AI interviewing, candidate ranking |

### Demo Time Split (Final)

**80% on audit + capture (what makes us different)**
**20% on hiring (what proves business value)**

The hiring side proves we're useful. The audit side proves we're novel.

### Adaptability Claim (Be Careful)

**Don't say:** "We can predict who learns fastest" (hard claim, pushback guaranteed)
**Do say:** "We generate domain-specific reasoning challenges derived from identified knowledge gaps and evaluate candidate responses" (defendable)

### What's Actually Unique About Us

Not the hiring. Not the interview. Not the resume scoring.

It's: **"What knowledge will disappear if Sarah leaves?"**

And specifically:
> "Sarah is the only person who knows: Redis failover edge cases, token refresh outage history, why AUTH-4831 exists."

That's the sentence that makes judges pay attention.

---

## Decision 22: Why The Interview Exists (Judge Defense)

**Date:** June 9, 2026

**The question judges will ask:** "If the agents are so smart, why do you need the interview?"

**The answer:** Agents can only reason over existing evidence (PRs, tickets, incidents, docs, code). They cannot see Sarah's brain. They are detectives — they gather evidence, form theories, challenge theories. But eventually they reach **known unknowns** that no amount of data analysis can resolve.

**Example:** Agents find 4 outages involving refresh tokens. Risk Agent finds Redis correlation. Skeptic says "no proof of causation." Status: UNRESOLVED. The interview question becomes: "Sarah, why was Redis bypassed in AUTH-4831?" — because only Sarah can explain the causal reasoning that was never written down.

**The pitch line:** "The interview is only triggered when the agents cannot resolve uncertainty from available evidence."

**Why this is strong:** The goal isn't to replace Sarah. The goal is to identify exactly what ONLY Sarah can explain.

---

## Decision 23: Risk Scoring — Evidence, Not Magic Numbers

**Date:** June 9, 2026

**Problem:** A judge will ask "Why 94 and not 67?" if we show numeric scores.

**Solution:** Use qualitative levels (LOW / MEDIUM / HIGH / CRITICAL) earned by evidence factors. Show the EXPLANATION, not the formula.

**Display pattern:**
```
Knowledge Risk: HIGH
Confidence: 91%

Why HIGH?
✓ Bus Factor: 1
✓ Documentation Freshness: 18%
✓ Incident Ownership: 92%
✓ Business Criticality: High
✓ Departure: Confirmed
```

After interview: `HIGH → MEDIUM` (not `94 → 31`)

**Why:** Qualitative levels are easier to defend. Nobody argues "is it really 94 vs 88?" but they DO understand "this is CRITICAL because one person holds all the knowledge."

---

## Decision 24: Presentation = Story, Not Architecture

**Date:** June 9, 2026

**Most teams will fail by:** spending 3 minutes explaining agents, MCPs, vector databases, RAG, H100s, vLLM.

**Our approach:** Tell a mini-movie. Start with "Sarah is leaving Friday." End with "Nobody panics." Never say "multi-agent reasoning framework" to judges.

**Rule:** If judges care about Sarah, they'll care about everything after that. The best demos make people emotionally feel the problem before explaining the solution.

**12 slides:** See SPEC.md for full structure. Key moments:
- Slide 6: Agents arguing like a group chat
- Slide 7: "We still don't know" (UNRESOLVED)
- Slide 9: ⚡ CRITICAL KNOWLEDGE RECOVERED (money shot)
- Slide 12: Without/With comparison (funny ending)

