# Scenario 01 Dataset: Auth Refresh And Redis Failover

> Status: Scaffold created. Records not yet generated.

This dataset implements the scenario defined in:

`../../evidence-scenarios/scenario-01-auth-refresh.md`

## Layers

- `ground_truth/`: hidden truth known only to dataset authors and evaluators.
- `source_records/`: observable records from identity, development, work,
  documentation, incident, ownership, business, communication, validation, and
  candidate sources.
- `expected_outputs/`: the claims, abstentions, contradictions, retrieval
  requirements, and interview-question outcomes the engine should produce.

## Generation Rule

Every source record should trace to either:

- a hidden truth from the scenario spec; or
- an intentional distractor/contradiction from the scenario spec.

If a record does neither, it probably does not belong in the first dataset.
