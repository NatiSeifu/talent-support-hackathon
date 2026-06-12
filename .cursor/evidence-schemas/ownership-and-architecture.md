# Ownership And Architecture Schema

> Status: Initial model complete.

## Purpose

Ownership and architecture data records what the organization declares about:

- which systems, services, components, libraries, data stores, and interfaces exist;
- which teams or people hold specified formal responsibilities for them;
- which repositories or repository paths implement, configure, document, or support
  them;
- how technical entities are related or depend on one another;
- whether an entity is planned, active, deprecated, retired, or otherwise classified
  by its source;
- which knowledge artifacts record architecture decisions, designs, or rationale.

This source family gives expertise and knowledge-risk analysis a defensible technical
scope. It can locate activity within a declared component, identify the formal
accountability context, and show technical relationships across which knowledge may
be needed.

It does not establish that a declared owner actually performs stewardship, that an
architecture map matches runtime behavior, that a dependency is business-critical,
or that any person has expertise. Those conclusions require evidence from software
development, production operations, business impact, knowledge artifacts, and
knowledge validation.

## Governing Boundaries

SuccessionAI must keep these concepts separate:

```text
Formal ownership:
The organization declared a team or person responsible in a specified role.

Observed stewardship:
Recorded implementation, review, maintenance, deployment, or incident-response
behavior suggests that an actor has cared for an entity.

Expertise:
Evidence supports that a person can understand, judge, or perform relevant work.

Business criticality:
Evidence supports that failure or knowledge loss would materially affect the
organization.
```

A `CODEOWNERS` entry, catalog owner, team charter, or manual assignment supports
formal ownership only within its declared scope and time. It must not be converted
into observed stewardship, expertise, or criticality.

Architecture decisions and design documents remain Knowledge Artifacts. This family
stores only the provenance-bearing link between a technical entity or relationship
and the artifact that records its decision, rationale, constraint, or design.

## Objects

1. Technical entity catalog
2. Declared ownership
3. Repository and path mapping
4. Architecture relationship
5. Lifecycle declaration
6. Architecture decision and artifact link
7. Evidence propositions and contradiction state

## Retrieval

### Preferred Sources

- service catalogs such as Backstage, Cortex, OpsLevel, or an internal catalog;
- `CODEOWNERS` and equivalent repository ownership files at a specific revision;
- organization-maintained system inventories and architecture registries;
- team charters and responsibility matrices;
- manually administered ownership assignments;
- architecture graph or configuration exports;
- synthetic JSON for the demo.

### Supplementary Sources

- repository metadata and manifests;
- infrastructure-as-code and deployment configuration;
- API specifications and schema registries;
- dependency manifests and build metadata;
- architecture diagrams and design documents;
- architecture decision records;
- incident, deployment, and runtime records that corroborate or contradict declared
  relationships.

Supplementary observations must not silently become formal declarations. For
example, a package manifest may report a code dependency, while a service catalog
may declare a service dependency. Both should preserve their source and semantics.

### Collection Requirements

Initial synchronization should retrieve visible current records and available
history. Incremental events should be periodically reconciled because catalog
webhooks, repository events, manual assignments, and ownership-file history may be
incomplete.

For repository-backed declarations, collection must preserve the repository,
revision, path, and file content or raw payload reference used for interpretation.
For systems with mutable current-state APIs, snapshots are required when history is
not available.

Every ingestion must record:

- included and excluded catalogs, repositories, namespaces, and entity kinds;
- permissions and fields available to the connector;
- whether historical versions were accessible;
- parse errors, unresolved references, and unsupported source syntax;
- source-declared completeness, if any;
- observation time and known omissions.

## Shared Source Semantics

The source layer preserves what each connected system stated before normalization.

```python
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class OwnershipArchitectureSourceKind(str, Enum):
    SERVICE_CATALOG = "service_catalog"
    CODEOWNERS = "codeowners"
    TEAM_CHARTER = "team_charter"
    MANUAL_ASSIGNMENT = "manual_assignment"
    ARCHITECTURE_REGISTRY = "architecture_registry"
    REPOSITORY_CONFIGURATION = "repository_configuration"
    INFRASTRUCTURE_CONFIGURATION = "infrastructure_configuration"
    API_REGISTRY = "api_registry"
    KNOWLEDGE_ARTIFACT = "knowledge_artifact"
    OTHER = "other"
    UNKNOWN = "unknown"


class DeclarationAuthority(str, Enum):
    ORGANIZATION_DESIGNATED = "organization_designated"
    SOURCE_NATIVE = "source_native"
    TEAM_MAINTAINED = "team_maintained"
    PERSON_MAINTAINED = "person_maintained"
    GENERATED = "generated"
    UNKNOWN = "unknown"


class SourceDeclarationContext(BaseModel):
    source_kind: OwnershipArchitectureSourceKind
    authority_reported: str | None = None
    normalized_authority: DeclarationAuthority

    source_uri: str | None = None
    source_revision: str | None = None
    source_path: str | None = None

    source_created_at: datetime | None = None
    source_updated_at: datetime | None = None
    effective_from_reported: datetime | None = None
    effective_until_reported: datetime | None = None
    observed_at: datetime

    raw_payload_ref: str
```

`DeclarationAuthority` describes how the organization presents the source. It is not
a truth or quality score. A formally designated catalog may still be stale, and a
team-maintained file may be current.

## Technical Entity Catalog

### Purpose And Scope

A technical entity is a stable internal subject to which ownership, mappings,
relationships, lifecycle, activity, incidents, and knowledge artifacts may be
linked. The initial model is deliberately coarser than a complete configuration
management database or runtime topology.

Systems, services, components, libraries, data stores, interfaces, and infrastructure
units may be represented when they are useful to expertise or knowledge-risk
analysis. Repositories are defined in Software Development and linked rather than
duplicated here.

### Layer 1: Faithful Source Record

```python
class SourceTechnicalEntityRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    declaration_context: SourceDeclarationContext

    external_entity_id: str
    entity_kind_reported: str | None = None
    name_reported: str
    description_reported: str | None = None

    parent_external_entity_id: str | None = None
    domain_reported: str | None = None
    lifecycle_reported: str | None = None

    labels_reported: dict[str, str] = Field(default_factory=dict)
    links_reported: list[str] = Field(default_factory=list)
    deleted_reported: bool | None = None
```

Source-specific entity kind, domain, lifecycle, labels, and hierarchy are retained.
Names are not assumed to be unique or stable.

### Layer 2: Normalized Technical Entity

```python
class TechnicalEntityKind(str, Enum):
    SYSTEM = "system"
    SERVICE = "service"
    COMPONENT = "component"
    LIBRARY = "library"
    DATA_STORE = "data_store"
    INTERFACE = "interface"
    INFRASTRUCTURE = "infrastructure"
    JOB = "job"
    OTHER = "other"
    UNKNOWN = "unknown"


class TechnicalEntity(BaseModel):
    technical_entity_id: str
    entity_kind: TechnicalEntityKind
    canonical_name: str
    description: str | None = None

    parent_technical_entity_id: str | None = None
    source_entity_ids: list[str] = Field(default_factory=list)

    first_observed_at: datetime
    last_observed_at: datetime
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

The parent relationship represents source-supported composition or catalog hierarchy,
not business criticality or technical dependency. A service may belong to a system
and also depend on another service; those are distinct relationships.

### Entity Resolution

Records from different catalogs must not be merged by name alone. Resolution may
use:

- explicit cross-system identifiers;
- source-maintained aliases or links;
- confirmed repository/path mappings;
- confirmed parent and interface relationships;
- human-reviewed mappings.

```python
class EntityResolutionStatus(str, Enum):
    CONFIRMED = "confirmed"
    PROBABLE = "probable"
    AMBIGUOUS = "ambiguous"
    CONTESTED = "contested"
    REJECTED = "rejected"
    UNRESOLVED = "unresolved"


class TechnicalEntitySourceLink(BaseModel):
    entity_source_link_id: str
    technical_entity_id: str
    source_system: str
    source_tenant_id: str
    external_entity_id: str
    resolution_status: EntityResolutionStatus

    resolution_method: str
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
    resolved_at: datetime | None = None
    resolved_by: str | None = None
```

Probable or ambiguous links must remain visible and may require abstention from
entity-level assessments.

### Supported Propositions

Catalog records may support that:

- a source declared a technical entity with a particular name and kind;
- the source placed an entity within a declared parent or domain;
- several source records were resolved to the same internal technical entity;
- an entity was present or absent from a particular observed catalog snapshot.

### Cannot Establish

Catalog presence or metadata alone cannot establish:

- production deployment or runtime existence;
- business criticality;
- technical correctness of the entity model;
- current ownership;
- expertise or stewardship;
- that similarly named entities are identical;
- that an omitted entity does not exist.

## Declared Ownership

### Purpose And Scope

Declared ownership records a source-attributed assignment of a responsibility role
to a team, person, or unresolved principal for a defined subject and time.

Ownership may apply to a technical entity, repository, repository path, interface,
or another explicitly identified technical scope. Team ownership and person
ownership are retained separately. A team declaration must not be expanded into
ownership by every current team member.

### Layer 1: Faithful Source Record

```python
class SourceOwnershipDeclarationRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    declaration_context: SourceDeclarationContext

    external_declaration_id: str | None = None
    subject_type_reported: str
    subject_external_id: str | None = None
    subject_locator_reported: str | None = None

    owner_type_reported: str | None = None
    owner_external_id: str | None = None
    owner_display_reported: str
    ownership_role_reported: str | None = None

    rule_order_reported: int | None = None
    rule_pattern_reported: str | None = None
    is_required_reported: bool | None = None
    notes_reported: str | None = None
    deleted_reported: bool | None = None
```

For `CODEOWNERS`, one record should preserve each parsed rule and owner token at a
specific repository revision. Rule order and exact pattern matter because later
matching rules may override earlier rules. Unmatched, invalid, or unresolved owner
tokens remain source facts rather than being discarded.

### Layer 2: Normalized Ownership Declaration

```python
class OwnershipSubjectType(str, Enum):
    TECHNICAL_ENTITY = "technical_entity"
    REPOSITORY = "repository"
    REPOSITORY_PATH = "repository_path"
    INTERFACE = "interface"
    OTHER = "other"
    UNKNOWN = "unknown"


class OwnerPrincipalType(str, Enum):
    TEAM = "team"
    PERSON = "person"
    EXTERNAL_ORGANIZATION = "external_organization"
    UNRESOLVED = "unresolved"


class OwnershipRole(str, Enum):
    ACCOUNTABLE = "accountable"
    RESPONSIBLE = "responsible"
    TECHNICAL = "technical"
    OPERATIONAL = "operational"
    SECURITY = "security"
    DATA = "data"
    REVIEW = "review"
    MAINTAINER = "maintainer"
    CONTACT = "contact"
    OTHER = "other"
    UNKNOWN = "unknown"


class OwnershipDeclarationStatus(str, Enum):
    ACTIVE = "active"
    SUPERSEDED = "superseded"
    REVOKED = "revoked"
    DELETED = "deleted"
    STALE_SUSPECTED = "stale_suspected"
    CONTESTED = "contested"
    UNKNOWN = "unknown"


class DeclaredOwnership(BaseModel):
    declared_ownership_id: str
    subject_type: OwnershipSubjectType
    technical_entity_id: str | None = None
    repository_id: str | None = None
    repository_path_pattern: str | None = None
    interface_technical_entity_id: str | None = None

    owner_principal_type: OwnerPrincipalType
    owner_team_id: str | None = None
    owner_person_id: str | None = None
    unresolved_owner_ref: str | None = None

    ownership_role: OwnershipRole
    ownership_role_reported: str | None = None
    declaration_status: OwnershipDeclarationStatus
    authority: DeclarationAuthority

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    first_observed_at: datetime
    last_observed_at: datetime

    source_rule_order: int | None = None
    source_rule_pattern: str | None = None
    is_required_reported: bool | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

`owner_team_id` refers to an organization unit from Identity and Organization.
`owner_person_id` is used only when the source explicitly assigns a person or a
verified person mapping exists. A team alias, mailing list, or source group must not
be coerced into a person.

`STALE_SUSPECTED` records that evidence calls the declaration's currency into
question. The declaration remains preserved; it is not silently rewritten to the
observed steward or newer inferred owner.

### CODEOWNERS Evaluation

A normalized ownership observation for a concrete path must retain the matching
context:

```python
class OwnershipRuleMatch(BaseModel):
    ownership_rule_match_id: str
    repository_id: str
    repository_revision: str
    concrete_path: str

    matched_declared_ownership_ids: list[str] = Field(default_factory=list)
    effective_declared_ownership_ids: list[str] = Field(default_factory=list)
    unmatched_owner_tokens: list[str] = Field(default_factory=list)

    evaluation_method: str
    evaluator_version: str | None = None
    evaluated_at: datetime
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

This record supports what the selected file declared for the concrete path at that
revision. It does not establish that the platform enforced review, that the owners
were notified, or that they acted.

### Contradictions And Staleness

Conflicts may occur when:

- `CODEOWNERS` names one team and the service catalog names another;
- a team charter and manual assignment overlap with different responsibility roles;
- a declaration remains active after a team is dissolved;
- a catalog update removes an owner without recording a replacement;
- observed stewardship repeatedly differs from formal ownership;
- current declarations are projected onto historical paths or entities.

SuccessionAI must preserve each declaration with its source, role, authority, and
validity. It may expose the conflict as contested formal ownership. Observed
stewardship is corroborating or contradicting assessment context, not a replacement
ownership declaration.

### Supported Propositions

Ownership records may support that:

- a named source declared a team or person responsible for a specified subject;
- the declaration used a particular responsibility role;
- a `CODEOWNERS` rule applied to a path at a particular revision;
- multiple sources agreed or conflicted about formal ownership;
- a declaration was added, changed, superseded, revoked, deleted, or suspected stale;
- ownership was assigned to a team rather than directly to its members.

### Cannot Establish

Declared ownership alone cannot establish:

- observed stewardship or actual work performed;
- expertise, understanding, or availability;
- that every team member shares the relevant knowledge;
- that a named person accepted or still holds the responsibility;
- that required review was requested, completed, or substantive;
- sole responsibility;
- business criticality or knowledge-loss risk;
- correctness or freshness of the declaration.

## Repository And Path Mapping

### Purpose And Scope

Repository and path mappings connect development activity to technical entities.
They allow commits, file changes, pull requests, and reviews to be interpreted in
the declared component context without treating repository names or directory names
as proof.

Mappings may be one-to-many and many-to-one. A monorepo can contain many components,
one component can span repositories, and a repository can contain implementation,
configuration, tests, documentation, or generated clients for the same entity.

### Layer 1: Faithful Source Record

```python
class SourceRepositoryMappingRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    declaration_context: SourceDeclarationContext

    external_entity_id: str | None = None
    external_repository_id: str | None = None
    repository_locator_reported: str
    path_pattern_reported: str | None = None
    relationship_reported: str | None = None

    exclusion_patterns_reported: list[str] = Field(default_factory=list)
    priority_reported: int | None = None
    notes_reported: str | None = None
    deleted_reported: bool | None = None
```

### Layer 2: Normalized Mapping

```python
class RepositoryEntityRelationshipKind(str, Enum):
    PRIMARY_IMPLEMENTATION = "primary_implementation"
    SUPPORTING_IMPLEMENTATION = "supporting_implementation"
    SHARED_LIBRARY = "shared_library"
    INFRASTRUCTURE = "infrastructure"
    DEPLOYMENT_CONFIGURATION = "deployment_configuration"
    API_DEFINITION = "api_definition"
    DATA_SCHEMA = "data_schema"
    TESTS = "tests"
    DOCUMENTATION = "documentation"
    GENERATED_CLIENT = "generated_client"
    OTHER = "other"
    UNKNOWN = "unknown"


class MappingResolutionStatus(str, Enum):
    CONFIRMED = "confirmed"
    PROBABLE = "probable"
    AMBIGUOUS = "ambiguous"
    CONTESTED = "contested"
    REJECTED = "rejected"
    UNRESOLVED = "unresolved"


class RepositoryEntityMapping(BaseModel):
    repository_entity_mapping_id: str
    repository_id: str
    technical_entity_id: str
    path_pattern: str | None = None
    exclusion_patterns: list[str] = Field(default_factory=list)

    relationship_kind: RepositoryEntityRelationshipKind
    relationship_kind_reported: str | None = None
    resolution_status: MappingResolutionStatus

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    source_revision: str | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

A mapping applies only within its validity and source-revision context. Path moves,
repository transfers, splits, and merges require new mappings or bounded historical
records; current paths must not be projected backward.

### Supported Propositions

Mappings may support that:

- a source linked a repository or path to a technical entity;
- development activity at a concrete path occurred within a mapped component scope;
- one technical entity spans multiple repositories or paths;
- one repository contains multiple technical entities;
- a mapping changed, conflicted, or became unresolved over time.

### Cannot Establish

A mapping alone cannot establish:

- that all files under the path implement the entity;
- that a mapped repository is deployed or active;
- that contributors to the path understand the whole entity;
- ownership, expertise, stewardship, or criticality;
- runtime dependency or data flow;
- correctness of a name-derived or inferred mapping.

## Architecture Relationships

### Purpose And Scope

Architecture relationships describe source-declared technical topology useful for
understanding the scope and adjacency of expertise. The initial model captures
direct, entity-level relationships rather than exhaustive call graphs, symbol
graphs, telemetry, or perfect runtime lineage.

Direction is always explicit: `source_technical_entity_id` has the stated
relationship to `target_technical_entity_id`.

### Layer 1: Faithful Source Record

```python
class SourceArchitectureRelationshipRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    declaration_context: SourceDeclarationContext

    external_relationship_id: str | None = None
    source_external_entity_id: str
    target_external_entity_id: str | None = None
    target_locator_reported: str | None = None

    relationship_kind_reported: str
    direction_reported: str | None = None
    environment_reported: str | None = None
    interface_reported: str | None = None
    required_reported: bool | None = None
    notes_reported: str | None = None
    deleted_reported: bool | None = None
```

### Layer 2: Normalized Relationship

```python
class ArchitectureRelationshipKind(str, Enum):
    DEPENDS_ON = "depends_on"
    CALLS = "calls"
    PROVIDES_API_TO = "provides_api_to"
    PUBLISHES_TO = "publishes_to"
    SUBSCRIBES_TO = "subscribes_to"
    READS_FROM = "reads_from"
    WRITES_TO = "writes_to"
    HOSTS = "hosts"
    DEPLOYED_WITH = "deployed_with"
    EXTENDS = "extends"
    REPLACES = "replaces"
    OTHER = "other"
    UNKNOWN = "unknown"


class RelationshipOrigin(str, Enum):
    SOURCE_DECLARED = "source_declared"
    CONFIGURATION_DERIVED = "configuration_derived"
    ARTIFACT_EXTRACTED = "artifact_extracted"
    HUMAN_CONFIRMED = "human_confirmed"
    UNKNOWN = "unknown"


class ArchitectureRelationshipStatus(str, Enum):
    ACTIVE = "active"
    SUPERSEDED = "superseded"
    REMOVED = "removed"
    CONTESTED = "contested"
    UNRESOLVED = "unresolved"
    UNKNOWN = "unknown"


class ArchitectureRelationship(BaseModel):
    architecture_relationship_id: str
    source_technical_entity_id: str
    target_technical_entity_id: str | None = None
    unresolved_target_ref: str | None = None

    relationship_kind: ArchitectureRelationshipKind
    relationship_kind_reported: str | None = None
    origin: RelationshipOrigin
    status: ArchitectureRelationshipStatus

    environment: str | None = None
    interface_technical_entity_id: str | None = None
    required_reported: bool | None = None

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    first_observed_at: datetime
    last_observed_at: datetime

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

`required_reported` preserves a source declaration and is not a criticality
classification. Environment remains explicit because staging, development, and
production topology may differ.

### Relationship Interpretation

Architecture edges may help:

- expand retrieval from a component to its declared dependencies and interfaces;
- contextualize reviews, incidents, runbooks, and handoff exercises;
- identify adjacent technical areas that may require corroborating expertise;
- explain why evidence about one entity may be relevant to another without merging
  the entities;
- surface conflicting or stale architecture declarations for evaluation.

They must not automatically propagate ownership, expertise, criticality, or risk.
A person with expertise in a calling service is not thereby an expert in the called
service. A dependency edge is not proof that failure has material business impact.

### Supported Propositions

Architecture records may support that:

- a source declared or configuration indicated a directional relationship;
- a relationship applied in a stated environment and time;
- a relationship was added, changed, removed, superseded, or contradicted;
- an unresolved external target was named but could not be mapped;
- multiple sources corroborated or disagreed about technical topology.

### Cannot Establish

Architecture relationships alone cannot establish:

- observed runtime traffic or current production use;
- dependency strength, failure impact, or business criticality;
- correctness, completeness, or direction of a diagram-derived edge;
- ownership or expertise on either side of the edge;
- data sensitivity or regulatory significance;
- that absence of an edge means no dependency exists.

## Lifecycle Declaration

### Purpose And Scope

Lifecycle records preserve what a source declared about a technical entity at a
point or interval in time. Lifecycle is separate from repository lifecycle,
deployment state, runtime health, and business criticality.

### Source And Normalized Records

```python
class SourceLifecycleDeclarationRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    declaration_context: SourceDeclarationContext

    external_entity_id: str
    lifecycle_reported: str
    effective_from_reported: datetime | None = None
    effective_until_reported: datetime | None = None
    reason_reported: str | None = None
    replacement_external_entity_id: str | None = None


class TechnicalLifecycle(str, Enum):
    PROPOSED = "proposed"
    EXPERIMENTAL = "experimental"
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    DEPRECATED = "deprecated"
    RETIRING = "retiring"
    RETIRED = "retired"
    UNKNOWN = "unknown"


class TechnicalEntityLifecycleDeclaration(BaseModel):
    lifecycle_declaration_id: str
    technical_entity_id: str
    lifecycle: TechnicalLifecycle
    lifecycle_reported: str

    replacement_technical_entity_id: str | None = None
    reason_reported: str | None = None
    valid_from: datetime | None = None
    valid_until: datetime | None = None
    observed_at: datetime

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

An entity marked retired may still receive traffic or require knowledge for
recovery, migration, audit, or incident response. Conversely, an active catalog
entry may describe a system that was never deployed. Production Operations supplies
the operational evidence.

### Supported Propositions

Lifecycle records may support that:

- a source classified an entity using a particular lifecycle value;
- the normalized broad lifecycle applied for a declared or observed interval;
- a source named a replacement entity;
- lifecycle declarations disagreed with one another or with operational evidence.

### Cannot Establish

Lifecycle declarations alone cannot establish:

- actual deployment, traffic, health, or retirement;
- lack of residual knowledge requirements;
- business criticality;
- ownership, expertise, or stewardship;
- that an active entity is maintained;
- that a retired entity can be safely ignored.

## Architecture Decision And Artifact Links

### Purpose And Scope

This object links technical entities and architecture relationships to Knowledge
Artifacts without duplicating artifact content, revision history, propositions,
reviews, or approvals.

The linked artifact may be an ADR, design document, diagram, proposal, runbook, or
other record. Knowledge Artifacts owns what the artifact stated and whether a
decision was proposed, accepted, superseded, or contradicted in its content.

```python
class ArchitectureArtifactLinkKind(str, Enum):
    RECORDS_DECISION_FOR = "records_decision_for"
    DESCRIBES = "describes"
    DEFINES_INTERFACE_FOR = "defines_interface_for"
    EXPLAINS_RELATIONSHIP = "explains_relationship"
    RECORDS_MIGRATION_FOR = "records_migration_for"
    RECORDS_DEPRECATION_FOR = "records_deprecation_for"
    REFERENCES = "references"
    UNKNOWN = "unknown"


class ArchitectureArtifactLink(BaseModel):
    architecture_artifact_link_id: str
    knowledge_artifact_id: str
    artifact_revision_id: str | None = None

    technical_entity_id: str | None = None
    architecture_relationship_id: str | None = None
    link_kind: ArchitectureArtifactLinkKind
    origin: RelationshipOrigin
    resolution_status: EntityResolutionStatus

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

An explicit catalog or artifact link is stronger relationship evidence than a title
or filename match, but neither proves that the decision remains implemented.

### Supported Propositions

Artifact links may support that:

- a source linked an artifact or revision to a technical entity or relationship;
- an artifact provides decision, design, interface, migration, or deprecation
  context for architecture retrieval;
- the link was explicit, extracted, human-confirmed, ambiguous, or contested.

### Cannot Establish

An artifact link alone cannot establish:

- what the artifact stated;
- that a decision was accepted or implemented;
- that the artifact is current, correct, or complete;
- who has expertise in the linked entity;
- ownership or business criticality.

## Layer 3: Evidence Records

Normalized records support narrow, attributed evidence propositions. They do not
directly create expertise or knowledge-risk assessments.

```python
class OwnershipArchitectureProposition(str, Enum):
    SOURCE_DECLARED_ENTITY = "source_declared_entity"
    SOURCE_DECLARED_OWNER = "source_declared_owner"
    OWNERSHIP_DECLARATIONS_CONFLICT = "ownership_declarations_conflict"
    OWNERSHIP_DECLARATION_MAY_BE_STALE = "ownership_declaration_may_be_stale"
    REPOSITORY_OR_PATH_MAPPED_TO_ENTITY = (
        "repository_or_path_mapped_to_entity"
    )
    SOURCE_DECLARED_ARCHITECTURE_RELATIONSHIP = (
        "source_declared_architecture_relationship"
    )
    SOURCE_DECLARED_LIFECYCLE = "source_declared_lifecycle"
    ARTIFACT_LINKED_TO_ARCHITECTURE = "artifact_linked_to_architecture"


class EvidenceResolutionStatus(str, Enum):
    SUPPORTED = "supported"
    CORROBORATED = "corroborated"
    CONTESTED = "contested"
    SUPERSEDED = "superseded"
    UNRESOLVED = "unresolved"


class OwnershipArchitectureEvidenceRecord(BaseModel):
    evidence_id: str
    proposition: OwnershipArchitectureProposition

    technical_entity_id: str | None = None
    repository_id: str | None = None
    declared_ownership_id: str | None = None
    architecture_relationship_id: str | None = None
    knowledge_artifact_id: str | None = None

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    resolution_status: EvidenceResolutionStatus

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
    derivation_method: str | None = None
    derivation_version: str | None = None
```

Evidence wording should remain attributed:

- "The service catalog declared Team A the technical owner of Service B."
- "The `CODEOWNERS` file at revision X assigned this path to Team C."
- "The architecture registry declared Service B depends on Data Store D."
- "The catalog marked Component E deprecated as observed on this date."

Avoid:

- "Team A actually owns Service B."
- "Every member of Team C knows this code."
- "Service B cannot operate without Data Store D."
- "Component E is safe to ignore."

## Retrieval For Expertise And Knowledge-Risk Analysis

Retrieval should begin with an assessment subject and return scoped context rather
than an unbounded organization graph.

For a technical entity, retrieve:

1. entity records and aliases;
2. current and historical ownership declarations by role and principal type;
3. repository and path mappings applicable to the evidence time;
4. direct architecture relationships with direction, environment, and provenance;
5. lifecycle declarations and replacements;
6. linked knowledge artifacts and exact revisions when available;
7. contradictions, unresolved references, stale declarations, and access gaps.

For a repository path or development record, resolve the path against mappings at
the relevant repository revision, then retrieve the corresponding entity context.
Do not use today's mapping to relabel historical work without support.

Architecture expansion beyond direct neighbors should be explicit and
claim-dependent. The initial model does not define automatic transitive propagation
of expertise, ownership, or risk.

## Time, Freshness, And Deletion

- Preserve source event, source update, effective, observation, and ingestion times
  separately where available.
- Treat current-state APIs as observations, not complete historical truth.
- Preserve ownership-file and configuration revisions used for interpretation.
- Bound ownership, mappings, relationships, and lifecycle records with validity
  intervals when evidence permits.
- Never project current team membership onto historical team ownership.
- Never project current ownership, path mappings, or architecture onto historical
  activity.
- Preserve superseded and revoked declarations for historical analysis.
- Represent deletion as a source event or observation; do not erase prior evidence
  unless retention policy requires it.
- A declaration may be suspected stale without a fixed age threshold. Relevant
  evidence includes newer conflicting declarations, dissolved teams, renamed or
  moved entities, replacement systems, and contradictory operational records.
- No universal freshness window is defined. Freshness depends on the proposition,
  source maintenance process, and corroborating evidence.

## Identity And Organization Semantics

- Team identifiers refer to time-aware organization units from Identity and
  Organization.
- Person identifiers require conservative source-account resolution.
- Team ownership does not imply person ownership.
- Person ownership does not imply team ownership.
- A team's current members must not be attached to a historical team declaration
  as direct owners.
- Shared accounts, mailing lists, bots, and unresolved aliases remain non-person or
  unresolved principals.
- A team charter may define responsibility scope, but membership and reporting lines
  remain Identity and Organization records.
- A formal owner who has no observed activity remains a formal owner in the evidence
  model; the discrepancy is useful assessment context.

## Privacy, Access, And Sensitivity

Ownership and architecture sources may expose:

- private repository paths and team aliases;
- internal network topology and service interfaces;
- data stores and security boundaries;
- sensitive system names and migration plans;
- employee responsibility assignments;
- links to restricted ADRs, incidents, or infrastructure configuration.

Connectors must preserve source permissions, redactions, and field-level access.
SuccessionAI must not reveal architecture records, owner identities, or linked
artifact content to users who lack source authorization.

Restricted metadata may establish that an entity, declaration, relationship, or
artifact link exists, but inaccessible details must remain uninterpreted. Missing
access is an observability limitation, not evidence that ownership or architecture
is absent.

The initial model does not require secrets, credentials, raw infrastructure state,
customer data, packet captures, or unrestricted runtime telemetry.

## Canonical Failure Cases

1. `CODEOWNERS` names a team that no longer exists.
2. A later `CODEOWNERS` rule overrides an earlier broad rule.
3. An owner token cannot be resolved to a team or person.
4. A team is declared owner, but all observed stewardship comes from another team.
5. A person is named as owner, but the assignment was intended only as a contact.
6. Team ownership is incorrectly expanded to every current team member.
7. Current team membership is applied to a historical ownership declaration.
8. A service catalog and team charter declare different owners with different roles.
9. A manual assignment silently overrides a more authoritative declaration.
10. A monorepo directory name is mistaken for a confirmed component mapping.
11. One component spans several repositories.
12. One repository contains implementation for several independently owned systems.
13. A path moves between components while historical activity remains at the old
    path.
14. A generated client is mistaken for the primary implementation.
15. An archived repository maps to a service still running in production.
16. A catalog marks a service active even though it was never deployed.
17. A catalog marks a service retired while it still receives production traffic.
18. An architecture diagram reverses the direction of a dependency.
19. A declared dependency exists only in staging.
20. A package dependency is mistaken for a service runtime dependency.
21. A missing architecture edge is treated as proof that no dependency exists.
22. Ownership or expertise is propagated automatically across a dependency edge.
23. A dependency is treated as business-critical without Business Impact evidence.
24. An ADR is linked to a component but was only a rejected proposal.
25. A superseded ADR is treated as current architecture.
26. An inaccessible catalog namespace makes ownership appear absent.
27. A deleted declaration erases the ownership context for historical activity.
28. Two catalogs use the same system name for different entities.
29. One entity is duplicated under old and new names after migration.
30. Observed stewardship is silently promoted to formal ownership.

## Accepted Decisions

1. Model technical entities as stable internal subjects while preserving
   source-specific IDs, kinds, names, and hierarchy.
2. Do not merge entities by name alone.
3. Keep repositories in Software Development and link them to technical entities
   through explicit, provenance-bearing mappings.
4. Support monorepos, multi-repository systems, path movement, and multiple mapping
   relationship kinds.
5. Treat formal ownership as a temporal, source-attributed declaration with a
   specific subject, principal type, and responsibility role.
6. Keep team ownership distinct from person ownership and never expand team
   ownership into ownership by all members.
7. Preserve `CODEOWNERS` revision, rule order, exact pattern, unresolved tokens, and
   concrete path-match context.
8. Preserve overlapping, contradictory, superseded, revoked, deleted, and suspected
   stale ownership declarations.
9. Do not replace formal ownership with observed stewardship.
10. Keep formal ownership, observed stewardship, expertise, and business criticality
    as separate evidence and assessment dimensions.
11. Model architecture relationships as directional, temporal, environment-aware,
    provenance-bearing declarations or derived observations.
12. Do not propagate ownership, expertise, criticality, or risk across architecture
    edges.
13. Normalize lifecycle only to a broad vocabulary while preserving source-reported
    values and contradictions.
14. Treat lifecycle as declared state, distinct from repository state and observed
    production operation.
15. Keep architecture decisions and design content in Knowledge Artifacts; store
    only links and applicability context in this family.
16. Use current-state observations and revision snapshots without claiming complete
    history when the source cannot provide it.
17. Record inaccessible sources, parse failures, unresolved mappings, and omitted
    history as observability limitations.
18. Defer deep semantic code analysis, exhaustive runtime topology, symbol graphs,
    automatic transitive risk propagation, and a universal freshness threshold.

## Ownership And Architecture Summary

The initial model covers:

1. Technical systems, services, components, libraries, data stores, interfaces, and
   infrastructure as source-resolved catalog entities
2. Temporal formal ownership by teams, people, external organizations, or unresolved
   principals
3. `CODEOWNERS`, service catalogs, team charters, and manual assignments with their
   distinct authority and role semantics
4. Repository and path mappings that support monorepos and multi-repository systems
5. Directional, environment-aware architecture and dependency relationships
6. Source-declared lifecycle and replacement context
7. Provenance-bearing links to architecture decisions and other knowledge artifacts
8. Narrow evidence propositions, contradictions, stale declarations, access gaps,
   and historical interpretation

The governing boundary remains:

> Ownership and architecture evidence establishes what the organization or a
> technical source declared about responsibility, scope, topology, lifecycle, and
> architecture context. It does not establish actual stewardship, expertise,
> business criticality, runtime truth, or knowledge-loss risk without corroborating
> evidence.
