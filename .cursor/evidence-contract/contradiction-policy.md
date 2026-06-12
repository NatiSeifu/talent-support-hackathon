# Evidence Hierarchy And Contradiction Policy

> Status: Initial contract complete.

## Core Principle

There is no universal source ranking. Reliability is **claim-specific**.

For example:

- Git is strong for recorded commit metadata.
- A deployment audit log is stronger for execution than a release note.
- A contract is strong for contractual commitments.
- A demonstrated task is stronger than a resume for scoped capability.
- None of those sources is universally “more reliable” than the others.

## Resolution Dimensions

Evaluate evidence along these dimensions:

1. **Directness:** Does it record the event or repeat a narrative?
2. **Attribution:** Is the actor or source identifiable?
3. **Specificity:** Does it address the exact proposition and scope?
4. **Temporal applicability:** Was it valid at the relevant time?
5. **Independence:** Is it independent corroboration or copied from another source?
6. **Completeness:** Is important context unavailable or redacted?
7. **Authority:** Is the source designated for this kind of declaration?
8. **Validation:** Was the proposition demonstrated or tested?

These are qualitative resolution factors, not numeric weights.

## Claim-Specific Preference Examples

| Proposition | Prefer | Do not substitute |
|---|---|---|
| Account belongs to person | Authoritative directory mapping | Display-name match |
| Commit attribution | Git metadata plus verified identity/signature context | PR assignee |
| Formal ownership | Time-valid catalog, charter, or `CODEOWNERS` declaration | Activity volume |
| Observed stewardship | Repeated substantive maintenance and operational action | Formal owner field |
| Deployment occurred | Deployment controller or audit log | Repository release |
| Incident action executed | Audit/action record | Postmortem summary alone |
| Contractual commitment | Contract or designated SLA registry | Incident severity |
| Current procedure | Current artifact plus operational validation | Recent edit timestamp |
| Scoped capability | Observed validation under defined criteria | Resume or nomination |
| Candidate claim | Candidate document | Recruiter summary |

## Contradiction Types

```python
class ContradictionKind(str, Enum):
    DIRECT_FACT_CONFLICT = "direct_fact_conflict"
    ATTRIBUTION_CONFLICT = "attribution_conflict"
    TEMPORAL_CONFLICT = "temporal_conflict"
    SCOPE_CONFLICT = "scope_conflict"
    DEFINITION_CONFLICT = "definition_conflict"
    AUTHORITY_CONFLICT = "authority_conflict"
    NARRATIVE_VS_ACTION = "narrative_vs_action"
    DECLARATION_VS_BEHAVIOR = "declaration_vs_behavior"
    MISSING_CONTEXT = "missing_context"
    SUPERSESSION = "supersession"
```

## Resolution Outcomes

- **Supported:** sufficient relevant evidence, no unresolved material contradiction
- **Partially supported:** proposition is justified only for part of its scope
- **Contested:** material evidence supports and contradicts the proposition
- **Contradicted:** stronger claim-specific evidence rejects the proposition
- **Superseded:** newer valid evidence replaces the earlier state
- **Unresolved:** available evidence cannot justify a direction
- **Abstained:** required evidence, access, identity, or evaluation conditions are
  inadequate

## Resolution Procedure

1. Normalize the exact proposition and scope.
2. Separate source facts from attributed narratives and assessments.
3. Check identity and entity resolution.
4. Check time validity and supersession.
5. Group supporting, contradicting, and context-only evidence.
6. Detect whether records are independent or copied.
7. Apply claim-specific authority and directness.
8. Preserve material disagreement.
9. Select a categorical resolution state.
10. Record limitations and the evidence needed to resolve the claim.

## Missing Evidence Policy

Missing evidence is not contradiction unless the source scope is demonstrably
complete for the proposition.

Examples:

- No visible Slack answer does not mean nobody answered elsewhere.
- No PR does not mean no implementation occurred.
- No document does not mean no person knows the procedure.
- No incident participation does not mean no operational capability.

## Freshness Policy

No global age cutoff exists.

Freshness depends on:

- system or process change;
- role and team changes;
- superseding declarations;
- later validation;
- operational recurrence;
- source update cadence;
- the claim being made.

An old architecture rationale may remain valid; a recent ownership field may already
be stale.

## Abstention Triggers

Abstain when any of these is material to the claim:

- unresolved identity merge;
- inaccessible decisive evidence;
- unsupported subject/entity mapping;
- inadequate evaluation criteria;
- unknown material assistance;
- incompatible time scopes;
- contradictory evidence with no claim-specific basis for resolution;
- source coverage too narrow to support an absence or uniqueness claim.

## Prohibited Resolution Behavior

- Majority vote across sources
- Latest timestamp automatically wins
- Formal source automatically overrides observed behavior
- Observed behavior silently rewrites formal ownership
- LLM confidence resolves contradictory facts
- Repetition of copied claims counts as independent corroboration
- Missing data is converted into negative evidence
- One source family directly resolves a multi-dimensional risk claim

