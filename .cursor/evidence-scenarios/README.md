# SuccessionAI Evidence Scenarios

> Ground-truth and synthetic-data specifications for evaluating the evidence model.

## Purpose

Scenarios define what is true in the synthetic organization before we generate what
SuccessionAI is allowed to observe.

Keep these layers separate:

```text
1. Hidden ground truth:
   What the scenario author knows is true.

2. Observable source records:
   What source systems report under a specific access profile.

3. Expected outputs:
   What SuccessionAI should support, contest, contradict, or abstain from.
```

The engine must never read hidden ground truth. Ground truth exists only for dataset
generation and evaluation.

## Workflow

1. Fill out [ground-truth-template.md](ground-truth-template.md).
2. Decide the primary access profile.
3. Define expected and prohibited claims.
4. Generate source records from the observable-evidence plan.
5. Run a thin deterministic evidence engine before using LLM agents.
6. Use failures to revise the scenario, schemas, or evidence contract.

## Authoring Rules

- Start with one small scenario before broad coverage.
- Every expected claim must map to hidden truth and observable evidence.
- Every prohibited claim must have a tempting but insufficient evidence pattern.
- Include contradictions, stale records, restricted evidence, and correct abstention.
- Do not use fixed confidence percentages, risk scores, or bus-factor formulas.
- Do not let source records state the hidden truth directly unless the test is about
  source-attributed truth.

## First Scenario Recommendation

The first scenario should focus on:

- a departing employee;
- one at-risk capability;
- one stale or incomplete artifact;
- one misleading ownership declaration;
- one partial successor;
- one candidate with general but not company-specific evidence;
- one incident or operational event with misleading final attribution;
- one correct abstention.

## Parallel Scenario Work

Scenario 02 is available as an independent contributor track:

- [scenario-02-deployment-pipeline.md](scenario-02-deployment-pipeline.md)

Use it to develop a second canonical scenario while Scenario 01 moves into dataset
generation. Contributors should complete the scenario spec before generating
dataset YAMLs.
