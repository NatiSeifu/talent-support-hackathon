# Knowledge Validation Schema

> Status: Initial model complete.

## Purpose

Knowledge Validation records deliberate attempts to test whether inferred or
claimed knowledge is real, current, transferable, and usable. It is the source
family that can move SuccessionAI beyond activity, authorship, self-description,
and document existence toward evidence that a person can explain or apply
organization-specific knowledge and that another person can use what was
transferred.

This source family covers:

- knowledge-capture interviews;
- peer, manager, and subject-matter-expert attestations and nominations;
- documentation usability reviews;
- handoff exercises;
- simulated operational tasks;
- successor demonstrations;
- historical knowledge-transfer outcomes.

The governing distinctions are:

```text
Self-report is not demonstrated capability.
Attestation is not direct observation unless the attester observed the claimed work.
Nomination is perceived expertise, not validated expertise.
Observed completion is not independent completion when assistance was material.
Evaluator judgment is not the observed performance itself.
Exercise success is scoped to its task, criteria, environment, and validity time.
Immediate exercise success is not durable downstream transfer.
Historical outcome is not proof that the transfer alone caused the outcome.
```

Knowledge Validation preserves three layers:

```text
1. Source record:
   A validation system, form, interview record, exercise platform, evaluator,
   or historical record captured a prompt, response, attempt, observation,
   judgment, artifact, or outcome.

2. Evidence record:
   The record supports a narrow attributed proposition, such as "the participant
   described the recovery dependency," "the successor completed the rollback
   with one evaluator hint," or "the reviewer could not locate the prerequisite
   in the supplied runbook."

3. Assessment record:
   Corroborated evidence may support a broader conclusion about current knowledge,
   transferability, documentation usability, successor readiness, or an unresolved
   knowledge gap.
```

No validation event should directly overwrite the source evidence that motivated
it. Failed, partial, assisted, contradictory, and abstained results are useful
evidence and must remain visible.

## Scope And Boundaries

The meaningful objects are:

1. Validation program and session
2. Validation target and pre-existing gap
3. Prompt or interview question
4. Task definition and criteria
5. Participant response or performance attempt
6. Attestation and nomination
7. Evaluator qualification and assignment
8. Observation and assistance
9. Produced artifact
10. Evaluator judgment
11. Validation outcome and validity interval
12. Historical transfer outcome
13. Contradiction and evidence resolution
14. Consent, privacy, access, and ingestion scope

Related concepts remain in their owning source families:

- employment, team, role, reporting line, and identity history belong to Identity
  and Organization;
- commits, pull requests, reviews, and releases belong to Software Development;
- assigned work and workflow state belong to Work Management;
- documents and their revisions belong to Knowledge Artifacts;
- incidents, deployments, alerts, and real operational actions belong to Production
  Operations;
- formal ownership and system relationships belong to Ownership and Architecture;
- business criticality belongs to Business Impact;
- resumes and general candidate assessments belong to Candidate and Successor
  Evidence.

Knowledge Validation may link to those records without copying or reclassifying
their source facts.

## Retrieval

Knowledge-validation evidence may be retrieved from:

- structured interview tools and approved recordings or transcripts;
- survey and form systems;
- learning, assessment, and simulation platforms;
- tabletop-exercise and game-day records;
- sandbox, lab, or test-environment audit logs;
- documentation-review workflows;
- handoff plans, checklists, and completion records;
- evaluator scorecards and observation notes;
- peer, manager, and SME nomination systems;
- post-transfer work, incident, and operational records through explicit links;
- archival project, staffing, and transfer records;
- manually entered records with identified authors and provenance;
- synthetic JSON for the demo.

Authoritative retrieval depends on the proposition. Platform logs may be stronger
for recorded actions, while an evaluator note may contain the only explanation of
why a step was correct or unsafe. A manager form is authoritative for what the
manager attested, not for the truth of the underlying capability.

Initial synchronization should preserve visible session definitions, prompts,
criteria, participant responses, attempt logs, evaluator assignments, artifacts,
judgments, outcomes, consent, and available history. Incremental updates should be
reconciled because judgments may be revised, appeals may be filed, artifacts may be
redacted, and later real-world outcomes may contradict an exercise result.

The ingestion scope must record:

- included and excluded programs, teams, systems, participants, and time spans;
- whether prompts, recordings, transcripts, artifacts, detailed logs, judgments,
  appeals, and downstream outcomes were accessible;
- whether records were deleted, redacted, summarized, or retained only as metadata;
- whether participation was mandatory, voluntary, or unknown;
- known selection bias, retention limits, and incomplete historical coverage;
- source permissions and the authorization basis for sensitive content.

## Shared Modeling Conventions

The following Python/Pydantic pseudocode specifies product and data contracts, not
backend implementation.

```python
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ValidationMethod(str, Enum):
    KNOWLEDGE_CAPTURE_INTERVIEW = "knowledge_capture_interview"
    ATTESTATION = "attestation"
    NOMINATION = "nomination"
    DOCUMENTATION_USABILITY_REVIEW = "documentation_usability_review"
    HANDOFF_EXERCISE = "handoff_exercise"
    SIMULATED_OPERATIONAL_TASK = "simulated_operational_task"
    SUCCESSOR_DEMONSTRATION = "successor_demonstration"
    HISTORICAL_TRANSFER_REVIEW = "historical_transfer_review"
    OTHER = "other"
    UNKNOWN = "unknown"


class EvidenceMode(str, Enum):
    SELF_REPORT = "self_report"
    THIRD_PARTY_ATTESTATION = "third_party_attestation"
    OBSERVED_PERFORMANCE = "observed_performance"
    EVALUATOR_JUDGMENT = "evaluator_judgment"
    DOWNSTREAM_ASSESSMENT = "downstream_assessment"
    SOURCE_METADATA = "source_metadata"
    UNRESOLVED = "unresolved"


class EvidencePolarity(str, Enum):
    SUPPORTS = "supports"
    CONTRADICTS = "contradicts"
    CONTEXT_ONLY = "context_only"
    UNRESOLVED = "unresolved"


class ResolutionStatus(str, Enum):
    ATTRIBUTED = "attributed"
    CORROBORATED = "corroborated"
    CONTRADICTED = "contradicted"
    CONTESTED = "contested"
    SUPERSEDED = "superseded"
    UNRESOLVED = "unresolved"
    ABSTAINED = "abstained"


class CompletionState(str, Enum):
    COMPLETED = "completed"
    PARTIALLY_COMPLETED = "partially_completed"
    NOT_COMPLETED = "not_completed"
    NOT_ATTEMPTED = "not_attempted"
    INVALIDATED = "invalidated"
    UNOBSERVABLE = "unobservable"
    UNKNOWN = "unknown"


class AssessmentDisposition(str, Enum):
    SUPPORTED = "supported"
    PARTIALLY_SUPPORTED = "partially_supported"
    NOT_SUPPORTED = "not_supported"
    CONTRADICTED = "contradicted"
    INCONCLUSIVE = "inconclusive"
    NOT_APPLICABLE = "not_applicable"
    ABSTAINED = "abstained"
    UNKNOWN = "unknown"


class ValidationEvidenceRecord(BaseModel):
    validation_evidence_id: str
    evidence_mode: EvidenceMode
    proposition_text: str
    polarity: EvidencePolarity
    resolution_status: ResolutionStatus

    session_id: str | None = None
    participant_person_id: str | None = None
    evaluator_person_id: str | None = None
    attester_person_id: str | None = None
    subject_system_id: str | None = None
    subject_component_id: str | None = None
    subject_capability_id: str | None = None

    occurred_at: datetime | None = None
    valid_from: datetime | None = None
    valid_until: datetime | None = None

    extraction_method: str
    extractor_version: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

`evidence_mode` prevents statements made by a participant, statements made about a
participant, observed actions, evaluator interpretations, and later outcomes from
being collapsed into one undifferentiated validation result.

## Validation Program And Session

A program defines an organization's named validation process. A session is one
bounded occurrence involving specific participants, targets, methods, and context.

### Layer 1: Faithful Source Record

```python
class SourceValidationSessionRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_program_id: str | None = None
    external_session_id: str

    title: str | None = None
    method_reported: str | None = None
    status_reported: str | None = None
    purpose_reported: str | None = None

    participant_external_actor_ids: list[str] = Field(default_factory=list)
    evaluator_external_actor_ids: list[str] = Field(default_factory=list)
    organizer_external_actor_id: str | None = None

    target_refs_reported: list[str] = Field(default_factory=list)
    environment_ref: str | None = None
    instructions_ref: str | None = None
    recording_ref: str | None = None
    transcript_ref: str | None = None

    source_scheduled_at: datetime | None = None
    source_started_at: datetime | None = None
    source_ended_at: datetime | None = None
    source_updated_at: datetime | None = None

    participation_required_reported: bool | None = None
    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

### Layer 2: Normalized Record

```python
class SessionLifecycle(str, Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    INVALIDATED = "invalidated"
    UNKNOWN = "unknown"


class KnowledgeValidationSession(BaseModel):
    session_id: str
    external_session_id: str
    program_id: str | None = None

    title: str | None = None
    validation_method: ValidationMethod
    lifecycle: SessionLifecycle
    stated_purpose: str | None = None

    participant_person_ids: list[str] = Field(default_factory=list)
    unresolved_participant_source_account_ids: list[str] = Field(default_factory=list)
    evaluator_assignment_ids: list[str] = Field(default_factory=list)

    scheduled_at: datetime | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None
    observed_at: datetime

    participation_required: bool | None = None
    environment_id: str | None = None
    consent_record_ids: list[str] = Field(default_factory=list)
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Session completion establishes that the process occurred, not that knowledge or
transfer was validated. Cancellation and invalidation must not be treated as
failure by the participant.

## Validation Target And Pre-Existing Gap

Validation should state what proposition, capability, artifact, or transfer concern
it was designed to examine and why. This is essential for later evaluation of
whether an interview question targeted an evidenced gap rather than merely sounding
relevant.

```python
class ValidationTargetKind(str, Enum):
    KNOWLEDGE_PROPOSITION = "knowledge_proposition"
    PROCEDURE = "procedure"
    DIAGNOSTIC_REASONING = "diagnostic_reasoning"
    DECISION_RATIONALE = "decision_rationale"
    SYSTEM_OPERATION = "system_operation"
    DOCUMENT_USABILITY = "document_usability"
    HANDOFF_COMPLETENESS = "handoff_completeness"
    SUCCESSOR_CAPABILITY = "successor_capability"
    TRANSFER_DURABILITY = "transfer_durability"
    INFERRED_KNOWLEDGE_GAP = "inferred_knowledge_gap"
    OTHER = "other"
    UNKNOWN = "unknown"


class GapResolutionState(str, Enum):
    OPEN = "open"
    PARTIALLY_RESOLVED = "partially_resolved"
    RESOLVED = "resolved"
    CONTRADICTED = "contradicted"
    NOT_A_GAP = "not_a_gap"
    UNRESOLVED = "unresolved"
    ABSTAINED = "abstained"


class ValidationTarget(BaseModel):
    validation_target_id: str
    target_kind: ValidationTargetKind
    target_statement: str

    subject_person_id: str | None = None
    subject_system_id: str | None = None
    subject_component_id: str | None = None
    subject_capability_id: str | None = None
    subject_artifact_id: str | None = None

    pre_validation_resolution_state: GapResolutionState
    target_created_at: datetime | None = None
    target_valid_at: datetime | None = None

    motivating_evidence_ids: list[str] = Field(default_factory=list)
    motivating_assessment_ids: list[str] = Field(default_factory=list)
    contradicting_evidence_ids: list[str] = Field(default_factory=list)
    observability_limitations: list[str] = Field(default_factory=list)
```

A target may be generated from an assessment, but the motivating evidence remains
linked. A weak or unsupported target makes a question less useful for resolving an
evidenced gap even when the answer is interesting.

## Prompt And Interview Question

Prompts include interview questions, follow-up questions, task instructions, review
requests, and evaluator probes. Prompt records preserve intent, target, sequence,
and the information available when the prompt was selected.

### Faithful Source Record

```python
class SourceValidationPromptRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_session_id: str
    external_prompt_id: str

    prompt_text: str
    prompt_type_reported: str | None = None
    author_external_actor_id: str | None = None
    asked_by_external_actor_id: str | None = None
    directed_to_external_actor_id: str | None = None

    parent_external_prompt_id: str | None = None
    sequence_number_reported: int | None = None
    rationale_reported: str | None = None
    target_refs_reported: list[str] = Field(default_factory=list)

    source_created_at: datetime | None = None
    source_asked_at: datetime | None = None
    observed_at: datetime
    raw_payload_ref: str
```

### Normalized Prompt

```python
class PromptKind(str, Enum):
    OPEN_INTERVIEW_QUESTION = "open_interview_question"
    FOLLOW_UP_QUESTION = "follow_up_question"
    CLARIFICATION = "clarification"
    COUNTEREXAMPLE_PROBE = "counterexample_probe"
    TASK_INSTRUCTION = "task_instruction"
    DOCUMENT_REVIEW_REQUEST = "document_review_request"
    DEMONSTRATION_REQUEST = "demonstration_request"
    OTHER = "other"
    UNKNOWN = "unknown"


class ValidationPrompt(BaseModel):
    prompt_id: str
    session_id: str
    external_prompt_id: str
    prompt_kind: PromptKind
    prompt_text: str

    author_person_id: str | None = None
    asked_by_person_id: str | None = None
    directed_to_person_id: str | None = None
    parent_prompt_id: str | None = None
    sequence_number_reported: int | None = None

    validation_target_ids: list[str] = Field(default_factory=list)
    stated_rationale: str | None = None
    selected_at: datetime | None = None
    asked_at: datetime | None = None

    prior_prompt_ids_available: list[str] = Field(default_factory=list)
    prior_evidence_ids_available: list[str] = Field(default_factory=list)
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

### Interview-Question Utility Evidence

The initial schema does not assign a utility score, threshold, or reward weight.
It preserves the observations required for later evaluation.

```python
class RelevanceDisposition(str, Enum):
    RELEVANT = "relevant"
    PARTIALLY_RELEVANT = "partially_relevant"
    NOT_RELEVANT = "not_relevant"
    INCONCLUSIVE = "inconclusive"
    ABSTAINED = "abstained"


class RedundancyDisposition(str, Enum):
    NON_REDUNDANT = "non_redundant"
    PARTIALLY_REDUNDANT = "partially_redundant"
    REDUNDANT = "redundant"
    INCONCLUSIVE = "inconclusive"
    ABSTAINED = "abstained"


class OutputUsabilityDisposition(str, Enum):
    VERIFIABLE_AND_USABLE = "verifiable_and_usable"
    VERIFIABLE_NOT_YET_USABLE = "verifiable_not_yet_usable"
    USABLE_NOT_INDEPENDENTLY_VERIFIABLE = "usable_not_independently_verifiable"
    NEITHER_VERIFIABLE_NOR_USABLE = "neither_verifiable_nor_usable"
    INCONCLUSIVE = "inconclusive"
    ABSTAINED = "abstained"


class InterviewQuestionUtilityEvidence(BaseModel):
    question_utility_evidence_id: str
    prompt_id: str
    validation_target_ids: list[str] = Field(default_factory=list)

    targeted_evidenced_gap: RelevanceDisposition
    target_rationale: str | None = None
    target_supporting_evidence_ids: list[str] = Field(default_factory=list)

    elicited_new_relevant_information: RelevanceDisposition
    new_information_evidence_ids: list[str] = Field(default_factory=list)

    pre_question_resolution_state: GapResolutionState
    post_question_resolution_state: GapResolutionState
    resolution_change_rationale: str | None = None

    redundancy: RedundancyDisposition
    overlapping_prior_prompt_ids: list[str] = Field(default_factory=list)
    overlapping_prior_evidence_ids: list[str] = Field(default_factory=list)

    output_usability: OutputUsabilityDisposition
    produced_artifact_ids: list[str] = Field(default_factory=list)
    verification_evidence_ids: list[str] = Field(default_factory=list)

    evaluator_judgment_ids: list[str] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

The pre- and post-question states must be based on the state known at those times.
Later corroboration may revise the interpretation without rewriting the historical
decision context. A question can elicit new information without resolving the gap,
or produce useful output while being partly redundant.

## Task Definition And Criteria

Exercises and demonstrations require explicit task scope and assessable criteria.
Criteria should describe observable expectations, including safety, reasoning,
verification, and artifact quality where applicable.

```python
class TaskCriterionKind(str, Enum):
    REQUIRED_ACTION = "required_action"
    REQUIRED_EXPLANATION = "required_explanation"
    DIAGNOSTIC_REASONING = "diagnostic_reasoning"
    DECISION_RATIONALE = "decision_rationale"
    SAFETY_CONSTRAINT = "safety_constraint"
    VERIFICATION_STEP = "verification_step"
    OUTPUT_ARTIFACT = "output_artifact"
    TIME_OR_SEQUENCE_CONSTRAINT = "time_or_sequence_constraint"
    PROHIBITED_ACTION = "prohibited_action"
    OTHER = "other"
    UNKNOWN = "unknown"


class CriterionDisclosure(str, Enum):
    DISCLOSED_BEFORE_ATTEMPT = "disclosed_before_attempt"
    PARTIALLY_DISCLOSED = "partially_disclosed"
    NOT_DISCLOSED = "not_disclosed"
    UNKNOWN = "unknown"


class ValidationTaskCriterion(BaseModel):
    criterion_id: str
    task_id: str
    criterion_kind: TaskCriterionKind
    criterion_text: str
    disclosure: CriterionDisclosure

    expected_evidence_description: str | None = None
    applicable_environment_conditions: list[str] = Field(default_factory=list)
    criterion_defined_at: datetime | None = None
    defined_by_person_id: str | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

```python
class ValidationTask(BaseModel):
    task_id: str
    session_id: str
    validation_target_ids: list[str] = Field(default_factory=list)

    title: str
    task_description: str
    initial_conditions: list[str] = Field(default_factory=list)
    available_resources: list[str] = Field(default_factory=list)
    prohibited_resources: list[str] = Field(default_factory=list)
    criterion_ids: list[str] = Field(default_factory=list)

    task_version: str | None = None
    created_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Criteria created or materially changed after an attempt must be identifiable. A
task cannot fairly establish failure against hidden expectations, although hidden
diagnostic conditions may be legitimate when the disclosed task permits them.

## Environment Realism

Exercise interpretation depends on how closely the environment represents the
conditions relevant to the claim.

```python
class EnvironmentRealism(str, Enum):
    REAL_OPERATIONAL = "real_operational"
    PRODUCTION_LIKE = "production_like"
    REPRESENTATIVE_SIMULATION = "representative_simulation"
    CONSTRAINED_LAB = "constrained_lab"
    TABLETOP = "tabletop"
    INTERVIEW_ONLY = "interview_only"
    HISTORICAL_REVIEW = "historical_review"
    UNKNOWN = "unknown"


class ValidationEnvironment(BaseModel):
    environment_id: str
    realism: EnvironmentRealism
    environment_description: str

    represented_system_ids: list[str] = Field(default_factory=list)
    represented_component_ids: list[str] = Field(default_factory=list)
    scenario_time_context: datetime | None = None

    production_data_used: bool | None = None
    live_customer_impact_possible: bool | None = None
    destructive_actions_blocked: bool | None = None
    automation_available: bool | None = None
    normal_tools_available: bool | None = None

    known_differences_from_target_conditions: list[str] = Field(default_factory=list)
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

A tabletop can strongly test explanation or decision rationale while providing
little evidence of tool execution. A constrained lab may test execution but omit
stress, incomplete telemetry, permissions, scale, or coordination present in real
operations. Realism is multidimensional; this enum is descriptive, not a score.

## Participant Response And Performance Attempt

Interview answers remain self-report unless independently corroborated. Task
attempts preserve what was attempted and completed separately from evaluator
interpretation.

```python
class SourceParticipantResponseRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_session_id: str
    external_response_id: str

    respondent_external_actor_id: str | None = None
    external_prompt_id: str | None = None
    response_text_ref: str | None = None
    response_artifact_refs: list[str] = Field(default_factory=list)

    source_started_at: datetime | None = None
    source_submitted_at: datetime | None = None
    observed_at: datetime
    raw_payload_ref: str
```

```python
class ParticipantResponse(BaseModel):
    response_id: str
    session_id: str
    participant_person_id: str | None = None
    prompt_id: str | None = None

    evidence_mode: EvidenceMode = EvidenceMode.SELF_REPORT
    response_text_ref: str | None = None
    produced_artifact_ids: list[str] = Field(default_factory=list)

    started_at: datetime | None = None
    submitted_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

```python
class PerformanceAttempt(BaseModel):
    attempt_id: str
    session_id: str
    task_id: str
    participant_person_id: str | None = None

    completion_state: CompletionState
    started_at: datetime | None = None
    ended_at: datetime | None = None

    observed_action_ids: list[str] = Field(default_factory=list)
    assistance_event_ids: list[str] = Field(default_factory=list)
    produced_artifact_ids: list[str] = Field(default_factory=list)
    criterion_result_ids: list[str] = Field(default_factory=list)

    invalidation_reason: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Partial completion must preserve which criteria were met, missed, unobservable, or
not applicable. A single overall result must not erase unsafe actions, strong
reasoning with failed execution, successful execution without understanding, or
completion achieved through substantial assistance.

## Attestation And Nomination

Attestations state that another person believes a proposition about a subject.
Nominations identify a person as a likely knowledge holder or evaluator. Neither is
observed performance unless it cites specific observed events.

```python
class AttestationKind(str, Enum):
    PEER = "peer"
    MANAGER = "manager"
    SUBJECT_MATTER_EXPERT = "subject_matter_expert"
    DIRECT_REPORT = "direct_report"
    CROSS_FUNCTIONAL_PARTNER = "cross_functional_partner"
    SELF = "self"
    OTHER = "other"
    UNKNOWN = "unknown"


class AttestationBasis(str, Enum):
    DIRECTLY_OBSERVED_WORK = "directly_observed_work"
    REVIEWED_WORK_PRODUCT = "reviewed_work_product"
    RECEIVED_HELP_OR_HANDOFF = "received_help_or_handoff"
    MANAGERIAL_OVERSIGHT = "managerial_oversight"
    REPUTATION_OR_HEARSAY = "reputation_or_hearsay"
    SOURCE_RECORDS = "source_records"
    UNSPECIFIED = "unspecified"
    UNKNOWN = "unknown"


class AttestationSubjectKind(str, Enum):
    KNOWLEDGE = "knowledge"
    CURRENT_CAPABILITY = "current_capability"
    HISTORICAL_CAPABILITY = "historical_capability"
    TRANSFER_ABILITY = "transfer_ability"
    DOCUMENTATION_QUALITY = "documentation_quality"
    SUCCESSOR_READINESS = "successor_readiness"
    OTHER = "other"
    UNKNOWN = "unknown"


class KnowledgeAttestation(BaseModel):
    attestation_id: str
    session_id: str | None = None
    attester_person_id: str | None = None
    subject_person_id: str | None = None

    attestation_kind: AttestationKind
    attestation_basis: AttestationBasis
    subject_kind: AttestationSubjectKind
    attestation_statement: str

    cited_evidence_ids: list[str] = Field(default_factory=list)
    cited_source_record_ids: list[str] = Field(default_factory=list)
    relationship_to_subject_reported: str | None = None
    observed_from: datetime | None = None
    observed_until: datetime | None = None
    attested_at: datetime | None = None
    valid_until: datetime | None = None

    contradicting_attestation_ids: list[str] = Field(default_factory=list)
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

```python
class NominationPurpose(str, Enum):
    KNOWLEDGE_HOLDER = "knowledge_holder"
    VALIDATION_PARTICIPANT = "validation_participant"
    EVALUATOR = "evaluator"
    SUCCESSOR = "successor"
    HANDOFF_RECIPIENT = "handoff_recipient"
    OTHER = "other"
    UNKNOWN = "unknown"


class KnowledgeNomination(BaseModel):
    nomination_id: str
    nominator_person_id: str | None = None
    nominee_person_id: str | None = None
    purpose: NominationPurpose
    rationale: str | None = None

    subject_system_id: str | None = None
    subject_capability_id: str | None = None
    cited_evidence_ids: list[str] = Field(default_factory=list)
    nominated_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Repeated nominations may support perceived expertise or organizational dependence.
They do not establish correctness, capability, uniqueness, or current availability.

## Evaluator Qualification And Assignment

Evaluator identity, relationship, conflicts, and basis of qualification affect how
judgments may be interpreted. Qualification is claim-specific and time-specific.

```python
class EvaluatorQualificationBasis(str, Enum):
    DEMONSTRATED_CAPABILITY = "demonstrated_capability"
    FORMAL_ROLE = "formal_role"
    DECLARED_OWNERSHIP = "declared_ownership"
    CERTIFICATION_OR_TRAINING = "certification_or_training"
    RELEVANT_WORK_HISTORY = "relevant_work_history"
    PEER_NOMINATION = "peer_nomination"
    MANAGER_NOMINATION = "manager_nomination"
    SELF_DECLARED = "self_declared"
    UNSPECIFIED = "unspecified"
    UNKNOWN = "unknown"


class EvaluatorQualification(BaseModel):
    evaluator_qualification_id: str
    evaluator_person_id: str | None = None
    qualification_statement: str
    basis: EvaluatorQualificationBasis

    subject_system_id: str | None = None
    subject_capability_id: str | None = None
    valid_from: datetime | None = None
    valid_until: datetime | None = None

    supporting_evidence_ids: list[str] = Field(default_factory=list)
    contradicting_evidence_ids: list[str] = Field(default_factory=list)
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

```python
class EvaluatorRole(str, Enum):
    INTERVIEWER = "interviewer"
    OBSERVER = "observer"
    TASK_GRADER = "task_grader"
    DOCUMENT_REVIEWER = "document_reviewer"
    SME_REVIEWER = "sme_reviewer"
    MANAGER_REVIEWER = "manager_reviewer"
    DOWNSTREAM_ASSESSOR = "downstream_assessor"
    OTHER = "other"
    UNKNOWN = "unknown"


class EvaluatorAssignment(BaseModel):
    evaluator_assignment_id: str
    session_id: str
    evaluator_person_id: str | None = None
    evaluator_role: EvaluatorRole

    qualification_ids: list[str] = Field(default_factory=list)
    declared_conflicts: list[str] = Field(default_factory=list)
    relationship_to_participant_reported: str | None = None
    blinded_to_prior_assessments: bool | None = None

    assigned_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Formal role or ownership may be relevant qualification evidence, but neither proves
that an evaluator can judge every criterion. A participant's manager may know work
history while lacking technical qualification. An SME may be technically qualified
while having a conflict or preference for one valid method.

## Observation, Assistance, And Independence

Observed actions and assistance must be recorded separately. Assistance includes
hints, corrections, runbook use, collaboration, automation, privileged access, and
takeover by another actor.

```python
class ObservedActionKind(str, Enum):
    EXPLANATION = "explanation"
    INFORMATION_RETRIEVAL = "information_retrieval"
    DIAGNOSTIC_STEP = "diagnostic_step"
    DECISION = "decision"
    TOOL_ACTION = "tool_action"
    OPERATIONAL_ACTION = "operational_action"
    VERIFICATION = "verification"
    DOCUMENTATION_CHANGE = "documentation_change"
    HANDOFF_COMMUNICATION = "handoff_communication"
    SAFETY_VIOLATION = "safety_violation"
    OTHER = "other"
    UNKNOWN = "unknown"


class ValidationObservedAction(BaseModel):
    observed_action_id: str
    attempt_id: str
    actor_person_id: str | None = None
    action_kind: ObservedActionKind
    action_description: str

    action_started_at: datetime | None = None
    action_ended_at: datetime | None = None
    observer_person_ids: list[str] = Field(default_factory=list)
    system_log_refs: list[str] = Field(default_factory=list)

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

```python
class AssistanceKind(str, Enum):
    CLARIFYING_INSTRUCTION = "clarifying_instruction"
    GENERAL_HINT = "general_hint"
    SPECIFIC_HINT = "specific_hint"
    CORRECTION = "correction"
    DOCUMENTATION_USE = "documentation_use"
    PEER_COLLABORATION = "peer_collaboration"
    AUTOMATION = "automation"
    PRIVILEGED_ACCESS = "privileged_access"
    EVALUATOR_INTERVENTION = "evaluator_intervention"
    TAKEOVER = "takeover"
    OTHER = "other"
    UNKNOWN = "unknown"


class AssistanceEffect(str, Enum):
    NO_OBSERVED_EFFECT = "no_observed_effect"
    ENABLED_PROGRESS = "enabled_progress"
    ENABLED_COMPLETION = "enabled_completion"
    PREVENTED_HARM = "prevented_harm"
    INVALIDATED_INDEPENDENCE = "invalidated_independence"
    UNKNOWN = "unknown"


class AssistanceEvent(BaseModel):
    assistance_event_id: str
    attempt_id: str
    assistance_kind: AssistanceKind
    assistance_description: str

    provider_person_id: str | None = None
    artifact_id: str | None = None
    occurred_at: datetime | None = None
    effect: AssistanceEffect
    expected_resource_for_task: bool | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Use of an allowed runbook may be exactly the capability under test. The same use may
invalidate a memory-recall claim. Independence must therefore be interpreted
against disclosed task conditions, not inferred from assistance type alone.

## Produced Artifacts And Documentation Usability

Validation may produce transcripts, notes, revised runbooks, decision records,
commands, screenshots, diagrams, checklists, or handoff packages. The artifact
record establishes production and review context. The artifact itself remains a
Knowledge Artifact when retained as organizational documentation.

```python
class ProducedArtifactKind(str, Enum):
    INTERVIEW_TRANSCRIPT = "interview_transcript"
    KNOWLEDGE_NOTE = "knowledge_note"
    RUNBOOK_REVISION = "runbook_revision"
    CHECKLIST = "checklist"
    DIAGRAM = "diagram"
    COMMAND_OR_QUERY = "command_or_query"
    TASK_OUTPUT = "task_output"
    RECORDING = "recording"
    HANDOFF_PACKAGE = "handoff_package"
    OTHER = "other"
    UNKNOWN = "unknown"


class ValidationProducedArtifact(BaseModel):
    produced_artifact_id: str
    session_id: str
    attempt_id: str | None = None
    artifact_kind: ProducedArtifactKind
    title: str | None = None
    content_ref: str | None = None

    producer_person_ids: list[str] = Field(default_factory=list)
    linked_knowledge_artifact_id: str | None = None
    created_at: datetime | None = None

    verification_status: ResolutionStatus
    verified_by_evaluator_assignment_ids: list[str] = Field(default_factory=list)
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

```python
class UsabilityObservationKind(str, Enum):
    LOCATED_REQUIRED_INFORMATION = "located_required_information"
    COULD_NOT_LOCATE_INFORMATION = "could_not_locate_information"
    FOLLOWED_PROCEDURE = "followed_procedure"
    PROCEDURE_BLOCKED_PROGRESS = "procedure_blocked_progress"
    FOUND_AMBIGUITY = "found_ambiguity"
    FOUND_MISSING_PREREQUISITE = "found_missing_prerequisite"
    FOUND_STALE_CONTENT = "found_stale_content"
    REQUIRED_UNDOCUMENTED_HELP = "required_undocumented_help"
    PRODUCED_CORRECT_RESULT = "produced_correct_result"
    PRODUCED_INCORRECT_OR_UNSAFE_RESULT = "produced_incorrect_or_unsafe_result"
    OTHER = "other"
    UNKNOWN = "unknown"


class DocumentationUsabilityObservation(BaseModel):
    usability_observation_id: str
    session_id: str
    reviewer_person_id: str | None = None
    knowledge_artifact_id: str
    artifact_revision_id: str | None = None
    observation_kind: UsabilityObservationKind
    observation_statement: str

    task_id: str | None = None
    assistance_event_ids: list[str] = Field(default_factory=list)
    occurred_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

A reviewer saying that a document is clear is evaluator judgment. A reviewer
locating and successfully applying a procedure is observed usability evidence. The
two may corroborate or contradict each other.

## Criterion Results And Evaluator Judgment

Criterion results preserve the observed basis and disposition for each criterion.
Evaluator judgments interpret evidence and must not replace it.

```python
class CriterionResult(BaseModel):
    criterion_result_id: str
    attempt_id: str
    criterion_id: str
    disposition: AssessmentDisposition

    observed_action_ids: list[str] = Field(default_factory=list)
    produced_artifact_ids: list[str] = Field(default_factory=list)
    assistance_event_ids: list[str] = Field(default_factory=list)
    evaluator_judgment_ids: list[str] = Field(default_factory=list)
    rationale: str | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

```python
class EvaluatorJudgmentKind(str, Enum):
    RESPONSE_RELEVANCE = "response_relevance"
    RESPONSE_CORRECTNESS = "response_correctness"
    RESPONSE_COMPLETENESS = "response_completeness"
    REASONING_QUALITY = "reasoning_quality"
    TASK_CRITERION = "task_criterion"
    SAFETY = "safety"
    ARTIFACT_USABILITY = "artifact_usability"
    TRANSFER_SUCCESS = "transfer_success"
    SUCCESSOR_READINESS = "successor_readiness"
    QUESTION_UTILITY = "question_utility"
    OTHER = "other"
    UNKNOWN = "unknown"


class EvaluatorJudgment(BaseModel):
    evaluator_judgment_id: str
    evaluator_assignment_id: str
    judgment_kind: EvaluatorJudgmentKind
    judgment_statement: str
    disposition: AssessmentDisposition

    response_id: str | None = None
    attempt_id: str | None = None
    criterion_id: str | None = None
    prompt_id: str | None = None
    produced_artifact_id: str | None = None

    cited_observed_action_ids: list[str] = Field(default_factory=list)
    cited_evidence_ids: list[str] = Field(default_factory=list)
    cited_source_record_ids: list[str] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)

    judged_at: datetime | None = None
    valid_until: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

Multiple evaluators may disagree. Their judgments remain separate, with
qualifications and cited observations, until a claim-specific resolution process
produces a downstream assessment or abstains.

## Validation Outcome And Validity

A validation outcome summarizes a bounded session or target without erasing its
evidence modes, criteria, assistance, or limitations.

```python
class ValidationOutcomeKind(str, Enum):
    KNOWLEDGE_CORROBORATED = "knowledge_corroborated"
    KNOWLEDGE_CONTRADICTED = "knowledge_contradicted"
    KNOWLEDGE_PARTIALLY_DEMONSTRATED = "knowledge_partially_demonstrated"
    DOCUMENT_USABLE = "document_usable"
    DOCUMENT_NOT_USABLE = "document_not_usable"
    HANDOFF_PARTIALLY_SUCCESSFUL = "handoff_partially_successful"
    HANDOFF_SUCCESSFUL = "handoff_successful"
    HANDOFF_NOT_SUCCESSFUL = "handoff_not_successful"
    SUCCESSOR_PARTIALLY_DEMONSTRATED = "successor_partially_demonstrated"
    SUCCESSOR_DEMONSTRATED = "successor_demonstrated"
    SUCCESSOR_NOT_DEMONSTRATED = "successor_not_demonstrated"
    INCONCLUSIVE = "inconclusive"
    ABSTAINED = "abstained"
    OTHER = "other"
    UNKNOWN = "unknown"


class ValidationOutcome(BaseModel):
    validation_outcome_id: str
    session_id: str
    validation_target_id: str | None = None
    outcome_kind: ValidationOutcomeKind
    disposition: AssessmentDisposition
    outcome_statement: str

    participant_person_id: str | None = None
    subject_system_id: str | None = None
    subject_capability_id: str | None = None

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    validity_basis: str | None = None
    invalidated_at: datetime | None = None
    invalidation_reason: str | None = None

    supporting_validation_evidence_ids: list[str] = Field(default_factory=list)
    contradicting_validation_evidence_ids: list[str] = Field(default_factory=list)
    evaluator_judgment_ids: list[str] = Field(default_factory=list)
    observability_limitations: list[str] = Field(default_factory=list)
```

Validity is claim-specific. Relevant changes include system redesign, procedure
changes, role changes, long periods without practice, newly discovered failure
modes, later failed demonstrations, and contradictory real-world outcomes. No fixed
freshness window is defined.

An outcome may be:

- successful for some criteria and unsuccessful for others;
- successful with expected documentation use;
- completed only after material assistance;
- technically correct but unsafe;
- correct in a simulation but untested in production-like conditions;
- immediately successful but not yet assessed for durable transfer;
- inconclusive because the environment, criteria, evaluator qualification, or
  observability was insufficient.

## Historical Transfer Outcomes

Historical outcomes assess what happened after a handoff or transfer period. They
may provide stronger transfer evidence than an immediate exercise, but attribution
and observability remain limited.

```python
class HistoricalTransferOutcomeKind(str, Enum):
    INDEPENDENT_TASK_COMPLETION = "independent_task_completion"
    ASSISTED_TASK_COMPLETION = "assisted_task_completion"
    ESCALATION_TO_PRIOR_HOLDER = "escalation_to_prior_holder"
    SUCCESSFUL_INCIDENT_RESPONSE = "successful_incident_response"
    UNSUCCESSFUL_INCIDENT_RESPONSE = "unsuccessful_incident_response"
    DOCUMENTATION_MAINTAINED = "documentation_maintained"
    DOCUMENTATION_ABANDONED = "documentation_abandoned"
    RESPONSIBILITY_SUSTAINED = "responsibility_sustained"
    RESPONSIBILITY_REASSIGNED = "responsibility_reassigned"
    KNOWLEDGE_RELEARNED_EXTERNALLY = "knowledge_relearned_externally"
    NO_OBSERVABLE_OPPORTUNITY = "no_observable_opportunity"
    OTHER = "other"
    UNKNOWN = "unknown"


class HistoricalTransferOutcome(BaseModel):
    historical_transfer_outcome_id: str
    prior_validation_session_id: str | None = None
    transferor_person_id: str | None = None
    recipient_person_id: str | None = None
    outcome_kind: HistoricalTransferOutcomeKind
    outcome_statement: str

    subject_system_id: str | None = None
    subject_capability_id: str | None = None
    observation_period_started_at: datetime | None = None
    observation_period_ended_at: datetime | None = None

    downstream_source_record_ids: list[str] = Field(default_factory=list)
    downstream_assessment_ids: list[str] = Field(default_factory=list)
    alternative_explanations: list[str] = Field(default_factory=list)
    observability_limitations: list[str] = Field(default_factory=list)
    resolution_status: ResolutionStatus

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

The absence of escalations does not prove transfer success when no relevant event
occurred, escalation records were unavailable, the prior holder was inaccessible,
or the recipient relearned the capability elsewhere. A later successful task may
support durable capability while leaving the causal contribution of the original
handoff unresolved.

## Assessment Boundary

Knowledge-validation assessments are downstream records:

```python
class KnowledgeValidationAssessmentKind(str, Enum):
    CURRENT_KNOWLEDGE = "current_knowledge"
    PRACTICAL_CAPABILITY = "practical_capability"
    DOCUMENTATION_USABILITY = "documentation_usability"
    TRANSFERABILITY = "transferability"
    TRANSFER_COMPLETENESS = "transfer_completeness"
    TRANSFER_DURABILITY = "transfer_durability"
    SUCCESSOR_READINESS = "successor_readiness"
    REMAINING_KNOWLEDGE_GAP = "remaining_knowledge_gap"
    VALIDATION_COVERAGE = "validation_coverage"
    OTHER = "other"
    UNKNOWN = "unknown"


class KnowledgeValidationAssessment(BaseModel):
    knowledge_validation_assessment_id: str
    assessment_kind: KnowledgeValidationAssessmentKind
    assessment_statement: str
    disposition: AssessmentDisposition

    subject_person_id: str | None = None
    subject_system_id: str | None = None
    subject_capability_id: str | None = None

    assessed_at: datetime
    valid_until: datetime | None = None
    assessment_method: str
    assessment_version: str | None = None

    supporting_validation_evidence_ids: list[str] = Field(default_factory=list)
    contradicting_validation_evidence_ids: list[str] = Field(default_factory=list)
    supporting_outcome_ids: list[str] = Field(default_factory=list)
    contradicting_outcome_ids: list[str] = Field(default_factory=list)
    observability_limitations: list[str] = Field(default_factory=list)
```

No confidence threshold, pass cutoff, source weight, freshness cutoff, evaluator
weight, question reward, or combined readiness score is defined in this initial
model.

## Provenance, Time, Identity, And Access

### Provenance

Every normalized record, observation, judgment, and assessment must remain
traceable to source records. Transcript excerpts, system logs, evaluator notes,
artifacts, and downstream records should retain inspectable references according to
policy. Derived classifications record method and version.

Source precedence is proposition-specific. A task log may be stronger for whether a
command ran, an evaluator may be stronger for whether the command showed sound
reasoning, and a later incident may be stronger for whether the capability remained
usable. None automatically erases the others.

### Time

Preserve:

- prompt creation, selection, and asking time;
- response and attempt time;
- action, assistance, and artifact time;
- evaluator assignment, qualification, and judgment time;
- system and procedure version represented by the exercise;
- attestation observation period and attestation time;
- outcome validity intervals and invalidation time;
- downstream observation periods;
- source update and ingestion time.

Do not project current role, ownership, system design, evaluator qualification, or
documentation state backward onto historical validation.

### Identity

Validation records may contain participants, evaluators, observers, managers,
peers, SMEs, facilitators, automation, shared accounts, and external providers.
Concrete identifiers are preferred. Name-only identity remains unresolved.

Facilitator, evaluator, observer, attester, transferor, recipient, and task actor
roles must remain distinct. Team-level success must not be assigned to one person
without attributable evidence.

### Privacy, Consent, And Access

Validation may include performance-sensitive employment data, voice or video,
transcripts, behavioral observations, accessibility information, security details,
customer data, credentials, and interpersonal judgments.

```python
class ConsentStatus(str, Enum):
    GRANTED = "granted"
    DECLINED = "declined"
    WITHDRAWN = "withdrawn"
    NOT_REQUIRED_REPORTED = "not_required_reported"
    UNKNOWN = "unknown"


class ValidationConsentRecord(BaseModel):
    consent_record_id: str
    person_id: str | None = None
    session_id: str | None = None
    consent_status: ConsentStatus
    purposes: list[str] = Field(default_factory=list)
    permitted_content_types: list[str] = Field(default_factory=list)
    prohibited_content_types: list[str] = Field(default_factory=list)
    retention_terms: str | None = None
    granted_at: datetime | None = None
    withdrawn_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Source permissions and purpose limitations must be preserved. SuccessionAI must not
broaden access through extracted propositions. Consent to participate does not
automatically imply consent to record, transcribe, retain, use for employment
decisions, or train models.

When content is inaccessible, redacted, withdrawn, or outside permitted purpose,
the system may retain authorized metadata but must abstain from judging the missing
content. Accommodations and permitted tools must not be misclassified as improper
assistance.

### Ingestion Scope

```python
class ValidationIngestionScope(BaseModel):
    ingestion_scope_id: str
    source_system: str
    source_tenant_id: str

    included_program_ids: list[str] = Field(default_factory=list)
    excluded_program_ids: list[str] = Field(default_factory=list)
    included_team_ids: list[str] = Field(default_factory=list)
    included_system_ids: list[str] = Field(default_factory=list)
    history_starts_at: datetime | None = None
    history_ends_at: datetime | None = None

    prompt_content_accessible: bool | None = None
    response_content_accessible: bool | None = None
    recordings_accessible: bool | None = None
    detailed_action_logs_accessible: bool | None = None
    evaluator_notes_accessible: bool | None = None
    downstream_outcomes_accessible: bool | None = None

    permissions_observed: list[str] = Field(default_factory=list)
    unavailable_object_types: list[str] = Field(default_factory=list)
    retention_limitations: list[str] = Field(default_factory=list)
    selection_limitations: list[str] = Field(default_factory=list)

    collection_started_at: datetime
    collection_completed_at: datetime | None = None
    source_claimed_complete: bool
    limitations: list[str] = Field(default_factory=list)
```

Validation coverage must be interpreted within the tested tasks, selected
participants, observable history, and accessible content. People who were not
tested must not be treated as having failed validation.

## Contradictions, Appeals, And Abstention

Common contradictions include:

- a participant's explanation conflicts with source records;
- an attestation conflicts with observed performance;
- two qualified evaluators interpret the same action differently;
- a simulated success conflicts with a later real-world failure;
- a failed exercise conflicts with repeated successful operational outcomes;
- a manager nomination conflicts with SME evidence;
- a document is judged clear but users repeatedly require undocumented help;
- an exercise records independent completion while logs show material intervention;
- an outcome was valid for an earlier system version but not the current one;
- a source marks a session complete while key evidence is inaccessible.

```python
class ValidationContradictionKind(str, Enum):
    SELF_REPORT_VS_RECORD = "self_report_vs_record"
    ATTESTATION_VS_PERFORMANCE = "attestation_vs_performance"
    EVALUATOR_DISAGREEMENT = "evaluator_disagreement"
    OBSERVATION_VS_JUDGMENT = "observation_vs_judgment"
    ASSISTANCE_ATTRIBUTION = "assistance_attribution"
    CRITERION_INTERPRETATION = "criterion_interpretation"
    SIMULATION_VS_REAL_WORLD = "simulation_vs_real_world"
    CURRENT_VS_HISTORICAL = "current_vs_historical"
    ARTIFACT_USABILITY = "artifact_usability"
    IDENTITY = "identity"
    OTHER = "other"
    UNKNOWN = "unknown"


class ValidationContradiction(BaseModel):
    validation_contradiction_id: str
    contradiction_kind: ValidationContradictionKind
    description: str
    resolution_status: ResolutionStatus

    supporting_validation_evidence_ids: list[str] = Field(default_factory=list)
    contradicting_validation_evidence_ids: list[str] = Field(default_factory=list)
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)

    resolution_method: str | None = None
    resolved_at: datetime | None = None
```

Appeals, corrections, and evaluator revisions should be retained as new records or
versioned changes. They must not silently replace the original judgment.

The system should abstain when:

- the validation target is not specific enough;
- task criteria were absent, changed retrospectively, or not observable;
- the participant identity or actor attribution is unresolved;
- assistance cannot be distinguished from independent performance;
- the environment is too unlike the target conditions for the intended claim;
- evaluator qualification is absent or materially contradicted;
- essential content is inaccessible or consent does not permit its use;
- evidence supports incompatible interpretations without a defensible resolution;
- no relevant downstream opportunity occurred;
- the system or procedure changed enough to invalidate current applicability.

## Supported Propositions

Knowledge-validation records may support narrow claims that:

- a participant was asked a specific question about an evidenced target;
- a participant stated a particular explanation, procedure, rationale, dependency,
  uncertainty, or gap;
- a peer, manager, or SME attested to or nominated a person for a stated reason;
- an attestation was based on direct observation, work-product review, managerial
  oversight, reputation, or an unspecified basis;
- an evaluator had a recorded, time-bounded qualification and assignment;
- a participant attempted, completed, partially completed, or did not complete a
  defined task;
- a participant performed specific observed actions under stated conditions;
- completion used specified assistance, documentation, automation, or collaboration;
- a produced artifact contained new information or revised organizational knowledge;
- a reviewer could or could not locate and apply information in a specific artifact
  revision;
- a criterion was supported, partly supported, unsupported, contradicted,
  unobservable, or abstained based on cited evidence;
- evaluators agreed or disagreed about a response, action, artifact, or outcome;
- a validation result applied to a particular system version, environment, task,
  and time interval;
- later operational evidence corroborated or contradicted an earlier transfer
  result;
- an interview question targeted an evidenced gap, elicited new relevant
  information, changed or did not change resolution state, overlapped prior
  questions, and produced verifiable or usable output.

When corroborated and appropriately scoped, these records may contribute to
assessments of current knowledge, practical capability, documentation usability,
transferability, transfer completeness, transfer durability, and successor
readiness.

## Prohibited Claims

Knowledge-validation evidence must not, by itself, be used to claim:

- "The interview answer is true."
- "The participant is an expert" from fluent self-report.
- "The nominee is the only person who knows the system."
- "The manager's attestation proves technical capability."
- "The SME is correct" without relevant evidence.
- "The evaluator is qualified for every criterion" from title or ownership alone.
- "The participant completed independently" when assistance was material or
  unobservable.
- "The participant failed" when the task, criteria, environment, access, or
  accommodations were invalid.
- "The documentation is usable" because a reviewer said it was clear.
- "The documentation is unusable" because one unfamiliar reviewer struggled.
- "The successor is production-ready" from an interview-only or tabletop result.
- "The handoff succeeded durably" from immediate recall or one demonstration.
- "The transfer caused later success" without considering other learning and
  experience.
- "No transfer occurred" because no downstream record was observed.
- "No one else has the capability" because only selected people were tested.
- "Old validation remains current" without applicability evidence.
- "A passed simulation proves safe real-world execution."
- "A failed simulation overrides repeated contrary real-world evidence" without
  resolving the contradiction.
- "A useful question deserves a particular score or reward" before evaluation
  criteria are calibrated.
- "Missing, declined, withdrawn, or inaccessible validation is negative evidence."

## Canonical Failure Cases

The synthetic evaluation set should include at least:

1. A fluent interview answer contains a plausible but incorrect dependency.
2. A hesitant answer identifies the correct safety constraint and uncertainty.
3. A participant memorizes a procedure but cannot apply it to a variant.
4. A participant completes a task through an evaluator's decisive hint.
5. An allowed runbook enables correct completion and is wrongly treated as cheating.
6. A prohibited answer key is available in the simulation environment.
7. A task is marked failed against criteria added after the attempt.
8. A participant explains correct reasoning but lacks required sandbox permission.
9. A participant executes correct steps but cannot explain why they are safe.
10. A participant completes the visible happy path but misses recovery verification.
11. A tabletop success is generalized to production tool proficiency.
12. A production-like simulation omits the permission boundary that causes real
    failures.
13. A manager nominates the most visible responder while a quieter peer performed
    the decisive work.
14. Several peers nominate a person based on reputation rather than direct
    observation.
15. An SME evaluator is qualified historically but unfamiliar with the current
    system version.
16. Two qualified evaluators disagree because two procedures are both valid.
17. An evaluator penalizes an approved accessibility accommodation as assistance.
18. An interviewer asks a broad question unrelated to the motivating evidence gap.
19. A follow-up repeats information already established by an earlier answer.
20. A repeated question is necessary because the earlier answer was contradictory,
    and is wrongly labeled redundant.
21. A question elicits novel detail that cannot be verified or used.
22. A question produces a concrete runbook correction without fully resolving the
    underlying gap.
23. A question changes the resolution state only because an evaluator overstates
    ambiguous self-report.
24. A transcript summary omits the participant's explicit uncertainty.
25. A reviewer says a runbook is clear but cannot complete the task with it.
26. A reviewer completes a task by using undocumented help from the author.
27. A runbook works in the lab but references a stale production command.
28. A successor demonstrates one procedure but is assessed as ready for the whole
    system.
29. A successor performs successfully immediately after coaching but cannot repeat
    the task later.
30. A successor later succeeds after independent training, and the original
    handoff receives all causal credit.
31. No relevant incident occurs after transfer, and absence of escalation is
    treated as success.
32. A later failure is caused by a new system design, not failed transfer.
33. A failed exercise conflicts with repeated successful production work.
34. A shared account makes the evaluator appear to have performed the task.
35. A facilitator's actions are attributed to the participant.
36. A team exercise result is assigned to every team member individually.
37. A participant declines recording but valid non-recorded observations exist.
38. Consent is withdrawn and transcript-derived judgments remain exposed.
39. Restricted evaluator notes contain the only rationale for a result.
40. A cancelled or invalidated session is counted as participant failure.
41. Only suspected weak successors are tested, creating selection bias in outcome
    comparisons.
42. Historical records include successful transfers but omit failed transfers
    removed by retention policy.
43. Current ownership and evaluator roles are projected backward onto an old
    handoff.
44. One failed criterion erases several independently demonstrated criteria.
45. A safety violation is hidden by an overall completed status.

## Accepted Decisions

1. Preserve source records, narrow evidence propositions, and downstream
   assessments as separate layers.
2. Keep self-report, third-party attestation, observed performance, evaluator
   judgment, and downstream assessment as distinct evidence modes.
3. Treat interview answers as attributed self-report until independently
   corroborated.
4. Treat attestations and nominations as attributed third-party claims, preserving
   their basis, relationship, observation period, and cited evidence.
5. Model evaluator qualification as claim-specific, evidence-backed, and
   time-bounded rather than inferred solely from title, role, or ownership.
6. Preserve evaluator assignment, conflicts, relationship to the participant, and
   access to prior assessments.
7. Require tasks to preserve explicit scope, initial conditions, resources, and
   criterion-level expectations.
8. Preserve criteria that were disclosed, hidden, changed, or created after an
   attempt.
9. Represent completion, partial completion, non-completion, non-attempt,
   invalidation, and unobservability separately.
10. Preserve observed actions separately from criterion results and evaluator
    judgments.
11. Record assistance type, provider, timing, expectedness, and observed effect
    without assuming all assistance invalidates capability.
12. Preserve environment realism and known differences from target conditions
    without reducing realism to a numeric score.
13. Link produced artifacts to the validation event and, when retained as
    organizational knowledge, to Knowledge Artifacts.
14. Distinguish a judgment that documentation is usable from observed successful
    use of a specific artifact revision.
15. Scope outcomes to the tested task, criteria, system or procedure version,
    environment, assistance, and validity interval.
16. Preserve partial, unsafe, assisted, failed, invalidated, contested, and
    abstained outcomes.
17. Use later operational and work evidence to assess historical transfer outcomes
    without assuming the transfer caused those outcomes.
18. Treat absence of downstream opportunity or records as an observability
    limitation, not successful or failed transfer.
19. Preserve contradictions among self-report, attestation, observation, judgment,
    simulation, and real-world outcomes.
20. Retain appeals, corrections, and revised judgments without erasing original
    records.
21. Preserve consent purpose, recording permission, retention terms, withdrawal,
    source authorization, and accessibility accommodations.
22. Abstain when target specificity, criteria, actor attribution, assistance,
    realism, evaluator qualification, access, consent, or current applicability is
    insufficient.
23. Preserve the evidence needed to evaluate interview-question utility: evidenced
    gap targeting, new relevant information, resolution-state change, redundancy,
    and verifiable or usable output.
24. Do not define numeric thresholds, pass cutoffs, freshness windows, source
    weights, evaluator weights, reward weights, or a combined readiness score in
    the initial model.
25. Keep backend connectors, database models, APIs, agents, scoring systems, and UI
    out of scope.

## Knowledge Validation Summary

The initial Knowledge Validation model covers:

1. Programs and bounded validation sessions
2. Evidence-backed validation targets and pre-existing gap state
3. Interview questions, prompts, follow-ups, and future utility evidence
4. Explicit task definitions and criterion-level results
5. Environment realism and applicability limits
6. Participant self-report and observed performance attempts
7. Peer, manager, and SME attestations and nominations
8. Evaluator qualification, assignment, conflicts, and judgments
9. Observed actions, assistance, independence, and partial success
10. Produced artifacts and documentation usability observations
11. Time-bounded validation outcomes and abstention
12. Historical transfer outcomes and downstream assessment
13. Contradictions, appeals, provenance, identity, privacy, consent, and access

The governing boundary remains:

> Knowledge Validation establishes what was asked, stated, attested, attempted,
> observed, produced, judged, and later assessed under specific conditions. Broader
> conclusions about real, current, transferable, durable, and successor-usable
> knowledge require claim-specific corroboration, valid evaluation conditions, and
> explicit treatment of assistance, contradictions, time, privacy, and
> observability.
