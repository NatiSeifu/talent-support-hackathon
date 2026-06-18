# Evidence Engine Contracts

> Product and evaluation contracts for consuming SuccessionAI evidence datasets.

This directory does not define production backend implementation. It defines what
an evaluator or future engine is allowed to read, what it must emit, and how its
outputs should be checked against scenario fixtures.

## Documents

- [thin-deterministic-engine-contract.md](thin-deterministic-engine-contract.md)

## Boundary

Evidence engine contracts sit between:

- `../evidence-datasets/`: synthetic fixtures;
- `../evidence-contract/`: shared evidence and claim semantics;
- future implementation code.

They should remain implementation-neutral until the product claims and evaluation
methodology are stable enough to justify code.
