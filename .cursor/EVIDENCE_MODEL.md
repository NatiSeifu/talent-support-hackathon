# SuccessionAI Evidence Model

> Canonical product-semantics document for data sources, evidence, and assessments.
> This document defines what the product may infer before implementation details are chosen.

## Core Distinction

SuccessionAI separates recorded facts from interpretations and organizational conclusions:

```text
Source system
    |
    v
1. Source records: What did the system record?
    |
    v
2. Evidence records: What narrow proposition does that record support?
    |
    v
3. Assessment records: What organizational conclusion is justified?
```

These are layers of the evidence pipeline, not buckets that data sources belong to.
Every source may contribute one or more source records, which may support evidence
records, which may in turn support or contradict an assessment.

### Example

```text
Source record:
Alex approved PR #482, which changed payment retry behavior.

Evidence record:
Alex performed a substantive review of a change to payment retry behavior.

Assessment record:
Alex may have expertise in payment retry behavior.
```

The source record does not, by itself, establish the assessment.

## Fact Versus Inference

A person who pushed a change authored the recorded change. They do not necessarily
own the affected code or understand every line.

The change may be generated, reverted, pair-authored, directed by someone else,
outside the author's normal domain, or subsequently maintained by another team.
SuccessionAI must preserve distinctions such as:

- **Authorship:** recorded creation of a change or artifact
- **Declared ownership:** formal responsibility recorded by the organization
- **Observed stewardship:** repeated implementation, review, maintenance, or response behavior
- **Claimed expertise:** self-reported knowledge or experience
- **Validated expertise:** capability confirmed by qualified people or demonstrated tasks

## Data Availability Profiles

Evidence coverage should be evaluated under three access profiles:

| Profile | Typical access |
|---|---|
| **Comprehensive** | Private communications, full development history, incidents, tickets, documents, resumes, and identity directory |
| **Manager-visible** | Work artifacts and public or team channels, with limited private communications, HR data, and document telemetry |
| **Restricted** | Selected repositories, tickets, published documents, sanitized incidents, and approved candidate records |

Missing sources reduce what SuccessionAI can claim. Missing evidence must not be
treated as evidence that a person lacks expertise or that knowledge does not exist.

## Source Inventory

### 1. Identity And Organization

Defines who people are and the organizational context in which activity occurred.

- Canonical employee identity and source-system aliases
- Team membership history
- Role and job history
- Reporting structure
- Project assignments
- Employment status and relevant availability dates
- On-call rotations

This family is required for identity resolution and temporal interpretation.

### 2. Software Development

Records software changes and collaboration around them.

- Repositories
- Commits and file changes
- Pull requests
- Code reviews, comments, and approvals
- Releases and release participation
- Branch and contribution history

These records establish activity and authorship. They do not independently establish
expertise, ownership, or current responsibility.

### 3. Work Management

Records assigned, discussed, and completed work.

- Jira or Linear issues
- Projects and epics
- Assignees and participants
- Comments and status history
- Dependencies and blockers
- Acceptance or sign-off

Assignment establishes expected responsibility more strongly than demonstrated
capability. Completion may support capability when corroborated by the work product.

### 4. Knowledge Artifacts

Records explicit organizational knowledge.

- Confluence and internal documentation
- Architecture decision records
- Design documents and proposals
- Runbooks and playbooks
- Operational checklists
- Product specifications and project plans
- Document revisions, comments, and review history

Authorship and access do not establish that documentation is correct, current,
complete, or usable by another person.

### 5. Production Operations

Records practical operation of systems under normal and exceptional conditions.

- Incident timelines and postmortems
- Responders and response actions
- Alerts and acknowledgements
- Deployments, rollbacks, and remediation activity
- Change-management records
- Root-cause analyses
- Operational follow-up tasks

Final incident reports alone may omit the person who diagnosed or resolved the issue.

### 6. Ownership And Architecture

Defines formal responsibility and the technical relationships between systems.

- `CODEOWNERS` and equivalent declared ownership
- Service catalog
- System and component ownership
- Architecture maps
- System dependency graph
- Team charters

Declared ownership must remain distinct from observed stewardship.

### 7. Business Impact

Establishes why loss of knowledge about a system or process may matter.

- Business criticality classifications
- Service-level objectives
- Recovery requirements
- Revenue or customer dependencies
- Data sensitivity
- Security and regulatory obligations
- Known organizational or technical single points of failure

Without business-impact context, the product can identify concentrated activity but
cannot defensibly classify the resulting organizational risk.

### 8. Communication And Collaboration

Records coordination and knowledge that may not appear in formal work artifacts.

- Public Slack channels
- Private team channels
- Direct messages under an explicitly invasive access profile
- Email threads
- Meeting notes or transcripts
- Internal technical Q&A
- Mentoring and escalation records

These sources are noisy and privacy-sensitive. Message volume, mentions, or access
to a conversation do not establish expertise.

### 9. Knowledge Validation

Tests whether inferred knowledge is real, current, and transferable.

- Knowledge-capture interviews
- Peer and manager attestations
- Subject-matter expert nominations
- Documentation usability reviews
- Handoff exercises
- Simulated operational tasks
- Successor demonstrations
- Historical transfer outcomes

Interview answers are self-reported evidence unless independently corroborated.

### 10. Candidate And Successor Evidence

Describes potential coverage of identified organizational needs.

- Candidate resumes
- Internal work history
- Work samples
- Structured interview evaluations
- Skills assessments
- Certifications
- Candidate statements
- Role and successor requirements

A resume supports claimed prior experience. It does not establish readiness to
operate this organization's specific systems.

## Minimum Defensible Inventory

The first evidence model should include these source families:

| Source family | Why it is required |
|---|---|
| Identity and organization | Resolves people and preserves role and team history |
| Software development | Captures implementation and review behavior |
| Work management | Captures assigned responsibilities and work context |
| Knowledge artifacts | Measures the presence and maintenance of explicit knowledge |
| Production operations | Captures practical operational capability |
| Ownership and architecture | Separates formal accountability from observed stewardship |
| Business impact | Connects knowledge concentration to organizational consequences |
| Knowledge validation | Tests whether inferred knowledge exists and can be transferred |
| Candidate and successor evidence | Grounds candidate-gap and successor-coverage analysis |

Communication data is valuable but should not be mandatory for defensible baseline
operation. Its absence should be represented as an observability limitation.

## Optional Or High-Sensitivity Sources

These may improve coverage but are not required for the initial evidence model:

- Direct messages
- Email
- Meeting transcripts
- Document viewing history
- HR performance records
- Customer-support escalations
- Training records
- Calendar data
- IDE or terminal telemetry

Each requires a separate evidentiary-value, privacy, consent, and access-control
decision. For example, viewing a document establishes access, not comprehension.

## Risk Dimensions

Knowledge-loss risk must not be inferred from activity volume alone. At minimum,
future assessments should preserve these dimensions separately:

1. **Criticality:** How important is the capability or system?
2. **Concentration:** How few people appear able to perform the relevant work?
3. **Transferability:** How easily can the knowledge be learned or recovered?
4. **Freshness:** Is the supporting evidence current enough for the claim?
5. **Exposure:** Is the knowledge holder expected to become unavailable?
6. **Observability:** How much relevant activity can the system actually see?

No combined score or threshold is defined yet. Any aggregation must follow from
validated product claims and evaluation results.

## Next Modeling Step

Detailed source-family specifications and their decision history live in
[`evidence-schemas/`](evidence-schemas/README.md).

Identity and organization has an initial accepted model. The next source family is
software development. GitHub should be decomposed into distinct object types rather
than represented as generic "GitHub evidence":

- Repository
- Commit
- File change
- Pull request
- Review
- Review comment
- Release
- Declared ownership record

For each object type, define the faithful source fields, provenance, identity links,
time semantics, limitations, and the narrow propositions it may support.
