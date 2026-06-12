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
| Work management | Work item through lightweight comments accepted; remaining objects in progress | [work-management.md](work-management.md) |
| Knowledge artifacts | Not started | TBD |
| Production operations | Not started | TBD |
| Ownership and architecture | Not started | TBD |
| Business impact | Not started | TBD |
| Communication and collaboration | Not started | TBD |
| Knowledge validation | Not started | TBD |
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
