# Product Claims And Prohibited Claims

> Status: Initial contract complete.

## Claim Standard

SuccessionAI should make claims about **observable evidence and justified
uncertainty**, not hidden mental states.

Every product claim must specify:

- its subject and scope;
- the proposition being asserted;
- supporting and contradicting evidence;
- time applicability;
- observability limitations;
- resolution state;
- whether it is source-attributed, inferred, or demonstrated.

## Defensible Product Claims

| Claim family | Defensible wording | Minimum evidence condition |
|---|---|---|
| Recorded activity | “The source attributed these actions to this account.” | Valid source records and resolved or disclosed identity status |
| Declared responsibility | “The service catalog declared Team A responsible for Service B during this period.” | Time-bounded ownership declaration |
| Observed exposure | “The person had recorded exposure to this component through these activities.” | Relevant activity records; no claim of understanding |
| Implementation experience | “The person repeatedly contributed substantive implementation changes in this scope.” | Corroborated PR/commit/file context with mechanical work distinguished |
| Technical evaluation | “The person provided substantive recorded review or decision feedback in this scope.” | Inspectable reviews, comments, or decisions |
| Operational participation | “The person participated in these operational events in the recorded role.” | Incident, timeline, action, or deployment records |
| Demonstrated capability | “The person demonstrated this scoped capability under these conditions.” | Knowledge Validation with criteria, observations, assistance, and evaluator context |
| Knowledge concentration | “Observed evidence for this capability is concentrated among these people within the available scope.” | Person-capability evidence distribution plus observability disclosure |
| Documentation gap | “No accessible artifact was found that covers this evidenced requirement.” | Defined search scope and requirement; absence phrased as observed |
| Documentation concern | “The available artifact is contradicted, superseded, unvalidated, or missing required content.” | Artifact propositions plus contradiction or validation evidence |
| Business consequence | “The organization classified or described these consequences for this capability.” | Business Impact declarations with native scale and validity |
| Knowledge-loss concern | “The evidence indicates a potential loss concern because critical capability evidence is concentrated and transfer evidence is incomplete.” | Separate concentration, impact, transferability, exposure, and observability evidence |
| Unresolved gap | “The available evidence cannot establish whether another person can perform this capability.” | Missing, conflicting, or insufficient evidence |
| Interview need | “This question targets this unresolved evidence gap.” | Question linked to an evidenced unresolved proposition |
| Candidate gap coverage | “The candidate has demonstrated, corroborated, claimed, adjacent, or insufficient evidence for this requirement.” | Per-requirement candidate evidence assessment |

## Required Qualifiers

Use these distinctions in user-facing language:

- **Source reported:** faithful source assertion
- **Evidence supports:** narrow inference with provenance
- **Demonstrated:** observed validation under stated conditions
- **Contested:** material supporting and contradicting evidence remain
- **Unresolved:** available evidence cannot justify a direction
- **Abstained:** the system declines because evidence or evaluation conditions are
  inadequate

## Explicitly Prohibited Claims

| Prohibited claim | Why prohibited |
|---|---|
| “This person owns the code” from commits or line counts | Authorship and ownership differ |
| “This person is the expert” from activity volume | Activity does not establish capability or uniqueness |
| “Bus factor is 1” from one top contributor | Capability and substitutes were not demonstrated |
| “Knowledge will disappear when this person leaves” | Knowledge held by others or artifacts may be unobserved |
| “No one else knows this” | Requires comprehensive validated capability evidence |
| “The document is current/correct” from recent edits | Edit recency is not substantive validity |
| “The incident was solved by this person” from presence or final action | Participation, diagnosis, action, and recovery are distinct |
| “The deployment succeeded operationally” from pipeline success | Execution status is not service outcome |
| “This system is critical” from incident severity or architecture position | Business Impact evidence is required |
| “This candidate covers the gap” from a resume claim | Claims require corroboration or demonstration |
| “Best candidate” or automatic hiring verdict | Evidence coverage is not a complete employment decision |
| Guaranteed ramp time or time to competency | Requires calibrated longitudinal evidence |
| Fixed knowledge score | No validated construct or measurement model exists |
| Fixed risk score or critical/high/medium formula | No calibrated aggregation or thresholds exist |
| Uncalibrated confidence percentage | Numeric probability semantics are undefined |
| “More debate rounds means more certainty” | More computation can repeat or amplify errors |
| “Interview answer confirmed the truth” | Interview answers begin as self-report |
| “Missing record means missing knowledge” | Missing data may reflect observability limits |

## Product Claim Boundary

SuccessionAI may provide **decision support** for documentation, handoff, staffing,
interview planning, and candidate gap analysis. It must not present evidence
assessments as employment, compensation, promotion, retention, or hiring decisions.

## Deferred Claims

These require ground truth, calibration, and outcome data:

- calibrated probability of expertise;
- calibrated probability of knowledge loss;
- combined organizational risk score;
- predicted ramp time;
- predicted transition success;
- causal ROI or time-to-competency reduction;
- universal source reliability ordering.

