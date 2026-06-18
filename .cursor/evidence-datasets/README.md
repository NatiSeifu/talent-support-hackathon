# Evidence Datasets

> Synthetic datasets used to evaluate SuccessionAI evidence retrieval,
> inference, risk classification, uncertainty, interview utility, and candidate
> gap coverage.

Each dataset should keep three layers separate:

- `ground_truth/`: evaluator-only facts that the engine must not see.
- `source_records/`: visible mock records from source systems.
- `expected_outputs/`: claim resolutions, retrieval requirements, abstentions,
  and contradiction expectations.

Do not add backend implementation details here. These files describe evaluation
fixtures, not production storage.
