# Ground-Truth Scenario Template

> Fill this out before generating source records.

## Scenario Metadata

| Field | Value |
|---|---|
| Scenario ID |  |
| Scenario name |  |
| Version |  |
| Author |  |
| Created at |  |
| Primary access profile | Comprehensive / Manager-visible / Restricted |
| Secondary access profiles |  |
| Scenario purpose |  |

## Judge-Facing Product Claim

Complete this sentence:

> SuccessionAI can help an organization determine __________.

This claim should be narrow enough to evaluate.

## Organizational Decision Supported

What decision should the output inform?

- Documentation priority
- Knowledge-capture interview planning
- Successor training
- Staffing or hiring gap coverage
- Incident-readiness planning
- Other:

State what a false positive and false negative would cost in this scenario.

## Organization And People

### Organization

| Field | Value |
|---|---|
| Company type |  |
| Team size |  |
| Primary team |  |
| Relevant systems |  |
| Time window |  |

### People

| Person ID | Role | Team | Ground-truth capability summary | Departure/exposure status |
|---|---|---|---|---|
|  |  |  |  |  |

## Capability Taxonomy

Define the capabilities that the scenario will evaluate.

| Capability ID | Capability name | Type | System/component | Why it matters | Expected transfer difficulty |
|---|---|---|---|---|---|
|  |  | Operational procedure / Diagnostic reasoning / Implementation / Decision rationale / Business process |  |  |  |

## Hidden Ground Truth

This section is not visible to the engine.

### Person-Capability Truth

| Person ID | Capability ID | True capability state | Scope | Evidence visibility plan |
|---|---|---|---|---|
|  |  | Can perform independently / Can perform with help / Conceptual familiarity / Observed only / Cannot perform / Unknown |  | Visible / Partially visible / Hidden / Contradictory |

### Knowledge Artifacts Truth

| Artifact ID | Capability ID | Truth |
|---|---|---|
|  |  | Complete and current / Stale / Incomplete / Incorrect / Inaccessible / Missing |

### Ownership And Architecture Truth

| Subject | Declared truth | Actual/observed truth | Intended contradiction |
|---|---|---|---|
|  |  |  |  |

### Business Impact Truth

| Capability ID | Impact truth | Source-visible declaration |
|---|---|---|
|  |  |  |

### Transferability Truth

| Capability ID | Transferability truth | Validation plan |
|---|---|---|
|  |  |  |

## Observable Evidence Plan

For each source family, define what the engine will see.

| Source family | Included records | Omitted/restricted records | Intended inference pressure |
|---|---|---|---|
| Identity and organization |  |  |  |
| Software development |  |  |  |
| Work management |  |  |  |
| Knowledge artifacts |  |  |  |
| Production operations |  |  |  |
| Ownership and architecture |  |  |  |
| Business impact |  |  |  |
| Communication and collaboration |  |  |  |
| Knowledge validation |  |  |  |
| Candidate and successor evidence |  |  |  |

## Contradictions And Distractors

Each scenario should contain intentional misleading patterns.

| Distractor ID | Observable pattern | Hidden truth | Correct behavior |
|---|---|---|---|
|  |  |  | Support / Partially support / Contest / Contradict / Abstain |

## Expected Claims

These are claims the system should produce or support.

| Claim ID | Claim kind | Claim text | Expected resolution | Required evidence IDs or source families | Hidden truth basis |
|---|---|---|---|---|---|
|  |  |  | Supported / Partially supported / Contested / Contradicted / Unresolved / Abstained |  |  |

## Prohibited Claims

These are tempting claims the system must avoid.

| Prohibited ID | Prohibited claim | Tempting evidence | Why prohibited | Correct safer wording |
|---|---|---|---|---|
|  |  |  |  |  |

## Interview Questions

Questions should target unresolved evidence gaps.

| Question ID | Targeted claim/gap | Question | Information sought | Expected useful answer | What would count as non-resolution |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## Candidate/Successor Coverage

| Candidate ID | Requirement/capability | Evidence state | Expected coverage disposition | Limitation |
|---|---|---|---|---|
|  |  | Claimed / Corroborated / Demonstrated / Adjacent / Insufficient / Contradicted |  |  |

## Access Profile Variants

Define how claims should change as access changes.

| Access profile | Evidence removed or added | Expected claim changes | Correct abstentions |
|---|---|---|---|
| Comprehensive |  |  |  |
| Manager-visible |  |  |  |
| Restricted |  |  |  |

## Evaluation Notes

### Retrieval Correctness

Which records must be retrieved for the scenario to work?

### Inference Correctness

Which claims test non-trivial inference?

### Risk Classification

Which evidence dimensions are needed before any knowledge-loss concern is justified?

### Uncertainty And Abstention

Where is abstention the correct behavior?

### Interview Utility

Which question should resolve which genuine gap?

### Candidate Gap Coverage

What should be claimed about candidate coverage, and what must remain unknown?

## Scenario Completion Checklist

- [ ] Hidden truth is separate from observable records.
- [ ] Every expected claim has supporting observable evidence.
- [ ] Every prohibited claim has tempting insufficient evidence.
- [ ] At least one contradiction exists.
- [ ] At least one stale source exists.
- [ ] At least one omitted or restricted source exists.
- [ ] At least one partial-capability case exists.
- [ ] At least one correct abstention exists.
- [ ] Candidate coverage is per requirement, not ranked globally.
- [ ] No fixed confidence percentages, risk scores, or knowledge scores are used.

