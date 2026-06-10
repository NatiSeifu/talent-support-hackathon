# SuccessionAI

**AI-powered organizational knowledge audit for inference-time compute.**

When a key employee is leaving, we ingest company signals (PRs, incidents, tickets, docs) and run 5 specialized agents:

- **Evidence Agent** → finds raw signals
- **Expertise Agent** → determines who actually knows what
- **Risk Agent** → identifies undocumented/high-risk knowledge
- **Skeptic Agent** → challenges conclusions and finds contradictions
- **Question Agent** → generates targeted interview questions

The agents debate in multiple rounds until they either reach confidence or identify unresolved questions.

Those unresolved questions are then handed off to an AI video interviewer (powered by Tavus). Instead of asking generic exit interview questions, the interviewer asks highly specific questions generated from the audit:

> *"You were the only reviewer on AUTH-4831. Why?"*
>
> *"Four outages reference refresh token failures. What was the root cause?"*

The departing employee's answers resolve uncertainty, fill documentation gaps, and reduce organizational knowledge risk.

Finally, the system converts captured knowledge into:

1. A **hiring specification** tailored to the exact missing expertise
2. **Candidate gap analysis** — how much of the missing knowledge does each candidate already cover?
3. **Adaptability assessments** — domain-specific reasoning challenges generated from real organizational knowledge gaps

## Why Inference-Time Compute

We use GPU budget for multi-agent investigation, debate, verification, and uncertainty reduction — not just running a chatbot. More compute means more hypotheses tested, more contradictions caught, and more undocumented knowledge gaps discovered.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

```bash
cp .env.example .env
# Add your LLM_API_KEY (OpenAI or any OpenAI-compatible endpoint)
```

## GPU Mode (Hackathon)

Point `LLM_BASE_URL` at a vLLM instance serving Llama 3.3 70B:

```bash
LLM_BASE_URL=http://gpu-box:8000/v1
LLM_API_KEY=local-key
LLM_MODEL=meta-llama/Llama-3.3-70B-Instruct
```
