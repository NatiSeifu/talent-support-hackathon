# Knowledge Artifacts Schema

> Status: Initial model complete.

## Purpose

Knowledge-artifact data records explicit organizational knowledge in documents such
as wiki pages, design documents, architecture decisions, runbooks, playbooks,
checklists, specifications, and troubleshooting guides.

This source family helps SuccessionAI determine:

- what knowledge was explicitly recorded;
- what a document stated about a system, decision, procedure, or risk;
- who created, revised, reviewed, or approved the artifact;
- how the artifact changed over time;
- which systems, incidents, work items, or repositories it concerns;
- whether the source marked it draft, active, deprecated, or archived.

Artifact existence does not prove correctness, freshness, completeness,
discoverability, or usability. Actual application by another person belongs to
Knowledge Validation.

## Objects

1. Container
2. Artifact
3. Revision and contribution
4. Extracted content proposition
5. Review and approval
6. Cross-source relationship
7. Access and discoverability observation

## Retrieval

Knowledge artifacts may be retrieved from:

- Confluence APIs and webhooks;
- Google Drive and Docs APIs;
- Microsoft SharePoint or OneDrive APIs;
- Notion APIs;
- Git repositories containing Markdown, ADRs, runbooks, or specifications;
- internal wiki exports;
- document-management exports;
- synthetic JSON for the demo.

Initial synchronization should preserve visible artifact metadata, current content,
available revision history, permissions, and links. Incremental updates should be
reconciled periodically because webhook delivery and revision-history access may be
incomplete.

The ingestion scope must record inaccessible spaces, drives, folders, pages,
revisions, comments, or attachments.

## Container

Containers provide source scope and hierarchy, such as a Confluence space, Drive,
SharePoint site, wiki collection, or repository documentation directory.

```python
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ArtifactContainerKind(str, Enum):
    WIKI_SPACE = "wiki_space"
    DRIVE = "drive"
    FOLDER = "folder"
    SHAREPOINT_SITE = "sharepoint_site"
    REPOSITORY_DOCS = "repository_docs"
    COLLECTION = "collection"
    UNKNOWN = "unknown"


class KnowledgeArtifactContainer(BaseModel):
    container_id: str
    source_system: str
    source_tenant_id: str
    external_container_id: str

    container_kind: ArtifactContainerKind
    name: str
    parent_container_id: str | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Containers establish location and scope only. Container membership does not imply
artifact quality, ownership, or business importance.

## Artifact

### Layer 1: Faithful Source Record

```python
class SourceKnowledgeArtifactRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str

    external_container_id: str | None = None
    external_artifact_id: str
    parent_external_artifact_id: str | None = None

    title: str
    body_ref: str | None = None
    content_format_reported: str | None = None
    artifact_type_reported: str | None = None
    lifecycle_reported: str | None = None

    creator_external_actor_id: str | None = None
    current_version_external_id: str | None = None

    source_created_at: datetime | None = None
    source_updated_at: datetime | None = None
    source_archived_at: datetime | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

The body is stored or referenced according to access and retention policy. The
faithful record preserves the source's type and lifecycle vocabulary.

### Layer 2: Normalized Artifact

```python
class KnowledgeArtifactType(str, Enum):
    WIKI_PAGE = "wiki_page"
    DESIGN_DOCUMENT = "design_document"
    ARCHITECTURE_DECISION = "architecture_decision"
    RUNBOOK = "runbook"
    PLAYBOOK = "playbook"
    CHECKLIST = "checklist"
    PRODUCT_SPECIFICATION = "product_specification"
    PROJECT_PLAN = "project_plan"
    TROUBLESHOOTING_GUIDE = "troubleshooting_guide"
    REFERENCE = "reference"
    OTHER = "other"
    UNKNOWN = "unknown"


class ArtifactLifecycle(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"
    UNKNOWN = "unknown"


class KnowledgeArtifact(BaseModel):
    knowledge_artifact_id: str
    container_id: str | None = None
    external_artifact_id: str

    title: str
    artifact_type: KnowledgeArtifactType
    lifecycle: ArtifactLifecycle
    current_revision_id: str | None = None

    creator_source_account_id: str | None = None
    parent_artifact_id: str | None = None

    created_at: datetime | None = None
    updated_at: datetime | None = None
    archived_at: datetime | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Artifact type may be source-declared, path-derived, template-derived, or classified.
The method and version should remain inspectable when it is not source-declared.

### Artifact-Type Interpretation

Artifact types carry different potential value:

- **Architecture decisions** may record rationale, alternatives, and constraints.
- **Design documents** may record intended behavior and tradeoffs.
- **Runbooks and playbooks** may record operational procedures.
- **Troubleshooting guides** may record symptoms, diagnoses, and mitigations.
- **Specifications** may record requirements and expected behavior.
- **Wiki pages and references** may provide broad context.
- **Project plans** mainly record intended work and coordination.

Type alone does not determine reliability. A stale runbook may be less useful than a
recently validated wiki page.

## Revision And Contribution

### Faithful Revision Record

```python
class SourceArtifactRevisionRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_artifact_id: str
    external_revision_id: str

    revision_number_reported: int | None = None
    editor_external_actor_id: str | None = None
    body_ref: str | None = None
    change_summary_reported: str | None = None

    source_created_at: datetime | None = None
    observed_at: datetime
    raw_payload_ref: str
```

### Normalized Revision

```python
class ArtifactRevision(BaseModel):
    artifact_revision_id: str
    knowledge_artifact_id: str
    external_revision_id: str

    editor_source_account_id: str | None = None
    revision_number_reported: int | None = None
    body_ref: str | None = None
    change_summary: str | None = None

    created_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Revision history establishes source-attributed editing activity. It does not prove
that the editor authored every unchanged section, understood the entire artifact, or
made a substantive contribution.

### Contribution Classification

```python
class ArtifactContributionKind(str, Enum):
    CREATED = "created"
    SUBSTANTIVE_REVISION = "substantive_revision"
    LIMITED_REVISION = "limited_revision"
    MECHANICAL_EDIT = "mechanical_edit"
    REVIEWED = "reviewed"
    APPROVED = "approved"
    COMMENTED = "commented"
    UNKNOWN = "unknown"


class ArtifactContribution(BaseModel):
    artifact_contribution_id: str
    knowledge_artifact_id: str
    artifact_revision_id: str | None = None
    contributor_source_account_id: str
    contribution_kind: ArtifactContributionKind

    occurred_at: datetime | None = None
    classification_method: str | None = None
    classifier_version: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Substantive versus mechanical classification should remain broad. Revision count,
character count, and recency are descriptive context, not measures of expertise.

## Extracted Content Proposition

Artifacts may contain explicit claims, decisions, procedures, constraints, and known
failure modes. These should be represented as attributed propositions rather than
accepted truth.

```python
class ArtifactPropositionKind(str, Enum):
    SYSTEM_DESCRIPTION = "system_description"
    PROCEDURE = "procedure"
    DECISION = "decision"
    DECISION_RATIONALE = "decision_rationale"
    CONSTRAINT = "constraint"
    DEPENDENCY = "dependency"
    REQUIREMENT = "requirement"
    FAILURE_MODE = "failure_mode"
    DIAGNOSTIC_STEP = "diagnostic_step"
    MITIGATION = "mitigation"
    OWNERSHIP_STATEMENT = "ownership_statement"
    KNOWN_GAP = "known_gap"
    OTHER = "other"
    UNKNOWN = "unknown"


class PropositionResolutionStatus(str, Enum):
    ATTRIBUTED = "attributed"
    CORROBORATED = "corroborated"
    CONTRADICTED = "contradicted"
    CONTESTED = "contested"
    SUPERSEDED = "superseded"
    UNRESOLVED = "unresolved"


class ArtifactContentProposition(BaseModel):
    artifact_proposition_id: str
    knowledge_artifact_id: str
    artifact_revision_id: str

    proposition_kind: ArtifactPropositionKind
    proposition_text: str
    source_locator: str | None = None
    resolution_status: PropositionResolutionStatus

    subject_system_id: str | None = None
    subject_component_id: str | None = None

    extraction_method: str
    extractor_version: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

`source_locator` identifies the relevant section, block, heading, or paragraph.
Extracted propositions must remain inspectable against the source revision.

An ownership statement inside a document is still a document-attributed declaration.
Formal ownership semantics belong to Ownership and Architecture.

## Review And Approval

Some systems provide explicit review, verification, or approval actions. These can
support that someone evaluated an artifact.

```python
class ArtifactReviewKind(str, Enum):
    TECHNICAL = "technical"
    OPERATIONAL = "operational"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    EDITORIAL = "editorial"
    UNKNOWN = "unknown"


class ArtifactReviewOutcome(str, Enum):
    APPROVED = "approved"
    CHANGES_REQUESTED = "changes_requested"
    COMMENTED = "commented"
    REJECTED = "rejected"
    REVOKED = "revoked"
    UNKNOWN = "unknown"


class ArtifactReview(BaseModel):
    artifact_review_id: str
    knowledge_artifact_id: str
    artifact_revision_id: str | None = None

    reviewer_source_account_id: str | None = None
    reviewer_team_id: str | None = None
    review_kind: ArtifactReviewKind
    outcome: ArtifactReviewOutcome
    notes: str | None = None

    occurred_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Approval does not prove correctness, completeness, or usability. It may be
procedural, stale, self-approved, or invalidated by later revisions.

Comments that contain substantive technical propositions may be retained as
attributed source records, but the initial model does not require a detailed comment
thread graph.

## Cross-Source Relationship

Artifacts become more useful when linked to the systems and events they describe.

```python
class ArtifactRelationTargetType(str, Enum):
    SYSTEM = "system"
    COMPONENT = "component"
    REPOSITORY = "repository"
    WORK_ITEM = "work_item"
    INCIDENT = "incident"
    DEPLOYMENT = "deployment"
    RELEASE = "release"
    PERSON = "person"
    OTHER_ARTIFACT = "other_artifact"
    UNKNOWN = "unknown"


class ArtifactRelationKind(str, Enum):
    DESCRIBES = "describes"
    DOCUMENTS_PROCEDURE_FOR = "documents_procedure_for"
    RECORDS_DECISION_FOR = "records_decision_for"
    SPECIFIES = "specifies"
    RESPONDS_TO = "responds_to"
    CREATED_FROM = "created_from"
    SUPERSEDES = "supersedes"
    REFERENCES = "references"
    OWNERSHIP_DECLARATION_FOR = "ownership_declaration_for"
    UNKNOWN = "unknown"


class ArtifactRelation(BaseModel):
    artifact_relation_id: str
    knowledge_artifact_id: str

    target_type: ArtifactRelationTargetType
    target_id: str
    relation_kind: ArtifactRelationKind
    origin: RelationshipOrigin
    resolution_status: RelationshipResolutionStatus

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

Explicit source links, integrations, text references, and human-confirmed mappings
remain distinguishable. A title or path match alone should not confirm a system
relationship.

## Access And Discoverability Observation

Access metadata helps describe observability and potential discoverability. It does
not establish comprehension or practical usability.

```python
class ArtifactAccessLevel(str, Enum):
    ORGANIZATION = "organization"
    TEAM = "team"
    RESTRICTED = "restricted"
    PRIVATE = "private"
    PUBLIC = "public"
    UNKNOWN = "unknown"


class ArtifactAccessObservation(BaseModel):
    access_observation_id: str
    knowledge_artifact_id: str

    access_level: ArtifactAccessLevel
    visible_to_team_ids: list[str] = Field(default_factory=list)
    content_accessible_to_succession_ai: bool
    revision_history_accessible: bool | None = None

    observed_at: datetime
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Document view history, search rankings, and analytics are optional high-sensitivity
sources. If collected, they establish access or retrieval events only. A view does
not prove reading, comprehension, or successful application.

## Freshness And Validity

Freshness is claim-specific. A document's most recent edit time is not enough to
determine whether its technical content remains valid.

Relevant freshness evidence may include:

- the revision date of the specific proposition;
- later revisions that supersede it;
- explicit lifecycle or deprecation status;
- links to current or retired systems;
- recent incidents, deployments, or code changes that corroborate or contradict it;
- explicit review or validation against a current environment.

No fixed freshness threshold is defined. The system should preserve:

- artifact creation and update time;
- revision time;
- review time;
- source observation time;
- superseding and deprecation relationships;
- the time of corroborating or contradicting evidence.

## Supported Propositions

Knowledge-artifact records may support:

- an artifact and revision existed within the observed scope;
- the source attributed creation, revision, review, or approval to an account;
- a particular revision stated a procedure, decision, requirement, constraint,
  failure mode, mitigation, ownership declaration, or known gap;
- the artifact was marked draft, active, deprecated, or archived;
- the artifact was linked to a system, incident, work item, repository, deployment,
  release, or another artifact;
- explicit organizational knowledge had been recorded;
- recorded knowledge changed, conflicted, or was superseded over time.

Repeated substantive artifact contributions may support documentation experience or
recorded familiarity with a domain when corroborated.

## Cannot Establish

Knowledge artifacts alone cannot establish:

- that content is correct, current, complete, or internally consistent;
- that the creator or editor is the subject-matter expert;
- that reviewers understood or tested the content;
- that a reader can discover, comprehend, or apply it;
- that a runbook succeeds in a real incident;
- that an architecture decision still governs the system;
- that an ownership statement reflects current formal ownership;
- that missing documentation means knowledge does not exist;
- that recent editing means substantive freshness;
- that document views imply knowledge transfer.

## Privacy And Access

Artifacts may contain:

- credentials or secrets;
- customer or employee information;
- security vulnerabilities;
- regulated or legally privileged material;
- restricted architecture and incident details;
- links to more sensitive sources.

Connectors must preserve source permissions, deletion signals, and redactions.
SuccessionAI may retain metadata that an inaccessible artifact exists, but it must
abstain from extracting or grading inaccessible content.

The system should not broaden access by exposing artifact content or extracted
propositions to users who lack source authorization.

## Canonical Failure Cases

1. A detailed runbook is stale and fails against the current system.
2. A short wiki page is current and operationally useful.
3. A document is recently edited only to fix formatting.
4. A creator copied content written by another person.
5. A frequent editor changes links but not technical substance.
6. An approved design document describes a system that was never built.
7. An ADR is superseded without an explicit deprecation marker.
8. Two active documents provide contradictory procedures.
9. A runbook omits the critical undocumented recovery step.
10. A document names an owner whose team changed months earlier.
11. A private page contains the only current procedure.
12. A document is widely viewed but not understood.
13. A procedure works in staging but fails in production.
14. A generated reference page appears to have a human author.
15. A deleted page remains referenced by tickets and incidents.
16. A document title implies one system but its content describes another.
17. A viewer lacks access to an attachment containing the essential detail.
18. A high-quality document exists but cannot be found through normal search.

## Accepted Decisions

1. Separate artifact existence from correctness, freshness, completeness,
   discoverability, and usability.
2. Preserve source-specific artifact type and lifecycle vocabulary.
3. Model containers only as source scope and hierarchy.
4. Preserve revision-level provenance and source-attributed contributors.
5. Treat revision counts and edit volume as descriptive metadata, not expertise.
6. Extract narrow content propositions with exact revision and source location.
7. Keep extracted content attributed until corroborated.
8. Model review and approval as recorded evaluation, not correctness proof.
9. Link artifacts to systems and events through explicit, provenance-bearing
   relationships.
10. Treat access and view telemetry as observability or retrieval evidence only.
11. Use claim-specific freshness evidence rather than a fixed age threshold.
12. Preserve contradictions, supersession, inaccessible content, and deletion.
13. Keep real usability tests, handoff exercises, and successor demonstrations in
   Knowledge Validation.
14. Give richer treatment to runbooks, architecture decisions, design documents,
   and troubleshooting guides while keeping generic planning artifacts lighter.

## Knowledge Artifacts Summary

The initial model covers:

1. Containers as source scope
2. Artifacts and lifecycle
3. Revisions and attributed contribution
4. Attributed content propositions
5. Review and approval
6. Cross-source relationships
7. Access and discoverability observations

The governing boundary remains:

> Knowledge artifacts establish what explicit knowledge was recorded and what a
> particular revision stated. Whether that knowledge is true, current, sufficient,
> discoverable, transferable, or usable requires corroboration and validation.

