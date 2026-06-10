# Software Development Schema

> Status: Initial model complete.

## Purpose

Software development data records changes and collaboration within development
systems. It should faithfully describe repositories, commits, file changes, pull
requests, reviews, comments, releases, and branch activity.

This source family establishes development activity. It does not independently
establish formal ownership, production use, business criticality, or expertise.

## Governing Boundary

Software development records remain narrowly scoped to what the development
platform recorded.

Related conclusions come from explicit links to other source families:

```text
Software development:
This repository exists, and this activity occurred within it.

Ownership and architecture:
The organization declares that this repository or path supports a system and is
owned by a person or team.

Production operations:
A revision from this repository was deployed, operated, rolled back, or involved
in an incident.

Business impact:
The related system supports a business-critical capability.
```

These records are joined during evidence construction and assessment. Their source
facts must not be collapsed into one denormalized assertion that hides provenance or
contradictions.

For example, a service catalog may mark a repository as deprecated while deployment
records show a recent production release. Both facts remain available, and the
resulting relationship is contested until resolved.

## Software Development Objects

1. Repository
2. Commit
3. File change
4. Pull request
5. Pull-request review
6. Review comment
7. Release
8. Branch activity

`CODEOWNERS` may be retrieved from a repository, but its semantics belong to the
Ownership and Architecture source family because it declares responsibility.

## Repository

### Purpose

A repository is the source-system container in which development activity occurs.
It provides context for later commit, pull-request, review, and release records.

A repository is not assumed to be equivalent to a system, service, business
capability, or unit of expertise.

### Retrieval

For GitHub, repository data may be retrieved through:

- GitHub GraphQL API for initial and periodic synchronization;
- GitHub REST API for required fields not covered by selected GraphQL queries;
- GitHub App webhooks for incremental updates;
- Git history for commit and file-level records;
- organization exports or synthetic JSON for the demo.

A production connector should combine an initial synchronization, incremental
events, and periodic reconciliation. Webhooks alone cannot establish completeness
because events may be delayed or missed.

### Layer 1: Faithful Source Record

```python
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class RepositoryVisibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    INTERNAL = "internal"
    UNKNOWN = "unknown"


class SourceRepositoryRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_repository_id: str

    owner_name: str
    repository_name: str
    full_name: str
    visibility: RepositoryVisibility
    default_branch_name: str | None = None

    is_archived: bool | None = None
    is_disabled: bool | None = None
    is_fork: bool | None = None
    parent_external_repository_id: str | None = None

    description: str | None = None
    homepage_url: str | None = None
    source_uri: str | None = None

    primary_language_reported: str | None = None
    languages_reported: dict[str, int] = Field(default_factory=dict)
    topics_reported: list[str] = Field(default_factory=list)

    source_created_at: datetime | None = None
    source_updated_at: datetime | None = None
    source_pushed_at: datetime | None = None
    observed_at: datetime

    raw_payload_ref: str
```

The source's immutable repository ID is the external identity. Repository names,
owners, visibility, default branches, and descriptions may change.

### Layer 2: Normalized Repository

```python
class RepositoryLifecycleStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    DISABLED = "disabled"
    UNKNOWN = "unknown"


class Repository(BaseModel):
    repository_id: str
    source_system: str
    source_tenant_id: str
    external_repository_id: str

    canonical_name: str
    visibility: RepositoryVisibility
    lifecycle_status: RepositoryLifecycleStatus
    default_branch_name: str | None = None
    parent_repository_id: str | None = None

    first_observed_at: datetime
    last_observed_at: datetime
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Business domain, business criticality, system identity, deployment state, and
ownership are deliberately excluded.

### Repository History

```python
class RepositorySnapshot(BaseModel):
    repository_snapshot_id: str
    repository_id: str

    owner_name: str
    repository_name: str
    default_branch_name: str | None = None
    visibility: RepositoryVisibility
    lifecycle_status: RepositoryLifecycleStatus

    valid_from: datetime
    valid_until: datetime | None = None
    source_record_id: str
```

Snapshots prevent current repository metadata from being projected backward onto
historical activity.

### Cross-Family Relationship

The link between a repository and an organizational system is modeled explicitly:

```python
class RelationshipResolutionStatus(str, Enum):
    CONFIRMED = "confirmed"
    PROBABLE = "probable"
    AMBIGUOUS = "ambiguous"
    CONTESTED = "contested"
    REJECTED = "rejected"


class RepositorySystemLink(BaseModel):
    repository_system_link_id: str
    repository_id: str
    system_id: str
    relationship_kind: str
    resolution_status: RelationshipResolutionStatus

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

The final `relationship_kind` taxonomy will be defined with Ownership and
Architecture. Likely distinctions include primary implementation, supporting
library, infrastructure, documentation, and deployment configuration.

### Supported Propositions

Repository records may support narrow propositions such as:

- a repository existed during a period;
- a repository was active, archived, disabled, or forked;
- a source reported particular languages or topics;
- a repository's metadata changed;
- a repository was linked to a system when corroborating cross-family evidence is
  present.

Most repository fields should remain context. SuccessionAI should create an evidence
record only when a field supports or contradicts an actual product claim.

### Cannot Establish

Repository data alone cannot establish:

- who owns or understands the repository;
- whether its contents are deployed or operational;
- whether it is business-critical;
- whether a listed language reflects a person's capability;
- whether an archived repository is irrelevant;
- whether a recently updated repository is maintained by humans;
- whether a repository maps one-to-one to a service.

### Access And Observability

Every ingestion run should record connector scope:

```python
class IngestionScope(BaseModel):
    ingestion_scope_id: str
    source_system: str
    source_tenant_id: str

    included_repository_ids: list[str] = Field(default_factory=list)
    excluded_repository_ids: list[str] = Field(default_factory=list)
    permissions_observed: list[str] = Field(default_factory=list)

    collection_started_at: datetime
    collection_completed_at: datetime | None = None
    source_claimed_complete: bool
    limitations: list[str] = Field(default_factory=list)
```

Claims about contribution concentration must be scoped to the repositories and
history that were actually observable.

### Canonical Failure Cases

1. A repository renamed during the evaluation period.
2. A repository transferred between organizations.
3. An active fork containing substantial upstream activity.
4. An archived repository that still runs in production.
5. A frequently updated generated-code repository.
6. A monorepo containing independently owned systems.
7. One system implemented across multiple repositories.
8. A private repository omitted under restricted access.
9. A repository whose name misrepresents its business purpose.
10. A deleted repository referenced by tickets, deployments, or incidents.

### Accepted Repository Decisions

1. Use the source's immutable repository ID as the external identifier.
2. Preserve historically meaningful repository metadata changes.
3. Treat repository-to-system linkage as a separate evidence-backed relationship.
4. Record connector scope and known omissions for every ingestion.
5. Do not infer ownership or criticality from names, topics, or activity volume.
6. Classify forks and generated repositories before interpreting contribution data.
7. Support monorepos and systems spanning multiple repositories.
8. Treat the repository as a container rather than the unit of expertise.

## Commit

### Purpose

A commit records a change event in Git history. It preserves source-attributed
author, committer, co-author, timestamp, parent, signature, and repository context.

A commit does not independently prove who conceived, wrote, understood, reviewed,
or deployed the change.

### Retrieval

Commit records may be retrieved from:

- local Git history;
- GitHub GraphQL or REST APIs;
- pull-request commit lists;
- push webhooks;
- repository exports.

Git history provides Git-object fidelity. The hosting platform may add account
associations, signature verification, pull-request links, branch observations, and
web URLs. Both should be preserved when available.

### Layer 1: Faithful Source Record

```python
class SignatureStatus(str, Enum):
    VERIFIED = "verified"
    UNVERIFIED = "unverified"
    UNKNOWN = "unknown"


class SourceGitActor(BaseModel):
    name_reported: str | None = None
    email_reported: str | None = None
    timestamp_reported: datetime | None = None
    external_account_id: str | None = None
    username_reported: str | None = None


class SourceCommitRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_repository_id: str

    commit_hash: str
    parent_hashes: list[str] = Field(default_factory=list)
    author: SourceGitActor
    committer: SourceGitActor
    co_authors_reported: list[SourceGitActor] = Field(default_factory=list)

    message: str
    authored_at: datetime | None = None
    committed_at: datetime | None = None

    signature_status: SignatureStatus = SignatureStatus.UNKNOWN
    signature_reason_reported: str | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

The author is the identity Git reports as creating the original change. The
committer is the identity Git reports as placing the change into this commit. These
may differ after rebasing, cherry-picking, applying patches, or using automation.

### Layer 2: Normalized Commit

```python
class AutomationClassification(str, Enum):
    HUMAN = "human"
    BOT = "bot"
    MIXED = "mixed"
    UNKNOWN = "unknown"


class Commit(BaseModel):
    commit_id: str
    repository_id: str
    commit_hash: str
    parent_commit_ids: list[str] = Field(default_factory=list)

    message: str
    authored_at: datetime | None = None
    committed_at: datetime | None = None

    author_source_account_id: str | None = None
    committer_source_account_id: str | None = None
    co_author_source_account_ids: list[str] = Field(default_factory=list)

    automation_classification: AutomationClassification
    signature_status: SignatureStatus
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Unresolved actors remain unresolved source accounts. They are not discarded or
forcibly assigned to a person.

### Commit Observations

Branch reachability and pull-request association are observations that may change
or depend on connector visibility:

```python
class CommitObservation(BaseModel):
    commit_observation_id: str
    commit_id: str

    observed_branch_names: list[str] = Field(default_factory=list)
    observed_tag_names: list[str] = Field(default_factory=list)
    associated_pull_request_ids: list[str] = Field(default_factory=list)
    is_reachable_from_default_branch: bool | None = None

    observed_at: datetime
    source_record_ids: list[str] = Field(default_factory=list)
```

A commit may exist without being merged into the default branch or released.

### Supported Propositions

Commit records may support narrow propositions such as:

- the source attributed authorship to an account;
- the source attributed committer activity to an account;
- the commit message declared one or more co-authors;
- the commit existed in the observed repository;
- the commit was observed as reachable from a branch or tag;
- the commit was associated with a pull request;
- the source reported a verified or unverified signature;
- the commit appeared automated.

Authorship propositions must use source-attribution language. Git metadata is
self-declared and may be spoofed.

### What Commit Patterns May Suggest

When combined with file changes and corroborating sources, commit patterns may
suggest:

- exposure to a component;
- repeated implementation activity;
- recent participation in a domain;
- breadth or concentration of contribution;
- possible stewardship over time.

Expertise inference requires further context such as substantive pull-request
descriptions, reviews, design decisions, incidents, repeated maintenance, peer
validation, or demonstrated tasks.

### Cannot Establish

A commit alone cannot establish:

- expertise or understanding;
- formal or operational ownership;
- original intellectual contribution;
- work quality or difficulty;
- whether code was copied or generated;
- whether a change was reviewed, deployed, or remains relevant;
- whether a large change was important;
- whether a small change was trivial.

### Complications

#### Squash Merges

A squash commit may attribute a multi-person pull request to one account. The pull
request is often the better collaboration unit.

#### Rebase And Cherry-Pick

Equivalent changes may appear under different commit hashes. Patch equivalence,
pull-request associations, and cherry-pick annotations may suggest duplication, but
the relationship remains an inference.

#### Co-Authorship

`Co-authored-by` message trailers are source-reported declarations. They may be
missing, malformed, or inaccurate. Pair and mob programming may leave no Git
representation at all.

#### Bots And Generated Changes

Bot activity, generated code, lockfiles, vendored code, dependency updates, and
bulk formatting must be classified before contribution aggregation. A human may
trigger generated output, and a bot may apply a human-designed change.

#### Merge Commits

Merge commits commonly combine existing work without adding equivalent original
implementation. Their line counts must not be treated like ordinary changes.

#### Signatures

A verified signature strengthens attribution to a signing identity. It does not
prove who intellectually produced or understood every changed line.

### Time Semantics

- Preserve both `authored_at` and `committed_at`.
- Neither timestamp establishes when work began or entered production.
- Preserve earlier observations when force-pushes or history rewrites change branch
  reachability.
- Do not apply a person's current team or role to a historical commit without using
  the organization assignment valid at the commit's time.

### Canonical Failure Cases

1. One person authors a commit that another person cherry-picks.
2. A squash merge collapses several contributors into one commit.
3. A bot creates a large dependency update.
4. A human commits a large generated-code change.
5. A merge commit reports thousands of changed lines without original implementation.
6. A one-line production fix requires deep domain knowledge.
7. A commit uses another employee's email.
8. Pair programming is absent from Git metadata.
9. A commit exists only on an abandoned branch.
10. A force-push removes a previously observed commit.
11. Equivalent changes appear under multiple hashes.
12. Repository migration imports a former employee's historical commit.

### Accepted Commit Decisions

1. Treat commit hashes as repository-scoped identifiers internally.
2. Preserve author, committer, and declared co-authors separately.
3. Phrase authorship evidence as source attribution.
4. Store branch, tag, and pull-request reachability as observed context.
5. Classify merge, bot, generated, vendored, and bulk mechanical changes before
   ordinary contribution aggregation.
6. Never use raw commit counts or line counts as expertise scores.
7. Preserve unresolved identities and attribution contradictions.
8. Contextualize commit activity with pull requests, reviews, incidents, and
   repeated maintenance.
9. Model patch equivalence as an inference rather than silently deduplicating.

## Next Object

The next object to define is the pull request. Pull requests provide stronger
collaboration and intent context than isolated commits or file changes.

## File Change

### Purpose And Scope

File changes provide supporting context for commits and pull requests:

- where a change occurred;
- whether it affected source code, tests, documentation, configuration, generated
  output, or another broad content category;
- whether the source reported an add, modification, deletion, rename, or copy;
- how the changed path may connect to a broader component.

File changes are not a primary expertise unit. The initial model deliberately avoids
deep semantic code analysis, perfect file lineage, and fine-grained symbol tracking.
Pull requests, reviews, incidents, and repeated work patterns provide more useful
evidence for SuccessionAI's product claims.

### Retrieval

File-change metadata may be retrieved from:

- Git commit diffs;
- GitHub pull-request and commit file APIs;
- repository exports;
- local Git comparison commands.

The initial model requires metadata and optional patch references. It does not
require storing or analyzing the complete source tree.

### Layer 1: Faithful Source Record

```python
class FileChangeKind(str, Enum):
    ADDED = "added"
    MODIFIED = "modified"
    DELETED = "deleted"
    RENAMED = "renamed"
    COPIED = "copied"
    UNKNOWN = "unknown"


class SourceFileChangeRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_repository_id: str
    commit_hash: str

    old_path: str | None = None
    new_path: str | None = None
    change_kind: FileChangeKind

    additions_reported: int | None = None
    deletions_reported: int | None = None
    similarity_reported: int | None = None
    is_binary_reported: bool | None = None

    previous_blob_hash: str | None = None
    resulting_blob_hash: str | None = None
    patch_ref: str | None = None

    observed_at: datetime
    raw_payload_ref: str
```

### Layer 2: Lightweight Normalized Record

```python
class ContentCategory(str, Enum):
    SOURCE_CODE = "source_code"
    TEST = "test"
    DOCUMENTATION = "documentation"
    CONFIGURATION = "configuration"
    INFRASTRUCTURE = "infrastructure"
    DATABASE_MIGRATION = "database_migration"
    GENERATED = "generated"
    VENDORED = "vendored"
    DEPENDENCY_MANIFEST = "dependency_manifest"
    LOCKFILE = "lockfile"
    BINARY = "binary"
    DATA = "data"
    UNKNOWN = "unknown"


class ChangeNature(str, Enum):
    SUBSTANTIVE = "substantive"
    MECHANICAL = "mechanical"
    GENERATED = "generated"
    VENDORED = "vendored"
    MIXED = "mixed"
    UNKNOWN = "unknown"


class FileChange(BaseModel):
    file_change_id: str
    commit_id: str

    old_path: str | None = None
    new_path: str | None = None
    change_kind: FileChangeKind

    additions_reported: int | None = None
    deletions_reported: int | None = None
    is_binary: bool | None = None

    content_category: ContentCategory
    change_nature: ChangeNature
    component_id: str | None = None

    patch_ref: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

`component_id` is populated only through a separately supported repository or path
mapping. A directory name alone does not confirm a component relationship.

### Classification

Broad classifications may use:

- file extensions and path conventions;
- `.gitattributes`;
- generated-file headers;
- known lockfile and package-manifest names;
- configured generated or vendored directories;
- repository-specific rules;
- human correction.

The classification method and ruleset version should remain inspectable. `UNKNOWN`
and `MIXED` are valid outcomes.

Deep semantic tags such as authentication logic, concurrency behavior, or API design
are deferred. The initial model should use pull-request descriptions, review
discussion, tickets, incidents, and architecture records for that context.

### Supported Use

File-change records may support:

- locating development activity within a repository or mapped component;
- distinguishing broad categories of work;
- filtering generated, vendored, binary, and mechanical changes;
- contextualizing commits and pull requests;
- identifying repeated recorded exposure to an area.

They should not independently create expertise, ownership, criticality, or impact
assessments.

### Cannot Establish

A file change alone cannot establish:

- expertise or understanding;
- ownership;
- work quality or difficulty;
- business or production impact;
- solution design;
- sole authorship;
- whether the changed behavior remains in use.

Line counts are descriptive metadata only. A one-line fix may be more consequential
than a generated change containing thousands of lines.

### Canonical Failure Cases

1. A pure rename appears as a deletion and addition.
2. A large formatting-only change appears substantive by volume.
3. A generated client contributes thousands of changed lines.
4. A small authentication fix has high operational consequence.
5. A path moves between components.
6. A monorepo directory name gives a misleading component mapping.
7. A binary artifact cannot be inspected textually.
8. Vendored third-party code is modified internally.
9. A test-only change is mistaken for production implementation.
10. A change is later reverted.

### Accepted File-Change Decisions

1. Treat file changes as supporting context, not a primary expertise unit.
2. Store only the metadata needed to contextualize commits and pull requests.
3. Preserve old and new paths, broad change kind, source-reported counts, and an
   optional patch reference.
4. Use broad content and change classifications with inspectable provenance.
5. Retain but distinguish generated, vendored, binary, test, and mechanical work.
6. Treat line counts as descriptive metadata only.
7. Populate component links only from separately supported mappings.
8. Defer deep semantic code analysis, symbol graphs, and perfect file lineage.
9. Interpret repeated substantive changes as possible exposure, not expertise.

## Next Object

The next object to define is the pull-request review. Reviews are distinct from pull
requests because they provide evidence about evaluation, judgment, and trusted
participation rather than implementation alone.

## Pull Request

### Purpose

A pull request is the primary collaboration unit for proposed software changes. It
can combine:

- the author's stated intent and rationale;
- commits and file-change scope;
- linked tickets, incidents, and documentation;
- requested reviewers and participating accounts;
- review and discussion activity;
- checks and merge outcome;
- lifecycle timestamps.

Pull requests are stronger evidence than isolated commit counts because they provide
context around why a change was proposed and how others evaluated it. They still do
not independently prove expertise, correctness, ownership, or production impact.

Reviews, review comments, general discussion comments, and automated checks remain
separate records linked to the pull request.

### Retrieval

For GitHub, pull-request data may be retrieved through:

- GitHub GraphQL API for pull-request metadata, participants, timelines, reviews,
  commits, and linked objects;
- GitHub REST API for required details or diff/file endpoints;
- GitHub App webhooks for lifecycle changes;
- repository exports or synthetic JSON for the demo.

Initial synchronization should retrieve complete visible pull-request history within
the configured time window. Webhooks support incremental updates, while periodic
reconciliation checks for missed events and edits.

### Layer 1: Faithful Source Record

```python
class PullRequestState(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    MERGED = "merged"
    UNKNOWN = "unknown"


class MergeMethod(str, Enum):
    MERGE_COMMIT = "merge_commit"
    SQUASH = "squash"
    REBASE = "rebase"
    UNKNOWN = "unknown"


class SourcePullRequestRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_repository_id: str
    external_pull_request_id: str
    number: int

    title: str
    body: str | None = None
    state: PullRequestState
    is_draft: bool | None = None

    author_external_actor_id: str | None = None
    requested_reviewer_external_actor_ids: list[str] = Field(default_factory=list)
    requested_team_external_ids: list[str] = Field(default_factory=list)
    assignee_external_actor_ids: list[str] = Field(default_factory=list)
    label_names: list[str] = Field(default_factory=list)

    base_branch_name: str
    head_branch_name: str
    head_repository_external_id: str | None = None
    head_commit_hash: str | None = None
    merge_commit_hash: str | None = None
    merge_method_reported: MergeMethod | None = None

    commit_hashes: list[str] = Field(default_factory=list)
    changed_file_count_reported: int | None = None
    additions_reported: int | None = None
    deletions_reported: int | None = None

    source_created_at: datetime | None = None
    source_updated_at: datetime | None = None
    source_closed_at: datetime | None = None
    source_merged_at: datetime | None = None
    merged_by_external_actor_id: str | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

Requested reviewers, assignees, labels, and state are source assertions. A requested
reviewer may never inspect the change, and an assignee may only coordinate it.

### Layer 2: Normalized Pull Request

```python
class PullRequest(BaseModel):
    pull_request_id: str
    repository_id: str
    external_pull_request_id: str
    number: int

    title: str
    body: str | None = None
    state: PullRequestState
    is_draft: bool | None = None

    author_source_account_id: str | None = None
    base_branch_name: str
    head_branch_name: str
    head_repository_id: str | None = None

    head_commit_id: str | None = None
    merge_commit_id: str | None = None
    commit_ids: list[str] = Field(default_factory=list)

    created_at: datetime | None = None
    updated_at: datetime | None = None
    closed_at: datetime | None = None
    merged_at: datetime | None = None
    merged_by_source_account_id: str | None = None
    merge_method: MergeMethod | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Counts remain available on the faithful source record or a snapshot. They should not
be interpreted as complexity or importance.

### Pull-Request Snapshots

Pull requests evolve. Titles, descriptions, requested reviewers, labels, commits,
and draft status may change:

```python
class PullRequestSnapshot(BaseModel):
    pull_request_snapshot_id: str
    pull_request_id: str

    title: str
    body: str | None = None
    state: PullRequestState
    is_draft: bool | None = None

    requested_reviewer_source_account_ids: list[str] = Field(default_factory=list)
    requested_team_ids: list[str] = Field(default_factory=list)
    assignee_source_account_ids: list[str] = Field(default_factory=list)
    label_names: list[str] = Field(default_factory=list)
    commit_ids: list[str] = Field(default_factory=list)

    observed_at: datetime
    source_record_ids: list[str] = Field(default_factory=list)
```

Snapshots preserve the observable lifecycle without treating the latest description
as the original rationale.

### Pull-Request Relationships

Links to work items, incidents, documents, components, and releases are separate,
evidence-backed relationships:

```python
class PullRequestRelationKind(str, Enum):
    IMPLEMENTS_WORK_ITEM = "implements_work_item"
    ADDRESSES_INCIDENT = "addresses_incident"
    UPDATES_DOCUMENT = "updates_document"
    AFFECTS_COMPONENT = "affects_component"
    INCLUDED_IN_RELEASE = "included_in_release"
    REVERTS_PULL_REQUEST = "reverts_pull_request"
    SUPERSEDES_PULL_REQUEST = "supersedes_pull_request"


class PullRequestRelation(BaseModel):
    pull_request_relation_id: str
    pull_request_id: str
    relation_kind: PullRequestRelationKind
    target_id: str
    resolution_status: RelationshipResolutionStatus

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

Links may be explicit, such as a ticket integration, or inferred from references.
Inferred links remain distinguishable from source-declared links.

### Stated Intent And Extracted Topics

The title and body may support claims about the author's stated intent:

```python
class PullRequestIntentRecord(BaseModel):
    pull_request_intent_id: str
    pull_request_id: str

    intent_summary: str
    stated_problem: str | None = None
    stated_solution: str | None = None
    stated_risks: list[str] = Field(default_factory=list)
    stated_test_evidence: list[str] = Field(default_factory=list)

    extraction_method: str
    extractor_version: str | None = None
    source_record_ids: list[str] = Field(default_factory=list)
```

This is a structured extraction from authored text, not independent verification.
The system should preserve wording such as "the author stated" until corroborated.

The initial model may also attach broad component or domain tags when supported by
file mappings, linked work items, or explicit text. It should abstain when the
available context is ambiguous.

### Participant Roles

Participation should be represented by action rather than one generic participant
list:

```python
class PullRequestParticipationKind(str, Enum):
    AUTHORED = "authored"
    ASSIGNED = "assigned"
    REVIEW_REQUESTED = "review_requested"
    COMMENTED = "commented"
    REVIEWED = "reviewed"
    APPROVED = "approved"
    REQUESTED_CHANGES = "requested_changes"
    MERGED = "merged"


class PullRequestParticipation(BaseModel):
    participation_id: str
    pull_request_id: str
    source_account_id: str
    participation_kind: PullRequestParticipationKind
    occurred_at: datetime | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

The review-related participation kinds summarize linked review records. The review
objects remain authoritative for review content and state.

### Supported Propositions

Pull-request records may support:

- an account opened a pull request;
- the author stated a particular intent, problem, solution, risk, or test result;
- the pull request proposed changes to particular commits, files, or components;
- reviewers or teams were requested;
- particular accounts participated through recorded actions;
- the pull request was closed, merged, superseded, or reverted;
- the pull request was linked to a ticket, incident, document, component, or release;
- repeated authored or reviewed work occurred in an area.

When combined with reviews and outcomes, pull requests can provide meaningful
evidence of implementation experience and technical participation.

### Evidence Strength Considerations

Stronger pull-request evidence generally includes:

- a specific rationale explaining tradeoffs or failure modes;
- substantive implementation linked to a real work item or incident;
- responsive discussion that addresses reviewer concerns;
- repeated work in the same component across time;
- accepted and unreverted changes;
- later maintenance or incident participation involving the same behavior.

Weaker pull-request evidence includes:

- title-only or template-only descriptions;
- generated, mechanical, vendored, or dependency-only changes;
- abandoned drafts;
- PRs opened by automation;
- trivial changes;
- changes authored elsewhere and merely imported;
- participation represented only by assignment or review request.

These are qualitative factors, not an invented numerical scoring formula.

### Cannot Establish

A pull request alone cannot establish:

- expertise or complete understanding;
- sole intellectual authorship;
- correctness or quality;
- formal ownership;
- business criticality;
- production deployment or operational success;
- that requested reviewers inspected the change;
- that a merged change remains active or unreverted;
- that a detailed description was written by the implementation author;
- that large scope implies difficult or important work.

### Time And Freshness Semantics

- Preserve created, updated, closed, and merged timestamps separately.
- Interpret author and participant organization context at the time of each action.
- Preserve observed snapshots when descriptions, labels, reviewers, or commits change.
- A merged timestamp does not establish deployment time.
- A recently edited old pull request does not become recent implementation activity.
- Reverts and superseding changes must remain linked to the original pull request.

### Privacy And Access

Pull-request titles, bodies, comments, and diffs may contain:

- credentials or accidentally committed secrets;
- customer or employee information;
- security vulnerability details;
- links to restricted systems;
- copied incident or support data.

Ingestion should preserve source access controls and support redaction or restricted
content references. Lack of access to private repositories or comments must be
recorded as an observability limitation.

### Canonical Failure Cases

1. A rich PR description was copied from a ticket and not authored by the implementer.
2. A squash merge hides several contributors.
3. A bot opens a large dependency-update pull request.
4. A human opens a generated-code pull request.
5. A requested reviewer never responds.
6. A PR is merged and immediately reverted.
7. An abandoned draft contains extensive but unused work.
8. A trivial PR has many comments because of style disagreement.
9. A critical one-line fix has little discussion.
10. A PR references the wrong ticket or component.
11. A fork-based PR attributes commits to external contributors.
12. One person opens a PR for pair- or mob-programmed work.
13. A maintainer merges a PR without understanding its domain.
14. A PR changes tests and documentation but no production behavior.
15. Restricted review comments contain the actual rationale while the visible PR
    description is generic.

### Accepted Pull-Request Decisions

1. Treat the pull request as a strong collaboration and intent source, not direct
   proof of expertise.
2. Preserve pull-request lifecycle and meaningful historical snapshots.
3. Keep commits, file changes, reviews, comments, and checks as linked records.
4. Model participant actions separately rather than using a generic participant list.
5. Preserve stated intent as attributed text until corroborated.
6. Link tickets, incidents, documents, components, releases, reverts, and superseding
   PRs through explicit relationships with provenance.
7. Treat assignment and requested review as weak participation signals.
8. Give more interpretive weight to substantive rationale, repeated work, responsive
   review discussion, and corroborated outcomes without inventing a score yet.
9. Distinguish drafts, automation, generated work, mechanical changes, imports,
   reverts, and superseded work.
10. Record access limitations and preserve source-level restrictions.

## Next Object

The next object to define is the review comment. Review comments preserve the
specific technical observations that make some reviews stronger evidence than
approval state alone.

## Pull-Request Review

### Purpose

A pull-request review records a reviewer's submitted evaluation of a proposed
change. It can provide evidence of:

- participation in technical evaluation;
- trusted or required review responsibility;
- familiarity with a component or type of change;
- detection of defects, risks, or missing considerations;
- repeated technical judgment over time.

Review state alone is weak evidence. The substance, specificity, context, subsequent
response, and repeated pattern of the review determine how informative it is.

A review is distinct from:

- being requested as a reviewer;
- leaving a general pull-request comment;
- leaving an inline review comment;
- merging the pull request;
- being named in `CODEOWNERS`.

### Retrieval

For GitHub, review data may be retrieved through:

- GitHub GraphQL pull-request review connections;
- GitHub REST pull-request review endpoints;
- review-submission and dismissal webhooks;
- repository exports or synthetic JSON for the demo.

Inline comments are retrieved separately and linked to the submitted review when the
source provides that relationship.

### Layer 1: Faithful Source Record

```python
class PullRequestReviewState(str, Enum):
    PENDING = "pending"
    COMMENTED = "commented"
    APPROVED = "approved"
    CHANGES_REQUESTED = "changes_requested"
    DISMISSED = "dismissed"
    UNKNOWN = "unknown"


class SourcePullRequestReviewRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_repository_id: str
    external_pull_request_id: str
    external_review_id: str

    reviewer_external_actor_id: str | None = None
    state: PullRequestReviewState
    body: str | None = None
    commit_hash_reviewed: str | None = None

    inline_comment_external_ids: list[str] = Field(default_factory=list)

    source_submitted_at: datetime | None = None
    source_updated_at: datetime | None = None
    source_dismissed_at: datetime | None = None
    dismissed_by_external_actor_id: str | None = None
    dismissal_message_reported: str | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

The review state describes what the platform recorded. It does not establish how
carefully the reviewer inspected the change.

### Layer 2: Normalized Review

```python
class PullRequestReview(BaseModel):
    review_id: str
    pull_request_id: str
    external_review_id: str

    reviewer_source_account_id: str | None = None
    state: PullRequestReviewState
    body: str | None = None
    reviewed_commit_id: str | None = None

    submitted_at: datetime | None = None
    updated_at: datetime | None = None
    dismissed_at: datetime | None = None
    dismissed_by_source_account_id: str | None = None
    dismissal_message: str | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

The reviewed commit matters because later commits may substantially alter the pull
request after an approval or requested-changes decision.

### Review Substance

Review substance is a derived, inspectable classification rather than a source fact:

```python
class ReviewSubstanceLevel(str, Enum):
    SUBSTANTIVE = "substantive"
    LIMITED = "limited"
    STATE_ONLY = "state_only"
    AUTOMATED = "automated"
    UNKNOWN = "unknown"


class ReviewConcernKind(str, Enum):
    CORRECTNESS = "correctness"
    SECURITY = "security"
    RELIABILITY = "reliability"
    PERFORMANCE = "performance"
    DATA_INTEGRITY = "data_integrity"
    API_OR_CONTRACT = "api_or_contract"
    OPERABILITY = "operability"
    MAINTAINABILITY = "maintainability"
    TESTING = "testing"
    DOCUMENTATION = "documentation"
    STYLE_OR_FORMATTING = "style_or_formatting"
    DOMAIN_BEHAVIOR = "domain_behavior"
    UNKNOWN = "unknown"


class ReviewSubstanceAssessment(BaseModel):
    review_substance_assessment_id: str
    review_id: str
    substance_level: ReviewSubstanceLevel
    concern_kinds: list[ReviewConcernKind] = Field(default_factory=list)

    rationale: str
    supporting_review_comment_ids: list[str] = Field(default_factory=list)
    supporting_source_record_ids: list[str] = Field(default_factory=list)

    assessment_method: str
    assessor_version: str | None = None
```

The model should not infer substance from comment length alone. A short question may
identify a critical flaw, while a long template response may add little information.

### Review Outcome And Response

Whether feedback affected the proposed change can provide useful corroboration:

```python
class ReviewResponseKind(str, Enum):
    CHANGE_APPLIED = "change_applied"
    AUTHOR_EXPLAINED = "author_explained"
    CONCERN_REJECTED = "concern_rejected"
    CONCERN_WITHDRAWN = "concern_withdrawn"
    SUPERSEDED_BY_NEW_REVIEW = "superseded_by_new_review"
    NO_OBSERVED_RESPONSE = "no_observed_response"
    UNKNOWN = "unknown"


class ReviewResponse(BaseModel):
    review_response_id: str
    review_id: str
    response_kind: ReviewResponseKind

    related_commit_ids: list[str] = Field(default_factory=list)
    related_comment_ids: list[str] = Field(default_factory=list)
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

This relationship must not assume that a later code change was caused by the review
unless comments, commits, or the source explicitly connect them.

### Review Context

Review interpretation may depend on:

- whether the reviewer was formally required;
- whether the reviewer was selected by the author, automation, or policy;
- whether the reviewer belonged to the responsible team at that time;
- whether the review covered the final revision;
- whether the review was dismissed;
- whether other reviewers disagreed;
- whether the pull request was later reverted or implicated in an incident.

These are linked contextual records, not fields that silently redefine the review.

### Supported Propositions

Review records may support:

- an account submitted a recorded review;
- the reviewer approved, commented, requested changes, or had a review dismissed;
- the review applied to a particular observed commit revision;
- the reviewer raised particular categories of concern;
- the review contained substantive or limited technical feedback;
- the author or implementation changed after review feedback;
- an account repeatedly reviewed changes in a component or domain;
- the organization repeatedly trusted or required an account to evaluate such work.

Repeated substantive reviews can be meaningful evidence of technical judgment and
domain familiarity, especially when concerns are accepted or later corroborated.

### Evidence Strength Considerations

Stronger review evidence generally includes:

- specific observations tied to code, behavior, architecture, or operational risk;
- identification of a defect or omitted edge case;
- explanation of tradeoffs or domain constraints;
- feedback that produces a relevant change or useful technical explanation;
- review of the final or near-final revision;
- repeated substantive reviews in the same area over time;
- later corroboration by tests, incidents, or other expert reviewers.

Weaker evidence generally includes:

- approval with no content;
- generic statements such as "looks good";
- style-only or formatting-only feedback;
- required signoff with no visible inspection;
- requested review without a submitted review;
- review of an early revision followed by major unreviewed changes;
- automated review output;
- reviews later dismissed for being stale or invalid.

These factors inform later inference. They do not define an unvalidated numeric
review score.

### Cannot Establish

A review alone cannot establish:

- complete understanding of the component;
- correctness of the review;
- formal ownership;
- implementation ability;
- operational capability;
- that approval means the code was safe or correct;
- that requested changes were necessary;
- that accepted feedback proves the reviewer designed the final solution;
- that frequent reviews imply deep expertise;
- that a dismissed review had no technical merit.

### Time And Freshness Semantics

- Preserve submission, update, and dismissal times separately.
- Link a review to the commit revision it evaluated when available.
- Do not apply an approval to substantial later changes without evidence of a new
  review.
- Interpret team, role, and ownership context at review time.
- Preserve dismissed and superseded reviews rather than deleting them.
- Repeated old reviews may support historical familiarity but not current expertise
  without fresher evidence.

No fixed freshness window is defined yet.

### Automation

Automated reviews from linters, security scanners, test systems, and AI review tools
must be classified as automated actors. Their findings may be useful technical
evidence, but they do not provide evidence of a human reviewer's expertise.

A human posting copied automated output should not automatically receive credit for
the underlying detection.

### Privacy And Access

Review bodies and inline comments may disclose:

- security vulnerabilities;
- customer information;
- internal architecture;
- credentials or secrets;
- interpersonal or performance-sensitive language.

Source access controls and redaction requirements must be preserved. Missing private
or deleted comments reduce the ability to assess review substance.

### Canonical Failure Cases

1. A reviewer submits an empty approval to satisfy branch protection.
2. A short review identifies a critical race condition.
3. A long review contains only formatting comments.
4. A reviewer approves an early revision before major later changes.
5. A valid review is dismissed because the reviewer left the organization.
6. A stale or incorrect review requests unnecessary changes.
7. Two qualified reviewers disagree on a domain constraint.
8. A bot posts a security finding under a human-looking account name.
9. A human copies a scanner's output into a review.
10. An author changes code after feedback, but the change is unrelated.
11. A reviewer repeatedly approves one team's PRs due to policy, without domain depth.
12. A reviewer catches an issue that later appears in an incident after being ignored.
13. Restricted inline comments contain the only substantive feedback.
14. A reviewer is assigned through `CODEOWNERS` but never submits a review.
15. A merge administrator approves solely to unblock an emergency change.

### Accepted Review Decisions

1. Keep submitted reviews distinct from review requests and general comments.
2. Preserve the reviewed commit revision whenever available.
3. Separate review state from review substance.
4. Classify substance and concern categories with inspectable provenance.
5. Do not use comment length as a proxy for review quality.
6. Represent observed responses to feedback without assuming causality.
7. Treat repeated substantive reviews as evidence of judgment and familiarity, not
   automatic proof of expertise.
8. Distinguish required, automated, dismissed, stale, state-only, and emergency
   approvals.
9. Preserve disagreements and later corroboration or contradiction.
10. Keep automated review evidence separate from human expertise evidence.

## Release

### Purpose And Scope

A release records that a development platform or repository workflow published a
named version of repository content. It may help connect commits and pull requests
to a version boundary.

Release data is optional supporting context. Many organizations deploy continuously,
use tags without platform releases, or do not maintain formal release objects.
Missing release records must not count as missing engineering activity.

A published release does not establish that the version reached a development,
staging, or production environment. Deployment evidence belongs to Production
Operations.

### Retrieval

Release information may come from:

- GitHub or GitLab release APIs;
- Git tags;
- changelog or release automation;
- package registries;
- repository exports or synthetic JSON.

Platform releases and Git tags should remain distinguishable because either may
exist without the other.

### Layer 1: Faithful Source Record

```python
class SourceReleaseRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_repository_id: str
    external_release_id: str

    tag_name: str
    target_commit_hash: str | None = None
    release_name: str | None = None
    body: str | None = None

    author_external_actor_id: str | None = None
    is_draft: bool | None = None
    is_prerelease: bool | None = None
    is_latest_reported: bool | None = None

    source_created_at: datetime | None = None
    source_published_at: datetime | None = None
    source_updated_at: datetime | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

### Layer 2: Lightweight Normalized Release

```python
class Release(BaseModel):
    release_id: str
    repository_id: str
    external_release_id: str

    tag_name: str
    target_commit_id: str | None = None
    release_name: str | None = None
    release_notes: str | None = None

    author_source_account_id: str | None = None
    is_draft: bool | None = None
    is_prerelease: bool | None = None

    created_at: datetime | None = None
    published_at: datetime | None = None
    updated_at: datetime | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Included commits and pull requests should be represented through explicit
relationships when the source or version comparison supports them:

```python
class ReleaseContentLink(BaseModel):
    release_content_link_id: str
    release_id: str
    commit_id: str | None = None
    pull_request_id: str | None = None
    resolution_status: RelationshipResolutionStatus

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Use

Release records may support:

- a named version was published;
- an account performed the recorded publication action;
- a tag targeted a particular observed commit;
- commits or pull requests were included within a version boundary;
- release notes stated particular changes or risks;
- a person repeatedly participated in release preparation.

Release notes remain attributed statements. The release author may be automation or
the person who clicked a button rather than the developer responsible for included
changes.

### Cannot Establish

A release alone cannot establish:

- deployment to any environment;
- production use or success;
- implementation authorship;
- expertise or ownership;
- business importance;
- that release notes are complete or correct;
- that the release author understood all included changes.

### Canonical Failure Cases

1. A release is published automatically by a bot.
2. A Git tag exists without a platform release.
3. A platform release exists but is never deployed.
4. Continuous deployment occurs without formal releases.
5. Release notes omit a consequential change.
6. One maintainer publishes work authored by many contributors.
7. A prerelease is mistaken for a production version.
8. A tag is moved or recreated.

### Accepted Release Decisions

1. Treat releases as optional supporting context.
2. Do not penalize repositories or people when formal release objects are absent.
3. Keep tags, platform releases, and deployments conceptually distinct.
4. Link included commits and pull requests with explicit provenance.
5. Treat release authorship as publication activity, not implementation ownership.
6. Preserve draft and prerelease status.
7. Leave environment deployment and operational outcome to Production Operations.

## Next Object

The final object in Software Development is branch activity.

## Branch Activity

### Purpose And Scope

Branch data provides lightweight workflow and reachability context:

- whether a commit was observed on the default or another named branch;
- which branches served as pull-request bases or heads;
- whether the source reported branch protection;
- when a branch reference was last observed.

Branches are mutable references, not durable units of work or expertise. The initial
model does not treat branch creation, push frequency, or branch ownership as
meaningful expertise evidence.

### Retrieval

Branch metadata may come from:

- Git references in a repository clone;
- GitHub or GitLab branch APIs;
- push, create, delete, and default-branch-change webhooks;
- pull-request base and head references;
- repository exports or synthetic JSON.

Complete historical branch activity may be unavailable because deleted branch
references are often not retained by Git itself.

### Layer 1: Faithful Source Record

```python
class BranchEventKind(str, Enum):
    OBSERVED = "observed"
    CREATED = "created"
    UPDATED = "updated"
    DELETED = "deleted"
    MADE_DEFAULT = "made_default"
    REMOVED_AS_DEFAULT = "removed_as_default"
    UNKNOWN = "unknown"


class SourceBranchActivityRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_repository_id: str

    branch_name: str
    event_kind: BranchEventKind
    head_commit_hash: str | None = None
    actor_external_actor_id: str | None = None

    is_default_reported: bool | None = None
    is_protected_reported: bool | None = None
    protection_rule_names_reported: list[str] = Field(default_factory=list)

    source_occurred_at: datetime | None = None
    observed_at: datetime
    raw_payload_ref: str
```

### Layer 2: Lightweight Normalized Observation

```python
class BranchObservation(BaseModel):
    branch_observation_id: str
    repository_id: str
    branch_name: str
    event_kind: BranchEventKind

    head_commit_id: str | None = None
    actor_source_account_id: str | None = None
    is_default: bool | None = None
    is_protected: bool | None = None

    occurred_at: datetime | None = None
    observed_at: datetime
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

No permanent branch entity is required for the initial model. Observations are
sufficient because branch names can be deleted, recreated, and moved.

### Supported Use

Branch observations may support:

- a commit was reachable from an observed branch at a particular time;
- a branch was the repository's reported default branch;
- a branch was used as a pull-request base or head;
- protection was reported for a branch;
- an account performed a recorded branch update or deletion.

This context can distinguish merged work from abandoned or isolated work.

### Cannot Establish

Branch activity alone cannot establish:

- expertise, ownership, or responsibility;
- intellectual authorship of commits on the branch;
- code quality or importance;
- review completion;
- deployment or production use;
- that branch protection was actually effective;
- complete branch history.

### Canonical Failure Cases

1. A deleted branch is absent from a later repository scan.
2. A branch name is deleted and recreated for unrelated work.
3. A bot updates the branch after a human-authored commit.
4. A long-lived branch contains stale, unmerged work.
5. The default branch changes from `master` to `main`.
6. A protected branch receives an emergency administrative bypass.
7. A commit is reachable from several branches.
8. A fork's head branch is mistaken for an internal branch.

### Accepted Branch Decisions

1. Keep branch activity lightweight and observational.
2. Do not create expertise signals from branch counts or push frequency.
3. Use branch context mainly for commit reachability and pull-request lifecycle.
4. Preserve default-branch and protection observations when available.
5. Do not assume complete historical visibility for deleted branches.
6. Keep production deployment separate.

## Review Comment

### Purpose

A review comment records a specific observation, question, recommendation, or reply
within pull-request review discussion. Review comments provide the inspectable
substance beneath broader review states.

They can reveal:

- what code or behavior a reviewer examined;
- which technical concern was raised;
- whether the concern involved domain knowledge or a general convention;
- how the author or other participants responded;
- whether later code addressed, invalidated, or left the concern unresolved.

Comment text is an attributed statement, not verified truth. A technically confident
comment may still be wrong.

### Scope

The initial model distinguishes:

- **Inline review comments:** attached to a file, line, or diff position;
- **Review-body comments:** submitted as part of a review but not line-specific;
- **Replies:** comments inside an existing review thread;
- **General pull-request comments:** timeline discussion outside a submitted review.

All may be normalized into a common discussion model, while preserving their
source-reported kind. General comments must not be silently upgraded into submitted
reviews.

### Retrieval

For GitHub, review comments may be retrieved through:

- GitHub GraphQL review threads, comments, and pull-request timeline connections;
- GitHub REST review-comment and issue-comment endpoints;
- comment creation, edit, deletion, and resolution webhooks where available;
- repository exports or synthetic JSON for the demo.

Deleted comment content may be unavailable. The connector should preserve a deletion
observation rather than fabricate the missing text.

### Layer 1: Faithful Source Record

```python
class ReviewCommentKind(str, Enum):
    INLINE = "inline"
    REVIEW_BODY = "review_body"
    THREAD_REPLY = "thread_reply"
    GENERAL_PULL_REQUEST = "general_pull_request"
    UNKNOWN = "unknown"


class DiffSide(str, Enum):
    LEFT = "left"
    RIGHT = "right"
    UNKNOWN = "unknown"


class SourceReviewCommentRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str
    external_repository_id: str
    external_pull_request_id: str
    external_comment_id: str

    external_review_id: str | None = None
    external_thread_id: str | None = None
    parent_external_comment_id: str | None = None
    author_external_actor_id: str | None = None

    comment_kind: ReviewCommentKind
    body: str | None = None

    path_reported: str | None = None
    line_reported: int | None = None
    start_line_reported: int | None = None
    side_reported: DiffSide | None = None
    commit_hash_reported: str | None = None
    original_commit_hash_reported: str | None = None
    diff_hunk_reported: str | None = None

    is_outdated_reported: bool | None = None
    is_resolved_reported: bool | None = None
    resolved_by_external_actor_id: str | None = None

    source_created_at: datetime | None = None
    source_updated_at: datetime | None = None
    source_deleted_at: datetime | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

Line positions and diff hunks are source observations tied to a particular revision.
They may become outdated when the pull request changes.

### Layer 2: Normalized Comment And Thread

```python
class ReviewThread(BaseModel):
    review_thread_id: str
    pull_request_id: str
    external_thread_id: str | None = None

    initial_comment_id: str
    comment_ids: list[str] = Field(default_factory=list)
    is_resolved: bool | None = None
    resolved_by_source_account_id: str | None = None
    resolved_at: datetime | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)


class ReviewComment(BaseModel):
    review_comment_id: str
    pull_request_id: str
    review_id: str | None = None
    review_thread_id: str | None = None
    parent_comment_id: str | None = None

    author_source_account_id: str | None = None
    comment_kind: ReviewCommentKind
    body: str | None = None

    repository_file_id: str | None = None
    path_at_comment_time: str | None = None
    line_at_comment_time: int | None = None
    start_line_at_comment_time: int | None = None
    diff_side: DiffSide | None = None
    commit_id_at_comment_time: str | None = None
    diff_hunk_ref: str | None = None

    is_outdated: bool | None = None
    is_deleted: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None
    deleted_at: datetime | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Thread resolution is a workflow state. It does not prove the technical concern was
correctly addressed.

### Extracted Comment Proposition

Technical content may be normalized into attributed propositions:

```python
class CommentSpeechAct(str, Enum):
    QUESTION = "question"
    CLAIM = "claim"
    SUGGESTION = "suggestion"
    REQUIRED_CHANGE = "required_change"
    EXPLANATION = "explanation"
    AGREEMENT = "agreement"
    DISAGREEMENT = "disagreement"
    ACKNOWLEDGEMENT = "acknowledgement"
    UNKNOWN = "unknown"


class CommentPropositionStatus(str, Enum):
    ATTRIBUTED = "attributed"
    CORROBORATED = "corroborated"
    CONTRADICTED = "contradicted"
    RESOLVED_BY_CHANGE = "resolved_by_change"
    WITHDRAWN = "withdrawn"
    UNRESOLVED = "unresolved"
    NOT_APPLICABLE_AFTER_CHANGE = "not_applicable_after_change"


class ReviewCommentProposition(BaseModel):
    comment_proposition_id: str
    review_comment_id: str

    speech_act: CommentSpeechAct
    proposition_text: str
    concern_kinds: list[ReviewConcernKind] = Field(default_factory=list)
    status: CommentPropositionStatus

    subject_component_id: str | None = None
    related_file_change_ids: list[str] = Field(default_factory=list)
    related_commit_ids: list[str] = Field(default_factory=list)
    related_comment_ids: list[str] = Field(default_factory=list)

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)

    extraction_method: str
    extractor_version: str | None = None
```

The proposition remains attributed to its author unless separate evidence
corroborates it. Extraction must preserve the original comment reference so a human
or grader can inspect the context.

### Comment Response And Resolution

Responses may include:

- an author explanation;
- a code change;
- a disagreement;
- clarification from another reviewer;
- withdrawal by the original commenter;
- thread resolution without visible technical response;
- no observed response.

```python
class CommentResolutionKind(str, Enum):
    CODE_CHANGED = "code_changed"
    AUTHOR_EXPLAINED = "author_explained"
    REVIEWER_WITHDREW = "reviewer_withdrew"
    DISAGREEMENT_REMAINS = "disagreement_remains"
    RESOLVED_WITHOUT_VISIBLE_RESPONSE = "resolved_without_visible_response"
    SUPERSEDED_BY_LATER_CHANGE = "superseded_by_later_change"
    NO_OBSERVED_RESPONSE = "no_observed_response"
    UNKNOWN = "unknown"


class ReviewCommentResolution(BaseModel):
    comment_resolution_id: str
    review_comment_id: str
    resolution_kind: CommentResolutionKind

    related_comment_ids: list[str] = Field(default_factory=list)
    related_commit_ids: list[str] = Field(default_factory=list)
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Later code changes should be linked only when the source or diff comparison supports
the relationship. Temporal sequence alone does not prove causality.

### Evidence Strength Considerations

Stronger comment evidence generally includes:

- a specific observation tied to code or documented behavior;
- explanation of why the issue matters;
- reference to a domain constraint, incident, invariant, or failure mode;
- an accurate prediction of downstream behavior;
- a relevant implementation change or technical response;
- corroboration by another source or later event;
- repeated high-specificity observations in the same area.

Weaker comment evidence generally includes:

- style preferences;
- generic questions or acknowledgements;
- copied tool output;
- comments on generated or vendored code;
- unresolved speculation;
- comments made obsolete by later revisions;
- social approval or disagreement without technical content.

Short comments are not inherently weak. For example, a brief reference to a violated
invariant may be highly informative.

### Supported Propositions

Review comments may support:

- an account examined or discussed a specific code location or behavior;
- an account raised a particular attributed technical concern;
- another participant explained, accepted, disputed, or acted on the concern;
- a concern was corroborated, contradicted, withdrawn, or made obsolete;
- repeated comments demonstrated familiarity with domain constraints or failure
  modes;
- a review's substantive classification is supported by specific comments.

### Cannot Establish

A review comment alone cannot establish:

- that its technical claim is correct;
- complete component expertise;
- formal ownership;
- implementation capability;
- that thread resolution means the concern was fixed;
- that a subsequent change was caused by the comment;
- that a comment author independently discovered copied or automated feedback;
- that comment frequency or length implies review quality.

### Time And Applicability

- Preserve comment creation, edit, and deletion timestamps.
- Preserve the commit revision and diff location applicable when the comment was made.
- Mark comments outdated when the source reports it or when the referenced diff no
  longer applies.
- Do not erase historical value merely because a comment became outdated.
- Separate "technically resolved" from "workflow thread marked resolved."
- Old comments may support historical familiarity, not necessarily current expertise.

### Privacy And Access

Comment bodies and diff hunks may contain security details, secrets, customer data,
or sensitive interpersonal content. Source permissions, redaction, and deletion
signals must be preserved.

If content is inaccessible, SuccessionAI may retain metadata indicating that a
comment existed, but it must abstain from judging its technical substance.

### Canonical Failure Cases

1. A one-line comment catches a critical authorization flaw.
2. A long comment contains only naming preferences.
3. A thread is marked resolved without any visible code change.
4. A valid comment becomes outdated after the file is rewritten.
5. A technically incorrect comment causes an unnecessary change.
6. A comment quotes output from an automated scanner.
7. A deleted comment leaves only thread metadata.
8. A general PR comment is mistaken for a submitted review.
9. Two reviewers disagree about a domain invariant.
10. A later incident corroborates a previously ignored warning.
11. A code change follows a comment but addresses a different issue.
12. Restricted comments contain the only explanation of a critical concern.
13. A reply contains the substantive insight rather than the initial comment.
14. A comment references a file path that is later renamed.
15. A social acknowledgement is counted as technical participation.

### Accepted Review-Comment Decisions

1. Preserve inline, review-body, reply, and general PR comments distinctly.
2. Store thread structure, exact revision context, and source-reported resolution.
3. Treat workflow resolution separately from technical resolution.
4. Extract technical propositions as attributed, inspectable claims.
5. Preserve corroboration, contradiction, withdrawal, and obsolescence.
6. Do not infer quality from comment length, frequency, or confidence of tone.
7. Link later comments or commits without assuming causal influence.
8. Use specific comments to support review-substance assessments.
9. Abstain from substance classification when comment content is inaccessible.
10. Preserve historical comments even when later revisions make them outdated.

## Software Development Summary

The initial Software Development model now covers:

1. Repositories as source-system containers
2. Commits as recorded change events
3. File changes as lightweight supporting context
4. Pull requests as strong intent and collaboration evidence
5. Reviews as evidence of recorded evaluation and possible technical judgment
6. Review comments as inspectable, attributed technical propositions
7. Releases as optional versioning context
8. Branch activity as lightweight reachability context

Across the family, the governing rule remains:

> Development activity can support claims about recorded participation, exposure,
> implementation, and technical evaluation. Expertise, ownership, production
> importance, and knowledge-loss risk require corroboration from other source
> families.
