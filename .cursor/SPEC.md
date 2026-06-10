# SuccessionAI — Final Build Spec

> This is the definitive implementation guide. Any agent or developer can build the entire system from this document. No other spec overrides this one.

---

## The Product (One Sentence)

"Organizations don't know what knowledge they're about to lose. We built a multi-agent reasoning system that audits collective knowledge, identifies undocumented expertise, interviews the people who hold it, and converts that into hiring intelligence."

---

## Core Demo Flow

Sarah is leaving. System audits company data → agents debate to find what knowledge will disappear → unresolved questions become a live Tavus video interview → Sarah's answers feed back into agents → confidence scores update → generates hiring spec → scores candidates.

**That's it. Do not build extra features.**

**The loop:** H100s (audit + debate) → Tavus (video interview) → H100s (synthesize + hiring spec)

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

### Screen 3: AI Exit Interview (Tavus Video)

- Tavus video interviewer (live Mercor-style video call)
- Questions generated from UNRESOLVED agent disputes — not generic HR questions
- Live transcript with evidence citations
- "⚡ Critical insight captured" animation when answer resolves a gap
- Investigator tone — not HR tone
- Answers feed BACK into agents → confidence scores update in real-time

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

### Agent Deliberation Loop (The Real Innovation)

The mistake: "Agent 1 says X, Agent 2 says Y, done." That's just parallel prompting.

The actual architecture: **uncertainty resolution through debate.**

```
Round 1: Initial claims
┌────────────────────────────────────────────────────────────────┐
│ Evidence Agent:  "Sarah owns OAuth."           Confidence: 72% │
│ Risk Agent:      "Bus factor = 1."             Confidence: 88% │
│ Skeptic Agent:   "Disagree. Mike reviewed 40% of auth PRs."   │
└────────────────────────────────────────────────────────────────┘

Round 2: Challenge + investigation
┌────────────────────────────────────────────────────────────────┐
│ Evidence Agent (challenged):                                    │
│   "Revising. Mike reviewed PRs but never authored code."       │
│   "Mike has 0 commits in auth-service/src/"                    │
│   Confidence: 72% → 83%                                        │
│                                                                 │
│ Skeptic Agent:                                                  │
│   "Concede code authorship. But what about incidents?"         │
│   "Mike appears in 0 auth incident responses."                 │
└────────────────────────────────────────────────────────────────┘

Round 3: Convergence OR escalation
┌────────────────────────────────────────────────────────────────┐
│ Risk Agent (updated):                                           │
│   "Bus factor confirmed = 1. Mike is surface-level only."      │
│   Confidence: 88% → 94%                                        │
│                                                                 │
│ UNRESOLVED:                                                     │
│   "Can Mike operate auth independently in an incident?"        │
│   Evidence: CONFLICTING                                         │
│   → REQUIRES INTERVIEW TO RESOLVE                              │
└────────────────────────────────────────────────────────────────┘

Round 4: Question generation
┌────────────────────────────────────────────────────────────────┐
│ Question Agent:                                                  │
│   "Sarah, has Mike ever handled an auth incident without you?" │
│   "If you were unavailable during AUTH-431, who would know     │
│    about the Redis bypass?"                                     │
│   Source: UNRESOLVED DISPUTE between Evidence and Skeptic       │
└────────────────────────────────────────────────────────────────┘
```

**The loop continues until:**
1. Confidence threshold reached (≥90% on all critical claims)
2. Compute budget exhausted (max rounds hit)
3. Interview required (agents can't resolve from data alone)

**The interview is the TIE-BREAKER.** When agents disagree and evidence is conflicting, the unresolved questions become interview questions. Sarah's answers close the loop:

```
BEFORE INTERVIEW:
  "Can Mike operate auth independently?"
  Confidence: 43% | Status: UNRESOLVED

Sarah answers: "Mike reviews auth PRs but has never been primary 
incident responder. He wouldn't know about the Redis bypass."

AFTER INTERVIEW:
  "Can Mike operate auth independently?"  
  Confidence: 91% | Status: RESOLVED (NO)
  Bus Factor: CONFIRMED = 1
```

**Why this needs inference-time compute:**

The product isn't computing an answer. It's computing:
```
Hypothesis generation
       ↓
  Challenges
       ↓
Evidence retrieval
       ↓
Counterarguments
       ↓
More hypotheses
       ↓
Uncertainty reduction
       ↓
(repeat until confident or interview needed)
```

More compute = more investigation rounds = more certainty = fewer unanswered questions.

**The UI shows:**
- Confidence scores updating in real-time
- Open questions that haven't been resolved
- Which claims are confirmed vs disputed vs unknown
- When an interview question is generated, you can see WHY (which dispute triggered it)

**The one-line framing:**
> "The product isn't 'find knowledge.' The product is 'resolve uncertainty about organizational knowledge.'"

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

### GPU Allocation: All 8 H100s → Reasoning Brain

```
GPUs 0–7: Multi-agent audit (ALL reasoning)

vLLM → Llama 3.3 70B
├── 2 GPUs per replica (tensor parallelism)
├── 4 replicas (data parallelism)
└── = 8 H100s total

Powers:
├── Evidence Agent
├── Expertise Agent
├── Risk Agent
├── Skeptic Agent
├── Question Agent
├── Debate rounds (multi-round challenges)
├── Unresolved-question generation
├── Post-interview synthesis
├── Hiring spec generation
└── Candidate gap/adaptability assessment
```

### Video Interview: Tavus (External, No GPU Needed)

The video interview is powered by Tavus — NOT our H100s. Tavus handles video avatar rendering externally. Our system only:
1. Sends Tavus the generated questions
2. Receives transcript/answer back
3. Feeds answers back into agents
4. Recalculates risk/confidence scores

### The Full Loop

```
8 H100s (Phase 1)
  → Multi-agent audit
  → Debate rounds
  → Unresolved questions identified
        │
        ▼
Tavus (External)
  → Video interview with departing employee
  → Employee answers unresolved questions
  → Transcript captured
        │
        ▼
8 H100s (Phase 2)
  → Synthesize interview answers
  → Update risk scores + confidence
  → Generate hiring spec
  → Score candidates
```

**Tavus = interview face. H100s = reasoning brain.**

### vLLM Command

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

> "The 8 H100s are used for the multi-agent reasoning audit, not for rendering the video. The video interview is powered by Tavus. The agents identify unresolved questions, Tavus delivers them in a live video interview, and then the answers are fed back into the reasoning system to update the knowledge-risk score. More compute = more debate rounds = more certainty = fewer unanswered questions."

---

> **Build plan lives in `PLAN.md`.** This spec covers WHAT to build. The plan covers WHEN.

---

## Presentation Structure (12 Slides — Tell A Story, Not Architecture)

**Most teams will spend 3 minutes explaining agents, MCPs, vector databases, RAG, H100s, vLLM. Judges won't remember any of that. They'll remember a story.**

### Slide 1
**"Sarah is leaving Friday."**

Tiny text: *"So is everything she knows."*

Nothing else. Pause. Let it sit.

### Slide 2
Show chaos.

```
Confluence:    "TODO"
Jira:          "Ask Sarah"
Runbook:       "Outdated"
Slack:         "Sarah fixed this last time"
```

Then: *"Every company has a Sarah."*

### Slide 3
The relatable conversation:

> Manager: "Can someone explain why authentication keeps failing?"
> Team: "Sarah knew."
> Manager: "Can we ask her?"
> Team: "She left two weeks ago."

(Gets a laugh.)

### Slide 4
The Big Reveal. Don't say "AI." Don't say "agents."

Say: **"We don't know what knowledge we're about to lose."**

Then: *"So we built an organizational knowledge audit."*

### Slide 5
Run the audit. Show:

```
Knowledge Risk: HIGH

Auth Domain
├── Bus Factor: 1
├── Documentation: 18%
├── Incident Ownership: 92%
└── Business Criticality: High
```

Then: *"We think Sarah is the only person who understands authentication."*

### Slide 6
The fun part. Show agents ARGUING. Not agreeing.

```
Evidence Agent:   "Sarah owns auth."
Skeptic Agent:    "Mike reviewed 40% of auth PRs."
Evidence Agent:   "Mike never handled incidents."
Risk Agent:       "Bus factor remains 1."
```

Animate like a group chat. This will be memorable.

### Slide 7
The "Oh Shit" Moment. Big red box:

```
⚠️ UNRESOLVED QUESTION

Agents can't determine:
"Why does authentication fail during Redis outages?"
```

Then say: *"We searched every ticket. Every incident. Every document. We still don't know."*

Pause.

### Slide 8
Video Interview. Tavus appears. Mercor-style.

The AI asks: *"Sarah, why was Redis bypassed in AUTH-4831?"*

Context shown: *"Evidence Agent found 4 outages. Risk Agent found Redis correlation. Skeptic says no proof of causation."*

Sarah answers.

### Slide 9
Huge animation:

```
⚡ CRITICAL KNOWLEDGE RECOVERED

"Redis failover causes silent token expiration.
 No retry logic exists."

Documentation: NONE → CAPTURED
```

This is the money shot.

### Slide 10
Knowledge Risk animates:

```
HIGH → LOW
```

Everyone understands that.

### Slide 11
Hiring Intelligence.

*"If Sarah leaves tomorrow… who should we hire?"*

Show side-by-side:
- Generic JD (vague, copied from Google)
- AI-Generated Hiring Spec (hyper-specific to the actual knowledge gaps)

### Slide 12
Funny ending.

```
Without SuccessionAI:          With SuccessionAI:
Sarah leaves                   Sarah leaves
     ↓                              ↓
  Chaos                        Documentation
                                    ↓
                               Hiring Plan
                                    ↓
                               Nobody panics
```

---

## Why The Interview Exists (Critical — Judges Will Ask)

**"If the agents are so smart, why not just use them for everything?"**

The answer: **Agents can only reason over existing evidence.** They can see PRs, tickets, incidents, docs, code. But they cannot see Sarah's brain.

**Example:**

The agents find:
- Incident #1: Refresh tokens failing
- Incident #2: Refresh tokens failing
- Incident #3: Refresh tokens failing
- PR-4831: Redis bypass added

They can infer: *"Something about Redis seems related."*

But they CANNOT know: *"Redis packet loss caused stale token state, so I bypassed Redis and used the database directly"* — unless that was written somewhere.

**The agents are detectives.** They gather evidence. They form theories. They challenge theories. But eventually they reach **known unknowns** — that's where the interview comes in.

The interview is NOT: "Tell me what you know."
The interview IS: "We found this contradiction. Explain it."

**The demo flow:**
```
Data → Agent investigation → Agent disagreement → Unresolved uncertainty → Interview → Knowledge capture
```

NOT:
```
Data → Interview
```

**The pitch line:**
> "The interview is only triggered when the agents cannot resolve uncertainty from available evidence."

**Why this matters:**
- The goal isn't to replace Sarah
- The goal is to identify exactly what ONLY Sarah can explain
- That's a much more compelling product than a generic AI exit interview

---

## Demo Script (What To Say)

**Open with:**
> "Sarah is leaving Friday."

(Pause.)

**Show the problem:**
> "Every company has a Sarah. The person who knows why the system works, why it breaks, and why the docs are lying."

**Show the product:**
> "We audit the org. Five AI agents investigate, debate, and challenge each other. When they can't resolve something from evidence alone — they interview the expert."

**The reveal:**
> "Four outages. Same code path. Zero documentation. Three agents disagree on why. So we asked Sarah."

**End with:**
> "We turn institutional memory into an executable hiring spec."

**RULE: Never start with architecture. Start with the story.**

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

### 1. Risk Scoring: Evidence, Not Magic Numbers

Don't show: `Knowledge Risk Score: 94` (judges ask "why 94 and not 67?")

**Show risk factors first. Derive the score from evidence.**

The agents discover FACTS:

```
Authentication Domain

Primary expert:       Sarah Chen
Other contributors:   Mike (surface), Jenny (none)
Documentation:        18% fresh
Incident ownership:   92% Sarah
Code ownership:       87% Sarah
Bus factor:           1
Departure:            CONFIRMED
```

Nobody argues with those. They're evidence.

**Then derive risk from two dimensions:**

```
Knowledge Loss Probability (how likely to disappear?)
├── Knowledge concentration:  90%
├── Documentation quality:    20%
├── Cross-training level:     15%
└── Departure certainty:      100%
= HIGH

Impact (how bad if it disappears?)
├── Business criticality:     100% (auth = revenue-blocking)
├── Incident frequency:       High (4 P0s in 6 months)
├── Dependency count:         High (every service uses auth)
└── Customer impact:          Direct (logouts = churn)
= CRITICAL
```

**Final display (what the UI shows):**

```
Knowledge Risk: HIGH

Confidence: 91%

Contributing Factors:
• Bus Factor: 1
• Documentation Freshness: 18%
• Incident Ownership: 92%
• Business Criticality: High

Why HIGH?
✓ Sarah owns 87% of auth code
✓ Sarah led 92% of incidents
✓ Documentation is mostly stale
✓ Auth service is business critical
✓ Departure confirmed
```

**After interview, animate:**
```
Knowledge Risk: HIGH → MEDIUM
```

Not `94 → 31`. Use qualitative levels (LOW / MEDIUM / HIGH / CRITICAL). Much easier to defend to judges.

### 2. One "Holy Shit" Moment

The demo needs ONE moment judges remember after seeing 20 teams.

**The setup (agent debate):**
```
Evidence Agent:   "4 outages involve refresh token failures."
Risk Agent:       "Redis appears correlated."
Skeptic Agent:    "No evidence proving causation."
Status:           ⚠️ UNRESOLVED
```

**The interview question (targeted from dispute):**
> "Sarah, why was Redis bypassed in AUTH-4831?"

**Sarah answers.**

**UI flashes:**
```
⚡ CRITICAL KNOWLEDGE RECOVERED

"Redis failover causes silent token expiration.
 No retry logic exists. 3 production outages from this."

Documentation: NONE → CAPTURED
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

### Don't Use Magic Numbers. Use Evidence + Qualitative Levels.

The score should be SECONDARY. The real output is:

```
CRITICAL KNOWLEDGE GAP

Domain:       Authentication
Reason:       Only Sarah understands Redis failover behavior
Evidence:
  - Authored 82% of related PRs
  - Led 4 incidents
  - No fresh documentation
Confidence:   91%
Status:       UNRESOLVED → REQUIRES INTERVIEW
```

That's much more compelling than a magic number.

### Risk Levels (not 0-100)

Use: `LOW | MEDIUM | HIGH | CRITICAL`

Each level is EARNED by evidence:
- CRITICAL = bus factor 1 + no docs + business critical + departure confirmed
- HIGH = bus factor 1-2 + stale docs + high criticality
- MEDIUM = some concentration + partial docs
- LOW = distributed knowledge + fresh docs

### Expertise Score: Evidence, Not Activity

PR count is garbage. 500 typo-fix PRs mean nothing. 10 PRs that saved the company mean everything.

**Weigh by evidence quality:**

```
Auth Domain — Sarah Chen

Code ownership:            20%  (weighted by complexity, not count)
Incident participation:    40%  (led resolution, not just tagged)
Design decisions:          15%  (authored ADRs, drove architecture)
PR review depth:           15%  (substantive comments, not just "LGTM")
Documentation authorship:  10%  (fresh docs only — stale doesn't count)

Expertise Confidence: HIGH (91%)
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

### Risk Derivation

```
Knowledge Risk = f(Knowledge Loss Probability, Business Impact)

Knowledge Loss Probability:
  - Knowledge concentration (bus factor)
  - Documentation quality (freshness-weighted)
  - Cross-training level
  - Departure certainty

Business Impact:
  - Incident frequency + severity
  - Revenue/user impact
  - Dependency graph (what breaks if this breaks)
  - On-call pages
```

Don't show the formula to judges. Show the EXPLANATION:

> "Knowledge Risk is HIGH because Sarah owns 87% of auth code, led 92% of incidents, documentation is mostly stale, auth is business critical, and her departure is confirmed."

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
Adaptability:                  HIGH
Incident Reasoning:            HIGH
Knowledge Acquisition Speed:   HIGH

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


