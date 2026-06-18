# Evidence Model Task Board

> Claim work here before editing evidence schemas, scenarios, datasets, or engine
> contracts. Replace `Unclaimed` with a contributor name or agent identifier and
> update status as decisions are accepted.

## Source Families

| Source family | Status | Owner | Document |
|---|---|---|---|
| Identity and organization | Initial model complete | Existing session | [identity-and-organization.md](identity-and-organization.md) |
| Software development | Initial model complete | Existing session | [software-development.md](software-development.md) |
| Work management | Initial model complete | Existing session | [work-management.md](work-management.md) |
| Knowledge artifacts | Initial model complete | Existing session | [knowledge-artifacts.md](knowledge-artifacts.md) |
| Production operations | Initial model complete | Delegated agent | [production-operations.md](production-operations.md) |
| Ownership and architecture | Initial model complete | Delegated agent | [ownership-and-architecture.md](ownership-and-architecture.md) |
| Business impact | Initial model complete | Delegated agent | [business-impact.md](business-impact.md) |
| Communication and collaboration | Initial model complete | Agent session, reviewed by existing session | [communication-and-collaboration.md](communication-and-collaboration.md) |
| Knowledge validation | Initial model complete | Delegated agent | [knowledge-validation.md](knowledge-validation.md) |
| Candidate and successor evidence | Initial model complete | Agent session, refactored by existing session | [candidate-and-successor-evidence.md](candidate-and-successor-evidence.md) |

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

These artifacts define product semantics, scenario fixtures, and evaluation
contracts:

| Artifact | Status | Owner |
|---|---|---|
| Evidence and evaluation roadmap | Complete | Existing session |
| Product claims and prohibited-claims table | Complete | Existing session |
| Evidence-source semantics matrix | Complete | Existing session |
| Evidence hierarchy and contradiction policy | Complete | Existing session |
| Structured evidence-record envelope | Complete | Existing session |
| Ground-truth scenario template | Complete | Existing session |
| Canonical scenario 1 specification | Complete | Existing session |
| Expected/prohibited claim set for scenario 1 | Complete | Existing session |
| Scenario 1 initial YAML dataset | Complete | Existing session |
| Scenario 2 canonical specification | In progress | Parallel contributor |
| Five canonical synthetic scenarios | In progress | Scenario 02 brief created |
| Thin deterministic evidence engine contract | Complete | Existing session |
| Deterministic metric definitions | Next | Unclaimed |
| Human/model grading rubrics | Not started | Unclaimed |
| Interview-question utility evaluation | Not started | Unclaimed |
| Uncertainty and abstention evaluation | Not started | Unclaimed |
| Evaluation dataset format | In progress | Initial Scenario 01 structure created |
| Open product decisions register | Active | Existing session |

## Scenario 01 Dataset Tasks

| Task | Status | Owner |
|---|---|---|
| Dataset scaffold | Complete | Existing session |
| Ground-truth YAMLs | Complete | Existing session |
| Observable source-record YAMLs | Complete | Existing session |
| Expected-output YAMLs | Complete | Existing session |
| YAML parse validation | Complete | Existing session |
| Required retrieval ID validation | Complete | Existing session |
| Review dataset for over-obvious source records | Next | Unclaimed |
| Add manager-visible/restricted dataset variants | Not started | Unclaimed |

## Evidence Engine Tasks

| Task | Status | Owner |
|---|---|---|
| Thin deterministic engine contract | Complete | Existing session |
| Define deterministic metric formulas | Next | Unclaimed |
| Define engine run output fixture format | Next | Unclaimed |
| Implement thin deterministic engine | Not started | Unclaimed |
| Run Scenario 01 retrieval evaluation | Not started | Unclaimed |
| Run Scenario 01 inference evaluation | Not started | Unclaimed |
| Run Scenario 01 contradiction evaluation | Not started | Unclaimed |
| Run Scenario 01 abstention evaluation | Not started | Unclaimed |
| Run Scenario 01 interview-utility evaluation | Not started | Unclaimed |

## Current Coordination Guidance

The source-family pass is complete. New work should target separate artifacts to
avoid collisions:

- Scenario 01 dataset/evaluation work;
- Scenario 02 canonical scenario spec;
- deterministic metric definitions;
- engine run output format;
- human/model grading rubrics.

Changes to accepted source schemas should be driven by a concrete scenario or
evaluation failure and should preserve the original decision rationale.
