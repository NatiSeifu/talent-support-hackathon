# Scenario 02: Deployment Pipeline And Release Rollback

> Status: Parallel-work brief. Not yet a complete canonical scenario.

## Purpose

This scenario gives a second contributor an independent engineering-focused track
while Scenario 01 continues into dataset generation.

Scenario 01 is auth/runtime-operations-heavy: token refresh, Redis failover,
incidents, runbooks, and candidate gap coverage.

Scenario 02 should stay inside the same engineering evidence universe but stress a
different kind of knowledge risk: release engineering knowledge across CI/CD
configuration, deployment automation, rollback procedures, incident records,
ownership metadata, and internal docs.

## Contributor Assignment

The contributor should fill this scenario using
[ground-truth-template.md](ground-truth-template.md).

They should not generate dataset YAMLs yet. Their output should be a scenario spec
with hidden truth, observable evidence plan, expected claims, prohibited claims,
and correct abstentions.

## Candidate Scenario Shape

| Field | Draft direction |
|---|---|
| Scenario ID | `scenario_02_deployment_pipeline` |
| Scenario name | Deployment Pipeline And Release Rollback |
| Primary access profile | Comprehensive |
| Organization | B2B SaaS engineering team with shared CI/CD and Kubernetes deployment workflows |
| At-risk capability | Understanding how production releases, feature-flag rollbacks, migration ordering, and deployment verification work |
| Departing employee | Senior platform/release engineer who built or repeatedly repaired the deployment pipeline |
| Business consequence | Failed releases, unsafe rollback, prolonged incidents, or broken migration recovery |

## Suggested People

| Person role | Intended truth |
|---|---|
| Departing expert | Can independently diagnose failed deploys, repair CI/CD automation, choose rollback path, and explain migration ordering |
| Application engineer | Ships many features and triggers deployments, but does not understand pipeline internals |
| SRE/on-call engineer | Can follow the deploy runbook and monitor health, but cannot repair pipeline failures without help |
| Engineering manager | Listed as release approver or owner but not technically capable of recovery |
| Candidate/successor | Has general CI/CD or Kubernetes experience but no evidence of company-specific deployment/migration knowledge |

## Suggested Capabilities

| Capability ID suggestion | Capability |
|---|---|
| `cap_ci_pipeline_diagnosis` | Diagnose CI/CD pipeline failures |
| `cap_release_rollback_proc` | Execute safe production rollback |
| `cap_migration_ordering` | Explain database migration and application deploy ordering |
| `cap_deploy_verification` | Verify release health using logs, metrics, and smoke checks |
| `cap_pipeline_arch_rationale` | Explain why the current deployment pipeline is structured as it is |

## Evidence Sources To Exercise

This scenario should emphasize:

- Software development: pipeline config PRs, release automation changes, reviews.
- Production operations: failed deploy incidents, rollback timelines, deployment records.
- Knowledge artifacts: deploy runbook, migration checklist, CI/CD design note.
- Work management: release-blocker tickets, incident follow-ups, pipeline tech-debt tasks.
- Ownership and architecture: service catalog, repo ownership, deployment system ownership.
- Communication and collaboration: public release-channel references like “ask Nina before rerunning migration rollback.”
- Business impact: production availability/SLO context for failed releases.
- Knowledge validation: interview and dry-run rollback exercise.
- Candidate and successor evidence: general CI/CD/Kubernetes experience vs company-specific release knowledge.

## Required Contradictions And Distractors

Include at least:

- A deploy runbook that exists but omits a migration-ordering caveat.
- A formal release owner or approver who is not technically capable of pipeline recovery.
- A high-volume feature deployer who appears active in release records but only uses the pipeline.
- An SRE who is named in incident timelines but needed the departing expert for decisive recovery.
- A candidate with strong Kubernetes/GitHub Actions/CircleCI experience but no evidence of company-specific migration rollback knowledge.
- One correct abstention where the system cannot determine whether a rollback path is safe without validation.

## Expected Product Behavior

The system should be able to say:

- which deployment/release capabilities are exposed by the departure;
- what evidence supports implementation, operational, and rationale claims;
- which docs are useful, stale, or insufficient for transfer;
- where another engineer has partial capability but not full recovery coverage;
- which interview or dry-run question would resolve the most important gap.

The system must not say:

- “the departing employee is the only person who understands deployments”;
- “the release approver is the deployment expert”;
- “the deploy runbook proves transferability”;
- “the candidate covers the gap because they know Kubernetes or CI/CD”;
- any numeric risk, confidence, bus-factor, or ramp-time claim.

## Done Criteria

- The file is promoted from brief to full scenario spec.
- Hidden truth is separate from observable evidence.
- Expected and prohibited claims are explicit.
- At least one contradiction, stale source, partial capability, candidate gap,
  and correct abstention are included.
- The scenario does not require editing Scenario 01 files.
