# SuccessionAI Evidence And Evaluation Roadmap

> Product-semantics roadmap from source schemas to an executable synthetic audit.
> This roadmap precedes backend and agent architecture decisions.

## Guiding Principle

Do not wait until every evaluation artifact is polished before testing the model.

The correct sequence is:

```text
Source semantics
    -> shared evidence contract
    -> one canonical scenario
    -> synthetic records and hidden ground truth
    -> thin deterministic engine
    -> evaluation failures
    -> model and dataset refinement
    -> broader scenario suite
```

Mock data should begin as soon as SuccessionAI has enough shared structure to avoid
encoding accidental assumptions. It should not wait for the final scoring rubrics,
UI, agents, or complete evaluation harness.

## Phase 0: Finish Source-Family Schemas

### Objective

Complete the initial semantics for all ten source families.

### Status

Complete for the initial design pass.

### Exit Gate

- All source families define source records, normalized records, supported claims,
  prohibited claims, provenance, time semantics, access limitations, and failure
  cases.
- Cross-family boundaries are explicit.
- No source family directly produces a final expertise or knowledge-risk score.

## Phase 1: Define The Shared Evidence Contract

### Objective

Create the common structures that connect source-family records without erasing
their provenance.

### Status

Complete for the initial contract. Open product decisions remain active.

### Artifacts

1. **Product claims and prohibited-claims table**
2. **Structured evidence-record envelope**
3. **Evidence hierarchy and contradiction policy**
4. **Evidence-source semantics matrix**
5. **Open product decisions register**

### Minimum Evidence Envelope

The shared contract should identify:

- evidence ID and proposition;
- subject and object references;
- proposition type;
- source record IDs and source family;
- event, validity, and observation times;
- supporting and contradicting evidence;
- attribution status;
- resolution state;
- access and observability limitations;
- extraction or classification method and version.

It should not yet contain a universal confidence number or source weight.

### Exit Gate

Two records from different source families can support or contradict the same narrow
proposition without being flattened into one source fact.

## Phase 2: Define Ground Truth And The First Scenario

### Objective

Specify what the synthetic organization actually knows before generating what the
system is allowed to observe.

### Artifacts

1. **Ground-truth scenario template**
2. **Canonical scenario 1 specification**
3. **Expected claim set**
4. **Prohibited inference set**
5. **Access-profile variants**

### Status

Ground-truth template and canonical scenario 1 specification created. Scenario 1
expected and prohibited claim sets are included in the scenario spec.

### Recommended First Scenario

Use one small, intentionally legible scenario:

```text
Company:
Small SaaS organization

At-risk capability:
Authentication token refresh and Redis failover

Departing employee:
Primary operational expert with substantial implementation and incident history

Other employees:
- one reviewer with partial conceptual familiarity;
- one engineer with adjacent implementation exposure;
- one manager listed as formal owner but without technical capability;
- one successor candidate with relevant general experience but no company-specific
  operational knowledge.

Hidden truth:
- one undocumented recovery step;
- one stale runbook;
- one misleading CODEOWNERS declaration;
- one second person who can perform part, but not all, of the procedure;
- one incident whose final report misattributes the decisive diagnosis.
```

The scenario must define truth separately from the visible records.

### Exit Gate

For every intended product claim, the scenario states:

- the hidden truth;
- the observable supporting evidence;
- observable counterevidence;
- deliberately missing evidence;
- the correct resolution or abstention behavior.

## Phase 3: Generate The First Mock Dataset

### Objective

Create the smallest internally consistent dataset that exercises the evidence
contract and the core reasoning path.

This is where mock-data generation should begin.

### Status

Initial Scenario 01 YAML dataset generated with separate `ground_truth/`,
`source_records/`, and `expected_outputs/` layers. The dataset currently parses as
YAML, and required retrieval IDs resolve to observable source records.

### Dataset Layers

Keep three separate layers:

```text
scenario/ground_truth/
    Facts known to the dataset author and evaluator only

scenario/source_records/
    What GitHub, Jira, incidents, docs, identity, ownership, and business sources
    visibly report

scenario/expected_outputs/
    Claims the engine should support, reject, contest, or abstain from
```

### Initial Source Slice

Do not synthesize every possible field or source object. Start with enough data to
exercise the core claim:

- Identity and Organization
- Software Development: PRs, reviews, and selected commits
- Work Management: selected tickets and relationships
- Knowledge Artifacts: runbook, design note, and revision history
- Production Operations: two or three incidents with timelines and actions
- Ownership and Architecture: service, component, dependency, and ownership records
- Business Impact: one current criticality declaration and recovery objective
- Knowledge Validation: one interview and one successor exercise

Communication and candidate records should be included if they are needed to test
collaboration evidence or candidate gap coverage. They should stay scoped to the
scenario claim, not expanded into full Slack or recruiting simulations.

### Required Imperfections

The first dataset must include:

- contradictory sources;
- stale records;
- unresolved identity or ownership;
- restricted or omitted evidence;
- automation activity;
- a misleading high-volume contributor;
- a low-volume but consequential contribution;
- evidence that supports partial rather than complete capability;
- at least one claim for which abstention is correct.

### Exit Gate

- All source records validate against the conceptual schema.
- Every record traces to a hidden truth or intentional distractor.
- Cross-source identifiers resolve deliberately.
- Contradictions and missing evidence are intentional, not generation mistakes.

## Phase 4: Build A Thin Deterministic Evidence Engine

### Objective

Test whether the evidence model works before introducing multi-agent reasoning.

### Status

Initial engine contract created in
`.cursor/evidence-engine/thin-deterministic-engine-contract.md`. Implementation is
not started.

### Initial Capabilities

1. Load and validate source records.
2. Resolve explicit cross-source identities and entity links.
3. Emit narrow evidence propositions.
4. Assemble support and contradiction sets.
5. Apply freshness and access context without invented thresholds.
6. Produce claim states:
   - supported;
   - partially supported;
   - contested;
   - contradicted;
   - unresolved;
   - abstained.
7. Trace every result back to source records.

### Deliberately Excluded

- Final risk score
- LLM debate
- Agent role architecture
- UI
- Candidate ranking
- Automatic source weighting
- Uncalibrated confidence percentages

### Exit Gate

The engine produces a defensible evidence packet for the first scenario, and a human
can inspect why each claim was supported, rejected, contested, or withheld.

## Phase 5: Add The First Evaluation Loop

### Objective

Measure the core engine against deterministic ground truth.

### Initial Metrics

Keep these categories separate:

#### Retrieval Correctness

- Required source-record recall
- Irrelevant-record rate
- Citation validity
- Identity and entity link correctness

#### Evidence Construction

- Proposition extraction precision and recall
- Attribution correctness
- Temporal-scope correctness
- Contradiction detection recall
- Provenance completeness

#### Inference Correctness

- Supported-claim precision and recall
- Prohibited-inference rate
- Partial-capability recognition
- Correct contestation rate

#### Uncertainty And Abstention

- Abstention correctness
- Unsupported-claim rate
- Missing-evidence recognition
- Access-limitation recognition

Do not set success targets until baseline behavior and error costs are understood.

### Exit Gate

The evaluation can distinguish retrieval failure from evidence-construction failure,
inference failure, and uncertainty failure.

## Phase 6: Expand To Five Canonical Scenarios

### Objective

Prevent the engine from overfitting the first departure story.

### Proposed Scenario Families

1. **True single-holder operational knowledge**
2. **Apparent expert with strong activity but broad team redundancy**
3. **Formal owner differs from observed steward**
4. **Critical knowledge exists in usable documentation despite low person redundancy**
5. **Sparse or restricted evidence requiring abstention**

Each scenario should run under:

- comprehensive access;
- manager-visible access;
- restricted access.

### Exit Gate

The engine changes its claims and uncertainty when evidence availability changes,
without treating missing evidence as evidence of absence.

## Phase 7: Evaluate Interviews And Transfer

### Objective

Determine whether generated questions and captured answers resolve genuine gaps.

### Artifacts

- Interview-question utility rubric
- Before/after gap-resolution comparison
- Redundancy assessment
- New-information assessment
- Verifiability and usability assessment
- Successor demonstration records

### Key Question

A useful interview question should be evaluated by whether it:

1. targets an evidenced unresolved gap;
2. asks for information not already available;
3. elicits relevant new information;
4. changes the justified resolution state;
5. produces verifiable or usable output;
6. avoids overclaiming from self-report.

The Knowledge Validation schema already preserves these inputs. Numeric rewards or
weights remain deferred.

## Phase 8: Add Candidate Gap Coverage

### Objective

Test candidate and successor evidence against validated organizational needs.

### Required Separation

- Role requirement
- Organizational knowledge gap
- Candidate claimed experience
- Candidate demonstrated capability
- Company-specific gap coverage
- Remaining onboarding needs

The product should report coverage and missing evidence, not declare a universally
"best candidate."

## Phase 9: Introduce Model And Agent Roles

### Objective

Use LLM reasoning only after deterministic contracts and evaluation cases exist.

### Role Design Principle

Do not preserve the provisional five-agent architecture by default. Derive roles
from observed failure modes.

Potential boundaries include:

- retrieval and proposition extraction;
- expertise or capability inference;
- impact and risk synthesis;
- skeptical contradiction review;
- interview-question selection;
- final evidence-backed synthesis.

One role may handle several steps, or deterministic code may replace a proposed
agent entirely.

### Exit Gate

Agent or model changes can be compared against the same versioned scenarios and
metrics, and added inference-time compute demonstrates measurable improvement rather
than merely producing longer deliberation.

## Phase 10: Product Integration And Demo

### Objective

Connect the validated evidence engine to the UI, interview workflow, and hiring
intelligence flow.

### Demo Requirements

- Every visible claim cites evidence.
- Contradictions and missing access are visible.
- Confidence language matches calibration evidence.
- The interview resolves a real pre-existing gap.
- Candidate output describes gap coverage, not a hiring verdict.
- The demo contains at least one abstention or contested finding.
- No fixed before/after score is shown unless its semantics and evaluation are
  justified.

## Immediate Action Sequence

The next concrete actions are:

1. Define deterministic metric formulas for Scenario 01.
2. Define the engine run output fixture format.
3. Review Scenario 01 source records for over-obvious or hidden-truth leakage.
4. Implement the thin deterministic evidence engine.
5. Run the first retrieval, inference, contradiction, abstention, and
   interview-utility evaluations.

The first mock dataset and engine contract now exist. The next milestone is making
the evaluation executable and measurable without introducing agents or scoring
claims we have not justified.
