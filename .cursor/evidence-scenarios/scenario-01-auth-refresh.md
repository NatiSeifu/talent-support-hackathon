# Scenario 01: Auth Refresh And Redis Failover

> Status: Canonical scenario specification complete.

## Scenario Metadata

| Field | Value |
|---|---|
| Scenario ID | `scenario_01_auth_refresh` |
| Scenario name | Auth Refresh And Redis Failover |
| Version | `v0.1` |
| Primary access profile | Comprehensive |
| Secondary access profiles | Manager-visible, Restricted |
| Scenario purpose | Test whether SuccessionAI distinguishes activity, declared ownership, demonstrated capability, documentation quality, business impact, transferability, and candidate gap coverage. |

## Judge-Facing Product Claim

> SuccessionAI can help an organization determine which critical capabilities depend
> on a departing employee, what evidence supports that concern, and what gaps must
> be resolved before handoff or hiring.

## Organizational Decision Supported

The scenario supports:

- documentation priority;
- knowledge-capture interview planning;
- successor training;
- candidate gap coverage.

False positive cost:

- incorrectly labels Sarah indispensable;
- over-invests in unnecessary handoff work;
- understates Mike and Priya's partial capability.

False negative cost:

- misses a genuine auth outage recovery gap;
- leaves a stale runbook uncorrected;
- hires or trains for generic auth experience while missing company-specific Redis
  failover knowledge.

## Product Decisions Applied

| Decision | Scenario setting |
|---|---|
| Primary access profile | Comprehensive |
| Capability taxonomy | OAuth/token refresh implementation; Redis failover procedure; incident diagnosis for auth outages; operational rollback/mitigation; architecture rationale for current design |
| Departure exposure | Planned departure date plus limited overlap window |
| Human confirmation before “resolved” | None for this scenario. Resolution state is evidence-driven; production governance may revisit. |

## Organization And People

### Organization

| Field | Value |
|---|---|
| Company type | B2B SaaS |
| Team size | 8-person platform team inside a 50-person company |
| Primary team | Platform Engineering |
| Relevant systems | `auth-service`, `session-service`, Redis token cache, customer API gateway |
| Time window | 12 months |

### People

| Person ID | Name | Role | Team | Ground-truth capability summary | Departure/exposure status |
|---|---|---|---|---|---|
| `person_sarah_chen` | Sarah Chen | Staff Engineer | Platform | Can independently implement, diagnose, mitigate, and explain auth refresh and Redis failover. Knows undocumented recovery step. | Departing in 14 days with 5 business days of overlap |
| `person_mike_jones` | Mike Jones | Senior Engineer | Platform | Can review auth changes and explain token refresh concepts. Cannot independently perform Redis failover recovery. | Active |
| `person_priya_raman` | Priya Raman | SRE | Infrastructure | Can execute generic rollback and observe Redis symptoms. Can perform part of recovery with runbook help, but not the undocumented bypass. | Active |
| `person_alex_kim` | Alex Kim | Engineering Manager | Platform | Listed in some ownership records and coordinates work. No direct technical capability for auth failover. | Active |
| `candidate_jordan_lee` | Jordan Lee | External candidate | N/A | Strong general OAuth and Redis experience. No company-specific operational evidence. | Candidate |

## Capability Taxonomy

| Capability ID | Capability name | Type | System/component | Why it matters | Expected transfer difficulty |
|---|---|---|---|---|---|
| `cap_token_refresh_impl` | OAuth/token refresh implementation | Implementation capability | `auth-service/token-refresh` | Incorrect changes can break customer sessions. | Moderate |
| `cap_redis_failover_proc` | Redis failover recovery procedure | Operational procedure | Redis token cache | Required during auth outage when Redis consistency degrades. | High |
| `cap_auth_incident_diag` | Incident diagnosis for auth outages | Diagnostic reasoning | `auth-service`, Redis, gateway | Separates token refresh defects from Redis/cache symptoms. | High |
| `cap_auth_rollback_mitigation` | Operational rollback/mitigation | Operational procedure | deployment + feature flag path | Needed to stabilize sessions during outage. | Moderate |
| `cap_auth_arch_rationale` | Architecture rationale for current design | Decision rationale | auth/session architecture | Needed to avoid unsafe rewrites and understand tradeoffs. | Moderate |

## Hidden Ground Truth

### Person-Capability Truth

| Person ID | Capability ID | True capability state | Scope | Evidence visibility plan |
|---|---|---|---|---|
| `person_sarah_chen` | `cap_token_refresh_impl` | Can perform independently | Full implementation and review | Visible |
| `person_sarah_chen` | `cap_redis_failover_proc` | Can perform independently | Includes undocumented Redis bypass order | Partially visible |
| `person_sarah_chen` | `cap_auth_incident_diag` | Can perform independently | Full diagnostic path | Partially visible; final incident report misattributes one diagnosis |
| `person_sarah_chen` | `cap_auth_rollback_mitigation` | Can perform independently | Feature flag + rollback + verification | Visible |
| `person_sarah_chen` | `cap_auth_arch_rationale` | Can explain independently | Original tradeoff and retry semantics | Partially visible |
| `person_mike_jones` | `cap_token_refresh_impl` | Conceptual familiarity | Reviews and small changes only | Visible |
| `person_mike_jones` | `cap_redis_failover_proc` | Cannot perform | Knows Redis is involved but not order of operations | Visible through failed validation |
| `person_mike_jones` | `cap_auth_incident_diag` | Can perform with help | Can identify auth layer but misses Redis stale-cache edge case | Partially visible |
| `person_priya_raman` | `cap_auth_rollback_mitigation` | Can perform with help | Generic rollback and monitoring | Visible |
| `person_priya_raman` | `cap_redis_failover_proc` | Can perform with help | Can follow documented steps but document is incomplete | Visible through validation |
| `person_alex_kim` | all | Observed only / cannot perform | Coordination and formal ownership only | Visible |
| `candidate_jordan_lee` | `cap_token_refresh_impl` | Adjacent evidence | General OAuth experience | Candidate claim and partial corroboration |
| `candidate_jordan_lee` | `cap_redis_failover_proc` | Unknown | No company-specific evidence | Observable as insufficient evidence |

### Knowledge Artifacts Truth

| Artifact ID | Capability ID | Truth |
|---|---|---|
| `artifact_auth_runbook` | `cap_redis_failover_proc` | Stale and incomplete; omits Redis bypass ordering |
| `artifact_token_refresh_design` | `cap_auth_arch_rationale` | Mostly current but lacks recent incident learnings |
| `artifact_auth_incident_playbook` | `cap_auth_incident_diag` | Incomplete; overemphasizes application rollback |

### Ownership And Architecture Truth

| Subject | Declared truth | Actual/observed truth | Intended contradiction |
|---|---|---|---|
| `auth-service/src/token-refresh` | `CODEOWNERS` names Platform team and Alex as required reviewer | Sarah performs most substantive implementation and operational response | Formal owner differs from observed steward |
| Redis token cache dependency | Service catalog says Redis is supporting dependency | Production incidents show Redis behavior is central to auth recovery | Catalog understates operational dependency |

### Business Impact Truth

| Capability ID | Impact truth | Source-visible declaration |
|---|---|---|
| `cap_redis_failover_proc` | Material customer session impact if mishandled | Business-impact record classifies customer authentication as `Tier A` under native scale |
| `cap_token_refresh_impl` | High customer-facing impact | SLO registry states availability target for login/session refresh |

### Transferability Truth

| Capability ID | Transferability truth | Validation plan |
|---|---|---|
| `cap_redis_failover_proc` | Not transferable from current docs alone | Ask Sarah targeted interview; have Priya attempt procedure from runbook |
| `cap_auth_incident_diag` | Partially transferable through interview plus incident timeline | Ask diagnostic “why Redis bypass before rollback?” question |
| `cap_auth_arch_rationale` | Transferable if Sarah explains original design tradeoff | Ask design rationale question and update design note |

## Observable Evidence Plan

| Source family | Included records | Omitted/restricted records | Intended inference pressure |
|---|---|---|---|
| Identity and organization | Employees, source accounts, teams, Sarah departure date, overlap window | None in comprehensive profile | Attribute work and departure exposure correctly |
| Software development | Auth PRs, substantive Sarah reviews, Mike reviews, selected commits, file changes | Some pair-programming absent | Avoid line-count ownership; distinguish Mike review from Sarah implementation |
| Work management | Auth outage follow-up tickets, assignments, status transitions, links to PRs/incidents | None in comprehensive profile | Assignment does not prove implementation |
| Knowledge artifacts | Runbook, design doc, stale incident playbook, revisions | None in comprehensive profile | Existence of docs does not prove transferability |
| Production operations | Three auth incidents, timelines, alerts, rollback/deployment records | One verbal diagnosis only appears later in interview | Participation and final report do not equal diagnosis |
| Ownership and architecture | Service catalog, CODEOWNERS, Redis dependency, component mapping | None in comprehensive profile | Formal ownership conflicts with observed stewardship |
| Business impact | Native `Tier A` auth classification, SLO target, recovery objective | Exact revenue values redacted | Business importance without risk formula |
| Communication and collaboration | Public/team Slack auth threads, referrals to Sarah, one “ask Sarah” pattern | Direct messages absent despite comprehensive profile unless explicitly authorized | Referrals show perceived relevance, not validated expertise |
| Knowledge validation | Sarah interview, Priya runbook exercise, Mike diagnostic exercise | Durability not yet observed | Transfer claims require scoped validation |
| Candidate and successor evidence | Jordan resume/application, partial public corroboration, gap coverage assessment | Full employment verification unavailable | Candidate has adjacent/general evidence, not company-specific coverage |

## Contradictions And Distractors

| Distractor ID | Observable pattern | Hidden truth | Correct behavior |
|---|---|---|---|
| `dist_codeowners_alex` | `CODEOWNERS` names Alex/Platform | Alex coordinates but cannot perform auth recovery | Do not infer Alex capability |
| `dist_mike_reviews` | Mike reviewed many auth PRs | Mike has conceptual familiarity but cannot execute Redis failover | Partially support review exposure; abstain/contradict capability |
| `dist_runbook_exists` | Runbook exists and was edited recently | Edit was formatting; procedure omits key step | Contest transferability from docs alone |
| `dist_final_report` | Final incident report names Priya as resolver | Sarah supplied decisive diagnosis verbally and through later interview | Preserve contradiction; do not overcredit Priya |
| `dist_candidate_oauth` | Jordan has strong OAuth resume claims | No company-specific Redis failover evidence | Claim adjacent/corroborated general experience only |

## Expected Claims

| Claim ID | Claim kind | Claim text | Expected resolution | Required evidence/source families | Hidden truth basis |
|---|---|---|---|---|---|
| `claim_sarah_impl_experience` | Implementation experience | Sarah has recorded substantive implementation experience in token refresh. | Supported | Software development | Sarah can implement independently |
| `claim_sarah_operational_capability` | Operational capability | Sarah has evidence of scoped operational capability for Redis failover recovery. | Supported after interview/validation | Production operations + Knowledge validation | Sarah knows undocumented recovery step |
| `claim_docs_insufficient` | Documentation gap | Existing accessible docs do not establish transferable Redis failover procedure. | Supported | Knowledge artifacts + Knowledge validation | Runbook is stale/incomplete |
| `claim_alex_formal_not_capable` | Ownership/capability distinction | Alex is formally referenced in ownership records, but available evidence does not support technical capability. | Supported | Ownership + Knowledge validation/absence of capability evidence | Alex cannot perform |
| `claim_mike_partial` | Partial capability | Mike has conceptual/review familiarity but not demonstrated independent Redis failover capability. | Partially supported | Software development + Knowledge validation | Mike can review but not execute |
| `claim_priya_partial` | Partial capability | Priya can perform generic rollback/monitoring but not the undocumented Redis bypass without help. | Partially supported | Production operations + Knowledge validation | Priya partial capability |
| `claim_knowledge_loss_concern` | Knowledge-loss concern | Auth Redis failover presents a knowledge-loss concern because a business-important procedure is concentrated in Sarah and not transferable from current docs alone. | Supported, with limitations | Business impact + Production operations + Knowledge artifacts + Knowledge validation + Identity | Criticality, concentration, incomplete transfer |
| `claim_jordan_gap_coverage` | Candidate gap coverage | Jordan has adjacent/corroborated general OAuth evidence but insufficient evidence for company-specific Redis failover coverage. | Supported | Candidate evidence + Knowledge validation | Candidate lacks org-specific evidence |

## Prohibited Claims

| Prohibited ID | Prohibited claim | Tempting evidence | Why prohibited | Correct safer wording |
|---|---|---|---|---|
| `prohibit_bus_factor_1` | “Bus factor is exactly 1.” | Sarah dominates incidents/PRs | Mike and Priya have partial capability; observability matters | “Evidence is concentrated in Sarah, with partial coverage from Mike/Priya.” |
| `prohibit_alex_owner_expert` | “Alex owns and understands auth.” | CODEOWNERS and manager role | Formal ownership is not expertise | “Alex is referenced in formal ownership context.” |
| `prohibit_docs_sufficient` | “Runbook means the procedure is documented.” | Runbook exists and was edited | Content incomplete and validation fails | “A runbook exists but does not establish transferable procedure.” |
| `prohibit_priya_resolved` | “Priya diagnosed and resolved the outage.” | Final incident report names Priya | Timeline/interview contradict decisive diagnosis attribution | “Priya participated in mitigation; diagnosis attribution is contested.” |
| `prohibit_jordan_ready` | “Jordan covers the gap.” | OAuth/Redis resume claims | No company-specific demonstrated capability | “Jordan has adjacent evidence and remaining gap coverage unknown.” |
| `prohibit_knowledge_score` | “Knowledge score improved from X to Y.” | Interview captured new facts | No validated score construct | “Interview changed resolution state for specific gaps.” |

## Interview Questions

| Question ID | Targeted claim/gap | Question | Information sought | Expected useful answer | Non-resolution |
|---|---|---|---|---|---|
| `q_redis_order` | `claim_docs_insufficient` | “During AUTH-219, why did you bypass Redis token validation before rolling back the auth deployment?” | Undocumented order of operations and rationale | Sarah explains stale cache behavior and safe bypass sequence | Generic “Redis was down” answer |
| `q_arch_tradeoff` | `cap_auth_arch_rationale` | “What tradeoff led us to keep token refresh state in Redis instead of pushing all refresh state into the session database?” | Architecture rationale | Sarah explains latency, invalidation, and failure-mode tradeoffs | Only repeats design doc text |
| `q_successor_test` | `claim_priya_partial` | “Priya, using the current runbook only, walk through recovery for a Redis stale-token incident.” | Whether runbook transfers procedure | Priya misses bypass order without hint | Priya completes only after Sarah provides missing step |

## Candidate/Successor Coverage

| Candidate ID | Requirement/capability | Evidence state | Expected coverage disposition | Limitation |
|---|---|---|---|---|
| `person_mike_jones` | `cap_token_refresh_impl` | Reviews + conceptual discussion | Adjacent / partially supported | No independent implementation or operational validation |
| `person_priya_raman` | `cap_auth_rollback_mitigation` | Incident participation + SRE validation | Partially demonstrated | Company-specific bypass missing |
| `candidate_jordan_lee` | `cap_token_refresh_impl` | Resume claim + partial public corroboration | Corroborated experience | Not company-specific |
| `candidate_jordan_lee` | `cap_redis_failover_proc` | General Redis claim only | Insufficient evidence | No org-specific validation |

## Access Profile Variants

| Access profile | Evidence removed or added | Expected claim changes | Correct abstentions |
|---|---|---|---|
| Comprehensive | Main scenario; includes team Slack, incidents, validation, source metadata | Can support knowledge-loss concern with limitations | No exact bus-factor or numeric risk score |
| Manager-visible | Remove private/verbal context and detailed validation notes | Sarah concentration still visible; diagnosis attribution more contested | Abstain on who supplied decisive diagnosis unless interview available |
| Restricted | Remove Slack and detailed incident timelines; retain PRs, docs, ownership, selected tickets | Can identify possible documentation and ownership contradictions | Abstain on operational capability and transferability |

## Evaluation Notes

### Retrieval Correctness

Required records include Sarah/Mike/Priya identities, auth PRs/reviews, CODEOWNERS,
service catalog, auth runbook, incident timelines, business-impact declaration,
Sarah interview, Priya validation attempt, and Jordan candidate claims.

### Inference Correctness

Key tests:

- do not infer expertise from CODEOWNERS;
- do not infer transferability from document existence;
- do not infer diagnosis from incident ownership or final action;
- recognize partial capability for Mike and Priya.

### Risk Classification

Knowledge-loss concern requires:

- capability is business-important;
- relevant evidence is concentrated in Sarah;
- docs fail transfer validation;
- Sarah has departure exposure;
- partial successors do not cover the full capability.

### Uncertainty And Abstention

Correct abstentions:

- exact bus factor;
- numeric risk score;
- guaranteed candidate readiness;
- durable transfer after one interview;
- hidden verbal contribution if interview evidence is absent.

### Interview Utility

`q_redis_order` should change `cap_redis_failover_proc` from unresolved/contested
to supported as a Sarah-held undocumented procedure, while still requiring
documentation or successor validation before transferability is resolved.

### Candidate Gap Coverage

Report per-capability coverage only. Do not rank Jordan, Mike, and Priya globally.

