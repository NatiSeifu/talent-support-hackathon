# Structured Evidence Record Envelope

> Status: Initial contract complete.

## Purpose

The envelope gives every source family a common way to express a narrow proposition
without flattening source semantics or jumping directly to expertise and risk.

## Core Model

```python
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class SourceFamily(str, Enum):
    IDENTITY_AND_ORGANIZATION = "identity_and_organization"
    SOFTWARE_DEVELOPMENT = "software_development"
    WORK_MANAGEMENT = "work_management"
    KNOWLEDGE_ARTIFACTS = "knowledge_artifacts"
    PRODUCTION_OPERATIONS = "production_operations"
    OWNERSHIP_AND_ARCHITECTURE = "ownership_and_architecture"
    BUSINESS_IMPACT = "business_impact"
    COMMUNICATION_AND_COLLABORATION = "communication_and_collaboration"
    KNOWLEDGE_VALIDATION = "knowledge_validation"
    CANDIDATE_AND_SUCCESSOR = "candidate_and_successor"


class EntityKind(str, Enum):
    PERSON = "person"
    TEAM = "team"
    SOURCE_ACCOUNT = "source_account"
    TECHNICAL_ENTITY = "technical_entity"
    CAPABILITY = "capability"
    REPOSITORY = "repository"
    ARTIFACT = "artifact"
    WORK_ITEM = "work_item"
    INCIDENT = "incident"
    DEPLOYMENT = "deployment"
    BUSINESS_SUBJECT = "business_subject"
    CANDIDATE = "candidate"
    OTHER = "other"
    UNRESOLVED = "unresolved"


class EntityRef(BaseModel):
    entity_kind: EntityKind
    entity_id: str
    display_label: str | None = None


class AssertionMode(str, Enum):
    SOURCE_REPORTED = "source_reported"
    ATTRIBUTED_STATEMENT = "attributed_statement"
    DERIVED_OBSERVATION = "derived_observation"
    OBSERVED_PERFORMANCE = "observed_performance"
    ASSESSMENT = "assessment"


class EvidencePolarity(str, Enum):
    SUPPORTS = "supports"
    CONTRADICTS = "contradicts"
    CONTEXT_ONLY = "context_only"


class EvidenceResolutionState(str, Enum):
    ATTRIBUTED = "attributed"
    SUPPORTED = "supported"
    PARTIALLY_SUPPORTED = "partially_supported"
    CONTESTED = "contested"
    CONTRADICTED = "contradicted"
    SUPERSEDED = "superseded"
    UNRESOLVED = "unresolved"
    ABSTAINED = "abstained"


class EvidenceTime(BaseModel):
    occurred_at: datetime | None = None
    valid_from: datetime | None = None
    valid_until: datetime | None = None
    source_created_at: datetime | None = None
    source_updated_at: datetime | None = None
    observed_at: datetime


class MethodRef(BaseModel):
    method_kind: str
    method_name: str
    method_version: str | None = None
    configuration_ref: str | None = None


class ObservabilityLimitation(BaseModel):
    limitation_kind: str
    description: str
    affected_source_family: SourceFamily | None = None
    affected_scope_ref: str | None = None


class EvidenceRecord(BaseModel):
    evidence_id: str
    proposition_type: str
    proposition_text: str

    subject: EntityRef
    object: EntityRef | None = None
    scope_refs: list[EntityRef] = Field(default_factory=list)

    assertion_mode: AssertionMode
    polarity: EvidencePolarity
    resolution_state: EvidenceResolutionState

    source_family: SourceFamily
    source_record_ids: list[str] = Field(default_factory=list)
    source_uri_refs: list[str] = Field(default_factory=list)

    attributed_actor: EntityRef | None = None
    time: EvidenceTime

    supporting_evidence_ids: list[str] = Field(default_factory=list)
    contradicting_evidence_ids: list[str] = Field(default_factory=list)
    supersedes_evidence_ids: list[str] = Field(default_factory=list)

    method: MethodRef | None = None
    observability_limitations: list[ObservabilityLimitation] = Field(
        default_factory=list
    )

    created_at: datetime
```

## Claim Record

Broader conclusions remain separate from evidence:

```python
class ClaimKind(str, Enum):
    EXPOSURE = "exposure"
    IMPLEMENTATION_EXPERIENCE = "implementation_experience"
    TECHNICAL_JUDGMENT = "technical_judgment"
    OPERATIONAL_CAPABILITY = "operational_capability"
    EXPERTISE = "expertise"
    OBSERVED_STEWARDSHIP = "observed_stewardship"
    KNOWLEDGE_CONCENTRATION = "knowledge_concentration"
    DOCUMENTATION_GAP = "documentation_gap"
    TRANSFERABILITY = "transferability"
    BUSINESS_CONSEQUENCE = "business_consequence"
    KNOWLEDGE_LOSS_CONCERN = "knowledge_loss_concern"
    CANDIDATE_GAP_COVERAGE = "candidate_gap_coverage"
    OTHER = "other"


class ClaimRecord(BaseModel):
    claim_id: str
    claim_kind: ClaimKind
    claim_text: str
    subject: EntityRef
    object: EntityRef | None = None
    resolution_state: EvidenceResolutionState

    supporting_evidence_ids: list[str] = Field(default_factory=list)
    contradicting_evidence_ids: list[str] = Field(default_factory=list)
    prerequisite_claim_ids: list[str] = Field(default_factory=list)
    observability_limitations: list[ObservabilityLimitation] = Field(
        default_factory=list
    )

    assessment_method: MethodRef
    assessed_at: datetime
```

## Invariants

1. Every evidence record cites at least one source record.
2. `SOURCE_REPORTED` and `ATTRIBUTED_STATEMENT` preserve source-qualified wording.
3. Assessments cannot be used as their own supporting evidence.
4. Supporting and contradicting IDs must refer to independently inspectable records.
5. Time applicability is explicit; current state is not projected backward.
6. Missing or inaccessible evidence is recorded as a limitation, not contradiction.
7. No universal confidence percentage or source weight appears in the envelope.
8. Capability, expertise, concentration, transferability, and risk remain distinct
   claim kinds.

## Example

```python
EvidenceRecord(
    evidence_id="ev_review_482",
    proposition_type="substantive_review_recorded",
    proposition_text=(
        "GitHub recorded that Mike submitted a substantive review concerning "
        "token refresh behavior."
    ),
    subject=EntityRef(entity_kind="person", entity_id="person_mike"),
    object=EntityRef(entity_kind="technical_entity", entity_id="auth_refresh"),
    assertion_mode="derived_observation",
    polarity="supports",
    resolution_state="supported",
    source_family="software_development",
    source_record_ids=["gh_review_482"],
    time=EvidenceTime(
        occurred_at="2026-03-04T18:00:00Z",
        observed_at="2026-06-11T18:00:00Z",
    ),
    method=MethodRef(
        method_kind="classifier",
        method_name="review_substance",
        method_version="v1",
    ),
    created_at="2026-06-11T18:05:00Z",
)
```

This supports technical evaluation exposure. It does not independently establish
implementation capability or expertise.

