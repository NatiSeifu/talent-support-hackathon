# Evidence Model Contributor Guide

> Instructions for humans and coding agents extending SuccessionAI's evidence model.

## Current Objective

Define the product's evidence semantics and evaluation foundation before designing
or implementing the backend.

The immediate work is to specify, source family by source family:

- what data SuccessionAI can retrieve;
- what a faithful source record contains;
- how records are normalized internally;
- what narrow propositions the source can support;
- what the source cannot establish;
- how provenance, time, identity, access, and contradictions are preserved;
- which decisions are accepted and which remain open.

Do not implement connectors, database models, APIs, agents, scoring systems, or UI as
part of this task.

## Required Reading

Read these documents before contributing:

1. [`../EVIDENCE_MODEL.md`](../EVIDENCE_MODEL.md)
2. [`README.md`](README.md)
3. [`TASKS.md`](TASKS.md)
4. [`../evidence-scenarios/README.md`](../evidence-scenarios/README.md)
5. [`../evidence-scenarios/ground-truth-template.md`](../evidence-scenarios/ground-truth-template.md)
6. The existing schema or scenario document most similar to your assignment

The project implementation spec does not override evidence semantics defined here.

## Current Parallel Work Plan

The source-family schema pass is complete. Current work is scenario and evaluation
fixture design.

### Workstream A: Scenario 01 Dataset Generation

Primary owner: existing session / Nati.

Files:

- [`../evidence-scenarios/scenario-01-auth-refresh.md`](../evidence-scenarios/scenario-01-auth-refresh.md)
- `../evidence-datasets/scenario-01-auth-refresh/ground_truth/*.yaml`
- `../evidence-datasets/scenario-01-auth-refresh/source_records/*.yaml`
- `../evidence-datasets/scenario-01-auth-refresh/expected_outputs/*.yaml`

Scope:

- turn Scenario 01 into ground-truth, source-record, and expected-output YAMLs;
- keep hidden truth, observable records, and expected outputs separate;
- do not modify Scenario 02 unless coordinating explicitly.

### Workstream B: Scenario 02 Spec Completion

Primary owner: parallel contributor.

Files:

- [`../evidence-scenarios/scenario-02-deployment-pipeline.md`](../evidence-scenarios/scenario-02-deployment-pipeline.md)
- [`../evidence-scenarios/ground-truth-template.md`](../evidence-scenarios/ground-truth-template.md) for structure only

Scope:

- promote Scenario 02 from brief to full canonical scenario spec;
- stay within engineering evidence sources: repositories, PRs, reviews, incidents,
  work tickets, internal docs, ownership/service metadata, deployments,
  interviews, and candidate evidence;
- do not generate Scenario 02 dataset YAMLs yet;
- do not edit Scenario 01 dataset files.

Scenario 02 should be about deployment pipeline and release rollback knowledge
risk, not billing, sales, customer success, or broader business-process knowledge.

### Remote Collaboration Rules

- Prefer separate branches or separate pull requests per workstream.
- Do not edit the same file in parallel unless explicitly coordinated.
- If a contributor needs a shared ID or concept, add it to their own scenario spec
  first and document why it is needed.
- Source records must not leak hidden truth. They should look like records a real
  source system could expose.
- Expected outputs must not be written into source-record files.
- Scenario specs should be reviewed before dataset YAML generation begins.
- If a scenario exposes a gap in the accepted source schemas, record the gap as a
  scenario-driven schema question rather than silently expanding the source model.

## Non-Negotiable Evidence Boundaries

### Preserve Three Layers

```text
1. Source record:
   What did the connected system record?

2. Evidence record:
   What narrow, attributed proposition does that record support or contradict?

3. Assessment record:
   What broader expertise, dependency, risk, or candidate conclusion is justified?
```

Never store an inference as though it were a source fact.

### Use Careful Attribution

Prefer:

- "Git attributed authorship to this account."
- "The ticket was assigned to this person."
- "The reviewer stated that this could violate an invariant."
- "The service catalog declared this team as owner."

Avoid:

- "This person wrote the code."
- "This person solved the ticket."
- "This reviewer was correct."
- "This team actually owns the system."

Stronger wording requires corroborating evidence.

### Keep Major Claims Separate

Do not collapse these into one score or concept:

- recorded activity;
- exposure;
- implementation experience;
- technical judgment;
- expertise;
- formal ownership;
- observed stewardship;
- knowledge concentration;
- business criticality;
- transferability;
- departure exposure;
- knowledge-loss risk;
- candidate gap coverage.

Activity volume is not expertise. Expertise is not ownership. Expertise
concentration is not organizational risk without criticality and transferability.

### Missing Data Is Not Negative Evidence

Absence of a record may result from:

- restricted permissions;
- omitted systems;
- incomplete history;
- unrecorded verbal or collaborative work;
- deleted or redacted content;
- identity-resolution failure;
- different organizational workflows.

Represent observability limitations and abstain where appropriate. Do not infer that
knowledge, work, or expertise is absent merely because it was not observed.

### Preserve Provenance And Contradictions

Every normalized or derived record should remain traceable to source record IDs.
Derived classifications should record their method and version when relevant.

When sources conflict, preserve both. Do not silently select the most convenient
version. Contradictions are inputs to later evidence resolution.

### Preserve Time

Do not project current identity, role, ownership, description, status, or repository
metadata backward onto historical events.

Distinguish:

- source event time;
- source creation or update time;
- observation or ingestion time;
- validity intervals;
- current state versus historical snapshots.

### Keep Identity Conservative

Use concrete identifiers and verified mappings before aliases. Name-only matches
remain ambiguous. False merges are more damaging than temporary non-merges because
they fabricate combined activity and expertise.

### Avoid Unsupported Quantification

Do not invent:

- confidence thresholds;
- source weights;
- expertise formulas;
- risk-score formulas;
- freshness windows;
- success targets;
- grading cutoffs.

First define the claim, ground truth, and evaluation method. Quantification follows
only when it can be justified and calibrated.

## Modeling Conventions

- Use Python and Pydantic-style pseudocode, not TypeScript.
- These documents specify product and data contracts; they are not implementation.
- Use stable internal IDs and preserve source-system IDs separately.
- Prefer enums for bounded, meaningful categories.
- Include `UNKNOWN`, `UNRESOLVED`, or abstention states where forced classification
  would create false certainty.
- Use `supporting_source_record_ids` and, when relevant,
  `contradicting_source_record_ids`.
- Preserve raw payload references rather than copying every source field into the
  normalized model.
- Keep source-specific vocabulary when organization-specific semantics matter.
- Normalize only enough to support defensible cross-source comparisons.
- Add abstractions only when they clarify a real recurring distinction.

## Depth Guidance

Model each source only as deeply as SuccessionAI's claims require.

Use richer treatment for sources that carry intent, reasoning, operational action,
or validation, such as pull requests, substantive reviews, incidents, and handoff
exercises.

Use lightweight treatment for contextual sources such as branch activity, release
objects, file counts, workflow transitions, and routine comments.

Avoid deep semantic code analysis, perfect file lineage, exhaustive workflow graphs,
or telemetry collection unless a defensible product claim clearly needs them.

## Per-Source Workflow

For each source family:

1. State the product purpose and strongest legitimate use.
2. Identify authoritative and supplementary retrieval methods.
3. Enumerate the meaningful source objects.
4. Work through one object at a time.
5. Define its faithful source record.
6. Define the minimum useful normalized record.
7. Define narrow supported propositions.
8. State what it cannot establish.
9. Address identity, time, freshness, access, and privacy.
10. Add canonical failure cases for synthetic evaluation.
11. Propose decisions without inventing numeric thresholds.
12. Obtain product-owner acceptance before marking decisions accepted.
13. Update the document status and [`TASKS.md`](TASKS.md).

## Standard Source-Family Sections

Use this structure where it fits:

```text
# Source Family Schema
> Status

## Purpose
## Objects

## Object Name
### Purpose And Scope
### Retrieval
### Layer 1: Faithful Source Record
### Layer 2: Normalized Record
### Supported Propositions
### Cannot Establish
### Time And Freshness
### Privacy And Access
### Canonical Failure Cases
### Proposed or Accepted Decisions

## Next Object
```

Not every lightweight object needs every heading. Keep the document proportional to
the object's evidentiary importance.

## Product Questions To Ask Repeatedly

- What exact product claim would use this field?
- Is this a source fact, extracted proposition, or assessment?
- Is the actor's role being overstated?
- Could automation, policy, or workflow explain the activity?
- Could missing access create the same observed pattern?
- Is the record current enough for the intended claim?
- What other source could corroborate or contradict it?
- What synthetic failure case would make a convincing but wrong demo?
- Should the system abstain instead?

## Collaboration Protocol

1. Claim a source family or object in [`TASKS.md`](TASKS.md) before editing.
2. Prefer separate source-family files so contributors do not edit the same document.
3. Do not rewrite accepted decisions without recording the disputed decision and
   rationale.
4. Mark new conclusions as **Proposed** until the product owner accepts them.
5. Update status incrementally after each accepted object.
6. Do not revert or overwrite another contributor's unrelated changes.
7. If two source families need the same relationship, define the source facts in
   their respective files and defer the shared relationship semantics to the family
   that owns the concept.

Examples:

- `CODEOWNERS` is retrieved from a repository but belongs semantically to Ownership
  and Architecture.
- A release belongs to Software Development; environment deployment belongs to
  Production Operations.
- Jira priority belongs to Work Management; business criticality belongs to Business
  Impact.

## Definition Of Done For A Source Family

A source family is ready for its initial design pass when:

- its meaningful objects are covered at proportionate depth;
- retrieval and access limitations are stated;
- source and normalized records are sketched in Python/Pydantic;
- supported and prohibited inferences are explicit;
- provenance, identity, and time behavior are addressed;
- important contradictions and failure cases are represented;
- accepted and deferred decisions are listed;
- the catalog and task board reflect its status.

This does not mean the schema is frozen. Evaluation design may reveal that fields or
boundaries need revision.
