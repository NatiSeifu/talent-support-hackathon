# Evidence Model Task Board

> Claim work here before editing a source-family schema. Replace `Unclaimed` with a
> contributor name or agent identifier and update status as decisions are accepted.

## Source Families

| Source family | Status | Owner | Document |
|---|---|---|---|
| Identity and organization | Initial model accepted | Existing session | [identity-and-organization.md](identity-and-organization.md) |
| Software development | Initial model complete | Existing session | [software-development.md](software-development.md) |
| Work management | Initial model complete | Existing session | [work-management.md](work-management.md) |
| Knowledge artifacts | Initial model complete | Existing session | [knowledge-artifacts.md](knowledge-artifacts.md) |
| Production operations | Initial model complete | Delegated agent | [production-operations.md](production-operations.md) |
| Ownership and architecture | Initial model complete | Delegated agent | [ownership-and-architecture.md](ownership-and-architecture.md) |
| Business impact | Initial model complete | Delegated agent | [business-impact.md](business-impact.md) |
| Communication and collaboration | Initial model in progress | Agent session | [communication-and-collaboration.md](communication-and-collaboration.md) |
| Knowledge validation | Initial model complete | Delegated agent | [knowledge-validation.md](knowledge-validation.md) |
| Candidate and successor evidence | Initial model in progress | Agent session | [candidate-and-successor-evidence.md](candidate-and-successor-evidence.md) |

## Work Management Objects

| Object | Status | Owner |
|---|---|---|
| Workspace and project | Accepted, lightweight | Existing session |
| Work item | Accepted | Existing session |
| Assignment history | Accepted | Existing session |
| Status transition | Accepted | Existing session |
| Comment | Accepted, lightweight | Existing session |
| Dependency and relationship | Accepted, lightweight | Existing session |
| Acceptance or sign-off | Accepted, lightweight | Existing session |
| Iteration, sprint, or milestone | Accepted, lightweight | Existing session |

## Cross-Cutting Artifacts

These begin after enough source-family semantics are stable:

| Artifact | Status | Owner |
|---|---|---|
| Product claims and prohibited-claims table | Not started | Unclaimed |
| Evidence-source semantics matrix | Partially represented in schema docs | Unclaimed |
| Evidence hierarchy and contradiction policy | Not started | Unclaimed |
| Structured evidence-record envelope | Not started | Unclaimed |
| Ground-truth scenario template | Not started | Unclaimed |
| Five canonical synthetic scenarios | Not started | Unclaimed |
| Deterministic metric definitions | Not started | Unclaimed |
| Human/model grading rubrics | Not started | Unclaimed |
| Interview-question utility evaluation | Not started | Unclaimed |
| Uncertainty and abstention evaluation | Not started | Unclaimed |
| Evaluation dataset format | Not started | Unclaimed |
| Open product decisions register | Not started | Unclaimed |

## Suggested Parallel Work

The lowest-conflict parallel assignments are separate source-family documents:

- Contributor A: Knowledge Artifacts
- Contributor B: Production Operations
- Contributor C: Ownership and Architecture
- Contributor D: Business Impact

Ownership and Architecture, Production Operations, and Business Impact should compare
notes before finalizing cross-family relationships because all three contribute to
knowledge-risk assessments.

Avoid having two contributors edit `work-management.md` simultaneously unless they
coordinate distinct sections.
