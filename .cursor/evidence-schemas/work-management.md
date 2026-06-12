# Work Management Schema

> Status: Initial model complete.

## Purpose

Work management data records organizational intent and expected responsibility:

- what problem or task the organization recorded;
- who created, reported, or was assigned the work;
- how the work was prioritized and tracked;
- which requirements, dependencies, and acceptance criteria were stated;
- how the work relates to implementation, incidents, documents, and projects.

Assignment establishes expected responsibility, not demonstrated capability.
Completion establishes workflow state, not necessarily successful implementation or
deployment.

## Objects

1. Workspace and project
2. Work item
3. Assignment history
4. Status transition
5. Comment
6. Dependency and relationship
7. Acceptance or sign-off
8. Iteration, sprint, or milestone

## Workspace And Project

Workspaces and projects are minimal source containers used to scope identifiers and
group work items.

```python
class WorkWorkspace(BaseModel):
    workspace_id: str
    source_system: str
    source_tenant_id: str
    external_workspace_id: str
    name: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)


class WorkProject(BaseModel):
    project_id: str
    workspace_id: str
    external_project_id: str
    name: str
    lifecycle_reported: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

These records establish source scope and organizational grouping only. Project
membership, leadership, status, or naming does not establish contribution,
expertise, ownership, criticality, or successful delivery.

## Work Item

### Retrieval

Work items may be retrieved from:

- Jira REST APIs and webhooks;
- Linear GraphQL API and webhooks;
- organization exports;
- synthetic JSON for the demo.

Initial synchronization should retrieve visible records and relevant history within
the configured time window. Incremental events should be reconciled periodically.
Connector scope and inaccessible projects or fields must be recorded.

### Layer 1: Faithful Source Record

```python
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class SourceWorkItemRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str

    external_workspace_id: str
    external_project_id: str | None = None
    external_work_item_id: str
    display_key: str | None = None

    title: str
    description: str | None = None
    work_item_type_reported: str | None = None

    creator_external_actor_id: str | None = None
    reporter_external_actor_id: str | None = None
    assignee_external_actor_id: str | None = None

    status_reported: str | None = None
    resolution_reported: str | None = None
    priority_reported: str | None = None
    severity_reported: str | None = None
    labels_reported: list[str] = Field(default_factory=list)

    parent_external_work_item_id: str | None = None

    source_created_at: datetime | None = None
    source_updated_at: datetime | None = None
    source_completed_at: datetime | None = None
    source_cancelled_at: datetime | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

Source-specific values are preserved because Jira and Linear workflows are
organization-configurable. The mutable display key is not the record identity.

### Layer 2: Normalized Work Item

```python
class WorkItemType(str, Enum):
    TASK = "task"
    STORY = "story"
    BUG = "bug"
    EPIC = "epic"
    SUBTASK = "subtask"
    INCIDENT_FOLLOW_UP = "incident_follow_up"
    IMPROVEMENT = "improvement"
    RESEARCH = "research"
    UNKNOWN = "unknown"


class WorkItemLifecycle(str, Enum):
    BACKLOG = "backlog"
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    UNKNOWN = "unknown"


class WorkItem(BaseModel):
    work_item_id: str
    workspace_id: str
    project_id: str | None = None

    external_work_item_id: str
    display_key: str | None = None

    title: str
    description: str | None = None
    work_item_type: WorkItemType
    lifecycle: WorkItemLifecycle

    creator_source_account_id: str | None = None
    reporter_source_account_id: str | None = None
    current_assignee_source_account_id: str | None = None
    parent_work_item_id: str | None = None

    created_at: datetime | None = None
    updated_at: datetime | None = None
    completed_at: datetime | None = None
    cancelled_at: datetime | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Priority, severity, resolution, labels, estimates, and custom fields remain
source-specific until their organization-specific semantics are known.

### Stated Intent

Descriptions may be structured into attributed statements:

```python
class WorkItemIntent(BaseModel):
    work_item_intent_id: str
    work_item_id: str

    stated_problem: str | None = None
    stated_requirements: list[str] = Field(default_factory=list)
    stated_acceptance_criteria: list[str] = Field(default_factory=list)
    stated_constraints: list[str] = Field(default_factory=list)
    stated_risks: list[str] = Field(default_factory=list)

    extraction_method: str
    extractor_version: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

These are statements from the work item, not verification that the requirements
were current, correct, implemented, or accepted.

### Role Distinctions

- **Creator:** entered the source record.
- **Reporter:** was attributed as the source of the request or problem.
- **Assignee:** was expected to coordinate or perform the work at that time.
- **Contributor:** performed a separately recorded action related to the work.

These roles must not be collapsed. None independently proves implementation.

### Supported Propositions

Work-item records may support:

- the organization recorded a problem, request, or task;
- an account created, reported, or was assigned the item;
- the item belonged to a project or parent initiative;
- the source reported a type, priority, severity, status, or resolution;
- the description stated requirements, constraints, risks, or acceptance criteria;
- the item was linked to implementation, documentation, an incident, or another
  organizational record.

Repeated assigned and completed work may suggest domain exposure when corroborated
by implementation, review, documentation, or operational evidence.

### Cannot Establish

A work item alone cannot establish:

- that the assignee performed the work;
- that the reporter discovered or diagnosed the problem;
- that completion means correct implementation or deployment;
- expertise or understanding;
- objective work difficulty;
- business criticality;
- authorship of linked code;
- that the description remained current;
- that one assignee worked alone.

Jira priority reflects workflow urgency, not necessarily business criticality.
Story points and estimates are not objective measures of difficulty.

### Time And Change Semantics

- Preserve creation, update, completion, and cancellation times separately.
- Store assignment and status histories as separate records.
- Preserve materially changed descriptions through snapshots or source history.
- Interpret organization context using the time of each recorded action.
- A reopened item remains historically completed and later reopened.
- Automated transitions must preserve the automation actor.

### Privacy And Access

Work items may contain customer data, security details, employee information, or
links to restricted sources. Connectors must preserve source permissions and record
partially visible or inaccessible fields.

Visible metadata may establish that a restricted item exists, but SuccessionAI must
abstain from interpreting inaccessible requirements or discussion.

### Canonical Failure Cases

1. An assignee coordinates work implemented by someone else.
2. A ticket remains assigned to its creator after handoff.
3. A completed ticket has no implementation.
4. A low-priority ticket fixes a critical latent risk.
5. A high-priority ticket is administrative.
6. A stale description contradicts the linked pull request.
7. An epic assignee is mistaken for every child issue's implementer.
8. A ticket is reopened after completion.
9. Several people collaborate, but the source allows one assignee.
10. A private ticket contains requirements absent from visible records.
11. An issue is duplicated or superseded.
12. Automation transitions an issue to completed.
13. A bug reporter is treated as its technical diagnostician.
14. Story points are treated as objective difficulty.
15. An incident follow-up closes without resolving the underlying risk.

### Accepted Work-Item Decisions

1. Use immutable source IDs rather than mutable display keys as identity.
2. Preserve source-specific type, status, priority, severity, and resolution values.
3. Normalize only broad lifecycle and work-item type for cross-source comparison.
4. Keep creator, reporter, assignee, and contributors distinct.
5. Preserve materially relevant description history.
6. Treat requirements and acceptance criteria as attributed statements.
7. Do not use priority, estimates, completion, or assignment as direct expertise
   measures.
8. Require corroboration before attributing implementation or successful outcomes.
9. Represent parent, duplicate, blocked-by, superseded, and related links explicitly.
10. Record restricted records and fields as observability limitations.

## Next Object

The next object is status transition history: how an item moved through its workflow,
who or what triggered changes, and why workflow completion must remain distinct from
successful outcome.

## Assignment History

### Purpose And Scope

Assignment history records who a work item was assigned to over time. It provides
workflow-routing and expected-responsibility context.

It may help determine:

- who was expected to handle an item during a particular period;
- whether work in an area was repeatedly routed to one person or team;
- whether the item moved between possible specialists;
- whether an assignee held the item only briefly;
- who held the assignment when the workflow reached completion;
- whether a recorded handoff occurred.

Assignment history is lightweight supporting context. It does not prove performed
work, expertise, meaningful exposure, or a successful handoff.

### Retrieval

Assignment history may come from:

- Jira issue changelogs;
- Linear issue activity or history events;
- assignment-change webhooks retained by SuccessionAI;
- historical exports;
- periodic snapshots.

When only the current assignee is available, the system must not invent earlier
assignment history.

This object concerns assignment to a work item. Longer-lived team, role, reporting,
project, and on-call assignments remain in Identity and Organization.

### Layer 1: Faithful Source Record

```python
class SourceWorkItemAssignmentEvent(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_work_item_id: str

    previous_assignee_external_actor_id: str | None = None
    new_assignee_external_actor_id: str | None = None
    changed_by_external_actor_id: str | None = None

    source_occurred_at: datetime | None = None
    observed_at: datetime
    raw_payload_ref: str
```

An absent assignee may mean unassigned, unavailable, redacted, or unknown depending
on source semantics. The connector must preserve that distinction when possible.

### Layer 2: Normalized Event

```python
class WorkItemAssignmentEvent(BaseModel):
    assignment_event_id: str
    work_item_id: str

    previous_assignee_source_account_id: str | None = None
    new_assignee_source_account_id: str | None = None
    changed_by_source_account_id: str | None = None

    occurred_at: datetime | None = None
    observed_at: datetime
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Derived intervals may support temporal queries:

```python
class WorkItemAssignmentInterval(BaseModel):
    assignment_interval_id: str
    work_item_id: str
    assignee_source_account_id: str

    assigned_from: datetime
    assigned_until: datetime | None = None
    supporting_assignment_event_ids: list[str] = Field(default_factory=list)
```

Intervals are derived from observed events. Incomplete history must produce an
open-ended or explicitly incomplete interval rather than false precision.

### Supported Propositions

Assignment history may support:

- an account was the recorded assignee during a period;
- an item was reassigned from one account to another;
- an account held the assignment when a workflow event occurred;
- work in an area was repeatedly routed to an account or team;
- a recorded handoff or routing change occurred.

Repeated routing may weakly suggest that the organization perceived a person as
relevant or trusted in that area. Stronger interpretation requires corroboration.

### Cannot Establish

Assignment history cannot establish:

- who performed the work;
- why reassignment occurred;
- whether an assignee accepted or viewed the item;
- whether a brief assignment produced meaningful exposure;
- expertise or understanding;
- successful knowledge transfer;
- whether the completion-time assignee caused completion.

### Canonical Failure Cases

1. An item is reassigned for administrative closure.
2. An assignee performs no work before reassignment.
3. A person performs the work while another remains assigned.
4. Several collaborators are represented by one assignee.
5. Automation assigns work based on round-robin routing.
6. An assignment changes because someone is unavailable, not because of expertise.
7. History begins after earlier assignment events occurred.
8. A team assignment is flattened into an individual assignment.
9. A deleted or redacted account appears as an unknown assignee.
10. A rapid series of assignment changes creates misleading exposure counts.

### Accepted Assignment-History Decisions

1. Keep assignment history as lightweight workflow context.
2. Preserve previous assignee, new assignee, change actor, and event time.
3. Derive intervals only when supported by sufficient event history.
4. Do not infer performed work or expertise from assignment alone.
5. Treat repeated routing as a weak organizational-perception signal requiring
   corroboration.
6. Preserve incomplete history and unknown or redacted actors explicitly.
7. Keep work-item assignment distinct from organization-level assignments.

## Next Object

The next object is the work-item comment: attributed discussion, decisions,
clarifications, and technical claims that may explain the work beyond its formal
description.

## Status Transition History

### Purpose And Scope

Status transitions record how a work item moved through its configured workflow.
They provide context about:

- when work was planned, started, blocked, completed, cancelled, or reopened;
- who or what triggered a transition;
- how long an item remained in broad lifecycle states;
- whether the workflow changed repeatedly;
- whether completion was later reversed.

Status history is workflow evidence. It does not prove implementation, correctness,
deployment, acceptance, or resolution of the underlying problem.

### Retrieval

Status transitions may come from:

- Jira issue changelogs;
- Linear issue activity or history events;
- transition webhooks retained by SuccessionAI;
- historical exports;
- periodic snapshots when event history is unavailable.

Snapshot comparisons may show that status changed but may not establish exactly when,
who changed it, or which intermediate states occurred.

### Layer 1: Faithful Source Record

```python
class SourceWorkItemStatusTransitionRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_work_item_id: str

    previous_status_reported: str | None = None
    new_status_reported: str
    resolution_reported: str | None = None
    changed_by_external_actor_id: str | None = None

    source_occurred_at: datetime | None = None
    observed_at: datetime
    raw_payload_ref: str
```

Source-specific status and resolution values are preserved because organizations
define custom workflows and may use the same label differently.

### Layer 2: Normalized Transition

```python
class WorkItemStatusTransition(BaseModel):
    status_transition_id: str
    work_item_id: str

    previous_status_reported: str | None = None
    new_status_reported: str
    previous_lifecycle: WorkItemLifecycle | None = None
    new_lifecycle: WorkItemLifecycle

    resolution_reported: str | None = None
    changed_by_source_account_id: str | None = None

    occurred_at: datetime | None = None
    observed_at: datetime
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Broad lifecycle normalization supports cross-source analysis while retaining the
original workflow vocabulary.

### Derived Lifecycle Interval

```python
class WorkItemLifecycleInterval(BaseModel):
    lifecycle_interval_id: str
    work_item_id: str
    lifecycle: WorkItemLifecycle

    entered_at: datetime
    exited_at: datetime | None = None
    supporting_transition_ids: list[str] = Field(default_factory=list)
    history_complete: bool
```

Durations should only be calculated when timestamps and history are sufficiently
complete. Missing events must not become false zero-duration states.

### Transition Actor

The actor may be:

- a person;
- a bot or service account;
- a workflow automation rule;
- a source-system process;
- unresolved.

Manual and automated transitions remain distinct. A person triggering a transition
does not prove that person performed the underlying work.

### Reopening

A reopening is a transition from a broadly completed state back to a non-completed
state. It can support that the workflow's earlier completion was not final.

It does not, by itself, establish:

- that the original implementation was defective;
- who caused the problem;
- that the reopened item concerns the same exact requirement;
- that earlier work had no value.

### Supported Propositions

Status history may support:

- an item entered or exited a broad lifecycle state;
- a person or automation triggered a recorded transition;
- an item was blocked, completed, cancelled, or reopened;
- an item remained in an observed state during a period;
- the workflow repeatedly cycled between states;
- the source reported a resolution when transitioning.

These propositions may contextualize implementation and handoffs but do not verify
real-world outcomes.

### Cannot Establish

Status transitions cannot establish:

- that work began exactly when status became in progress;
- that blocked status captures every real blocker;
- that completion means implementation, review, deployment, or acceptance;
- that cancellation means the need disappeared;
- expertise or work quality;
- that a transition actor performed the work;
- objective productivity from time in status;
- root cause of reopening.

### Interpretation Boundaries

- Cycle time is a workflow metric, not an expertise metric.
- Long duration may reflect waiting, scope change, priority, or missing updates.
- Short duration may reflect trivial work, prior untracked work, or automation.
- Frequent completion transitions may reflect workflow habits rather than output.
- A blocked item may reveal a dependency, but the blocker should be modeled through
  an explicit relationship when available.

### Canonical Failure Cases

1. Automation marks an item complete after a pull request merges.
2. An item is completed before deployment or acceptance.
3. A person closes an item administratively without doing the work.
4. Work starts before the status changes to in progress.
5. An item remains in progress long after work stops.
6. A completed item is reopened for a different edge case.
7. A custom status is normalized incorrectly.
8. Snapshot ingestion misses several intermediate states.
9. A cancelled item is replaced by another work item.
10. A blocked item lacks a recorded blocking relationship.
11. A workflow transition is attributed to a shared account.
12. Status changes are bulk-edited during project cleanup.

### Accepted Status-Transition Decisions

1. Preserve source-specific statuses and resolutions.
2. Normalize only to broad lifecycle categories.
3. Record transition actor, event time, and observation time.
4. Distinguish manual, automated, shared, and unresolved actors through identity
   classification.
5. Derive lifecycle intervals only when history supports them.
6. Preserve reopenings and repeated workflow cycles.
7. Do not treat completion, cycle time, or transition volume as expertise or
   productivity measures.
8. Require linked implementation, review, deployment, acceptance, or operational
   evidence before asserting successful outcomes.

## Next Object

The next object is dependency and relationship data: parent, duplicate, blocked-by,
superseded, related, and cross-source links.

## Work-Item Comment

### Purpose And Scope

Work-item comments preserve attributed discussion that adds context beyond the title
and description. They may contain:

- requirement clarification;
- progress or handoff notes;
- technical explanations;
- decisions and constraints;
- blocker descriptions;
- links to implementation, incidents, or documents.

The initial model remains lightweight. It does not require a complex conversational
graph or detailed scoring of comment quality.

### Retrieval

Comments may come from:

- Jira or Linear APIs;
- comment webhooks;
- issue history exports;
- synthetic JSON for the demo.

Edits, deletions, and restricted content should be retained as metadata when the
source exposes them.

### Faithful And Normalized Records

```python
class SourceWorkItemCommentRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_work_item_id: str
    external_comment_id: str

    author_external_actor_id: str | None = None
    body: str | None = None

    source_created_at: datetime | None = None
    source_updated_at: datetime | None = None
    source_deleted_at: datetime | None = None

    observed_at: datetime
    raw_payload_ref: str


class WorkItemComment(BaseModel):
    work_item_comment_id: str
    work_item_id: str
    author_source_account_id: str | None = None
    body: str | None = None

    created_at: datetime | None = None
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    is_deleted: bool = False

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

### Broad Comment Classification

```python
class WorkItemCommentKind(str, Enum):
    CLARIFICATION = "clarification"
    TECHNICAL_EXPLANATION = "technical_explanation"
    DECISION = "decision"
    PROGRESS_UPDATE = "progress_update"
    HANDOFF = "handoff"
    BLOCKER = "blocker"
    LINK_OR_REFERENCE = "link_or_reference"
    ADMINISTRATIVE = "administrative"
    UNKNOWN = "unknown"


class WorkItemCommentClassification(BaseModel):
    classification_id: str
    work_item_comment_id: str
    comment_kinds: list[WorkItemCommentKind] = Field(default_factory=list)

    method: str
    classifier_version: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Multiple kinds and `UNKNOWN` are allowed. Classification remains inspectable and is
not inferred from comment length.

### Supported Use

Comments may support:

- an account participated in recorded work discussion;
- an account stated a requirement, decision, constraint, blocker, or explanation;
- a recorded handoff or progress update occurred;
- a work item referenced another source record;
- repeated technical discussion occurred in a domain.

Technical content remains attributed to its author until corroborated. Repeated
specific explanations may suggest familiarity, but comment activity alone does not
establish expertise.

### Cannot Establish

Comments alone cannot establish:

- that a technical statement is correct;
- that the commenter performed the work;
- expertise, ownership, or decision authority;
- that a handoff succeeded;
- that a blocker was resolved;
- that mentions imply participation;
- that comment length or frequency indicates importance.

### Canonical Failure Cases

1. A long comment copies text from another document.
2. A short comment contains the key domain constraint.
3. An administrative bot posts progress updates.
4. A person is mentioned but never participates.
5. A stale comment contradicts the eventual implementation.
6. A deleted comment leaves only metadata.
7. Restricted comments contain the actual requirement.
8. A handoff note does not produce a successful handoff.

### Accepted Comment Decisions

1. Keep work-item comments lightweight.
2. Preserve author, body, edit, deletion, and source provenance.
3. Use only broad, inspectable comment classifications.
4. Treat technical statements as attributed claims.
5. Do not infer expertise from comment count, length, mentions, or tone.
6. Use comments mainly to clarify work context and discover cross-source links.
7. Abstain from content interpretation when the body is inaccessible.

## Next Object

The next object is acceptance or sign-off: limited evidence that someone evaluated
whether work met stated expectations.

## Dependency And Relationship

### Purpose And Scope

Relationships connect a work item to the small set of records that materially enrich
expertise and knowledge-risk analysis.

The initial model retains:

- parent or child context needed to avoid false attribution;
- duplicate or superseding links needed to avoid double-counting;
- blocking links that explain dependencies or specialized handoffs;
- links to pull requests, incidents, documents, systems, components, deployments,
  and releases that enable multi-source corroboration.

SuccessionAI is not attempting to reproduce the full Jira or Linear relationship
model. Generic planning relationships that do not improve evidence interpretation
may remain only in the raw payload.

### Retrieval

Useful relationships may come from:

- structured Jira or Linear relationship fields;
- GitHub and work-management integrations;
- incident-created follow-up links;
- component or system fields;
- explicit identifiers in ticket, PR, incident, or document text;
- human-confirmed mappings.

Structured source links and text-extracted references remain distinguishable.

### Layer 1: Faithful Source Record

```python
class SourceWorkItemRelationshipRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    source_external_work_item_id: str

    target_external_id: str
    target_type_reported: str | None = None
    relationship_reported: str

    created_by_external_actor_id: str | None = None
    source_created_at: datetime | None = None
    observed_at: datetime
    raw_payload_ref: str
```

Source vocabulary is preserved because relationship labels are configurable and may
carry organization-specific meaning.

### Layer 2: Minimal Normalized Relationship

```python
class WorkItemRelationKind(str, Enum):
    PARENT_OR_CHILD = "parent_or_child"
    BLOCKS_OR_DEPENDS_ON = "blocks_or_depends_on"
    DUPLICATES = "duplicates"
    SUPERSEDES = "supersedes"
    IMPLEMENTED_BY = "implemented_by"
    FOLLOW_UP_TO = "follow_up_to"
    DOCUMENTED_BY = "documented_by"
    AFFECTS = "affects"
    INCLUDED_IN = "included_in"
    RELATED_TO = "related_to"
    UNKNOWN = "unknown"


class WorkItemRelationTargetType(str, Enum):
    WORK_ITEM = "work_item"
    PULL_REQUEST = "pull_request"
    COMMIT = "commit"
    INCIDENT = "incident"
    DOCUMENT = "document"
    SYSTEM = "system"
    COMPONENT = "component"
    DEPLOYMENT = "deployment"
    RELEASE = "release"
    UNKNOWN = "unknown"


class RelationshipOrigin(str, Enum):
    SOURCE_STRUCTURED = "source_structured"
    SOURCE_INTEGRATION = "source_integration"
    TEXT_REFERENCE = "text_reference"
    CROSS_SOURCE_REFERENCE = "cross_source_reference"
    HUMAN_CONFIRMED = "human_confirmed"


class WorkItemRelation(BaseModel):
    work_item_relation_id: str
    work_item_id: str

    target_type: WorkItemRelationTargetType
    target_id: str
    relation_kind: WorkItemRelationKind
    origin: RelationshipOrigin
    resolution_status: RelationshipResolutionStatus

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

Direction-specific source vocabulary remains available on the faithful record. The
normalized categories stay broad because their purpose is evidence assembly, not
project-management workflow reproduction.

### Inclusion Test

Normalize a relationship only when it helps answer at least one of these questions:

- What domain, system, or component did this work concern?
- What implementation or operational action corroborates the work item?
- Did another record supersede or duplicate this evidence?
- Was the work prompted by an incident or followed by deployment?
- Does the relationship explain a dependency, handoff, or concentrated capability?

Otherwise, retain the source data in `raw_payload_ref` without creating a normalized
relationship.

### Supported Use

Relationships may support:

- connecting expected work to implementation, review, documentation, incidents, or
  operational outcomes;
- locating work within a system or component;
- preventing duplicate and superseded work items from inflating activity;
- explaining why work moved between people or waited on specialized input;
- constructing corroborated evidence chains across source families.

For example, an assignment plus a linked pull request and incident response is more
informative than assignment alone.

### Cannot Establish

A relationship alone cannot establish:

- that the link is correct or current;
- that a pull request fully implemented a ticket;
- that a blocker truly prevented progress;
- that a duplicate contains no unique evidence;
- that an incident follow-up resolved the underlying risk;
- that a document is accurate;
- ownership, expertise, or successful outcome.

### Canonical Failure Cases

1. A pull request claims to fix a ticket but addresses only part of it.
2. A ticket links to abandoned and merged pull requests.
3. Duplicate tickets contain different useful evidence.
4. A stale blocker remains after the dependency is resolved.
5. An epic relationship causes credit to flow to the epic assignee.
6. A textual identifier resolves to the wrong project.
7. A superseded ticket contains unique technical discussion.
8. A component link is stale after reorganization.
9. A deployment contains the change behind a disabled feature flag.
10. Restricted access exposes only one side of a relationship.

### Accepted Relationship Decisions

1. Model only relationships that enrich expertise or knowledge-risk context.
2. Preserve source-specific relationship vocabulary in the faithful layer.
3. Use broad normalized categories rather than reproducing Jira workflows.
4. Distinguish structured, integrated, textual, cross-source, and human-confirmed
   links.
5. Keep duplicate and superseded records; link rather than discard them.
6. Do not propagate contribution credit through hierarchy.
7. Preserve provenance, contradictions, direction, and access limitations.
8. Treat relationships as corroborating context, not outcome proof.

## Next Object

The final object is iteration, sprint, or milestone context. It should remain minimal
because scheduling containers add little direct expertise evidence.

## Acceptance Or Sign-Off

### Purpose And Scope

Acceptance records that a person, team, or automation performed a recorded approval,
verification, or sign-off action against a work item.

Useful examples include:

- product or stakeholder acceptance;
- quality-assurance verification;
- security or compliance sign-off;
- operational readiness approval;
- explicit acceptance-criteria confirmation.

This is supporting evidence that evaluation occurred. It is not automatic proof that
the work was correct, complete, deployed, or understood deeply by the approver.

Code-review approvals remain in Software Development. This object covers acceptance
recorded in the work-management process.

### Retrieval

Acceptance may come from:

- structured approval or verification fields;
- workflow transitions with explicit approval semantics;
- acceptance-criteria checklists;
- dedicated sign-off comments;
- linked test or validation records;
- organization-specific custom fields.

Generic movement to a completed status is not enough to create an acceptance record.

### Minimal Model

```python
class AcceptanceKind(str, Enum):
    PRODUCT = "product"
    QUALITY_ASSURANCE = "quality_assurance"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    OPERATIONAL_READINESS = "operational_readiness"
    ACCEPTANCE_CRITERIA = "acceptance_criteria"
    OTHER = "other"
    UNKNOWN = "unknown"


class AcceptanceOutcome(str, Enum):
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CONDITIONAL = "conditional"
    REVOKED = "revoked"
    UNKNOWN = "unknown"


class WorkItemAcceptance(BaseModel):
    acceptance_id: str
    work_item_id: str

    acceptance_kind: AcceptanceKind
    outcome: AcceptanceOutcome
    evaluator_source_account_id: str | None = None
    evaluator_team_id: str | None = None

    criteria_text: list[str] = Field(default_factory=list)
    notes: str | None = None

    occurred_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

The faithful source record should preserve the original field, comment, checklist,
or transition from which this normalized record was derived.

### Supported Use

Acceptance may support:

- a recorded evaluation occurred;
- an account or team accepted, rejected, conditionally accepted, or revoked work;
- specific visible criteria were considered;
- a person participated in product, quality, security, compliance, or operational
  evaluation;
- work received corroborating evaluation beyond assignment and completion.

Repeated substantive sign-off in a domain may suggest trusted evaluative
responsibility. It does not independently establish expertise.

### Cannot Establish

Acceptance alone cannot establish:

- that the work was objectively correct;
- that every requirement was tested;
- deployment or production success;
- implementation authorship;
- complete understanding by the evaluator;
- expertise or ownership;
- that a checklist was performed rather than administratively checked;
- that acceptance remained valid after later changes.

### Canonical Failure Cases

1. An approver signs off administratively without inspection.
2. Acceptance occurs before later implementation changes.
3. A team name is recorded without the actual evaluator.
4. Automation marks acceptance after tests pass.
5. A conditional approval is interpreted as complete acceptance.
6. Acceptance is later revoked or the ticket reopened.
7. Visible criteria omit an important hidden requirement.
8. The implementer self-approves because no independent evaluator is available.

### Accepted Acceptance Decisions

1. Create acceptance records only from explicit approval or verification evidence.
2. Do not infer acceptance from completed status alone.
3. Preserve evaluator, evaluation kind, outcome, visible criteria, and time.
4. Distinguish human, team, automated, and unresolved evaluators.
5. Preserve conditional, rejected, and revoked outcomes.
6. Treat acceptance as corroborating evaluation, not correctness proof.
7. Keep code review approvals in Software Development.

## Next Object

The final object is lightweight iteration, sprint, or milestone context.

## Iteration, Sprint, Or Milestone

### Purpose And Scope

Planning containers provide limited temporal and organizational grouping:

- when work was planned;
- which work items were grouped into the same delivery period or objective;
- whether a work item moved into a later planning period;
- whether work was associated with a named milestone.

They are not expertise, productivity, reliability, or performance evidence.

### Minimal Model

```python
class PlanningContainerKind(str, Enum):
    ITERATION = "iteration"
    SPRINT = "sprint"
    MILESTONE = "milestone"
    CYCLE = "cycle"
    UNKNOWN = "unknown"


class PlanningContainer(BaseModel):
    planning_container_id: str
    workspace_id: str

    container_kind: PlanningContainerKind
    external_container_id: str
    name: str

    starts_at: datetime | None = None
    ends_at: datetime | None = None
    completed_at: datetime | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)


class WorkItemPlanningAssignment(BaseModel):
    planning_assignment_id: str
    work_item_id: str
    planning_container_id: str

    assigned_at: datetime | None = None
    removed_at: datetime | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Source-specific records should preserve the original sprint, cycle, iteration, or
milestone fields and timestamps from Jira or Linear.

### Supported Use

Planning context may support:

- a work item was planned during an observed period;
- several items were grouped in one planning container;
- an item moved between planning periods;
- a work item was associated with a named milestone.

This context may help interpret timing and related work. It should not produce a
person-level expertise signal.

### Cannot Establish

Planning context cannot establish:

- who performed the work;
- expertise or understanding;
- work difficulty;
- productivity, reliability, or team performance;
- why an item moved between periods;
- actual work start or completion time;
- whether a milestone shipped.

Velocity, story-point completion, sprint participation, capacity, and rollover rates
are excluded from expertise and knowledge-risk inference.

### Accepted Planning Decisions

1. Keep planning containers and work-item assignments lightweight.
2. Use them only for temporal and organizational grouping.
3. Do not model velocity, capacity, or planning-performance analytics.
4. Do not infer person-level expertise or reliability from sprint participation or
   rollover.
5. Preserve source-specific planning vocabulary in the faithful layer.

## Work Management Summary

The initial Work Management model now covers:

1. Workspaces and projects as minimal source containers
2. Work items as organizational statements of intended work
3. Assignment history as expected-responsibility and routing context
4. Status transitions as workflow lifecycle context
5. Comments as lightweight attributed discussion
6. Relationships as selective cross-source evidence links
7. Acceptance as explicit recorded evaluation
8. Planning containers as minimal temporal grouping

The governing boundary remains:

> Work-management data explains what the organization intended, assigned, discussed,
> linked, and accepted. Claims about performed work, expertise, ownership, successful
> outcomes, and knowledge risk require corroboration from other source families.
