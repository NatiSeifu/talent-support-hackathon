# Thin Deterministic Evidence Engine Contract

> Status: Initial contract.

## Purpose

The thin deterministic evidence engine is the first evaluator for SuccessionAI's
evidence model.

Its job is not to be intelligent, exhaustive, or production-ready. Its job is to
prove that the evidence records, expected outputs, and scenario fixtures are
structured well enough to support defensible product claims before LLM agents,
real connectors, backend services, or scoring systems are introduced.

For Scenario 01, the engine should answer:

> Given only observable source records, can a simple deterministic process produce
> the expected claim states, contradictions, abstentions, and interview-utility
> outcomes without reading hidden ground truth?

## Non-Goals

The engine must not introduce:

- real GitHub/Jira/Slack/incident connectors;
- database schema or API design;
- agent roles or debate loops;
- LLM extraction or grading;
- confidence percentages;
- risk scores;
- bus-factor formulas;
- candidate ranking;
- ramp-time estimates;
- source-weight formulas;
- freshness thresholds not already justified by the scenario.

If the first deterministic pass cannot explain a claim using traceable source
records, adding agents should be treated as premature.

## Allowed Inputs

For a scenario dataset, the engine may read:

```text
source_records/*.yaml
```

The evaluator may read:

```text
expected_outputs/*.yaml
```

The evaluator uses expected outputs to score the engine. The engine itself should
not use expected outputs as reasoning input.

## Forbidden Inputs During Engine Execution

The engine must not read:

```text
ground_truth/*.yaml
```

Ground truth is evaluator-only. It exists to create and audit the dataset, not to
help the engine reason.

The engine also must not use the narrative scenario spec as a hidden answer key
during execution. Scenario specs may define the dataset, but engine outputs must
be based on observable source records.

## Required Engine Stages

The first deterministic engine should be decomposed into five stages.

### 1. Load Source Records

Load all records from `source_records/*.yaml`.

Required behavior:

- preserve `record_id`;
- preserve `source_family`;
- preserve `source_system`;
- preserve source event and observation times when present;
- preserve source-qualified wording such as `supports`, `cannot_establish`, and
  `attribution_limitation`.

The loader should fail clearly when record IDs are duplicated.

### 2. Resolve Explicit Links

Resolve only explicit identifiers and links present in the source records.

Examples:

- source accounts to `person_id`;
- `linked_source_record_ids`;
- `linked_capability_ids`;
- artifact IDs;
- incident IDs;
- deployment and rollback IDs.

The engine must not infer identity from name similarity unless the source record
already provides a mapping.

### 3. Emit Narrow Evidence Propositions

Convert observable records into narrow propositions.

Examples:

```text
Sarah authored PR auth-service#184.
Mike reviewed token refresh code.
CODEOWNERS references Alex for token-refresh.
The Auth Redis Failover Runbook exists.
The runbook revision was formatting/navigation only.
Priya executed rollback during AUTH-219.
Sarah explained the Redis bypass ordering in an interview answer.
Jordan has adjacent OAuth/Redis resume evidence.
```

These propositions should use the evidence envelope semantics from
`../evidence-contract/evidence-envelope.md`.

Every proposition must cite at least one source record ID.

### 4. Resolve Claims

Use deterministic claim rules to aggregate propositions into claim results.

Allowed claim states:

- `supported`
- `supported_with_limitations`
- `supported_after_interview_validation`
- `partially_supported`
- `contested`
- `contradicted`
- `unresolved`
- `abstained`

The engine should produce claim results for the claim IDs defined by the dataset's
expected-output layer. During implementation, these claim IDs can be passed in as
configuration; the engine still must not read hidden ground truth.

### 5. Evaluate Against Expected Outputs

Evaluation compares engine output against:

```text
expected_outputs/claim_resolutions.yaml
expected_outputs/retrieval_requirements.yaml
expected_outputs/contradiction_expectations.yaml
expected_outputs/abstention_expectations.yaml
expected_outputs/interview_question_expectations.yaml
```

This comparison is deterministic. It checks whether the engine retrieved the
required records, produced the expected categorical states, preserved
contradictions, avoided prohibited claims, and identified the expected
interview-question effects.

## Required Output Artifacts

A future implementation should write outputs in a separate run directory, for
example:

```text
engine_runs/scenario-01-auth-refresh/<run_id>/
  loaded_records.yaml
  entity_links.yaml
  evidence_propositions.yaml
  claim_results.yaml
  contradiction_results.yaml
  abstention_results.yaml
  interview_utility_results.yaml
  evaluation_summary.yaml
```

These are conceptual artifacts, not committed product storage.

## Output Artifact Semantics

### `loaded_records.yaml`

Contains the observable records the engine loaded.

Minimum fields:

- `scenario_id`
- `run_id`
- `source_record_ids`
- `source_families`
- `record_count`
- duplicate or parse errors, if any

### `entity_links.yaml`

Contains explicit cross-record links the engine resolved.

Minimum fields:

- source account to person mappings;
- source record to capability mappings;
- source record to artifact mappings;
- source record to incident/deployment mappings;
- unresolved links.

Unresolved links are not failures by default. They are observability limitations
unless the evaluation fixture says the link is required.

### `evidence_propositions.yaml`

Contains narrow evidence propositions.

Minimum fields:

- `evidence_id`
- `proposition_type`
- `proposition_text`
- `subject`
- `object`
- `source_family`
- `source_record_ids`
- `polarity`
- `resolution_state`
- `cannot_establish`

### `claim_results.yaml`

Contains broader claim resolutions.

Minimum fields:

- `claim_id`
- `claim_text`
- `resolution_state`
- `supporting_evidence_ids`
- `contradicting_evidence_ids`
- `supporting_source_record_ids`
- `contradicting_source_record_ids`
- `limitations`
- `abstentions`

Every claim result must trace back to source records through evidence IDs or
direct source record IDs.

### `contradiction_results.yaml`

Contains preserved contradictions or tempting-but-insufficient evidence patterns.

Minimum fields:

- `contradiction_id`
- `observable_pattern`
- `tempting_wrong_claim`
- `correct_behavior`
- `affected_claim_ids`
- `source_record_ids`
- `resolution_effect`

### `abstention_results.yaml`

Contains outputs the system correctly refuses to make.

Minimum fields:

- `abstention_id`
- `prohibited_output`
- `reason`
- `acceptable_output`
- `related_claim_id` or `related_prohibited_claim_id`
- `source_record_ids`

### `interview_utility_results.yaml`

Contains the expected effect of interview or validation questions.

Minimum fields:

- `question_id`
- `targeted_claim_ids`
- `source_record_ids`
- `information_sought`
- `expected_resolution_change`
- `does_not_resolve`

## Scenario 01 Claim Rules

These are deliberately simple rules for the first fixture. They are not universal
product logic.

### Sarah Implementation Experience

`claim_sarah_impl_experience` is `supported` when observable software-development
records show Sarah authored or substantively reviewed token-refresh behavior.

This must not imply full operational capability.

### Sarah Operational Capability

`claim_sarah_operational_capability` is `supported_after_interview_validation`
when production-operation records show Sarah's incident participation and
knowledge-validation records show Sarah explaining the undocumented Redis bypass
ordering.

Incident presence alone is insufficient.

### Documentation Insufficiency

`claim_docs_insufficient` is `supported` when:

- the runbook exists;
- the runbook or revision record does not establish the missing bypass order; and
- validation shows a successor misses the bypass order using the runbook.

Document existence alone must not support transferability.

### Alex Formal Ownership Is Not Capability

`claim_alex_formal_not_capable` is `supported` when ownership records reference
Alex but no observable record demonstrates technical recovery capability.

Formal ownership is context, not expertise.

### Mike Partial Capability

`claim_mike_partial` is `partially_supported` when software-development records
show token-refresh review or implementation exposure, but validation records show
Mike misses Redis stale-cache recovery.

Review volume must not imply independent operational capability.

### Priya Partial Capability

`claim_priya_partial` is `partially_supported` when production-operation records
show rollback or mitigation participation, but validation shows Priya misses the
undocumented Redis bypass without help.

Incident final-resolver attribution must not imply decisive diagnosis.

### Knowledge-Loss Concern

`claim_knowledge_loss_concern` is `supported_with_limitations` when observable
records show:

- business importance;
- Sarah's departure exposure;
- Sarah-held operational knowledge;
- incomplete documentation transferability;
- partial but incomplete successor coverage.

The result must include limitations:

- exact bus factor unknown;
- no numeric risk score;
- partial coverage exists.

### Jordan Candidate Gap Coverage

`claim_jordan_gap_coverage` is `supported` when candidate records show adjacent
OAuth/Redis evidence but no company-specific Redis failover validation.

The engine must not rank Jordan globally or say Jordan covers the gap.

## Deterministic Evaluation Checks

The first evaluation pass should check these dimensions separately.

### Retrieval Correctness

For every `required_record_id` in `retrieval_requirements.yaml`, verify that the
engine loaded or retrieved the matching source record.

This measures whether the engine found the evidence, not whether it interpreted it
correctly.

### Inference Correctness

For every expected claim in `claim_resolutions.yaml`, compare the engine's
categorical `resolution_state` to the expected state.

This measures whether the engine drew the right narrow conclusion from retrieved
evidence.

### Contradiction Handling

For every contradiction in `contradiction_expectations.yaml`, verify that the
engine:

- preserved the tempting evidence;
- did not convert it into the wrong claim;
- attached it to the affected claim IDs.

### Abstention Correctness

For every abstention in `abstention_expectations.yaml`, verify that the engine did
not produce the prohibited output and did produce a safer acceptable output.

### Interview-Question Utility

For every question in `interview_question_expectations.yaml`, verify that the
engine identifies:

- what gap the question targets;
- which source record contains the answer or exercise;
- what claim state changes after the answer;
- what remains unresolved.

### Candidate Gap Coverage

Candidate evaluation is per capability or requirement. The engine must not output
a global candidate ranking.

## Failure Modes This Contract Should Catch

The first engine should fail evaluation if it:

- infers expertise from CODEOWNERS;
- infers operational capability from incident presence alone;
- infers transferability from document existence;
- treats a final incident report as complete attribution;
- treats candidate resume claims as company-specific coverage;
- collapses partial capability into full capability;
- emits a numeric risk score or confidence percentage;
- reads hidden ground truth during execution;
- cannot trace claim results to source records.

## Open Design Questions

- Should expected claim IDs be passed to the engine as configuration, or should
  the engine discover candidate claims from source records first?
- Should evidence proposition extraction be purely rule-based for Scenario 01, or
  should it allow fixture-authored `supports` fields as deterministic hints?
- What is the minimum output needed before a Python implementation is worthwhile?
- Should the first implementation evaluate one scenario at a time, or support a
  scenario registry from the start?
