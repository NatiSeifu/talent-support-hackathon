# SuccessionAI Evidence Schemas

> Working specifications for each source family in the SuccessionAI evidence model.

These documents define what data SuccessionAI retrieves, how it is represented
internally, what evidence it may support, and which product decisions shaped the
schema. They are product and data-contract specifications, not implementation code.

Python and Pydantic-style pseudocode are authoritative for internal models.

## Contributing

Before extending these schemas, read:

- [CONTRIBUTING.md](CONTRIBUTING.md) for evidence boundaries and modeling workflow
- [TASKS.md](TASKS.md) to claim a source family or object

## Schema Documents

| Inventory member | Status | Document |
|---|---|---|
| Identity and organization | Initial model accepted | [identity-and-organization.md](identity-and-organization.md) |
| Software development | Initial model complete | [software-development.md](software-development.md) |
| Work management | Initial model complete | [work-management.md](work-management.md) |
| Knowledge artifacts | Initial model complete | [knowledge-artifacts.md](knowledge-artifacts.md) |
| Production operations | Initial model complete | [production-operations.md](production-operations.md) |
| Ownership and architecture | Initial model complete | [ownership-and-architecture.md](ownership-and-architecture.md) |
| Business impact | Initial model complete | [business-impact.md](business-impact.md) |
| Communication and collaboration | Initial model in progress | [communication-and-collaboration.md](communication-and-collaboration.md) |
| Knowledge validation | Initial model complete | [knowledge-validation.md](knowledge-validation.md) |
| Candidate and successor evidence | Not started | TBD |

## Standard Analysis Template

Each inventory member should address:

1. Purpose and required product questions
2. Authoritative and supplementary retrieval sources
3. Faithful source records
4. Normalized internal records
5. Supported evidence propositions
6. Claims the source cannot establish
7. Identity and time semantics
8. Freshness, updates, and deletion
9. Access, privacy, and sensitivity
10. Failure cases and evaluation fixtures
11. Accepted decisions and unresolved questions
