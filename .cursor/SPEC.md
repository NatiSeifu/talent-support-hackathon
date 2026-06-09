# SuccessionAI — Final Build Spec

> This is the definitive implementation guide. Any agent or developer can build the entire system from this document. No other spec overrides this one.

---

## The Product (One Sentence)

"Organizations don't know what knowledge they're about to lose. We built a multi-agent reasoning system that audits collective knowledge, identifies undocumented expertise, interviews the people who hold it, and converts that into hiring intelligence."

---

## Core Demo Flow

Sarah is leaving. System audits company data → finds what knowledge will disappear → interviews Sarah → captures missing knowledge → generates hiring spec → scores candidates.

**That's it. Do not build extra features.**

---

## Tech Stack

- **Frontend:** Next.js, Tailwind, shadcn/ui, Framer Motion, React Flow
- **Backend:** Next.js API routes, one LLM endpoint (OpenAI-compatible)
- **Data:** JSON files (no real Jira/GitHub integration)
- **Video Interview:** Tavus (already integrated)
- **LLM (dev):** Claude API via OpenAI-compatible wrapper
- **LLM (hackathon):** vLLM serving Llama 3.3 70B on 8 H100s
- **Design:** Light mode only. Linear + Vercel + Stripe + enterprise risk dashboard.

---

## Frontend — 5 Screens

### Screen 1: Command Center

- "Sarah Chen is leaving"
- Knowledge risk score
- Agent debate live feed
- Critical gaps list
- CTA: "Run Knowledge Audit"

### Screen 2: Agent Audit

- 5 agents running in parallel
- Cards sliding in with findings
- Disagreements highlighted (agent debate visible)
- Evidence citations on every claim
- Real-time — findings appear as agents reason

### Screen 3: AI Exit Interview

- Tavus video interviewer
- Targeted questions (from Agent 5's output)
- Live transcript
- "⚡ Critical insight captured" animation
- Investigator tone — not HR tone

### Screen 4: Knowledge Recovery

- Before/after score: **34% → 87%**
- Graph fills in as gaps get captured
- Gaps disappear from the list
- Clear visual transformation

### Screen 5: Hiring Intelligence

- Auto-generated hiring spec (hyper-specific)
- Upload resume button
- Candidate match score (e.g., 82/100)
- Which gaps this candidate covers vs. which they don't
- Generated interview questions for THIS candidate's missing areas

---

## Backend Routes

```
/api/audit/run        → kicks off multi-agent audit
/api/audit/status     → returns current findings (stream/poll)
/api/interview/questions → returns targeted questions from audit
/api/interview/capture   → receives interview answers, updates score
/api/hiring/spec      → generates hiring spec from gaps
/api/hiring/evaluate  → scores candidate resume against gaps
/api/demo/reset       → resets demo state
```

---

## Data (JSON Files)

```
/data/company.json     → org structure, team members
/data/prs.json         → pull requests (author, reviewer, files, description)
/data/incidents.json   → incidents (who responded, what broke, resolution)
/data/jira.json        → tickets (assignee, domain, complexity, status)
/data/docs.json        → documentation coverage (which systems are documented)
/data/candidates.json  → sample candidate resumes for scoring
```

No real Jira/GitHub integration. But support uploads to look real:
- Upload GitHub export (JSON)
- Upload Jira CSV
- Upload incident JSON
- Upload resume PDF

---

## The 5 Agents

One LLM, five prompts. All call the same endpoint.

### Agent 1: Evidence Agent

**Job:** Finds raw signals from data.

**Example output:**
> "Sarah authored 82% of auth incident fixes. She was sole reviewer on 14 critical PRs. She owns 94% of code in auth-service/src/token.ts."

**Tools:** `query_prs()`, `query_incidents()`, `query_jira()`, `query_code_ownership()`

---

### Agent 2: Expertise Agent

**Job:** Infers who knows what, with confidence.

**Example output:**
> "Sarah is primary holder for OAuth token refresh (confidence: 96%). Mike has surface-level exposure to SSO (confidence: 42% — only reviewed, never authored)."

**Tools:** `get_evidence_summary()`, `compute_expertise_score()`

---

### Agent 3: Risk Agent

**Job:** Finds dangerous gaps — undocumented + single-owner systems.

**Example output:**
> "CRITICAL: Redis failover in token refresh is completely undocumented. Only Sarah has touched this code path. Bus factor = 1. Zero documentation exists."

**Tools:** `get_expertise_map()`, `check_documentation_coverage()`, `get_bus_factor()`

---

### Agent 4: Skeptic Agent

**Job:** Challenges other agents' claims. Demands evidence. Finds contradictions.

**Example output:**
> "Expertise Agent claims Mike knows SSO. Evidence: Mike reviewed 40% of SSO PRs. BUT Mike never participated in a single SSO incident and never authored SSO code. His understanding is likely superficial. Revise confidence to 15%."

**Tools:** `get_agent_findings()`, `query_evidence(claim)`, `challenge(claim, counter_evidence)`

---

### Agent 5: Question Agent

**Job:** Generates targeted interview questions from confirmed gaps.

**Example output:**
> 1. "In incident AUTH-431, you bypassed Redis and hotpatched token validation. Why was that necessary?"
> 2. "This code path hasn't changed in 18 months but appears in 4 incidents. What's happening here?"
> 3. "Three outages mention refresh token failures. Walk me through the root cause."
> 4. "You were the only reviewer on AUTH-4831. Why?"

**Tools:** `get_confirmed_gaps()`, `get_relevant_code()`, `get_incident_details()`

---

### Agent Debate (The Key Innovation)

Agents don't run once. They run in ROUNDS:

```
Round 1: Each agent produces initial findings (parallel)
Round 2: Skeptic reads all findings, challenges claims
Round 3: Other agents respond with more evidence or concede
Round 4: Final synthesis — confirmed gaps, confidence scores, questions
```

**UI shows this debate live.** Cards slide in. Disagreements are highlighted. Evidence is cited. This IS the inference-time compute demo.

---

## LLM Abstraction (GPU Adapter Layer)

```typescript
// lib/llm.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY || "local-key",
  baseURL: process.env.LLM_BASE_URL,
});

export async function runLLM(
  messages: { role: string; content: string }[],
  temperature = 0.2
) {
  const res = await client.chat.completions.create({
    model: process.env.LLM_MODEL || "local-model",
    messages,
    temperature,
  });
  return res.choices[0]?.message?.content ?? "";
}
```

**Before hackathon:**
```env
LLM_BASE_URL=https://api.anthropic.com/v1  (or OpenAI-compatible wrapper)
LLM_API_KEY=sk-ant-...
LLM_MODEL=claude-sonnet-4-20250514
```

**At hackathon:**
```env
LLM_BASE_URL=http://gpu-box:8000/v1
LLM_API_KEY=local-key
LLM_MODEL=meta-llama/Llama-3.3-70B-Instruct
```

App doesn't know or care which one it's talking to.

---

## GPU Setup (Hackathon Day)

```bash
docker run --gpus all \
  --ipc=host \
  -p 8000:8000 \
  -e HUGGING_FACE_HUB_TOKEN=$HF_TOKEN \
  vllm/vllm-openai:latest \
  --model meta-llama/Llama-3.3-70B-Instruct \
  --tensor-parallel-size 2 \
  --data-parallel-size 4 \
  --max-model-len 32768 \
  --gpu-memory-utilization 0.90 \
  --host 0.0.0.0 \
  --port 8000
```

- 2 GPUs per model replica × 4 replicas = **8 GPUs fully utilized**
- 4 parallel replicas = 5 agents can all reason simultaneously
- vLLM serves OpenAI-compatible API — zero code changes needed

**Fallback:** If GPUs break, demo still works on Claude. Set `USE_LOCAL_LLM=false`.

---

## Why 8 GPUs? (Judge Answer)

> "We are not using GPUs for one chatbot. We use them to scale inference-time investigation. Each H100 lane runs independent auditors, skeptics, and question generators over the same org history. More inference budget means more hypotheses tested, more contradictions caught, and more undocumented knowledge gaps discovered."

---

## 7-Day Build Plan

### Day 1: Story + Dataset
- Finalize the Sarah/auth/Redis/OAuth incident universe
- Create realistic JSON data files (PRs, incidents, Jira, docs)
- Make it feel like a real company

### Day 2: UI Skeleton
- Build all 5 screens with fake/hardcoded states
- Make it beautiful BEFORE making it real
- shadcn/ui components, Framer Motion transitions

### Day 3: Agent Backend
- Build all 5 agents with structured JSON output
- Build the debate loop (rounds 1-4)
- Test with Claude API

### Day 4: Connect Audit → UI
- Stream agent findings to frontend
- Show live cards sliding in
- Highlight disagreements
- Show evidence citations

### Day 5: Tavus Interview
- Connect Tavus to interview flow
- Feed questions from Agent 5
- Show live transcript + insight captures
- Even ONE great targeted question is enough

### Day 6: Hiring Spec + Resume Scoring
- Build hiring spec generation from confirmed gaps
- Build candidate scoring (resume → gap overlap)
- This is the money screen. Polish it.

### Day 7: Polish + Pitch
- Animations, transitions, loading states
- Practice demo 3x with timer
- No new features
- Record fallback video

---

## Presentation Structure

### Slide 1
**"Sarah is leaving Friday."**

Tiny text: *"So is everything she knows."*

### Slide 2
Show company chaos.

"Docs say 'TODO.' Jira says 'ask Sarah.' Slack says 'Sarah fixed this last time.'"

### Slide 3
Your product.

**"We find what your company is about to forget."**

### Slide 4
**Live Demo.** (No talking too much. Just show.)

### Slide 5
Before/after.

Knowledge coverage: **34% → 87%**
Hiring clarity: generic JD → exact missing expertise

### Slide 6
Why now.

"Inference-time compute lets us audit an organization like a team of paranoid senior engineers."

### Slide 7
Mercor angle.

"We don't just ask who is qualified. We define qualified from the actual knowledge gaps."

---

## Demo Script (What To Say)

**Open with:**
> "Every company has a Sarah. The person who knows why the system works, why it breaks, and why the docs are lying."

**Then show the product:**
> "We audit the org, identify the undocumented knowledge Sarah holds, interview her with questions generated from evidence, and convert that into hiring intelligence."

**End with:**
> "We turn institutional memory into an executable hiring spec."

---

## Do NOT Build

- ❌ Full digital twin
- ❌ Fine-tuning / LoRA
- ❌ GRPO / RL training
- ❌ Complex video avatar infra (use Tavus)
- ❌ Full Jira/GitHub OAuth integration
- ❌ Dark mode
- ❌ Admin settings / user accounts
- ❌ Complicated graph editing
- ❌ Voice cloning
- ❌ Onboarding coach
- ❌ Knowledge graph 3D visualization

---

## Success Criteria

Hackathon winners are clean demos, not giant apps. Your goal:

**Sleek UI + real agent reasoning + emotional story + hiring intelligence payoff.**

---

## Three Execution Rules

### 1. Make the Risk Score Concrete

Don't show: `Knowledge Risk Score: 94` (feels arbitrary)

Show the breakdown that EARNS the number:

```
Auth Domain
├── Bus Factor: 1 (only Sarah)
├── Documentation Coverage: 18%
├── Incident Ownership: 92% (Sarah led)
├── Code Ownership: 87% (Sarah authored)
└── Departure Risk: CONFIRMED

Knowledge Risk: 94/100
```

Now the number feels earned. Judges trust it.

### 2. One "Holy Shit" Moment

The demo needs ONE moment judges remember after seeing 20 teams.

**The moment:**

Agent finds:
- 4 outages
- Same code path
- 0 documentation

Interviewer asks:
> "Four outages reference refresh token failures. Why?"

Sarah answers.

UI flashes:

```
⚡ CRITICAL KNOWLEDGE RECOVERED
"Redis failover causes silent token expiration.
 No retry logic exists. 3 production outages from this."
 
 Documentation status: NONE → CAPTURED
```

That's the moment. Build everything to set up THIS reveal.

### 3. Knowledge Graph is Optional — Cut If Time Is Tight

Nobody wins because of a graph. People win because of story, reasoning, and demo. If React Flow takes more than 4 hours, cut it. Spend that time making the agent debate feel real instead.

---

## Priority Statement

**"The product is done. We are not inventing features anymore. Every hour from now until the hackathon goes into making the audit, the interview, and the hiring spec feel real."**

The biggest risk is NOT the idea. It's spending 20 hours polishing animations and only 2 hours making the agent reasoning believable.

Time allocation:
- 40% → Agent reasoning (make findings feel intelligent and evidence-backed)
- 25% → Hiring spec + candidate scoring (the commercial payoff)
- 20% → UI polish (enough to feel professional, not pixel-perfect)
- 10% → Interview (Tavus + one great targeted question)
- 5% → Everything else

---

## Scoring Philosophy (Critical)

### Expertise Score: Evidence, Not Activity

PR count is garbage. 500 typo-fix PRs mean nothing. 10 PRs that saved the company mean everything.

**Score by evidence quality:**

```
Auth Domain — Sarah Chen

Code ownership:            20%  (weighted by complexity, not count)
Incident participation:    40%  (led resolution, not just tagged)
Design decisions:          15%  (authored ADRs, drove architecture)
PR review depth:           15%  (substantive comments, not just "LGTM")
Documentation authorship:  10%  (fresh docs only — stale doesn't count)

Expertise Confidence: 94/100
```

### Documentation Freshness

Stale docs don't count. A Confluence page from 2021 is not "documented."

```
Auth Domain — Documentation

Coverage: 80%
├── Fresh (<6 months): 20%
├── Stale (>12 months): 60%
└── Never documented: 20%

Agents say: "Documentation exists but is 18 months stale and contradicts current code."
```

### Risk Formula

```
Risk Score = Knowledge Concentration × Business Criticality × Documentation Gap × Departure Risk
```

Let the AI infer business criticality from:
- Incident frequency + severity
- Revenue/user impact
- Dependency graph (what breaks if this breaks)
- On-call pages

### Candidate Evaluation: Gap Analysis, Not Ranking

**NEVER say:** "This is the best candidate" (dangerous, presumptuous)

**ALWAYS say:** "This candidate closes 82% of identified knowledge gaps" (factual)

```
Candidate: Alex Park

Knowledge Gap Coverage:     82%
Critical Gaps Covered:      3/4

Covers:
  ✓ OAuth token flows
  ✓ Redis caching patterns
  ✓ Incident response experience

Missing:
  ✗ SAML enterprise onboarding
  ✗ Specific Redis failover edge cases

Estimated Onboarding Time:  4 weeks
```

### Adaptability Assessment (Differentiator)

Don't just measure what they already know. Measure how fast they can learn.

**Domain-Specific Learning Challenge:**
> "You discover token refreshes are failing. Redis recently had packet loss. No documentation exists. Users report random logouts. What would you investigate first?"

**Score:**
- Reasoning quality
- Debugging approach
- Hypothesis generation
- Ability to learn from limited information

**Final candidate view:**
```
Candidate: Alex Park

Knowledge Gap Coverage:        82%
Adaptability:                  94%
Incident Reasoning:            91%
Knowledge Acquisition Speed:   88%

Expected Ramp Time:            3 weeks
```

**The pitch line:**
> "We don't just measure what a candidate already knows. We measure how quickly they can acquire the missing knowledge."

### Expose Uncertainty

Judges trust systems that explain reasoning. Never pretend omniscience.

- Show confidence levels on every claim
- Show which evidence supports each score
- Show where the system is uncertain
- Let the Skeptic Agent be visible — "this claim has weak evidence"


