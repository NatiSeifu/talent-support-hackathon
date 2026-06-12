# Identity And Organization Schema

> Status: Initial model complete.

## Purpose

Identity and organization data establishes:

- who an actor is across connected systems;
- which organization, team, and role context applied when an event occurred;
- whether an actor was an employee, contractor, external collaborator, service
  account, or unresolved identity;
- whether a person was active or expected to become unavailable at a relevant time.

It does not establish expertise, work quality, knowledge ownership, or organizational
risk. It provides attribution and context for evidence from other source families.

## Accepted Decisions

1. SuccessionAI assigns each known person a stable internal `person_id`.
2. Source-system identifiers remain separate records linked to the person.
3. Concrete identifiers are preferred over names:
   - organization-provided account mappings;
   - HR or directory employee IDs;
   - source-system account IDs;
   - verified corporate email addresses.
4. Historical emails, usernames, and other aliases are preserved with validity
   periods where available.
5. Display names are descriptive attributes, not unique identifiers.
6. Name-only matches are not automatically merged.
7. Unresolved actors are retained so their activity is not silently discarded.
8. Bots, service accounts, teams, and shared accounts are not modeled as people.
9. Identity links record how they were established and any contradictory signals.
10. Identity and organization records are temporal rather than timeless snapshots.

The default demo authority will be a synthetic organization directory. Connected
systems may provide supplementary account information and aliases.

## Retrieval

### Preferred Authoritative Sources

- HR information system, such as Workday
- Identity provider, such as Okta or Microsoft Entra ID
- Google Workspace or Microsoft 365 directory
- SCIM directory
- Organization-maintained employee roster
- Synthetic `company` directory for the demo

### Supplementary Sources

- GitHub organization members and commit author metadata
- Slack users
- Jira and Confluence accounts
- Incident-management accounts
- On-call systems
- Manually confirmed identity mappings

Connectors should ingest what each source asserts before identity resolution occurs.
Retrieval must not silently merge accounts merely because names or unverified emails
look similar.

## Layer 1: Faithful Source Records

### Source Identity

Represents an actor exactly as a connected system reports it.

```python
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class SourceSystem(str, Enum):
    HRIS = "hris"
    IDENTITY_PROVIDER = "identity_provider"
    GITHUB = "github"
    GIT = "git"
    SLACK = "slack"
    JIRA = "jira"
    CONFLUENCE = "confluence"
    INCIDENT_SYSTEM = "incident_system"
    ON_CALL_SYSTEM = "on_call_system"
    MANUAL_IMPORT = "manual_import"


class SourceIdentityRecord(BaseModel):
    source_record_id: str
    source_system: SourceSystem
    source_tenant_id: str
    external_actor_id: str

    actor_type_reported: str | None = None
    display_name: str | None = None
    username: str | None = None
    primary_email: str | None = None
    email_aliases: list[str] = Field(default_factory=list)
    active_status_reported: str | None = None

    source_created_at: datetime | None = None
    source_updated_at: datetime | None = None
    observed_at: datetime

    raw_payload_ref: str
    source_uri: str | None = None
```

`external_actor_id` is authoritative only within the named source and tenant.
Fields that the source does not provide remain absent rather than being inferred.

### Source Organization Assignment

Represents a source assertion about a person's employment, team, role, manager,
project, or on-call assignment.

```python
class AssignmentKind(str, Enum):
    EMPLOYMENT = "employment"
    TEAM_MEMBERSHIP = "team_membership"
    ROLE = "role"
    REPORTING_LINE = "reporting_line"
    PROJECT = "project"
    ON_CALL_ROTATION = "on_call_rotation"


class SourceOrganizationAssignmentRecord(BaseModel):
    source_record_id: str
    source_system: SourceSystem
    source_tenant_id: str

    external_actor_id: str
    assignment_kind: AssignmentKind
    external_container_id: str | None = None
    label_reported: str | None = None
    manager_external_actor_id: str | None = None

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    observed_at: datetime

    raw_payload_ref: str
    source_uri: str | None = None
```

## Layer 2: Normalized Internal Records

### Person

The canonical internal identity. Source usernames and emails do not live directly
on this record because they may change or conflict.

```python
class PersonType(str, Enum):
    EMPLOYEE = "employee"
    CONTRACTOR = "contractor"
    FORMER_EMPLOYEE = "former_employee"
    EXTERNAL_COLLABORATOR = "external_collaborator"
    UNKNOWN = "unknown"


class PersonLifecycleStatus(str, Enum):
    ACTIVE = "active"
    DEPARTING = "departing"
    INACTIVE = "inactive"
    UNKNOWN = "unknown"


class Person(BaseModel):
    person_id: str
    person_type: PersonType
    preferred_display_name: str | None = None
    lifecycle_status: PersonLifecycleStatus

    created_at: datetime
    updated_at: datetime
```

### Source Account

Preserves a source-specific identity and optionally links it to a canonical person.

```python
class SourceAccount(BaseModel):
    source_account_id: str
    source_system: SourceSystem
    source_tenant_id: str
    external_actor_id: str

    person_id: str | None = None
    username: str | None = None
    display_name: str | None = None
    reported_emails: list[str] = Field(default_factory=list)

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    source_record_ids: list[str] = Field(default_factory=list)
```

### Alias

Aliases support discovery and matching without becoming canonical identity keys.

```python
class AliasKind(str, Enum):
    VERIFIED_WORK_EMAIL = "verified_work_email"
    EMAIL_ALIAS = "email_alias"
    USERNAME = "username"
    DISPLAY_NAME = "display_name"
    FORMER_NAME = "former_name"
    EXTERNAL_EMPLOYEE_ID = "external_employee_id"


class PersonAlias(BaseModel):
    alias_id: str
    person_id: str
    alias_kind: AliasKind
    value: str

    source_system: SourceSystem
    source_record_ids: list[str] = Field(default_factory=list)
    is_verified: bool = False

    valid_from: datetime | None = None
    valid_until: datetime | None = None
```

An external employee ID should be stored with its issuing source or tenant. Its
string value is not assumed to be globally unique.

### Identity Link

Records the identity-resolution decision rather than hiding it inside ingestion.

```python
class IdentityLinkStatus(str, Enum):
    CONFIRMED = "confirmed"
    PROBABLE = "probable"
    AMBIGUOUS = "ambiguous"
    REJECTED = "rejected"


class IdentityResolutionMethod(str, Enum):
    AUTHORITATIVE_MAPPING = "authoritative_mapping"
    DETERMINISTIC_RULE = "deterministic_rule"
    PROBABILISTIC_MATCH = "probabilistic_match"
    HUMAN_REVIEW = "human_review"


class MatchSignalKind(str, Enum):
    DIRECTORY_MAPPING = "directory_mapping"
    EMPLOYEE_ID = "employee_id"
    VERIFIED_EMAIL = "verified_email"
    EMAIL_ALIAS = "email_alias"
    USERNAME = "username"
    DISPLAY_NAME = "display_name"
    TEAM_OR_ROLE_CONTEXT = "team_or_role_context"
    MANUAL_CONFIRMATION = "manual_confirmation"


class IdentityMatchSignal(BaseModel):
    signal_kind: MatchSignalKind
    source_record_ids: list[str] = Field(default_factory=list)
    observed_value: str | None = None


class IdentityContradiction(BaseModel):
    description: str
    source_record_ids: list[str] = Field(default_factory=list)


class IdentityLink(BaseModel):
    identity_link_id: str
    source_account_id: str
    person_id: str
    status: IdentityLinkStatus

    match_signals: list[IdentityMatchSignal] = Field(default_factory=list)
    contradictions: list[IdentityContradiction] = Field(default_factory=list)
    resolution_method: IdentityResolutionMethod

    resolved_at: datetime
    resolved_by: str | None = None
```

No numerical identity confidence is defined yet. The categorical status must be
supported by inspectable match signals and contradictions.

### Organization Entities And Assignments

```python
class OrganizationUnitKind(str, Enum):
    COMPANY = "company"
    DIVISION = "division"
    DEPARTMENT = "department"
    TEAM = "team"
    PROJECT = "project"
    ON_CALL_ROTATION = "on_call_rotation"


class OrganizationUnit(BaseModel):
    organization_unit_id: str
    unit_kind: OrganizationUnitKind
    name: str
    parent_unit_id: str | None = None


class PersonOrganizationAssignment(BaseModel):
    assignment_id: str
    person_id: str
    assignment_kind: AssignmentKind

    organization_unit_id: str | None = None
    role_title: str | None = None
    manager_person_id: str | None = None

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Separate time-bounded assignments prevent a person's current role from being
incorrectly applied to historical activity.

### Non-Person Actors

```python
class NonPersonActorKind(str, Enum):
    SERVICE_ACCOUNT = "service_account"
    BOT = "bot"
    SHARED_ACCOUNT = "shared_account"
    TEAM = "team"
    VENDOR = "vendor"


class NonPersonActor(BaseModel):
    actor_id: str
    actor_kind: NonPersonActorKind
    display_name: str | None = None
    source_account_ids: list[str] = Field(default_factory=list)
```

An unresolved source account remains unresolved; it is not converted into a
non-person actor unless evidence supports that classification.

## Layer 3: Supported Evidence Records

Identity and organization records may support narrow propositions such as:

```python
class IdentityProposition(str, Enum):
    ACCOUNT_LINKED_TO_PERSON = "account_linked_to_person"
    PERSON_ACTIVE_IN_ORGANIZATION = "person_active_in_organization"
    PERSON_DEPARTING = "person_departing"
    PERSON_EXTERNAL_TO_ORGANIZATION = "person_external_to_organization"
    PERSON_HELD_ROLE = "person_held_role"
    PERSON_BELONGED_TO_TEAM = "person_belonged_to_team"
    PERSON_REPORTED_TO_MANAGER = "person_reported_to_manager"
    PERSON_PARTICIPATED_IN_ON_CALL_ROTATION = (
        "person_participated_in_on_call_rotation"
    )


class EvidenceResolutionStatus(str, Enum):
    SUPPORTED = "supported"
    CONTESTED = "contested"
    UNRESOLVED = "unresolved"


class IdentityEvidenceRecord(BaseModel):
    evidence_id: str
    proposition: IdentityProposition
    subject_person_id: str

    source_account_id: str | None = None
    organization_unit_id: str | None = None
    related_person_id: str | None = None

    valid_from: datetime | None = None
    valid_until: datetime | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
    resolution_status: EvidenceResolutionStatus
```

These evidence records provide context to later expertise and risk assessments.
They do not directly assert that the person is an expert or knowledge owner.

## Identifier And Matching Policy

Use this order when resolving source accounts:

1. Explicit organization-provided account mapping
2. Stable external employee ID within its issuing directory
3. Exact verified corporate email
4. Verified historical email alias
5. Username plus corroborating team or role context
6. Display name plus corroborating context
7. Display name alone

Levels 1 through 3 may support deterministic linking when no contradiction exists.
Levels 4 through 6 require the supporting signals to be preserved and may remain
probable or ambiguous. Level 7 is insufficient for an automatic merge.

False merges are more damaging than temporary non-merges because they combine
different people's activity and can fabricate expertise.

## Time And Freshness Semantics

- Every source record has an `observed_at` time.
- Source-provided creation and update times are preserved separately.
- Accounts and aliases may have validity intervals.
- Team, role, manager, project, and on-call assignments are time-bounded.
- Historical activity is interpreted using the organization state applicable when
  the activity occurred.
- Account inactivity is not assumed to equal employment termination.
- A stale directory observation must not silently override newer source evidence.

Freshness thresholds are deliberately undefined until actual source update
frequencies and product claims are established.

## What This Source Family Cannot Establish

Identity and organization data cannot, by itself, establish:

- expertise or depth of understanding;
- work quality;
- authorship of an artifact;
- formal ownership unless an assignment explicitly states it;
- observed stewardship;
- current capability;
- knowledge transferability;
- material knowledge-loss risk.

## Privacy Boundary

The evidence model does not require:

- home addresses;
- personal phone numbers;
- compensation;
- demographic characteristics;
- government identifiers;
- medical or leave information;
- full performance-review records.

Connectors should retrieve only fields needed for attribution, organizational
context, availability, and source-account resolution.

## Canonical Failure Cases

The evaluation dataset should include:

1. Two employees with the same display name.
2. One person using corporate and personal GitHub accounts.
3. A renamed person with a historical email alias.
4. A contractor later converted to an employee.
5. A shared deployment account.
6. A bot whose display name resembles a person's name.
7. A Git commit containing spoofed author metadata.
8. A former employee whose source account remains active.
9. One person incorrectly represented by two directory records.
10. An account that cannot be resolved.

## Deferred Decisions

- Whether personal GitHub accounts are permitted in each access profile
- Which administrators may confirm or reject identity links
- How planned departure dates are supplied and permissioned
- Whether probable identity links may contribute to person-level assessments
- Retention and deletion requirements for identity history
- Whether identity corrections trigger automatic recomputation of assessments
