# Production Operations Schema

> Status: Initial model complete.

## Purpose

Production-operations data records how systems were changed, observed, and handled
in operational environments. It is especially useful to SuccessionAI because it may
contain practical evidence about:

- who participated in an incident or operational change;
- what symptoms, hypotheses, diagnoses, and decisions were recorded;
- which mitigations, remediations, deployments, or rollbacks were performed;
- what the source reported about impact, recovery, and root cause;
- which people repeatedly performed particular operational actions;
- where operational knowledge appears concentrated or insufficiently documented.

Operational records can provide strong evidence of practical exposure and, when
actions and reasoning are substantive and corroborated, operational capability.
They do not automatically establish expertise, formal ownership, or complete
understanding.

The governing distinctions are:

```text
Participation is not diagnosis.
Diagnosis is not resolution.
Resolution is not root-cause proof.
Release is not deployment.
Deployment is not successful operation.
Operational action is not expertise.
```

This schema preserves three layers:

```text
1. Source record:
   The incident system, alerting platform, deployment system, or change system
   recorded an event, actor, state, statement, or relationship.

2. Evidence record:
   The source supports a narrow attributed proposition, such as "this account
   acknowledged the alert" or "this responder stated that connection exhaustion
   caused the observed errors."

3. Assessment record:
   Corroborated evidence may contribute to a broader conclusion about operational
   exposure, diagnostic judgment, practical capability, knowledge concentration,
   or knowledge-loss risk.
```

An assessment must remain separate from the operational source and evidence records
that support or contradict it.

## Scope And Boundaries

This source family covers:

1. Incident and operational-event records
2. Incident timeline events
3. Event-specific participants and responder roles
4. Operational actions and outcomes
5. Alerts and acknowledgements
6. Event-specific on-call context
7. Environment deployments
8. Rollbacks
9. Remediation and follow-up links
10. Change-management requests and approvals
11. Postmortems and root-cause statements
12. Cross-source relationships

Related concepts remain in their owning source families:

- long-lived on-call rotations, schedules, employment, teams, and roles belong to
  Identity and Organization;
- repository releases, tags, commits, pull requests, and reviews belong to Software
  Development;
- incident follow-up tickets and their workflow belong to Work Management;
- runbooks, postmortem documents, and troubleshooting guides as documents belong to
  Knowledge Artifacts;
- service ownership and dependency graphs belong to Ownership and Architecture;
- service criticality, SLOs, customer consequences, and regulatory importance
  belong to Business Impact;
- exercises that test whether another person can operate the system belong to
  Knowledge Validation.

Production Operations may preserve explicit links to those objects without copying
their source facts into operational records.

## Retrieval

Production-operations evidence may be retrieved from:

- incident-management APIs, webhooks, exports, and audit logs;
- paging and alerting APIs, webhooks, and escalation logs;
- observability platforms when they expose incident or alert records;
- deployment platforms, CI/CD systems, infrastructure controllers, and audit logs;
- change-management and IT service-management APIs;
- status-page and operational-communication integrations;
- linked work-management and knowledge-artifact records;
- organization exports;
- synthetic JSON for the demo.

Examples include PagerDuty, Opsgenie, incident.io, Rootly, FireHydrant, Jira Service
Management, ServiceNow, GitHub Deployments, GitLab environments, Argo CD, Spinnaker,
Kubernetes audit events, and cloud-provider deployment histories. The schema does
not require all sources to expose the same event detail.

Initial synchronization should retrieve visible incidents, timeline entries,
participants, alerts, acknowledgements, deployments, change records, postmortems,
and relationships for the configured history. Incremental webhooks should be
reconciled periodically because webhook delivery, edits, merges, and late-added
timeline entries may be incomplete.

Connector scope must record:

- included and excluded projects, services, environments, accounts, and time spans;
- whether timeline history, message bodies, audit logs, and deleted records were
  accessible;
- whether actor identity, responder role, or automation identity was redacted;
- whether the source claims the retrieved history is complete;
- known retention limits and export truncation;
- fields visible only as metadata because their content was restricted.

## Shared Modeling Conventions

The pseudocode below is a product and data contract, not backend implementation.
Stable internal IDs are separate from source-system IDs. Source-specific vocabulary
is retained where normalization would erase meaningful organizational semantics.

```python
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ActorKind(str, Enum):
    PERSON_ACCOUNT = "person_account"
    TEAM = "team"
    AUTOMATION = "automation"
    SHARED_ACCOUNT = "shared_account"
    EXTERNAL_PARTY = "external_party"
    UNRESOLVED = "unresolved"
    UNKNOWN = "unknown"


class OperationalEnvironmentKind(str, Enum):
    PRODUCTION = "production"
    STAGING = "staging"
    DEVELOPMENT = "development"
    TEST = "test"
    DISASTER_RECOVERY = "disaster_recovery"
    CUSTOMER_SPECIFIC = "customer_specific"
    OTHER = "other"
    UNKNOWN = "unknown"


class EvidencePolarity(str, Enum):
    SUPPORTS = "supports"
    CONTRADICTS = "contradicts"
    CONTEXT_ONLY = "context_only"
    UNRESOLVED = "unresolved"


class PropositionResolutionStatus(str, Enum):
    ATTRIBUTED = "attributed"
    CORROBORATED = "corroborated"
    CONTRADICTED = "contradicted"
    CONTESTED = "contested"
    SUPERSEDED = "superseded"
    UNRESOLVED = "unresolved"


class RelationshipResolutionStatus(str, Enum):
    CONFIRMED = "confirmed"
    PROBABLE = "probable"
    AMBIGUOUS = "ambiguous"
    CONTESTED = "contested"
    REJECTED = "rejected"
    UNRESOLVED = "unresolved"


class RelationshipOrigin(str, Enum):
    STRUCTURED_SOURCE_LINK = "structured_source_link"
    SOURCE_INTEGRATION = "source_integration"
    TEXT_REFERENCE = "text_reference"
    TEMPORAL_ASSOCIATION = "temporal_association"
    DERIVED_MATCH = "derived_match"
    HUMAN_CONFIRMED = "human_confirmed"
    UNKNOWN = "unknown"
```

### Operational Evidence Record

Operational events should support narrow propositions rather than directly storing
expertise conclusions.

```python
class OperationalPropositionKind(str, Enum):
    PARTICIPATED_IN_EVENT = "participated_in_event"
    HELD_EVENT_ROLE = "held_event_role"
    ACKNOWLEDGED_ALERT = "acknowledged_alert"
    PERFORMED_OPERATIONAL_ACTION = "performed_operational_action"
    STATED_HYPOTHESIS = "stated_hypothesis"
    STATED_DIAGNOSIS = "stated_diagnosis"
    RECORDED_DECISION = "recorded_decision"
    EXECUTED_MITIGATION = "executed_mitigation"
    EXECUTED_ROLLBACK = "executed_rollback"
    VERIFIED_RECOVERY = "verified_recovery"
    DEPLOYED_REVISION = "deployed_revision"
    APPROVED_CHANGE = "approved_change"
    AUTHORED_ROOT_CAUSE_STATEMENT = "authored_root_cause_statement"
    REVIEWED_POSTMORTEM = "reviewed_postmortem"
    IDENTIFIED_FOLLOW_UP = "identified_follow_up"
    OTHER = "other"
    UNKNOWN = "unknown"


class OperationalEvidenceRecord(BaseModel):
    operational_evidence_id: str
    proposition_kind: OperationalPropositionKind
    proposition_text: str
    polarity: EvidencePolarity
    resolution_status: PropositionResolutionStatus

    subject_source_account_id: str | None = None
    subject_team_id: str | None = None
    subject_system_id: str | None = None
    subject_component_id: str | None = None
    incident_id: str | None = None
    deployment_id: str | None = None
    change_record_id: str | None = None

    occurred_at: datetime | None = None
    valid_from: datetime | None = None
    valid_until: datetime | None = None

    extraction_method: str
    extractor_version: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

`proposition_text` remains attributed to its source. For example, a postmortem may
support "the postmortem stated that a stale cache caused the outage." It does not
become "a stale cache caused the outage" until corroboration and resolution justify
that stronger wording.

### Assessment Boundary

Operational assessments are downstream and evidence-backed:

```python
class OperationalAssessmentKind(str, Enum):
    OPERATIONAL_EXPOSURE = "operational_exposure"
    DIAGNOSTIC_JUDGMENT = "diagnostic_judgment"
    MITIGATION_CAPABILITY = "mitigation_capability"
    DEPLOYMENT_EXPERIENCE = "deployment_experience"
    CHANGE_EVALUATION_EXPERIENCE = "change_evaluation_experience"
    OBSERVED_STEWARDSHIP = "observed_stewardship"
    KNOWLEDGE_CONCENTRATION = "knowledge_concentration"
    TRANSFERABILITY_CONCERN = "transferability_concern"
    UNKNOWN = "unknown"


class OperationalAssessment(BaseModel):
    operational_assessment_id: str
    assessment_kind: OperationalAssessmentKind
    subject_person_id: str | None = None
    subject_team_id: str | None = None
    subject_system_id: str | None = None
    assessment_statement: str

    assessment_method: str
    assessment_version: str | None = None
    assessed_at: datetime

    supporting_operational_evidence_ids: list[str] = Field(default_factory=list)
    contradicting_operational_evidence_ids: list[str] = Field(default_factory=list)
    observability_limitations: list[str] = Field(default_factory=list)
```

No confidence threshold, source weight, recency cutoff, or operational-expertise
score is defined in this initial model.

## Incident

### Purpose And Scope

An incident is the source-system container for an unplanned or exceptional
operational event. It provides the event's reported identity, scope, lifecycle,
impact language, affected resources, and links to its timeline and participants.

Incident severity, priority, and impact are organization-configurable source facts.
They are not automatically equivalent to Business Impact classifications.

### Layer 1: Faithful Source Record

```python
class SourceIncidentRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_incident_id: str

    title: str
    summary_reported: str | None = None
    status_reported: str | None = None
    severity_reported: str | None = None
    priority_reported: str | None = None
    incident_type_reported: str | None = None

    creator_external_actor_id: str | None = None
    commander_external_actor_id: str | None = None
    owner_external_actor_id: str | None = None
    owner_external_team_id: str | None = None

    affected_external_service_ids: list[str] = Field(default_factory=list)
    affected_external_component_ids: list[str] = Field(default_factory=list)
    environment_reported: str | None = None
    customer_impact_reported: str | None = None

    source_declared_at: datetime | None = None
    source_started_at: datetime | None = None
    source_detected_at: datetime | None = None
    source_acknowledged_at: datetime | None = None
    source_mitigated_at: datetime | None = None
    source_resolved_at: datetime | None = None
    source_closed_at: datetime | None = None
    source_updated_at: datetime | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

The source's immutable incident ID is the external identity. Titles, status,
severity, owners, commanders, and summaries may change.

### Layer 2: Normalized Incident

```python
class IncidentLifecycle(str, Enum):
    DECLARED = "declared"
    INVESTIGATING = "investigating"
    IDENTIFIED = "identified"
    MITIGATING = "mitigating"
    MONITORING = "monitoring"
    RESOLVED = "resolved"
    CLOSED = "closed"
    CANCELLED = "cancelled"
    MERGED = "merged"
    UNKNOWN = "unknown"


class IncidentOriginKind(str, Enum):
    ALERT = "alert"
    CUSTOMER_REPORT = "customer_report"
    EMPLOYEE_REPORT = "employee_report"
    DEPLOYMENT = "deployment"
    CHANGE = "change"
    SECURITY_EVENT = "security_event"
    EXERCISE = "exercise"
    UNKNOWN = "unknown"


class Incident(BaseModel):
    incident_id: str
    source_system: str
    source_tenant_id: str
    external_incident_id: str

    title: str
    lifecycle: IncidentLifecycle
    origin_kind: IncidentOriginKind
    severity_reported: str | None = None
    priority_reported: str | None = None
    environment_kind: OperationalEnvironmentKind

    creator_source_account_id: str | None = None
    current_commander_source_account_id: str | None = None
    current_owner_source_account_id: str | None = None
    current_owner_team_id: str | None = None

    declared_at: datetime | None = None
    started_at: datetime | None = None
    detected_at: datetime | None = None
    mitigated_at: datetime | None = None
    resolved_at: datetime | None = None
    closed_at: datetime | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Source-reported severity, priority, type, and status remain available even when a
broad lifecycle is normalized. The normalized incident does not assert objective
impact, cause, successful resolution, or expertise.

### Supported Propositions

Incident records may support:

- an incident was recorded within the observed source scope;
- the source reported a title, lifecycle, severity, priority, environment, or
  affected resource;
- an account or team was recorded as creator, commander, or owner;
- the source recorded particular declaration, detection, mitigation, resolution,
  or closure times;
- the source stated a summary or customer-impact description;
- the incident was linked to alerts, deployments, changes, work items, documents,
  or systems.

### Cannot Establish

An incident record alone cannot establish:

- who detected, diagnosed, mitigated, or resolved the problem;
- that the recorded commander performed technical work;
- that the owner understood the affected system;
- that the reported severity equals objective business criticality;
- that resolution means the underlying cause was removed;
- that the incident's stated start or impact window is exact;
- expertise, ownership, or knowledge concentration;
- that unlisted participants did not contribute;
- that one incident ID represents one underlying failure.

### Time And Change Semantics

- Preserve source-declared, started, detected, acknowledged, mitigated, resolved,
  closed, updated, and observed times separately.
- Do not derive precise incident duration when start or recovery times are disputed.
- Preserve status, severity, commander, owner, and affected-resource history when
  available.
- A reopened incident remains historically resolved and later reopened.
- A merged or duplicate incident remains retrievable and linked to its survivor.
- Interpret person, team, and on-call context at the time of each event.
- Late timeline edits must retain both event time and source creation or update time.

### Canonical Failure Cases

1. The incident commander coordinates but performs no diagnosis.
2. The incident owner is assigned after resolution for administrative closure.
3. A low-severity incident exposes a critical latent failure mode.
4. A high-severity incident is declared conservatively and has little impact.
5. The recorded start time is reconstructed hours later.
6. The incident is marked resolved after a temporary mitigation.
7. Two incident records describe the same outage.
8. One incident record combines several unrelated failures.
9. A private incident hides participants and technical details.
10. A training exercise is mistaken for a production incident.
11. An automated system creates and resolves the incident.
12. The final summary omits an early contributor.

### Accepted Incident Decisions

1. Use immutable source incident IDs and retain merged or duplicate records.
2. Preserve source-specific lifecycle, severity, priority, and type vocabulary.
3. Normalize only broad lifecycle, origin, and environment categories.
4. Treat commander, owner, creator, and technical contributor as distinct roles.
5. Preserve disputed and reconstructed event times.
6. Treat source-reported impact as an attributed statement, not Business Impact.
7. Do not infer diagnosis, resolution, ownership, or expertise from incident
   assignment.
8. Record inaccessible incident detail as an observability limitation.

## Incident Timeline Event

### Purpose And Scope

Timeline events provide the ordered operational record within an incident. They may
contain status changes, observations, hypotheses, decisions, actions, communications,
deployment links, and recovery statements.

Timeline order is evidentiary context. It does not prove causality.

### Layer 1: Faithful Source Record

```python
class SourceIncidentTimelineRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_incident_id: str
    external_timeline_event_id: str

    event_type_reported: str | None = None
    body_reported: str | None = None
    status_reported: str | None = None

    actor_external_id: str | None = None
    actor_type_reported: str | None = None
    integration_external_id: str | None = None

    linked_external_object_type: str | None = None
    linked_external_object_id: str | None = None

    source_occurred_at: datetime | None = None
    source_created_at: datetime | None = None
    source_updated_at: datetime | None = None
    source_deleted_at: datetime | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

### Layer 2: Normalized Timeline Event

```python
class IncidentTimelineEventKind(str, Enum):
    OBSERVATION = "observation"
    STATUS_CHANGE = "status_change"
    PARTICIPANT_CHANGE = "participant_change"
    HYPOTHESIS = "hypothesis"
    DIAGNOSIS = "diagnosis"
    DECISION = "decision"
    ACTION = "action"
    DEPLOYMENT = "deployment"
    ROLLBACK = "rollback"
    COMMUNICATION = "communication"
    IMPACT_UPDATE = "impact_update"
    RECOVERY_UPDATE = "recovery_update"
    LINK_ADDED = "link_added"
    AUTOMATION_EVENT = "automation_event"
    OTHER = "other"
    UNKNOWN = "unknown"


class IncidentTimelineEvent(BaseModel):
    incident_timeline_event_id: str
    incident_id: str
    external_timeline_event_id: str

    event_kind: IncidentTimelineEventKind
    body: str | None = None
    actor_kind: ActorKind
    actor_source_account_id: str | None = None
    actor_team_id: str | None = None
    automation_id: str | None = None

    occurred_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    deleted_at: datetime | None = None

    classification_method: str | None = None
    classifier_version: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Classification should be conservative. A message such as "database?" is a possible
hypothesis, not a diagnosis. A copied integration message is not human authorship.

### Attributed Timeline Proposition

```python
class TimelinePropositionKind(str, Enum):
    SYMPTOM = "symptom"
    IMPACT = "impact"
    HYPOTHESIS = "hypothesis"
    DIAGNOSIS = "diagnosis"
    DECISION_RATIONALE = "decision_rationale"
    MITIGATION_CLAIM = "mitigation_claim"
    RECOVERY_CLAIM = "recovery_claim"
    ROOT_CAUSE_CLAIM = "root_cause_claim"
    FOLLOW_UP_NEED = "follow_up_need"
    OTHER = "other"
    UNKNOWN = "unknown"


class IncidentTimelineProposition(BaseModel):
    timeline_proposition_id: str
    incident_timeline_event_id: str
    proposition_kind: TimelinePropositionKind
    proposition_text: str
    source_locator: str | None = None

    attributed_source_account_id: str | None = None
    attributed_team_id: str | None = None
    resolution_status: PropositionResolutionStatus

    extraction_method: str
    extractor_version: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Propositions

Timeline records may support:

- an account, team, or automation posted or triggered an event;
- a statement, hypothesis, diagnosis, decision, or recovery claim was recorded;
- a status or participant change occurred in the source;
- a deployment, rollback, alert, dashboard, runbook, or work item was linked;
- a particular sequence of recorded events occurred.

They may support reasoning evidence when the source clearly attributes substantive
diagnostic or decision language to an actor. The proposition remains attributed and
may later be corroborated, contradicted, or superseded.

### Cannot Establish

Timeline records alone cannot establish:

- that the sequence proves causal influence;
- that the first person to mention a system diagnosed the problem;
- that a diagnosis was correct;
- that an action produced recovery;
- that a copied command was devised or understood by the poster;
- that silence means non-participation;
- that message volume or early arrival means expertise;
- that the visible timeline is complete.

### Canonical Failure Cases

1. An integration posts an action under a human-looking name.
2. A responder copies a diagnosis supplied in a private channel.
3. A hypothesis is later disproved but retained in the timeline.
4. A correct diagnosis is posted after another person reached it verbally.
5. A timeline entry is backfilled after the incident.
6. A deleted entry contained a consequential disagreement.
7. A status update paraphrases another person's work.
8. The last action before recovery is incorrectly treated as causal.
9. A responder posts frequent coordination messages but no technical reasoning.
10. Restricted chat contains the actual diagnosis while the incident timeline does
    not.

### Accepted Timeline Decisions

1. Preserve event time, source creation time, update time, and observation time.
2. Distinguish human, team, shared-account, external, automation, and unresolved
   actors.
3. Keep timeline classification broad and inspectable.
4. Extract narrow attributed propositions with source locators.
5. Preserve disproved, contested, deleted, and superseded statements.
6. Do not infer causality from temporal order.
7. Do not use message count, response speed, or timeline position as expertise
   measures.

## Event Participant And Responder Role

### Purpose And Scope

Participant records describe event-specific involvement. They may show who joined,
was paged, coordinated, observed, communicated, diagnosed, executed actions, or
verified recovery when the source explicitly records those roles.

These records do not replace long-lived organization or on-call assignments.

### Layer 1 And Layer 2

```python
class SourceIncidentParticipantRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_incident_id: str

    external_actor_id: str | None = None
    external_team_id: str | None = None
    role_reported: str | None = None
    participation_status_reported: str | None = None

    source_joined_at: datetime | None = None
    source_left_at: datetime | None = None
    source_updated_at: datetime | None = None

    observed_at: datetime
    raw_payload_ref: str


class IncidentParticipantRole(str, Enum):
    COMMANDER = "commander"
    DEPUTY = "deputy"
    SCRIBE = "scribe"
    LIAISON = "liaison"
    COMMUNICATOR = "communicator"
    SUBJECT_MATTER_CONTACT = "subject_matter_contact"
    TECHNICAL_RESPONDER = "technical_responder"
    OBSERVER = "observer"
    EXECUTIVE = "executive"
    EXTERNAL_PARTY = "external_party"
    UNSPECIFIED_PARTICIPANT = "unspecified_participant"
    UNKNOWN = "unknown"


class IncidentParticipation(BaseModel):
    incident_participation_id: str
    incident_id: str
    actor_kind: ActorKind

    source_account_id: str | None = None
    team_id: str | None = None
    role: IncidentParticipantRole
    role_reported: str | None = None

    joined_at: datetime | None = None
    left_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

### Role Interpretation

- **Participant:** was recorded as present or involved.
- **Commander:** coordinated the response.
- **Scribe:** maintained the record.
- **Communicator or liaison:** managed stakeholder information.
- **Technical responder:** was expected or recorded to perform technical response.
- **Subject-matter contact:** was consulted as a possible source of knowledge.
- **Diagnostician:** made a separately evidenced diagnostic contribution.
- **Action executor:** performed a separately evidenced operational action.
- **Recovery verifier:** performed a separately evidenced verification.

The last three are not inferred from participant role alone. They require timeline,
action, deployment, audit, or verification records.

### Event-Specific On-Call Context

On-call evidence is included only when tied to a particular operational event:

```python
class EventOnCallContext(BaseModel):
    event_on_call_context_id: str
    incident_id: str | None = None
    alert_id: str | None = None

    source_account_id: str | None = None
    team_id: str | None = None
    external_schedule_id: str | None = None
    escalation_level_reported: str | None = None

    was_scheduled_on_call_reported: bool | None = None
    was_paged_reported: bool | None = None
    was_override_reported: bool | None = None

    valid_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

This record may explain why someone was notified or expected to respond. The
rotation, schedule membership, override history, and long-lived assignment remain
Identity and Organization records.

### Supported Propositions

Participation records may support:

- an actor was recorded as participating during a period;
- the source assigned an event-specific role;
- an actor was scheduled, paged, or substituted for this event;
- an account repeatedly participated in operational events concerning a system.

Repeated participation may support operational exposure. Stronger conclusions
require evidence of substantive actions, reasoning, outcomes, or validation.

### Cannot Establish

Participation and event-specific on-call context cannot establish:

- diagnosis, resolution, or action execution;
- expertise or system understanding;
- that the paged person responded;
- that an observer contributed;
- that the listed subject-matter contact was actually knowledgeable;
- why an actor joined or left;
- that unlisted people did not contribute;
- long-lived ownership or on-call responsibility.

### Canonical Failure Cases

1. Every channel member is imported as a participant.
2. A paged responder never acknowledges or joins.
3. An observer is credited with diagnosis.
4. The scribe's detailed timeline is mistaken for technical execution.
5. A commander is treated as the resolver.
6. An override responder covers one shift and is inferred to own the service.
7. A team is listed without identifying the acting person.
8. A shared account hides several responders.

### Accepted Participation Decisions

1. Model event-specific participation separately from long-lived assignments.
2. Preserve source-reported roles and normalize only broad event roles.
3. Require separate evidence for diagnosis, execution, and verification.
4. Treat paging and on-call status as response context, not expertise.
5. Preserve unresolved, team, automation, shared, and external actors.
6. Do not infer absence of participation from incomplete rosters.

## Operational Action

### Purpose And Scope

Operational actions are concrete interventions or checks performed during incidents,
maintenance, deployments, or remediation. This object receives rich treatment
because action-level evidence is more informative than generic participation.

Examples include:

- querying logs or metrics;
- checking configuration or recent changes;
- draining traffic or failing over;
- restarting, scaling, or isolating a component;
- changing a feature flag or runtime configuration;
- deploying a revision or rolling it back;
- restoring data;
- validating recovery.

Actions may be human-directed, human-executed, automated, or merely stated. The
model must preserve that distinction.

### Layer 1: Faithful Source Record

```python
class SourceOperationalActionRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_action_id: str

    external_incident_id: str | None = None
    external_change_id: str | None = None
    external_deployment_id: str | None = None

    action_type_reported: str | None = None
    description_reported: str | None = None
    status_reported: str | None = None
    outcome_reported: str | None = None

    initiator_external_actor_id: str | None = None
    executor_external_actor_id: str | None = None
    automation_external_id: str | None = None

    target_external_service_id: str | None = None
    target_external_component_id: str | None = None
    target_environment_reported: str | None = None

    source_started_at: datetime | None = None
    source_completed_at: datetime | None = None
    source_updated_at: datetime | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

### Layer 2: Normalized Operational Action

```python
class OperationalActionKind(str, Enum):
    OBSERVE = "observe"
    QUERY = "query"
    TEST = "test"
    CONFIGURE = "configure"
    FEATURE_FLAG_CHANGE = "feature_flag_change"
    RESTART = "restart"
    SCALE = "scale"
    FAILOVER = "failover"
    TRAFFIC_CHANGE = "traffic_change"
    ISOLATE = "isolate"
    DEPLOY = "deploy"
    ROLLBACK = "rollback"
    RESTORE = "restore"
    DATA_CORRECTION = "data_correction"
    SECURITY_CONTAINMENT = "security_containment"
    VERIFY = "verify"
    COMMUNICATE = "communicate"
    OTHER = "other"
    UNKNOWN = "unknown"


class ActionExecutionStatus(str, Enum):
    PROPOSED = "proposed"
    STARTED = "started"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REVERTED = "reverted"
    UNKNOWN = "unknown"


class ActionOutcomeKind(str, Enum):
    IMPROVEMENT_REPORTED = "improvement_reported"
    RECOVERY_REPORTED = "recovery_reported"
    NO_EFFECT_REPORTED = "no_effect_reported"
    DEGRADATION_REPORTED = "degradation_reported"
    FAILURE_REPORTED = "failure_reported"
    NOT_EVALUATED = "not_evaluated"
    UNKNOWN = "unknown"


class OperationalAction(BaseModel):
    operational_action_id: str
    incident_id: str | None = None
    change_record_id: str | None = None
    deployment_id: str | None = None

    action_kind: OperationalActionKind
    description: str | None = None
    execution_status: ActionExecutionStatus
    outcome_kind: ActionOutcomeKind

    initiator_source_account_id: str | None = None
    executor_source_account_id: str | None = None
    automation_id: str | None = None
    actor_kind: ActorKind

    system_id: str | None = None
    component_id: str | None = None
    environment_kind: OperationalEnvironmentKind

    started_at: datetime | None = None
    completed_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

An action described in chat is not equivalent to an audited execution. Source
records should distinguish proposed, reported, and system-observed actions.

### Action Attribution And Outcome

Initiation, execution, automation, and verification are separate:

```python
class OperationalActionVerification(BaseModel):
    action_verification_id: str
    operational_action_id: str

    verifier_source_account_id: str | None = None
    verifier_team_id: str | None = None
    verification_method_reported: str | None = None
    result_reported: str | None = None

    verified_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

A responder may propose an action another person executes. Automation may execute a
human-approved action. Recovery after an action is not enough to prove the action
caused recovery.

### Supported Propositions

Operational-action records may support:

- an actor proposed, initiated, executed, or verified a particular action;
- automation performed a particular action;
- an action targeted a system, component, or environment;
- the source reported that the action completed, failed, was reverted, or had a
  stated outcome;
- an actor repeatedly performed a particular class of operational intervention;
- an actor applied a specific procedure in a real operational context.

Corroborated, substantive actions may support practical operational capability.
Repeated actions across varied conditions may contribute to an assessment, but
action count alone is not an expertise measure.

### Cannot Establish

An action alone cannot establish:

- that the actor selected the action independently;
- that the actor understood its mechanism or risks;
- that the action was appropriate;
- that the action caused recovery;
- diagnosis or root cause;
- broad expertise beyond the performed task;
- formal ownership;
- successful knowledge transfer;
- whether a copied runbook step would work in a different condition.

### Canonical Failure Cases

1. A responder runs a command supplied by another person.
2. Automation executes a rollback attributed to the approving human.
3. A restart appears to recover service but masks the cause.
4. An action completes successfully and worsens impact.
5. A proposed action is mistaken for an executed action.
6. A chat message reports execution that audit logs contradict.
7. Several people jointly perform one action through screen sharing.
8. A feature-flag change disables functionality without resolving the defect.
9. The actor verifies a dashboard but not customer recovery.
10. A routine action is repeated many times and overstated as expertise.

### Accepted Operational-Action Decisions

1. Distinguish proposed, initiated, executed, automated, and verified actions.
2. Prefer audit or system execution records over uncorroborated narrative claims
   while preserving both.
3. Preserve target system, component, environment, time, status, and stated outcome.
4. Model causal attribution as unresolved unless evidence justifies it.
5. Treat operational action as evidence of performed work, not automatic expertise.
6. Keep communication-only actions separate from technical interventions.
7. Preserve failed, ineffective, harmful, cancelled, and reverted actions.

## Alert And Acknowledgement

### Purpose And Scope

Alerts record machine- or human-generated notifications about observed conditions.
Acknowledgements record receipt or workflow handling. They provide detection and
response-routing context, but usually weak expertise evidence.

### Layer 1 And Layer 2

```python
class SourceAlertRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_alert_id: str

    title: str | None = None
    description_reported: str | None = None
    condition_reported: str | None = None
    status_reported: str | None = None
    urgency_reported: str | None = None
    deduplication_key_reported: str | None = None

    external_incident_id: str | None = None
    external_service_id: str | None = None
    source_external_id: str | None = None

    source_triggered_at: datetime | None = None
    source_resolved_at: datetime | None = None
    source_updated_at: datetime | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str


class AlertLifecycle(str, Enum):
    TRIGGERED = "triggered"
    ACKNOWLEDGED = "acknowledged"
    SUPPRESSED = "suppressed"
    RESOLVED = "resolved"
    CLOSED = "closed"
    UNKNOWN = "unknown"


class Alert(BaseModel):
    alert_id: str
    external_alert_id: str
    title: str | None = None
    lifecycle: AlertLifecycle

    incident_id: str | None = None
    system_id: str | None = None
    component_id: str | None = None

    triggered_at: datetime | None = None
    resolved_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)


class SourceAlertAcknowledgementRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_alert_id: str

    acknowledger_external_actor_id: str | None = None
    acknowledgement_type_reported: str | None = None
    source_acknowledged_at: datetime | None = None

    observed_at: datetime
    raw_payload_ref: str


class AlertAcknowledgement(BaseModel):
    alert_acknowledgement_id: str
    alert_id: str

    actor_kind: ActorKind
    acknowledger_source_account_id: str | None = None
    acknowledger_team_id: str | None = None
    automation_id: str | None = None

    acknowledged_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Propositions

Alerts and acknowledgements may support:

- an alert condition was recorded;
- an alert was associated with a system, component, incident, or escalation;
- an account, team, or automation acknowledged the alert;
- event-specific routing or on-call context applied;
- an actor was exposed to repeated alerts about a system.

### Cannot Establish

They cannot establish:

- that the alert represented a real problem;
- that acknowledgement involved investigation;
- diagnosis, action, mitigation, or resolution;
- that the acknowledger was the responder;
- expertise, ownership, attentiveness, or response quality;
- that an automatically resolved alert reflects human success;
- that alert volume reflects system importance.

Response-time metrics are excluded from expertise inference. They may be shaped by
policy, notification delivery, time zone, automation, workload, and source behavior.

### Canonical Failure Cases

1. A mobile tap acknowledges an alert without investigation.
2. Automation acknowledges every alert.
3. One alert fan-outs to several systems and responders.
4. Many duplicate alerts describe one event.
5. A noisy alert creates high exposure without useful learning.
6. A silent failure produces no alert.
7. An alert resolves automatically before anyone responds.
8. The listed acknowledger hands the event to another person.

### Accepted Alert Decisions

1. Keep alerts and acknowledgements lightweight.
2. Preserve deduplication and incident links without assuming one-to-one identity.
3. Distinguish human, team, shared-account, and automated acknowledgements.
4. Treat acknowledgement as receipt or workflow handling only.
5. Do not use alert count or acknowledgement speed as expertise measures.
6. Treat missing alerts as an observability limitation, not evidence of no events.

## Deployment

### Purpose And Scope

A deployment records that a specific artifact, revision, image, configuration, or
release candidate was applied or promoted to a named environment or target.

A Software Development release is a published version boundary. A Production
Operations deployment is an environment change. Either may exist without the other.

```text
Release:
A repository or package workflow published version 2.4.1.

Deployment:
The deployment system applied image digest X to production cluster Y.
```

Deployment execution does not establish successful operation, implementation
authorship, or understanding of included changes.

### Layer 1: Faithful Source Record

```python
class SourceDeploymentRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_deployment_id: str

    deployment_type_reported: str | None = None
    status_reported: str | None = None
    environment_reported: str | None = None
    target_reported: str | None = None

    initiator_external_actor_id: str | None = None
    approver_external_actor_ids: list[str] = Field(default_factory=list)
    executor_external_actor_id: str | None = None
    automation_external_id: str | None = None

    artifact_identifiers_reported: list[str] = Field(default_factory=list)
    release_identifier_reported: str | None = None
    commit_hashes_reported: list[str] = Field(default_factory=list)
    configuration_version_reported: str | None = None

    source_started_at: datetime | None = None
    source_completed_at: datetime | None = None
    source_updated_at: datetime | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

### Layer 2: Normalized Deployment

```python
class DeploymentKind(str, Enum):
    APPLICATION = "application"
    INFRASTRUCTURE = "infrastructure"
    CONFIGURATION = "configuration"
    DATABASE = "database"
    FEATURE_FLAG = "feature_flag"
    DATA_PIPELINE = "data_pipeline"
    OTHER = "other"
    UNKNOWN = "unknown"


class DeploymentStatus(str, Enum):
    REQUESTED = "requested"
    QUEUED = "queued"
    IN_PROGRESS = "in_progress"
    SUCCEEDED_REPORTED = "succeeded_reported"
    FAILED_REPORTED = "failed_reported"
    CANCELLED = "cancelled"
    SUPERSEDED = "superseded"
    UNKNOWN = "unknown"


class Deployment(BaseModel):
    deployment_id: str
    external_deployment_id: str
    deployment_kind: DeploymentKind
    status: DeploymentStatus
    environment_kind: OperationalEnvironmentKind
    target_name_reported: str | None = None

    initiator_source_account_id: str | None = None
    executor_source_account_id: str | None = None
    automation_id: str | None = None
    actor_kind: ActorKind

    system_id: str | None = None
    component_id: str | None = None

    started_at: datetime | None = None
    completed_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

### Deployed Content Link

```python
class DeploymentContentTargetType(str, Enum):
    RELEASE = "release"
    COMMIT = "commit"
    PULL_REQUEST = "pull_request"
    ARTIFACT = "artifact"
    CONTAINER_IMAGE = "container_image"
    CONFIGURATION_VERSION = "configuration_version"
    DATABASE_MIGRATION = "database_migration"
    UNKNOWN = "unknown"


class DeploymentContentLink(BaseModel):
    deployment_content_link_id: str
    deployment_id: str
    target_type: DeploymentContentTargetType
    target_id: str
    resolution_status: RelationshipResolutionStatus

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

An environment may receive only part of a release, a generated artifact, or a
configuration change not represented by a repository release.

### Supported Propositions

Deployment records may support:

- a deployment was requested, initiated, executed, completed, failed, cancelled, or
  superseded;
- a source account or automation performed a recorded deployment role;
- specified content was linked to a target environment;
- an actor repeatedly participated in deployment or release-promotion activity;
- an incident occurred before, during, or after a deployment;
- a deployment source reported success or failure.

### Cannot Establish

A deployment alone cannot establish:

- that the content had a formal release;
- that the deployment reached every intended target;
- that the deployed system operated correctly afterward;
- that the initiator authored or understood the content;
- that an approval was substantive;
- that a nearby incident was caused by the deployment;
- expertise, ownership, business impact, or change quality.

### Canonical Failure Cases

1. A release is published but never deployed.
2. Continuous deployment occurs without a release object.
3. A successful pipeline leaves some targets on the old version.
4. A human clicks deploy while automation performs every technical step.
5. A deployment contains changes by many contributors.
6. A feature flag leaves deployed code inactive.
7. A deployment succeeds technically but causes delayed customer impact.
8. A deployment is retried under several IDs.
9. A configuration change is omitted from repository history.
10. Temporal proximity to an incident is mistaken for causality.

### Accepted Deployment Decisions

1. Keep repository releases and environment deployments conceptually distinct.
2. Preserve environment, target, content, initiator, executor, automation, status,
   and time.
3. Represent deployment-to-release, commit, artifact, and configuration links
   explicitly.
4. Treat source-reported deployment success as execution status, not operational
   outcome.
5. Do not propagate authorship or expertise from deployed content to the deployer.
6. Preserve partial, failed, cancelled, retried, and superseded deployments.
7. Require separate evidence for causal links between deployments and incidents.

## Rollback

### Purpose And Scope

A rollback is an operational action intended to restore a prior artifact,
configuration, traffic state, data state, or feature state. It may be implemented
as a distinct deployment, reversal command, or manual procedure.

Rollback execution is distinct from the diagnosis that motivated it and from
verified recovery.

### Minimal Model

```python
class RollbackKind(str, Enum):
    APPLICATION_VERSION = "application_version"
    CONFIGURATION = "configuration"
    INFRASTRUCTURE = "infrastructure"
    FEATURE_FLAG = "feature_flag"
    DATABASE = "database"
    TRAFFIC = "traffic"
    DATA = "data"
    OTHER = "other"
    UNKNOWN = "unknown"


class Rollback(BaseModel):
    rollback_id: str
    rollback_kind: RollbackKind
    incident_id: str | None = None
    original_deployment_id: str | None = None
    rollback_deployment_id: str | None = None

    initiator_source_account_id: str | None = None
    executor_source_account_id: str | None = None
    automation_id: str | None = None
    actor_kind: ActorKind

    reason_reported: str | None = None
    status_reported: str | None = None
    outcome_reported: str | None = None

    started_at: datetime | None = None
    completed_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Propositions

Rollback records may support:

- a rollback was proposed, initiated, executed, or verified;
- an actor or automation performed a recorded rollback role;
- a prior deployment or state was targeted;
- the source reported a reason, status, or outcome;
- an actor has practical exposure to reversal procedures.

### Cannot Establish

A rollback alone cannot establish:

- that the original deployment caused the incident;
- that rollback was the correct decision;
- that the prior state was fully restored;
- that rollback caused recovery;
- that the executor diagnosed the problem;
- expertise or ownership.

### Canonical Failure Cases

1. A rollback is attempted but only partially completes.
2. Recovery begins before rollback execution.
3. Rollback fails and a separate mitigation restores service.
4. A feature flag is called a rollback although code remains deployed.
5. A database rollback loses data.
6. Automation performs rollback under a human approval.
7. The person proposing rollback differs from the executor.
8. Rollback restores service without identifying root cause.

### Accepted Rollback Decisions

1. Model rollback as an operational action with explicit target and outcome.
2. Distinguish initiator, approver, executor, automation, and verifier.
3. Do not infer deployment causality from rollback occurrence.
4. Preserve partial, failed, harmful, and ineffective rollbacks.
5. Treat rollback experience as narrow performed-work evidence.

## Remediation And Follow-Up

### Purpose And Scope

Incidents and changes often create follow-up work intended to remove causes, improve
detection, update procedures, or reduce recurrence. Production Operations owns the
operational statement that a follow-up was identified and linked. Work Management
owns the follow-up item's assignment, workflow, and completion.

### Minimal Model

```python
class RemediationKind(str, Enum):
    PERMANENT_FIX = "permanent_fix"
    RESILIENCE_IMPROVEMENT = "resilience_improvement"
    DETECTION_IMPROVEMENT = "detection_improvement"
    RUNBOOK_UPDATE = "runbook_update"
    AUTOMATION = "automation"
    TESTING = "testing"
    PROCESS_CHANGE = "process_change"
    TRAINING = "training"
    SECURITY_REMEDIATION = "security_remediation"
    OTHER = "other"
    UNKNOWN = "unknown"


class OperationalFollowUp(BaseModel):
    operational_follow_up_id: str
    incident_id: str | None = None
    change_record_id: str | None = None
    postmortem_id: str | None = None

    remediation_kind: RemediationKind
    statement_reported: str
    identified_by_source_account_id: str | None = None
    identified_at: datetime | None = None

    work_item_id: str | None = None
    knowledge_artifact_id: str | None = None
    relationship_status: RelationshipResolutionStatus

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Propositions

Follow-up records may support:

- an incident or change record identified a remediation need;
- an actor authored or accepted a follow-up statement;
- a follow-up was linked to a work item or artifact;
- a later deployment, document revision, or validation record may corroborate
  implementation.

### Cannot Establish

They cannot establish:

- that the follow-up was assigned, implemented, deployed, or effective;
- that a closed ticket removed recurrence risk;
- that the author could perform the remediation;
- expertise or ownership;
- that all important follow-ups were recorded.

### Canonical Failure Cases

1. A follow-up is marked complete without production deployment.
2. A ticket fixes symptoms but not the stated cause.
3. A runbook update is created but remains inaccessible.
4. The same remediation appears under duplicate tickets.
5. A follow-up is intentionally accepted as residual risk.
6. The postmortem lists no follow-up despite known gaps.
7. Restricted work items hide implementation evidence.
8. A later incident contradicts the claim that recurrence was prevented.

### Accepted Remediation Decisions

1. Store operational follow-up statements as attributed propositions.
2. Link to Work Management rather than duplicating ticket workflow.
3. Require implementation and outcome corroboration before treating remediation as
   effective.
4. Preserve cancelled, duplicate, deferred, accepted-risk, and contradicted
   follow-ups.
5. Do not infer expertise from follow-up authorship or assignment.

## Change Management And Approval

### Purpose And Scope

Change-management records describe proposed or scheduled operational changes,
declared risks, plans, approvals, implementation windows, and review outcomes.

They provide intent and governance context. Approval may support evaluative
participation, but does not automatically establish technical judgment or successful
execution.

### Layer 1: Faithful Source Record

```python
class SourceChangeRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_change_id: str

    title: str
    description_reported: str | None = None
    change_type_reported: str | None = None
    status_reported: str | None = None
    risk_reported: str | None = None
    impact_reported: str | None = None

    requester_external_actor_id: str | None = None
    owner_external_actor_id: str | None = None
    implementer_external_actor_id: str | None = None

    implementation_plan_reported: str | None = None
    validation_plan_reported: str | None = None
    rollback_plan_reported: str | None = None

    source_requested_at: datetime | None = None
    source_scheduled_start_at: datetime | None = None
    source_scheduled_end_at: datetime | None = None
    source_started_at: datetime | None = None
    source_completed_at: datetime | None = None
    source_updated_at: datetime | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

### Layer 2: Normalized Change Record

```python
class ChangeLifecycle(str, Enum):
    DRAFT = "draft"
    REQUESTED = "requested"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED_REPORTED = "completed_reported"
    FAILED_REPORTED = "failed_reported"
    CANCELLED = "cancelled"
    REJECTED = "rejected"
    UNKNOWN = "unknown"


class ChangeRecord(BaseModel):
    change_record_id: str
    external_change_id: str
    title: str
    lifecycle: ChangeLifecycle
    change_type_reported: str | None = None
    risk_reported: str | None = None

    requester_source_account_id: str | None = None
    owner_source_account_id: str | None = None
    implementer_source_account_id: str | None = None

    scheduled_start_at: datetime | None = None
    scheduled_end_at: datetime | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Plans and risk descriptions remain source-attributed statements:

```python
class ChangePlanProposition(BaseModel):
    change_plan_proposition_id: str
    change_record_id: str
    proposition_kind: str
    proposition_text: str
    source_locator: str | None = None

    extraction_method: str
    extractor_version: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

### Change Approval

```python
class ChangeApprovalOutcome(str, Enum):
    APPROVED = "approved"
    CONDITIONAL = "conditional"
    REJECTED = "rejected"
    REVOKED = "revoked"
    ABSTAINED = "abstained"
    UNKNOWN = "unknown"


class ChangeApproval(BaseModel):
    change_approval_id: str
    change_record_id: str

    approver_source_account_id: str | None = None
    approver_team_id: str | None = None
    actor_kind: ActorKind
    outcome: ChangeApprovalOutcome
    rationale_reported: str | None = None
    conditions_reported: list[str] = Field(default_factory=list)

    occurred_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Propositions

Change records may support:

- an operational change was requested, planned, reviewed, approved, scheduled,
  implemented, cancelled, rejected, or reported complete;
- a source attributed requester, owner, implementer, or approver roles;
- a change record stated risks, plans, validation steps, or rollback steps;
- an approver recorded a decision, rationale, or conditions;
- a deployment, rollback, incident, work item, or release was linked.

Repeated substantive approval rationale may contribute to evidence of change
evaluation experience. Approval count alone does not.

### Cannot Establish

Change records cannot establish:

- that the plans were technically sound or followed;
- that the recorded implementer executed the change;
- that an approval involved substantive review;
- that approved risk equals objective risk;
- that reported completion means successful deployment or operation;
- expertise, ownership, or causality;
- that an emergency change was irresponsible;
- that an unapproved change was technically unsound.

### Canonical Failure Cases

1. A change is rubber-stamped under policy.
2. A group approval hides the actual evaluator.
3. An approver evaluates process completeness, not technical content.
4. The implementation differs materially from the approved plan.
5. An emergency change occurs before retrospective approval.
6. A completed change has no deployment evidence.
7. A cancelled change is mistaken for performed work.
8. A reusable boilerplate rollback plan is treated as specific knowledge.
9. Automation approves after tests pass.
10. A later incident contradicts the recorded successful outcome.

### Accepted Change-Management Decisions

1. Preserve source-specific change type, risk, impact, and lifecycle vocabulary.
2. Keep requester, owner, implementer, approver, executor, and verifier distinct.
3. Treat plans, risks, and outcomes as attributed source statements.
4. Create approval evidence only from explicit approval records.
5. Preserve conditional, rejected, revoked, retrospective, group, and automated
   approvals.
6. Do not infer substantive judgment from approval count.
7. Require deployment or audit evidence for execution and operational evidence for
   outcome.

## Postmortem And Root-Cause Statement

### Purpose And Scope

Postmortems and root-cause analyses contain retrospective statements about impact,
timeline, contributing factors, causes, response effectiveness, and follow-up work.
They are rich sources of organizational reasoning but may be incomplete, contested,
edited, politically constrained, or written by someone summarizing others' work.

The document artifact and revisions belong to Knowledge Artifacts. Production
Operations models the postmortem's relationship to an operational event and the
narrow attributed propositions extracted from it.

### Minimal Source And Normalized Records

```python
class SourcePostmortemRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_postmortem_id: str
    external_incident_id: str | None = None

    title: str
    body_ref: str | None = None
    status_reported: str | None = None
    author_external_actor_ids: list[str] = Field(default_factory=list)
    reviewer_external_actor_ids: list[str] = Field(default_factory=list)
    approver_external_actor_ids: list[str] = Field(default_factory=list)

    source_created_at: datetime | None = None
    source_published_at: datetime | None = None
    source_updated_at: datetime | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str


class PostmortemLifecycle(str, Enum):
    DRAFT = "draft"
    UNDER_REVIEW = "under_review"
    PUBLISHED = "published"
    SUPERSEDED = "superseded"
    RETRACTED = "retracted"
    UNKNOWN = "unknown"


class Postmortem(BaseModel):
    postmortem_id: str
    external_postmortem_id: str
    incident_id: str | None = None
    knowledge_artifact_id: str | None = None

    title: str
    lifecycle: PostmortemLifecycle
    author_source_account_ids: list[str] = Field(default_factory=list)
    reviewer_source_account_ids: list[str] = Field(default_factory=list)
    approver_source_account_ids: list[str] = Field(default_factory=list)

    created_at: datetime | None = None
    published_at: datetime | None = None
    updated_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

### Attributed Postmortem Proposition

```python
class PostmortemPropositionKind(str, Enum):
    IMPACT = "impact"
    DETECTION_GAP = "detection_gap"
    TIMELINE_CLAIM = "timeline_claim"
    DIRECT_CAUSE = "direct_cause"
    ROOT_CAUSE = "root_cause"
    CONTRIBUTING_FACTOR = "contributing_factor"
    RESPONSE_SUCCESS = "response_success"
    RESPONSE_GAP = "response_gap"
    REMEDIATION = "remediation"
    OWNERSHIP_STATEMENT = "ownership_statement"
    PROCESS_LESSON = "process_lesson"
    OTHER = "other"
    UNKNOWN = "unknown"


class PostmortemProposition(BaseModel):
    postmortem_proposition_id: str
    postmortem_id: str
    proposition_kind: PostmortemPropositionKind
    proposition_text: str
    source_locator: str | None = None

    attributed_author_source_account_ids: list[str] = Field(default_factory=list)
    resolution_status: PropositionResolutionStatus

    subject_system_id: str | None = None
    subject_component_id: str | None = None

    extraction_method: str
    extractor_version: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

Root-cause statements remain attributed propositions. Publication or approval does
not transform them into uncontested facts.

### Authorship, Diagnosis, And Review

- **Author:** drafted or edited the postmortem.
- **Incident participant:** was involved in the event.
- **Diagnostician:** made a separately evidenced diagnostic contribution.
- **Reviewer:** evaluated the postmortem or a revision.
- **Approver:** accepted it under the source workflow.

These roles must not be collapsed. A skilled facilitator may author the document
without diagnosing the incident. A diagnostician may not be named as an author.

### Supported Propositions

Postmortem records may support:

- a retrospective artifact was created, reviewed, approved, published, superseded,
  or retracted;
- named accounts authored, reviewed, or approved it;
- a specific revision stated an impact, cause, factor, lesson, or remediation;
- the statement was corroborated, contradicted, contested, or superseded by other
  evidence;
- an actor performed substantive retrospective analysis when source attribution and
  content support that narrower proposition.

### Cannot Establish

Postmortems cannot establish:

- that the stated root cause is objectively correct or complete;
- that the author discovered the cause during the incident;
- that reviewers independently verified every statement;
- that an approved document is uncontested;
- that listed remediation was completed or effective;
- that absent people did not contribute;
- expertise, ownership, or transferability;
- that blame-free wording eliminates organizational pressure or omission.

### Canonical Failure Cases

1. The facilitator authors the postmortem from interviews.
2. The final report omits a contractor who found the issue.
3. An early root-cause statement is later disproved.
4. Two teams publish conflicting causal accounts.
5. Approval is procedural rather than technical.
6. A root cause is actually a proximate trigger.
7. The report attributes recovery to an action that occurred after recovery began.
8. A security or legal review redacts decisive evidence.
9. A later incident reveals an unrecorded contributing factor.
10. The postmortem is copied from a template with generic lessons.
11. A document is revised without preserving the original causal claim.
12. The incident system summary conflicts with the linked postmortem.

### Accepted Postmortem Decisions

1. Model postmortem source records and operational propositions while linking the
   full document to Knowledge Artifacts.
2. Preserve revision, author, reviewer, approver, publication, and supersession
   context.
3. Keep root cause, direct cause, contributing factor, and response assessment
   distinct.
4. Treat every causal or evaluative statement as attributed until corroborated.
5. Preserve contested, retracted, redacted, and superseded propositions.
6. Do not equate postmortem authorship with incident diagnosis.
7. Require separate evidence for remediation implementation and effectiveness.

## Cross-Source Relationship

### Purpose And Scope

Operational evidence becomes useful for expertise and knowledge-risk analysis when
it is linked carefully to systems, code, releases, work, and knowledge artifacts.
Relationships must preserve their origin, direction, resolution status, and
contradictions.

```python
class OperationalRelationSourceType(str, Enum):
    INCIDENT = "incident"
    ALERT = "alert"
    OPERATIONAL_ACTION = "operational_action"
    DEPLOYMENT = "deployment"
    ROLLBACK = "rollback"
    CHANGE_RECORD = "change_record"
    POSTMORTEM = "postmortem"
    FOLLOW_UP = "follow_up"
    UNKNOWN = "unknown"


class OperationalRelationTargetType(str, Enum):
    SYSTEM = "system"
    COMPONENT = "component"
    REPOSITORY = "repository"
    COMMIT = "commit"
    PULL_REQUEST = "pull_request"
    RELEASE = "release"
    WORK_ITEM = "work_item"
    KNOWLEDGE_ARTIFACT = "knowledge_artifact"
    PERSON = "person"
    TEAM = "team"
    BUSINESS_CAPABILITY = "business_capability"
    OTHER_OPERATIONAL_RECORD = "other_operational_record"
    UNKNOWN = "unknown"


class OperationalRelationKind(str, Enum):
    AFFECTED = "affected"
    TRIGGERED = "triggered"
    DETECTED_BY = "detected_by"
    CAUSED_BY_REPORTED = "caused_by_reported"
    CONTRIBUTED_TO_REPORTED = "contributed_to_reported"
    MITIGATED_BY_REPORTED = "mitigated_by_reported"
    RESOLVED_BY_REPORTED = "resolved_by_reported"
    DEPLOYED = "deployed"
    ROLLED_BACK = "rolled_back"
    FOLLOWED_UP_BY = "followed_up_by"
    DOCUMENTED_BY = "documented_by"
    USED_PROCEDURE_FROM = "used_procedure_from"
    SUPERSEDES = "supersedes"
    DUPLICATES = "duplicates"
    REFERENCES = "references"
    UNKNOWN = "unknown"


class OperationalCrossSourceRelation(BaseModel):
    operational_relation_id: str
    source_type: OperationalRelationSourceType
    source_id: str
    target_type: OperationalRelationTargetType
    target_id: str
    relation_kind: OperationalRelationKind

    origin: RelationshipOrigin
    resolution_status: RelationshipResolutionStatus
    valid_from: datetime | None = None
    valid_until: datetime | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

`CAUSED_BY_REPORTED`, `MITIGATED_BY_REPORTED`, and `RESOLVED_BY_REPORTED` preserve
source attribution. A temporal association alone must not be normalized into one of
these causal relationships.

### Relationship Rules

- An incident-to-system link may establish reported affected scope, not formal
  ownership or objective business impact.
- A deployment-to-release link establishes that the source associated the release
  with an environment change, not that every release item was active.
- An incident-to-deployment link may be temporal, explicitly reported as causal, or
  later rejected. Preserve which.
- A timeline-to-runbook link may establish that a procedure was referenced. An
  action record is needed to support that it was applied.
- An incident-to-work-item link establishes follow-up or related-work context.
  Work Management owns assignment and completion.
- A postmortem-to-person link establishes attributed authorship or review only when
  the relation kind says so; it must not imply diagnosis.

### Canonical Failure Cases

1. A URL points to the wrong incident after migration.
2. A title match links an incident to the wrong service.
3. Several repositories deploy into one operational system.
4. One monorepo supports several independently operated systems.
5. A release identifier is reused across products.
6. A deployment near an incident is automatically labeled causal.
7. A work item closes while the operational risk remains.
8. A runbook is linked but not used.
9. An affected component is inferred from a broad team label.
10. Restricted records expose only one side of a relationship.

### Accepted Cross-Source Decisions

1. Model cross-source links explicitly rather than copying foreign source facts.
2. Preserve structured, integrated, textual, temporal, derived, and human-confirmed
   relationship origins.
3. Keep reported causal relations distinct from temporal association.
4. Preserve direction, validity time, contradictions, and resolution status.
5. Do not propagate expertise, ownership, contribution credit, or business impact
   through relationships.
6. Retain rejected and contested links for audit and evaluation.

## Provenance, Time, Identity, And Access

### Provenance

Every normalized record and proposition must remain traceable to one or more source
records. Raw payloads or immutable payload references should be retained according
to policy. Extracted classifications and propositions record their method and
version.

Source precedence must not silently erase disagreement. Audit logs, timeline text,
deployment records, and postmortems may each report different actors or outcomes.
All remain available to evidence resolution.

### Time

Operational evidence should preserve:

- event occurrence time;
- source creation, update, and deletion time;
- scheduled time;
- started and completed time;
- incident declaration, detection, mitigation, resolution, and closure time;
- postmortem publication and revision time;
- observation and ingestion time;
- validity intervals for relationships and event-specific assignments.

Current service names, team membership, account mappings, ownership, and severity
must not be projected backward. Late reconstruction should remain identifiable.

### Identity

Operational sources often contain:

- source account IDs;
- shared responder accounts;
- team identities;
- bot or integration identities;
- external vendor accounts;
- phone or email aliases;
- free-text names in imported timelines.

Concrete source identifiers are preferred. Name-only matches remain ambiguous.
Unresolved actors are retained. Team participation must not be assigned to an
arbitrary person. Shared and automation accounts must not be modeled as people.

### Access And Privacy

Operational data may contain:

- customer or employee information;
- credentials, tokens, commands, and sensitive infrastructure details;
- security vulnerabilities;
- legal, regulatory, or privileged material;
- performance commentary;
- vendor communications;
- restricted incident channels and attachments.

SuccessionAI must preserve source authorization and redaction. It may record that a
restricted record exists, but must abstain from interpreting inaccessible content.
Extracted propositions must not broaden access beyond the underlying source.

### Ingestion Scope

```python
class OperationalIngestionScope(BaseModel):
    ingestion_scope_id: str
    source_system: str
    source_tenant_id: str

    included_project_ids: list[str] = Field(default_factory=list)
    excluded_project_ids: list[str] = Field(default_factory=list)
    included_service_ids: list[str] = Field(default_factory=list)
    excluded_service_ids: list[str] = Field(default_factory=list)
    included_environment_names: list[str] = Field(default_factory=list)

    history_starts_at: datetime | None = None
    history_ends_at: datetime | None = None
    permissions_observed: list[str] = Field(default_factory=list)
    unavailable_object_types: list[str] = Field(default_factory=list)
    retention_limitations: list[str] = Field(default_factory=list)

    collection_started_at: datetime
    collection_completed_at: datetime | None = None
    source_claimed_complete: bool
    limitations: list[str] = Field(default_factory=list)
```

Knowledge-concentration assessments must be scoped to the systems, environments,
events, history, and content actually observable.

## Contradictions And Evidence Resolution

Operational sources commonly disagree. Contradictions are first-class evidence:

- the incident summary names one cause while the postmortem names another;
- chat reports that a person executed an action while an audit log names automation;
- a deployment system reports success while health checks report failure;
- the incident is marked resolved while customer impact continues;
- a follow-up ticket is complete while later incidents show recurrence;
- a current service name or owner conflicts with historical records;
- a timeline attributes diagnosis to one person while a later report attributes it
  to a team;
- an alert reports one affected component while the incident scope names another.

```python
class OperationalContradictionKind(str, Enum):
    ACTOR_ATTRIBUTION = "actor_attribution"
    EVENT_TIME = "event_time"
    EVENT_SCOPE = "event_scope"
    ACTION_EXECUTION = "action_execution"
    ACTION_OUTCOME = "action_outcome"
    DEPLOYMENT_CONTENT = "deployment_content"
    CAUSAL_CLAIM = "causal_claim"
    RECOVERY_CLAIM = "recovery_claim"
    REMEDIATION_STATUS = "remediation_status"
    IDENTITY = "identity"
    RELATIONSHIP = "relationship"
    OTHER = "other"
    UNKNOWN = "unknown"


class OperationalContradiction(BaseModel):
    operational_contradiction_id: str
    contradiction_kind: OperationalContradictionKind
    description: str
    resolution_status: PropositionResolutionStatus

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
    resolution_method: str | None = None
    resolved_at: datetime | None = None
```

No universal source hierarchy is defined. An audit log may be stronger for execution
identity while a postmortem may provide richer causal interpretation. Resolution is
claim-specific.

## Supported Assessment Uses

When evidence is sufficiently specific, corroborated, and observable, Production
Operations may contribute to assessments of:

- operational exposure to a system or failure mode;
- demonstrated execution of particular operational procedures;
- substantive diagnostic or decision-making contributions;
- mitigation, rollback, deployment, or recovery-verification experience;
- repeated observed stewardship under operational conditions;
- concentration of observed diagnostic or response capability;
- dependence on one person for undocumented procedures or system-specific context;
- gaps between recorded procedures and actual operational practice;
- stale or contested operational knowledge;
- transferability concerns requiring Knowledge Validation.

Assessments should consider:

- actor attribution quality;
- whether the evidence shows participation, reasoning, execution, or verification;
- automation and policy effects;
- action complexity and specificity without inventing a numeric difficulty score;
- corroboration across source types;
- recency and system change;
- restricted or missing evidence;
- counterexamples, failed actions, and contradictions;
- Business Impact and Ownership evidence from their own source families.

## Prohibited Claims

Production-operations evidence must not, by itself, be used to claim:

- "This participant diagnosed the incident."
- "This diagnoser resolved the incident."
- "The last actor before recovery caused recovery."
- "This incident commander is the system expert."
- "This alert acknowledger understands the service."
- "This on-call responder owns the system."
- "This deployer authored or understands the deployed code."
- "This release was deployed" without deployment evidence.
- "This deployment succeeded operationally" from pipeline success alone.
- "This rollback proves the preceding deployment caused the incident."
- "This postmortem author discovered the root cause."
- "This approved root cause is objectively true."
- "This closed follow-up eliminated recurrence risk."
- "This person is an expert" from action, incident, alert, or deployment volume.
- "No one else knows this system" because other activity was not observed.
- "This system is business-critical" from incident severity or alert volume alone.
- "This team owns the system" from repeated response activity alone.
- "Knowledge transfer succeeded" because a runbook was linked or used once.

Stronger claims require corroborating evidence and, where relevant, Knowledge
Validation.

## Canonical Cross-Object Failure Cases

The synthetic evaluation set should include at least these scenarios:

1. A commander coordinates while another responder diagnoses and automation
   executes the mitigation.
2. The person who acknowledges an alert hands it off without investigating.
3. A responder proposes the correct diagnosis but someone else verifies and
   resolves it.
4. A release exists without a deployment.
5. A production deployment exists without a formal release.
6. A successful deployment pipeline causes delayed production failure.
7. A rollback restores service but does not prove the deployment was causal.
8. A temporary mitigation is recorded as resolution while the defect remains.
9. A postmortem facilitator authors a diagnosis supplied by responders.
10. A postmortem root-cause statement is later contradicted by another incident.
11. A follow-up ticket closes without deployment or validation.
12. An on-call override responds once and is mistaken for the long-term owner.
13. A high-volume responder performs routine commands supplied by a runbook.
14. A quiet responder makes the decisive diagnostic contribution in a restricted
    channel.
15. A shared account combines actions by several people.
16. A bot appears under a human display name.
17. Event times are backfilled and conflict with source audit timestamps.
18. An incident links to the wrong service through name similarity.
19. A deployment near an incident is correlated but not causal.
20. A restricted postmortem contains the only root-cause detail.
21. A reopened incident contradicts the earlier recovery claim.
22. A runbook is referenced but the successful action deviates from it.
23. A group approval is mistaken for one person's technical judgment.
24. A team is repeatedly paged because of routing policy, not expertise.
25. Missing alert history is treated as absence of operational events.

## Accepted Decisions

1. Preserve source facts, attributed propositions, and assessments as separate
   layers.
2. Give incidents, timelines, actions, deployments, and causal statements richer
   treatment than alerts and scheduling context.
3. Distinguish participation, diagnosis, action execution, resolution, recovery
   verification, and retrospective authorship.
4. Distinguish repository releases from environment deployments.
5. Keep long-lived on-call rotations in Identity and Organization; model only
   event-specific on-call context here.
6. Treat operational actions as performed-work evidence, not automatic expertise.
7. Preserve initiator, approver, executor, automation, verifier, commander, owner,
   author, reviewer, and acknowledger roles separately.
8. Preserve source-specific severity, priority, status, risk, and outcome language.
9. Treat source-reported impact, cause, mitigation, resolution, and success as
   attributed propositions until corroborated.
10. Preserve failed, ineffective, harmful, cancelled, reverted, contested, and
    superseded records.
11. Do not infer causality from temporal order or proximity.
12. Do not use response speed, alert count, incident count, deployment count,
    message volume, or approval count as direct expertise measures.
13. Link operational records to systems, releases, code, work items, and artifacts
    through explicit provenance-bearing relationships.
14. Preserve contradictions rather than selecting one convenient narrative.
15. Record connector scope, retention limits, redactions, permissions, and
    inaccessible content as observability constraints.
16. Use historical identity, team, ownership, and system context at event time.
17. Require separate evidence for follow-up implementation and effectiveness.
18. Require Knowledge Validation for claims about transferability or successor
    readiness.
19. Define no confidence thresholds, source weights, freshness cutoffs, or combined
    operational-expertise score in the initial model.
20. Keep this document at evidence-model depth; backend connectors, database models,
    APIs, agents, scoring systems, and UI are out of scope.

## Production Operations Summary

The initial Production Operations model covers:

1. Incidents as operational-event containers
2. Timelines as attributed observations, reasoning, decisions, and event history
3. Event-specific participants, responder roles, and on-call context
4. Concrete operational actions and separate verification
5. Alerts and acknowledgements as lightweight detection and routing context
6. Environment deployments distinct from repository releases
7. Rollbacks as explicit operational actions
8. Remediation statements linked to follow-up work
9. Change requests, plans, approvals, and implementation context
10. Postmortems and root-cause statements as attributed retrospective propositions
11. Provenance-bearing cross-source relationships
12. Contradictions, time, identity, privacy, access, and observability limits

The governing boundary remains:

> Production-operations data establishes what operational systems recorded, what
> actors were attributed as participating or acting, and what sources stated about
> diagnosis, response, deployment, recovery, and cause. Expertise, ownership,
> causal truth, knowledge concentration, transferability, and knowledge-loss risk
> require corroborated evidence and separate assessment.
