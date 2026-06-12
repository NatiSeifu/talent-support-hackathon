# Candidate And Successor Evidence Schema

> Status: Initial model in progress.

## Purpose

Candidate and successor evidence establishes:

- what knowledge gaps exist after a departure is confirmed;
- which internal people have partial coverage of those gaps;
- what observable signals indicate proximity to the required knowledge;
- what external candidates claim and what can be verified;
- how ramp-up estimates are grounded in measurable factors;
- what assessment results indicate about a candidate's learning trajectory.

It does not establish that a candidate will succeed, that ramp estimates are
guarantees, or that proximity to a domain equals readiness to operate it. It provides
structured evidence for staffing decisions that would otherwise be made on intuition.

## Product Questions This Source Answers

1. After the audit identifies knowledge gaps, who internally has the closest
   proximity to those gaps?
2. What observable evidence (PRs reviewed, adjacent code, incident exposure)
   supports or contradicts a person's readiness?
3. For external candidates, what claims can be corroborated against verifiable
   sources?
4. How is ramp-up time estimated, and what assumptions does it rest on?
5. What did assessment exercises reveal about a candidate's ability to acquire
   the missing knowledge?

## Objects

| Object | Evidentiary weight | Treatment |
|---|---|---|
| Knowledge gap | High | Full schema |
| Internal candidate profile | High | Full schema |
| Proximity signal | Medium | Full schema |
| External candidate profile | Medium | Full schema |
| Assessment exercise | Medium–High | Full schema |
| Ramp-up estimate | Medium | Full schema |
| Staffing recommendation | High (derived) | Full schema |

## Knowledge Gap

### Purpose And Scope

A knowledge gap is a structured representation of what the departing person holds
that is not covered by anyone else. Gaps are derived from the audit (agent debate
+ interview) and are the basis for all candidate evaluation.

Gaps are not generic job requirements. They are specific, evidence-backed deficiencies
identified by the multi-agent deliberation.

### Layer 1: Faithful Source Record

Knowledge gaps are derived artifacts, not source records from external systems. Their
provenance traces back to the audit evidence that established them.

```python
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class GapOrigin(str, Enum):
    AGENT_CONSENSUS = "agent_consensus"
    INTERVIEW_CONFIRMED = "interview_confirmed"
    AGENT_UNRESOLVED = "agent_unresolved"


class GapDomain(str, Enum):
    CODE_OWNERSHIP = "code_ownership"
    OPERATIONAL_KNOWLEDGE = "operational_knowledge"
    ARCHITECTURAL_DECISION = "architectural_decision"
    INCIDENT_RESPONSE = "incident_response"
    TRIBAL_KNOWLEDGE = "tribal_knowledge"
    VENDOR_RELATIONSHIP = "vendor_relationship"
    PROCESS_KNOWLEDGE = "process_knowledge"
    UNKNOWN = "unknown"


class KnowledgeGap(BaseModel):
    gap_id: str
    departing_person_id: str

    domain: GapDomain
    title: str
    description: str

    origin: GapOrigin
    confidence_at_identification: float | None = None

    systems_affected: list[str] = Field(default_factory=list)
    services_affected: list[str] = Field(default_factory=list)

    is_documentable: bool | None = None
    requires_operational_experience: bool | None = None
    requires_tacit_knowledge: bool | None = None

    supporting_evidence_ids: list[str] = Field(default_factory=list)
    interview_question_ids: list[str] = Field(default_factory=list)

    identified_at: datetime
    updated_at: datetime
```

### Supported Propositions

- "The audit identified a gap in domain X with origin Y."
- "This gap affects services A, B, C."
- "This gap was confirmed by the departing person in the exit interview."
- "This gap requires operational experience that cannot be learned from docs alone."

### Cannot Establish

- That the gap is the complete picture (other gaps may exist but were not identified).
- That the gap is permanent (someone may already be learning).
- The business impact severity of the gap (that belongs to Business Impact family).
- How long it will take to fill (that is a separate ramp-up estimate).


## Internal Candidate Profile

### Purpose And Scope

An internal candidate profile aggregates observable evidence about an existing
team member's proximity to the identified knowledge gaps. It does not score or
rank candidates — it presents the evidence for a staffing decision.

### Layer 1: Faithful Source Records

Internal candidate evidence is assembled from other source families:

- Software Development: PRs reviewed, code authored in adjacent areas
- Communication: questions answered, threads participated in
- Production Operations: incident exposure, on-call history
- Work Management: tickets worked in related domains

No new external retrieval is needed. The candidate profile is a cross-reference
of existing evidence filtered by relevance to specific gaps.

### Layer 2: Normalized Record

```python
class ProximityLevel(str, Enum):
    DIRECT = "direct"
    ADJACENT = "adjacent"
    OBSERVATIONAL = "observational"
    NONE_OBSERVED = "none_observed"
    UNKNOWN = "unknown"


class InternalCandidateProfile(BaseModel):
    profile_id: str
    person_id: str
    person_display_name: str | None = None
    team: str | None = None
    tenure_months: int | None = None

    gap_coverage: list["GapCoverage"] = Field(default_factory=list)
    strengths: list["EvidencedStrength"] = Field(default_factory=list)
    gaps_remaining: list[str] = Field(default_factory=list)

    estimated_ramp_weeks: int | None = None
    ramp_estimate_basis: str | None = None

    created_at: datetime
    updated_at: datetime


class GapCoverage(BaseModel):
    gap_id: str
    proximity: ProximityLevel
    supporting_signals: list["ProximitySignal"] = Field(default_factory=list)
    coverage_notes: str | None = None


class EvidencedStrength(BaseModel):
    description: str
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Propositions

- "Person X has ADJACENT proximity to gap Y, based on N PR reviews in the same service."
- "Person X has DIRECT proximity to gap Y, based on incident response in a related system."
- "Person X has no observed activity in the domain covered by gap Y."

### Cannot Establish

- That proximity equals readiness to operate independently.
- That PR review experience translates to authorship capability.
- That adjacent-domain experience will transfer to the specific gap.
- That the person is willing or available to take on the role.
- That ramp-up will succeed within the estimated timeframe.


## Proximity Signal

### Purpose And Scope

A proximity signal is a single piece of observable evidence that a candidate
has some relationship to a knowledge gap's domain. Signals are not scores — they
are attributed observations that a decision-maker can weigh.

### Layer 2: Normalized Record

```python
class SignalSource(str, Enum):
    PR_REVIEW = "pr_review"
    PR_AUTHORSHIP = "pr_authorship"
    INCIDENT_PARTICIPATION = "incident_participation"
    ON_CALL_ROTATION = "on_call_rotation"
    SLACK_ANSWER = "slack_answer"
    TICKET_ASSIGNMENT = "ticket_assignment"
    DOCUMENTATION_AUTHORSHIP = "documentation_authorship"
    PAIR_PROGRAMMING = "pair_programming"
    MEETING_ATTENDANCE = "meeting_attendance"
    OTHER = "other"


class SignalStrength(str, Enum):
    STRONG = "strong"
    MODERATE = "moderate"
    WEAK = "weak"
    AMBIGUOUS = "ambiguous"


class ProximitySignal(BaseModel):
    signal_id: str
    person_id: str
    gap_id: str

    source: SignalSource
    strength: SignalStrength
    description: str

    occurred_at: datetime | None = None
    recency_months: int | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Propositions

- "Person X reviewed 8 PRs in auth-service (signal: PR_REVIEW, strength: MODERATE)."
- "Person X responded to 1 incident involving auth (signal: INCIDENT_PARTICIPATION, strength: MODERATE)."
- "Person X authored code in a service that calls auth-service (signal: PR_AUTHORSHIP, strength: WEAK — adjacent, not direct)."

### Cannot Establish

- That the signal indicates deep understanding.
- That reviewing code means the person could author equivalent code.
- That a single incident response means the person can handle future incidents independently.
- The quality or depth of engagement (a "LGTM" review and a substantive review
  produce the same signal type but different strength assessments).

### Strength Classification

Signal strength is not a numeric score. It reflects observability:

- **STRONG**: Direct, repeated, recent activity in the exact domain (authored code,
  sole incident responder, documented the system).
- **MODERATE**: Meaningful engagement with the domain (substantive reviews, answered
  questions, participated in incidents alongside the expert).
- **WEAK**: Peripheral or indirect contact (reviewed without comment, attended meetings,
  worked in adjacent service).
- **AMBIGUOUS**: Evidence exists but its meaning is unclear (e.g., assigned to a ticket
  but no activity recorded).


## External Candidate Profile

### Purpose And Scope

External candidate profiles represent what is known about a person outside the
organization who is being evaluated for the role. Evidence is weaker than internal
profiles because most signals cannot be verified against internal systems.

### Layer 2: Normalized Record

```python
class ClaimVerificationStatus(str, Enum):
    VERIFIED = "verified"
    PARTIALLY_VERIFIED = "partially_verified"
    UNVERIFIED = "unverified"
    CONTRADICTED = "contradicted"


class ExternalClaim(BaseModel):
    claim: str
    source: str
    verification_status: ClaimVerificationStatus
    verification_method: str | None = None
    notes: str | None = None


class ExternalCandidateProfile(BaseModel):
    profile_id: str
    candidate_name: str | None = None
    candidate_external_id: str | None = None

    claimed_experience: list[ExternalClaim] = Field(default_factory=list)
    gap_coverage_potential: list["ExternalGapCoverage"] = Field(default_factory=list)
    assessment_results: list[str] = Field(default_factory=list)

    red_flags: list[str] = Field(default_factory=list)

    created_at: datetime
    updated_at: datetime


class ExternalGapCoverage(BaseModel):
    gap_id: str
    candidate_claims_coverage: bool
    verification_status: ClaimVerificationStatus
    evidence_notes: str | None = None
```

### Supported Propositions

- "Candidate claims 5 years of OAuth experience (UNVERIFIED)."
- "Candidate's public GitHub shows contributions to an auth library (PARTIALLY_VERIFIED)."
- "Candidate's claimed Redis experience is contradicted by assessment performance."

### Cannot Establish

- That claimed experience is equivalent to the departing expert's specific knowledge.
- That years of experience indicate depth in the specific failure modes relevant here.
- That public activity reflects the full scope of a candidate's knowledge.
- That assessment performance predicts on-the-job success.


## Assessment Exercise

### Purpose And Scope

Assessment exercises are scenario-based evaluations designed from the specific
knowledge gaps identified in the audit. They test learning speed and reasoning
under ambiguity — not existing knowledge recall.

Results provide evidence of how a candidate approaches unfamiliar problems in the
exact domain where knowledge was lost.

### Layer 2: Normalized Record

```python
class AssessmentType(str, Enum):
    SCENARIO_WALKTHROUGH = "scenario_walkthrough"
    DEBUGGING_EXERCISE = "debugging_exercise"
    ARCHITECTURE_DISCUSSION = "architecture_discussion"
    INCIDENT_SIMULATION = "incident_simulation"
    CODE_REVIEW_EXERCISE = "code_review_exercise"


class ObservedBehavior(str, Enum):
    ASKS_CLARIFYING_QUESTIONS = "asks_clarifying_questions"
    FORMS_HYPOTHESES = "forms_hypotheses"
    SYSTEMATIC_APPROACH = "systematic_approach"
    RECOGNIZES_UNKNOWNS = "recognizes_unknowns"
    ESCALATES_APPROPRIATELY = "escalates_appropriately"
    MAKES_UNSUPPORTED_ASSUMPTIONS = "makes_unsupported_assumptions"
    FREEZES_UNDER_AMBIGUITY = "freezes_under_ambiguity"
    DEMONSTRATES_TRANSFER = "demonstrates_transfer"


class AssessmentExercise(BaseModel):
    exercise_id: str
    candidate_profile_id: str
    gap_ids: list[str] = Field(default_factory=list)

    exercise_type: AssessmentType
    scenario_description: str
    derived_from_gap: str | None = None

    observed_behaviors: list[ObservedBehavior] = Field(default_factory=list)
    evaluator_notes: str | None = None

    follow_up_questions_asked: int = 0
    follow_up_responses_quality: str | None = None

    conducted_at: datetime
    duration_minutes: int | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Propositions

- "Candidate demonstrated SYSTEMATIC_APPROACH and FORMS_HYPOTHESES when presented
  with the Redis failover scenario."
- "Candidate made unsupported assumptions about token refresh behavior."
- "Candidate asked 3 clarifying questions before proposing a debugging path."

### Cannot Establish

- That observed behaviors predict long-term success.
- That a single exercise captures the full range of required capabilities.
- That stress or unfamiliarity with the exercise format affected performance.
- That the exercise scenarios perfectly represent real-world conditions.
- Comparative ranking between candidates (exercises may not be identical in difficulty).


## Ramp-Up Estimate

### Purpose And Scope

A ramp-up estimate is a structured projection of how long a candidate needs to
reach operational independence for specific knowledge gaps. Estimates are grounded
in measurable factors, not intuition.

### Layer 2: Normalized Record

```python
class RampFactor(BaseModel):
    factor: str
    direction: str  # "reduces_ramp" or "increases_ramp"
    evidence: str
    supporting_source_record_ids: list[str] = Field(default_factory=list)


class RampUpEstimate(BaseModel):
    estimate_id: str
    candidate_profile_id: str
    gap_ids: list[str] = Field(default_factory=list)

    estimated_weeks: int | None = None
    confidence_qualifier: str | None = None

    factors_reducing_ramp: list[RampFactor] = Field(default_factory=list)
    factors_increasing_ramp: list[RampFactor] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)

    requires_departing_person_overlap: bool = False
    overlap_days_needed: int | None = None

    created_at: datetime
```

### Supported Propositions

- "Ramp estimate is 6 weeks, based on: adjacent domain experience (reduces),
  no incident experience (increases), overlap with departing person available (reduces)."
- "Estimate assumes 2 weeks of pair programming with departing person before departure."
- "If departing person is unavailable for overlap, estimate increases by 3 weeks."

### Cannot Establish

- That the estimate is accurate (it is a projection with stated assumptions).
- That the candidate will maintain motivation or availability.
- That unforeseen complexity won't extend the ramp.
- That the organization will provide the assumed support (pairing, shadowing, drills).

### Key Constraint

Ramp estimates must explicitly state their assumptions. An estimate without
assumptions is not an estimate — it is a guess. Common assumptions that must
be declared:

- Whether overlap with the departing person is available
- Whether dedicated ramp time vs. split with other work
- Whether simulated incidents or drills will be conducted
- Whether documentation from the exit interview is available
- Whether mentorship from adjacent-domain engineers is available


## Staffing Recommendation

### Purpose And Scope

A staffing recommendation is the Judge Agent's synthesized output combining
knowledge gaps, candidate profiles, proximity signals, assessment results, and
urgency constraints. It is a derived artifact that must cite its evidence.

### Layer 2: Normalized Record

```python
class RecommendationType(str, Enum):
    INTERNAL_TRANSFER = "internal_transfer"
    EXTERNAL_HIRE = "external_hire"
    BOTH_PARALLEL = "both_parallel"
    NO_ACTION = "no_action"
    INSUFFICIENT_EVIDENCE = "insufficient_evidence"


class StaffingRecommendation(BaseModel):
    recommendation_id: str
    departing_person_id: str

    recommendation_type: RecommendationType
    primary_candidate_id: str | None = None
    reasoning: str

    urgency_days_remaining: int | None = None
    gaps_covered_by_primary: list[str] = Field(default_factory=list)
    gaps_requiring_external: list[str] = Field(default_factory=list)

    factors_considered: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)

    supporting_evidence_ids: list[str] = Field(default_factory=list)

    created_at: datetime
```

### Supported Propositions

- "Recommendation: internal transfer + parallel external search, because urgency
  (11 days) precludes full external hire cycle."
- "Primary candidate covers 2 of 3 gaps with ADJACENT proximity."
- "External hire needed for operational knowledge gaps that no internal candidate covers."

### Cannot Establish

- That the recommendation will lead to successful knowledge recovery.
- That the recommended candidate will accept the role.
- That external hiring will produce a candidate within the required timeframe.
- That the organization will follow the recommendation.


## Canonical Failure Cases

1. **Proximity without depth**: Internal candidate reviewed 20 auth PRs (high signal
   count) but all reviews were "LGTM" (low quality). System must not confuse volume
   with depth — strength classification handles this.

2. **Recency bias**: A candidate worked in auth 2 years ago but the system has
   changed significantly. Historical proximity may not indicate current readiness.
   Signals should include `recency_months`.

3. **Over-confident ramp estimate**: Estimate assumes departing person overlap but
   departure date is in 5 days. System should flag when assumptions conflict with
   timeline reality.

4. **External candidate over-claim**: Candidate claims "led auth system redesign"
   but public evidence shows only peripheral contributions to an auth library.
   Verification status correctly reflects PARTIALLY_VERIFIED.

5. **Assessment gaming**: Candidate performs well on structured scenarios but
   assessment cannot measure on-call resilience at 3am. System acknowledges
   limitation in "Cannot Establish" rather than over-claiming assessment validity.


## Proposed Decisions

1. **Proposed**: Internal candidate profiles are assembled automatically from
   existing evidence across source families. No new data collection is needed —
   only cross-referencing existing records against identified gaps.

2. **Proposed**: Proximity signals use qualitative strength levels (STRONG,
   MODERATE, WEAK, AMBIGUOUS) rather than numeric scores. This avoids false
   precision and forces evidence-based justification for each level.

3. **Proposed**: Ramp-up estimates must declare assumptions explicitly. An
   estimate without stated assumptions is rejected by the system.

4. **Proposed**: Assessment exercises are derived from specific knowledge gaps,
   not generic interview questions. Each exercise traces back to a gap_id.

5. **Proposed**: Staffing recommendations must include a `risks` field
   acknowledging what could go wrong. Recommendations without risk acknowledgment
   are incomplete.

6. **Deferred**: Whether to track actual outcomes (did the ramp estimate prove
   accurate?) for calibration. Requires longitudinal data collection.

7. **Deferred**: How to weight conflicting signals (high PR review count but
   low review quality) in proximity assessment. Currently left to the Judge Agent's
   reasoning rather than a formula.
