# Open Product Decisions Register

> Status: Active.

## Accepted Decisions

| ID | Decision |
|---|---|
| PD-001 | Preserve source, evidence, and assessment as separate layers. |
| PD-002 | Use Python/Pydantic as the authoritative schema language. |
| PD-003 | Missing evidence is not evidence of absence. |
| PD-004 | Use categorical resolution states before numeric confidence. |
| PD-005 | Keep expertise, ownership, stewardship, concentration, impact, transferability, and risk separate. |
| PD-006 | Report candidate gap coverage, not a “best candidate” verdict. |
| PD-007 | Treat interview answers as self-report until corroborated or demonstrated. |
| PD-008 | No fixed risk score, knowledge score, bus-factor formula, source weight, or freshness cutoff is currently justified. |
| PD-009 | Build the first synthetic scenario before finalizing the full evaluation suite. |
| PD-010 | Test a thin deterministic evidence engine before committing to agent roles. |

## Decisions Required Before Scenario Generation

| ID | Question | Why it matters |
|---|---|---|
| OPEN-001 | What exact judge-facing one-sentence claim will the demo defend? | Determines expected outputs and prohibited inferences |
| OPEN-002 | Which organizational decisions should the first scenario support? | Defines consequence of false positives and false negatives |
| OPEN-003 | Which access profile is the primary demo profile? | Determines observability and permissible claims |
| OPEN-004 | What is the canonical capability taxonomy for scenario 1? | Needed to link evidence across systems |
| OPEN-005 | How is departure exposure represented: planned date, selected employee, or scenario condition? | Required for knowledge-loss concern |
| OPEN-006 | Which claims require human confirmation before presentation? | Defines governance boundary |

## Decisions Required Before Metrics

| ID | Question |
|---|---|
| OPEN-007 | What ground-truth unit is labeled: proposition, capability, person-capability pair, or risk finding? |
| OPEN-008 | Which errors are costlier for the demo: missed risk, false indispensability, false candidate coverage, or excess abstention? |
| OPEN-009 | Who can qualify as a grader for expertise, business impact, transferability, and candidate coverage? |
| OPEN-010 | Which qualitative judgments can use model grading, and which require humans? |
| OPEN-011 | How should partial capability be represented in ground truth? |
| OPEN-012 | What evidence makes an absence or uniqueness claim evaluable? |

## Decisions Required Before Product UI

| ID | Question |
|---|---|
| OPEN-013 | Which categorical resolution states are user-facing? |
| OPEN-014 | How should contested evidence and access limitations be displayed? |
| OPEN-015 | Should any aggregate visual exist before calibration? |
| OPEN-016 | What language replaces legacy “critical/high/medium” and confidence percentages? |
| OPEN-017 | Which employment-sensitive outputs are restricted to authorized users? |

## Legacy Decisions Requiring Revisit

The following appear in older planning documents but are not accepted evidence-model
decisions:

- fixed bus-factor thresholds;
- “critical/high” risk formulas;
- knowledge scores such as `34% -> 87%`;
- confidence percentages such as `96%`;
- fixed time-to-competency or ramp-time claims;
- stopping debate at an arbitrary confidence threshold;
- assumption that more debate rounds necessarily increase certainty;
- automatic staffing recommendations or candidate rankings.

