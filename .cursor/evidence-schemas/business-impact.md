# Business Impact Schema

> Status: Initial model complete.

## Purpose

Business Impact evidence records why an organization says loss, degradation, or
unavailability of a system, capability, data asset, or business process may matter.
It provides consequence context for later knowledge-risk assessment through:

- organization-declared criticality;
- customer and revenue dependency;
- service-level objectives, contractual commitments, and recovery objectives;
- data sensitivity classifications;
- security, legal, regulatory, and compliance obligations;
- business-process dependency;
- known organizational or technical single points of failure;
- expected, scenario-based, and observed impact statements and outcomes.

Its strongest legitimate use is to support narrow propositions such as:

> The organization's business-impact analysis classified the payroll capability as
> "Tier A" for the stated 2026 validity period.

> Contract record `C-184` stated a 99.9% monthly availability commitment for the
> named customer service during the contract term.

> The data catalog classified the linked data asset as "Restricted - Customer PII"
> under policy version 7.

These propositions may contribute criticality and consequence context to a later
knowledge-loss assessment. They do not establish that knowledge is concentrated,
that a named person has expertise, that a dependency exists at runtime, or that
knowledge loss will produce the declared outcome.

The evidence layers remain separate:

```text
1. Source record:
   A policy, catalog, contract, business-impact analysis, continuity plan, risk
   register, or outcome report recorded a declaration or attributed statement.

2. Evidence record:
   The source supports or contradicts a narrow proposition about declared
   criticality, dependency, obligation, objective, sensitivity, failure point, or
   impact.

3. Assessment record:
   Corroborated evidence may contribute to a broader conclusion about business
   criticality or knowledge-loss risk.
```

## Governing Boundaries

SuccessionAI must preserve these distinctions:

```text
Business impact:
The organization or an attributed source states that impairment of a subject may
or did cause a specified customer, financial, operational, security, legal, or
regulatory consequence.

Incident severity:
An operational source assigned urgency or severity to a particular event.

Architecture dependency:
A source declared or observed a technical relationship between entities.

Business-process dependency:
A business source stated that a process, obligation, customer outcome, or revenue
flow relies on a subject.

Single point of failure:
A source stated that one element lacks an adequate substitute or redundancy for a
specified scenario.

Knowledge-loss risk:
A separate assessment combines impact context with evidence about knowledge
concentration, transferability, freshness, exposure, and observability.
```

Business Impact must not absorb:

- incident severity, response actions, or causal conclusions from Production
  Operations;
- formal ownership from Ownership and Architecture;
- team membership or role history from Identity and Organization;
- expertise, stewardship, or activity volume from development, work-management,
  operational, communication, or validation evidence;
- technical dependency edges from Ownership and Architecture;
- the final knowledge concentration, departure exposure, successor coverage, or
  knowledge-loss assessment.

A source-native criticality label is not a universal severity rank. An SLA is not
an observed service result. A regulatory obligation is not proof of compliance or
violation. A single-point declaration is not proof that no fallback exists.

## Objects

1. Business-impact subject
2. Criticality declaration
3. Customer or revenue dependency
4. Service commitment and recovery objective
5. Data sensitivity declaration
6. Security, legal, regulatory, or compliance obligation
7. Business-process dependency
8. Known single-point-of-failure declaration
9. Impact statement or outcome
10. Attributed business-impact proposition
11. Contradiction and observability context

## Retrieval

### Preferred Sources

- organization-approved business-impact analyses;
- business-continuity and disaster-recovery plans;
- service catalogs with designated business metadata;
- contract and entitlement systems;
- SLO and SLA registries;
- data catalogs and information-classification systems;
- governance, risk, and compliance systems;
- regulatory-obligation registers and control mappings;
- business-process catalogs and process-owner-maintained dependency maps;
- enterprise risk registers;
- approved product, customer, finance, and operations reports;
- synthetic JSON for the demo.

### Supplementary Sources

- incident and postmortem impact statements;
- customer-support escalation summaries;
- status-page reports;
- audit findings and compliance assessments;
- security reviews and threat or risk assessments;
- architecture records linked to business subjects;
- work-management records for continuity or remediation work;
- policies, standards, contracts, and continuity documents;
- manually curated declarations with named authority and review history.

Supplementary records preserve what their source stated. They must not silently
become authoritative criticality classifications or verified outcomes. For example,
an incident commander may report customer impact, while a later finance report may
state a different revenue outcome. Both remain attributed and may contradict.

### Collection Requirements

Initial synchronization should retrieve visible current records and available
history. Mutable registers require snapshots or audit history because current values
must not be projected backward.

Every ingestion must record:

- included and excluded business units, catalogs, policies, contracts, products,
  services, processes, data domains, jurisdictions, and time spans;
- permissions, redactions, row-level restrictions, and field-level restrictions;
- whether source history, deleted records, revisions, and approval records were
  available;
- source-declared completeness and known retention limits;
- unresolved subject links, ambiguous customer or contract references, and parse
  failures;
- whether financial values were exact, ranged, categorized, rounded, converted,
  redacted, or unavailable;
- whether customer data was individual, aggregated, pseudonymized, or restricted;
- source event, effective, observation, and ingestion times where available.

## Shared Source And Normalization Semantics

The pseudocode is a product and data contract, not backend implementation.
Source-specific vocabulary is retained whenever normalization would invent a
cross-organization ranking or erase legal, contractual, or policy meaning.

```python
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class BusinessImpactSourceKind(str, Enum):
    BUSINESS_IMPACT_ANALYSIS = "business_impact_analysis"
    CONTINUITY_PLAN = "continuity_plan"
    SERVICE_CATALOG = "service_catalog"
    SLO_REGISTRY = "slo_registry"
    CONTRACT_SYSTEM = "contract_system"
    DATA_CATALOG = "data_catalog"
    POLICY_REGISTER = "policy_register"
    GRC_SYSTEM = "grc_system"
    REGULATORY_REGISTER = "regulatory_register"
    PROCESS_CATALOG = "process_catalog"
    RISK_REGISTER = "risk_register"
    FINANCE_REPORT = "finance_report"
    CUSTOMER_SYSTEM = "customer_system"
    INCIDENT_SYSTEM = "incident_system"
    AUDIT_OR_ASSESSMENT = "audit_or_assessment"
    KNOWLEDGE_ARTIFACT = "knowledge_artifact"
    MANUAL_DECLARATION = "manual_declaration"
    OTHER = "other"
    UNKNOWN = "unknown"


class DeclarationAuthority(str, Enum):
    ORGANIZATION_DESIGNATED = "organization_designated"
    CONTRACTUAL = "contractual"
    POLICY_DESIGNATED = "policy_designated"
    REGULATORY_INTERPRETATION = "regulatory_interpretation"
    BUSINESS_UNIT_MAINTAINED = "business_unit_maintained"
    SOURCE_NATIVE = "source_native"
    PERSON_STATEMENT = "person_statement"
    GENERATED = "generated"
    UNKNOWN = "unknown"


class BusinessImpactSubjectKind(str, Enum):
    TECHNICAL_ENTITY = "technical_entity"
    BUSINESS_CAPABILITY = "business_capability"
    BUSINESS_PROCESS = "business_process"
    PRODUCT_OR_OFFERING = "product_or_offering"
    CUSTOMER_FACING_SERVICE = "customer_facing_service"
    DATA_ASSET_OR_DOMAIN = "data_asset_or_domain"
    CONTRACTUAL_COMMITMENT = "contractual_commitment"
    SECURITY_OR_COMPLIANCE_SCOPE = "security_or_compliance_scope"
    ORGANIZATION_UNIT = "organization_unit"
    FACILITY_OR_LOCATION = "facility_or_location"
    EXTERNAL_PROVIDER = "external_provider"
    OTHER = "other"
    UNRESOLVED = "unresolved"
    UNKNOWN = "unknown"


class ImpactDimension(str, Enum):
    CUSTOMER = "customer"
    REVENUE = "revenue"
    FINANCIAL_COST = "financial_cost"
    OPERATIONS = "operations"
    PRODUCT_OR_SERVICE = "product_or_service"
    DATA = "data"
    SECURITY = "security"
    PRIVACY = "privacy"
    LEGAL = "legal"
    REGULATORY = "regulatory"
    COMPLIANCE = "compliance"
    REPUTATION = "reputation"
    SAFETY = "safety"
    WORKFORCE = "workforce"
    PARTNER_OR_SUPPLIER = "partner_or_supplier"
    OTHER = "other"
    UNKNOWN = "unknown"


class EvidencePolarity(str, Enum):
    SUPPORTS = "supports"
    CONTRADICTS = "contradicts"
    CONTEXT_ONLY = "context_only"
    UNRESOLVED = "unresolved"


class ResolutionStatus(str, Enum):
    ATTRIBUTED = "attributed"
    CORROBORATED = "corroborated"
    CONTRADICTED = "contradicted"
    CONTESTED = "contested"
    SUPERSEDED = "superseded"
    UNRESOLVED = "unresolved"


class SourceDeclarationContext(BaseModel):
    source_kind: BusinessImpactSourceKind
    source_system: str
    source_tenant_id: str | None = None
    source_record_id: str

    authority_reported: str | None = None
    normalized_authority: DeclarationAuthority
    approval_status_reported: str | None = None
    approved_by_source_actor_ids: list[str] = Field(default_factory=list)

    source_uri: str | None = None
    source_revision: str | None = None
    source_path: str | None = None
    source_created_at: datetime | None = None
    source_updated_at: datetime | None = None

    effective_from_reported: datetime | None = None
    effective_until_reported: datetime | None = None
    observed_at: datetime
    ingested_at: datetime

    access_classification_reported: str | None = None
    redacted_fields: list[str] = Field(default_factory=list)
    raw_payload_ref: str


class BusinessImpactIngestionScope(BaseModel):
    ingestion_scope_id: str
    source_system: str
    source_tenant_id: str | None = None

    included_scope_refs: list[str] = Field(default_factory=list)
    excluded_scope_refs: list[str] = Field(default_factory=list)
    included_object_types: list[str] = Field(default_factory=list)
    unavailable_object_types: list[str] = Field(default_factory=list)
    jurisdictions_observed: list[str] = Field(default_factory=list)

    history_starts_at: datetime | None = None
    history_ends_at: datetime | None = None
    permissions_observed: list[str] = Field(default_factory=list)
    redaction_notes: list[str] = Field(default_factory=list)
    retention_limitations: list[str] = Field(default_factory=list)

    collection_started_at: datetime
    collection_completed_at: datetime | None = None
    source_claimed_complete: bool
    limitations: list[str] = Field(default_factory=list)


class ReportedAmount(BaseModel):
    value_reported: str
    currency_reported: str | None = None
    amount_exact: Decimal | None = None
    amount_minimum: Decimal | None = None
    amount_maximum: Decimal | None = None
    amount_category_reported: str | None = None
    conversion_method: str | None = None
    conversion_as_of: datetime | None = None
    redacted: bool = False
```

`ReportedAmount` preserves a source value; it does not authorize a monetary impact
formula. Currency conversion, if performed for display or comparison, must retain
its method and date and must not overwrite the original.

## Business-Impact Subject

### Purpose And Scope

A Business Impact subject is the internal reference to what a declaration concerns.
It may link to a technical entity owned by Ownership and Architecture or identify a
business capability, process, product, customer-facing service, data domain,
contractual scope, or external provider.

This object does not recreate the architecture catalog or process model. It preserves
the source's subject identity and an explicit link when resolution is supported.

### Layer 1: Faithful Source Record

```python
class BusinessImpactSubjectSourceRecord(BaseModel):
    business_impact_subject_source_record_id: str
    declaration_context: SourceDeclarationContext

    subject_id_reported: str | None = None
    subject_name_reported: str
    subject_kind_reported: str | None = None
    parent_subject_id_reported: str | None = None
    scope_description_reported: str | None = None
    aliases_reported: list[str] = Field(default_factory=list)
    status_reported: str | None = None
    raw_fields: dict[str, Any] = Field(default_factory=dict)
```

### Layer 2: Normalized Record

```python
class BusinessImpactSubjectRef(BaseModel):
    business_impact_subject_id: str
    subject_kind: BusinessImpactSubjectKind
    display_name: str

    technical_entity_id: str | None = None
    external_subject_ref: str | None = None
    parent_business_impact_subject_id: str | None = None

    resolution_status: ResolutionStatus
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

Name similarity alone must not merge subjects. A product, service, process, and data
domain may share a label while carrying different impact declarations.

### Supported Propositions

- A source identified the named item as the subject of a business-impact record.
- A resolved subject was explicitly linked to a technical entity or business object.
- The source placed the subject within the reported scope or hierarchy.

### Cannot Establish

- that the subject exists or operates in production;
- a technical or runtime dependency;
- ownership, stewardship, or expertise;
- criticality without a separate declaration;
- equivalence between similarly named subjects.

## Organization-Declared Criticality

### Purpose And Scope

Criticality declarations preserve an organization's own classification, definition,
scope, authority, and validity. SuccessionAI must not impose a universal ordering
across labels such as `Tier 0`, `Tier 1`, `Gold`, `Mission Essential`, `High`, or
`Category A`.

If the source provides an explicit scale definition or ordering, preserve it as
source-specific metadata. Do not assume that lower numbers, colors, letters, or
words have equivalent meanings across organizations or even across policies.

### Layer 1: Faithful Source Record

```python
class CriticalityDeclarationSourceRecord(BaseModel):
    criticality_source_record_id: str
    declaration_context: SourceDeclarationContext

    subject_id_reported: str
    classification_reported: str
    scale_name_reported: str | None = None
    scale_version_reported: str | None = None
    definition_reported: str | None = None
    rank_or_order_reported: str | None = None
    rationale_reported: str | None = None
    impact_dimensions_reported: list[str] = Field(default_factory=list)

    review_due_at_reported: datetime | None = None
    supersedes_source_record_id: str | None = None
    raw_fields: dict[str, Any] = Field(default_factory=dict)
```

### Layer 2: Normalized Record

```python
class CriticalityDeclaration(BaseModel):
    criticality_declaration_id: str
    business_impact_subject_id: str

    classification_reported: str
    scale_name_reported: str | None = None
    scale_version_reported: str | None = None
    definition_reported: str | None = None
    source_order_reported: str | None = None
    rationale_reported: str | None = None
    impact_dimensions: list[ImpactDimension] = Field(default_factory=list)

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    review_due_at: datetime | None = None
    resolution_status: ResolutionStatus

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

No normalized `severity`, universal rank, numeric weight, or derived score is
defined. Cross-source comparison is defensible only within a documented compatible
scale and validity period.

### Supported Propositions

- The source classified the subject using the exact reported label.
- The classification used the named scale and version, when provided.
- The source stated the reported definition, rationale, dimensions, or review date.
- Two valid declarations agree, differ, or conflict within their stated scopes.

### Cannot Establish

- that one organization's `Tier 1` is more critical than another's `Critical`;
- objective importance independent of the declaring source;
- incident severity or probability of failure;
- knowledge concentration or knowledge-loss risk;
- a current classification after the declaration expires or is superseded.

## Customer And Revenue Dependency

### Purpose And Scope

This object records source-attributed dependency of customers, customer segments,
products, contracts, revenue streams, or commercial operations on a subject. It
preserves exact, ranged, categorical, aggregated, and redacted values without
inventing a revenue-at-risk formula.

Customer dependency may be declared by a contract, account record, product catalog,
finance report, business-impact analysis, or named authority. The model must
distinguish direct contractual dependency from analytical attribution or a person's
statement.

### Layer 1: Faithful Source Record

```python
class CustomerRevenueDependencySourceRecord(BaseModel):
    customer_revenue_dependency_source_record_id: str
    declaration_context: SourceDeclarationContext

    subject_id_reported: str
    dependency_kind_reported: str

    customer_id_reported: str | None = None
    customer_segment_reported: str | None = None
    contract_id_reported: str | None = None
    product_or_revenue_stream_reported: str | None = None

    dependency_description_reported: str | None = None
    customer_count_reported: str | None = None
    revenue_value_reported: str | None = None
    currency_reported: str | None = None
    measurement_period_reported: str | None = None
    allocation_method_reported: str | None = None

    confidentiality_reported: str | None = None
    raw_fields: dict[str, Any] = Field(default_factory=dict)
```

### Layer 2: Normalized Record

```python
class CommercialDependencyKind(str, Enum):
    CONTRACTUAL = "contractual"
    PRODUCT_USAGE = "product_usage"
    CUSTOMER_WORKFLOW = "customer_workflow"
    BILLING_OR_REVENUE_FLOW = "billing_or_revenue_flow"
    ANALYTICAL_ATTRIBUTION = "analytical_attribution"
    DECLARED_OTHER = "declared_other"
    UNKNOWN = "unknown"


class CustomerRevenueDependency(BaseModel):
    customer_revenue_dependency_id: str
    business_impact_subject_id: str
    dependency_kind: CommercialDependencyKind
    dependency_kind_reported: str

    customer_ref: str | None = None
    customer_segment_reported: str | None = None
    contract_ref: str | None = None
    product_or_revenue_stream_ref: str | None = None
    dependency_description_reported: str | None = None

    customer_count_reported: str | None = None
    revenue_amount: ReportedAmount | None = None
    measurement_period_reported: str | None = None
    allocation_method_reported: str | None = None

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    resolution_status: ResolutionStatus
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Propositions

- The source stated that a customer, segment, contract, product, or revenue stream
  depended on the subject in the reported manner.
- The source attributed the reported customer count or financial value for the
  stated measurement period and method.
- A contract linked the subject to a customer commitment during the contract term.

### Cannot Establish

- actual revenue loss from hypothetical knowledge loss;
- causality between subject failure and all attributed revenue;
- customer impact outside the source's scope or measurement period;
- that an analytical allocation is contractual truth;
- a universal monetary impact or risk score.

## Service Commitments And Recovery Objectives

### Purpose And Scope

This object preserves source-reported service-level indicators, objectives,
agreements, internal targets, and recovery objectives. These have distinct
semantics:

```text
SLI:
A source-defined measurement of service behavior.

SLO:
An objective for an SLI within a stated window and scope.

SLA or contractual commitment:
A contract or governing source states a commitment and possibly consequences.

RTO:
A source-stated target for restoring a capability after disruption.

RPO:
A source-stated tolerance for data loss expressed relative to a recovery point.

MTPD or equivalent:
A source-stated maximum tolerable disruption period under its own terminology.
```

SuccessionAI preserves source terms and does not infer equivalence among them.

### Layer 1: Faithful Source Record

```python
class ServiceObjectiveSourceRecord(BaseModel):
    service_objective_source_record_id: str
    declaration_context: SourceDeclarationContext

    subject_id_reported: str
    objective_kind_reported: str
    objective_name_reported: str | None = None
    target_reported: str
    indicator_or_measure_reported: str | None = None
    measurement_window_reported: str | None = None
    scope_reported: str | None = None
    exclusions_reported: list[str] = Field(default_factory=list)

    contract_id_reported: str | None = None
    customer_scope_reported: str | None = None
    consequence_reported: str | None = None
    timezone_or_calendar_reported: str | None = None

    raw_fields: dict[str, Any] = Field(default_factory=dict)
```

### Layer 2: Normalized Record

```python
class ServiceObjectiveKind(str, Enum):
    SLI_DEFINITION = "sli_definition"
    SLO = "slo"
    SLA = "sla"
    INTERNAL_SERVICE_TARGET = "internal_service_target"
    RTO = "rto"
    RPO = "rpo"
    MAXIMUM_TOLERABLE_DISRUPTION = "maximum_tolerable_disruption"
    RECOVERY_PRIORITY = "recovery_priority"
    OTHER = "other"
    UNKNOWN = "unknown"


class ServiceCommitmentOrRecoveryObjective(BaseModel):
    service_objective_id: str
    business_impact_subject_id: str
    objective_kind: ServiceObjectiveKind
    objective_kind_reported: str

    objective_name_reported: str | None = None
    target_reported: str
    indicator_or_measure_reported: str | None = None
    measurement_window_reported: str | None = None
    scope_reported: str | None = None
    exclusions_reported: list[str] = Field(default_factory=list)

    contract_ref: str | None = None
    customer_scope_reported: str | None = None
    consequence_reported: str | None = None
    timezone_or_calendar_reported: str | None = None

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    resolution_status: ResolutionStatus
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

Targets remain source-reported strings in the initial model because units, windows,
calendars, exclusions, percentile semantics, and contractual language may differ.
Structured parsing may be added only when it preserves the original and records the
parser method and version.

### Supported Propositions

- The source stated the named objective or commitment for the subject.
- The objective applied to the reported scope, window, exclusions, and validity.
- A contract stated the reported consequence or remedy.
- Two sources reported compatible or conflicting objectives.

### Cannot Establish

- actual historical attainment;
- that a pipeline, monitor, or report measured the objective correctly;
- customer harm when the objective is missed;
- operational severity of a particular incident;
- the effort, staffing, or expertise required to meet the objective.

## Data Sensitivity

### Purpose And Scope

Data sensitivity declarations record how an organization classifies data under a
specific policy, catalog, jurisdiction, or handling scheme. They preserve the exact
classification and handling context without creating a universal sensitivity scale.

### Source And Normalized Records

```python
class DataSensitivitySourceRecord(BaseModel):
    data_sensitivity_source_record_id: str
    declaration_context: SourceDeclarationContext

    subject_id_reported: str
    data_category_reported: str | None = None
    classification_reported: str
    policy_name_reported: str | None = None
    policy_version_reported: str | None = None
    handling_requirements_reported: list[str] = Field(default_factory=list)
    jurisdictions_reported: list[str] = Field(default_factory=list)
    data_subjects_reported: list[str] = Field(default_factory=list)
    rationale_reported: str | None = None
    raw_fields: dict[str, Any] = Field(default_factory=dict)


class DataSensitivityDeclaration(BaseModel):
    data_sensitivity_declaration_id: str
    business_impact_subject_id: str

    data_category_reported: str | None = None
    classification_reported: str
    policy_name_reported: str | None = None
    policy_version_reported: str | None = None
    handling_requirements_reported: list[str] = Field(default_factory=list)
    jurisdictions_reported: list[str] = Field(default_factory=list)
    data_subjects_reported: list[str] = Field(default_factory=list)
    rationale_reported: str | None = None

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    resolution_status: ResolutionStatus
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Propositions

- The source classified the subject's data using the exact reported label.
- The classification referenced the named policy and version.
- The source stated the reported handling requirements, jurisdictions, or data
  subject categories.

### Cannot Establish

- that the subject actually contains the classified data at all times;
- that all handling requirements are implemented;
- legal applicability independent of an attributed legal or compliance source;
- a breach, violation, or security incident;
- a universal ordering across organization-specific classifications.

## Security, Legal, Regulatory, And Compliance Obligations

### Purpose And Scope

This object records an attributed obligation or control applicability statement. It
may cite a law, regulation, contract, standard, internal policy, audit scope, or
control framework. It does not make SuccessionAI a legal authority and does not
convert a source's interpretation into objective legal truth.

### Source And Normalized Records

```python
class ObligationSourceRecord(BaseModel):
    obligation_source_record_id: str
    declaration_context: SourceDeclarationContext

    subject_id_reported: str
    obligation_kind_reported: str
    authority_or_framework_reported: str
    citation_reported: str | None = None
    control_id_reported: str | None = None
    obligation_text_reported: str | None = None
    applicability_reported: str | None = None
    jurisdiction_reported: str | None = None
    evidence_or_review_requirement_reported: str | None = None
    consequence_reported: str | None = None
    exception_reported: str | None = None
    raw_fields: dict[str, Any] = Field(default_factory=dict)


class ObligationKind(str, Enum):
    SECURITY = "security"
    PRIVACY = "privacy"
    LEGAL = "legal"
    REGULATORY = "regulatory"
    CONTRACTUAL = "contractual"
    COMPLIANCE_FRAMEWORK = "compliance_framework"
    INTERNAL_POLICY = "internal_policy"
    AUDIT_REQUIREMENT = "audit_requirement"
    OTHER = "other"
    UNKNOWN = "unknown"


class SecurityRegulatoryObligation(BaseModel):
    obligation_id: str
    business_impact_subject_id: str
    obligation_kind: ObligationKind
    obligation_kind_reported: str

    authority_or_framework_reported: str
    citation_reported: str | None = None
    control_id_reported: str | None = None
    obligation_text_reported: str | None = None
    applicability_reported: str | None = None
    jurisdiction_reported: str | None = None
    evidence_or_review_requirement_reported: str | None = None
    consequence_reported: str | None = None
    exception_reported: str | None = None

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    resolution_status: ResolutionStatus
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Propositions

- The source stated that an obligation or control applied to the subject.
- The source cited the reported authority, framework, jurisdiction, or control.
- The source recorded an exception, review requirement, or stated consequence.
- Sources disagreed about applicability, scope, or current obligation.

### Cannot Establish

- definitive legal applicability or legal advice;
- compliance, noncompliance, control effectiveness, or audit success;
- that a regulatory consequence will occur;
- that a person owns or understands the obligation;
- the severity or likelihood of a future violation.

## Business-Process Dependency

### Purpose And Scope

Business-process dependency records that a business process or capability relies on
a subject for a stated step, outcome, population, location, or period. This is
distinct from a technical dependency edge.

A source may declare that payroll processing relies on a service even when it does
not describe the service's runtime topology. Conversely, an architecture graph may
show a technical call without establishing material business-process dependence.

### Source And Normalized Records

```python
class BusinessProcessDependencySourceRecord(BaseModel):
    process_dependency_source_record_id: str
    declaration_context: SourceDeclarationContext

    process_id_reported: str
    process_name_reported: str
    dependent_subject_id_reported: str
    dependency_description_reported: str
    process_step_reported: str | None = None
    dependency_mode_reported: str | None = None
    fallback_reported: str | None = None
    affected_population_reported: str | None = None
    schedule_or_period_reported: str | None = None
    geography_reported: str | None = None
    raw_fields: dict[str, Any] = Field(default_factory=dict)


class BusinessProcessDependency(BaseModel):
    business_process_dependency_id: str
    business_process_subject_id: str
    dependent_business_impact_subject_id: str

    dependency_description_reported: str
    process_step_reported: str | None = None
    dependency_mode_reported: str | None = None
    fallback_reported: str | None = None
    affected_population_reported: str | None = None
    schedule_or_period_reported: str | None = None
    geography_reported: str | None = None

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    resolution_status: ResolutionStatus
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Propositions

- The source stated that the named process depended on the subject.
- The source identified the reported process step, population, schedule, geography,
  mode, or fallback.
- Multiple sources agreed or disagreed about the dependency or fallback.

### Cannot Establish

- the technical mechanism of dependency;
- that the dependency was exercised in production;
- that a stated fallback is usable, current, or sufficient;
- who owns, operates, or understands the process or subject;
- the final impact of process interruption.

## Known Single Points Of Failure

### Purpose And Scope

This object preserves explicit declarations that one technical, organizational,
vendor, process, facility, data, or knowledge element lacks an adequate substitute,
redundancy, or fallback for a stated scenario.

The source's use of "single point of failure," "key person dependency," "sole
provider," or equivalent language remains attributed. SuccessionAI must not infer a
single point from low activity counts, one formal owner, one responder, one vendor
record, or a sparse architecture graph.

### Source And Normalized Records

```python
class SinglePointSourceRecord(BaseModel):
    single_point_source_record_id: str
    declaration_context: SourceDeclarationContext

    subject_id_reported: str
    single_point_kind_reported: str
    element_id_reported: str | None = None
    element_description_reported: str
    scenario_reported: str | None = None
    missing_redundancy_reported: str | None = None
    fallback_reported: str | None = None
    fallback_status_reported: str | None = None
    consequence_reported: str | None = None
    remediation_reported: str | None = None
    raw_fields: dict[str, Any] = Field(default_factory=dict)


class SinglePointKind(str, Enum):
    TECHNICAL_COMPONENT = "technical_component"
    PERSON_OR_KNOWLEDGE = "person_or_knowledge"
    TEAM_OR_ORGANIZATION = "team_or_organization"
    EXTERNAL_PROVIDER = "external_provider"
    PROCESS_STEP = "process_step"
    DATA_ASSET = "data_asset"
    FACILITY_OR_LOCATION = "facility_or_location"
    OTHER = "other"
    UNKNOWN = "unknown"


class SinglePointDeclaration(BaseModel):
    single_point_declaration_id: str
    business_impact_subject_id: str
    single_point_kind: SinglePointKind
    single_point_kind_reported: str

    element_ref: str | None = None
    element_description_reported: str
    scenario_reported: str | None = None
    missing_redundancy_reported: str | None = None
    fallback_reported: str | None = None
    fallback_status_reported: str | None = None
    consequence_reported: str | None = None
    remediation_reported: str | None = None

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    resolution_status: ResolutionStatus
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

Person or knowledge single-point declarations are business-impact evidence about
what a source claimed. They do not establish expertise concentration. That requires
separate evidence about who can perform the work and whether transfer is possible.

### Supported Propositions

- The source identified the reported element as a single point for the stated
  subject and scenario.
- The source stated that redundancy or fallback was missing, limited, planned, or
  present.
- The source described a consequence or remediation.

### Cannot Establish

- that no unrecorded substitute or workaround exists;
- actual technical redundancy or runtime topology;
- that a named person is uniquely expert;
- that a remediation was implemented or effective;
- probability of failure or a knowledge-risk score.

## Impact Statements And Outcomes

### Purpose And Scope

Impact statements preserve expected, scenario-based, alleged, estimated, observed,
validated, or disputed consequences. They may come from business-impact analyses,
continuity exercises, incident reports, finance reports, customer reports, audits,
or named actors.

The model distinguishes:

- a hypothetical scenario from an observed event;
- a contemporaneous estimate from a later validated outcome;
- an attributed statement from a corroborated proposition;
- direct measurement from modeled or manually allocated impact;
- incident impact from incident severity.

### Layer 1: Faithful Source Record

```python
class ImpactStatementSourceRecord(BaseModel):
    impact_statement_source_record_id: str
    declaration_context: SourceDeclarationContext

    subject_id_reported: str
    statement_kind_reported: str
    statement_text_reported: str
    impact_dimensions_reported: list[str] = Field(default_factory=list)

    event_id_reported: str | None = None
    scenario_id_reported: str | None = None
    author_actor_id_reported: str | None = None
    affected_population_reported: str | None = None
    customer_count_reported: str | None = None
    financial_value_reported: str | None = None
    currency_reported: str | None = None
    duration_reported: str | None = None
    measurement_method_reported: str | None = None
    uncertainty_reported: str | None = None
    outcome_status_reported: str | None = None

    raw_fields: dict[str, Any] = Field(default_factory=dict)
```

### Layer 2: Normalized Record

```python
class ImpactStatementKind(str, Enum):
    EXPECTED = "expected"
    SCENARIO_BASED = "scenario_based"
    CONTEMPORANEOUS_ESTIMATE = "contemporaneous_estimate"
    OBSERVED_REPORTED = "observed_reported"
    VALIDATED_OUTCOME = "validated_outcome"
    DISPUTED = "disputed"
    RETROSPECTIVE_ANALYSIS = "retrospective_analysis"
    OTHER = "other"
    UNKNOWN = "unknown"


class ImpactStatementOrOutcome(BaseModel):
    impact_statement_id: str
    business_impact_subject_id: str
    statement_kind: ImpactStatementKind
    statement_kind_reported: str
    statement_text_reported: str
    impact_dimensions: list[ImpactDimension] = Field(default_factory=list)

    operational_event_ref: str | None = None
    scenario_ref: str | None = None
    attributed_actor_ref: str | None = None
    affected_population_reported: str | None = None
    customer_count_reported: str | None = None
    financial_amount: ReportedAmount | None = None
    duration_reported: str | None = None
    measurement_method_reported: str | None = None
    uncertainty_reported: str | None = None
    outcome_status_reported: str | None = None

    occurred_from: datetime | None = None
    occurred_until: datetime | None = None
    resolution_status: ResolutionStatus
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

An operational incident remains a Production Operations object. This record may
link to it and preserve a business source's impact statement. It must not copy or
reinterpret incident severity as business impact.

### Supported Propositions

- The source made the reported expected, scenario-based, estimated, observed, or
  validated impact statement.
- The source attributed the stated population, duration, customer count, financial
  amount, method, uncertainty, or outcome status.
- A later source corroborated, revised, disputed, or superseded an earlier impact
  statement.

### Cannot Establish

- objective causality between the subject and the outcome;
- that an estimate is a realized loss;
- that all affected customers, revenue, or obligations were observed;
- incident severity, root cause, or response quality;
- future impact from knowledge loss.

## Layer 3: Attributed Business-Impact Propositions

Evidence records express narrow propositions and retain direct traceability.

```python
class BusinessImpactPropositionKind(str, Enum):
    SUBJECT_IDENTIFICATION = "subject_identification"
    CRITICALITY_DECLARATION = "criticality_declaration"
    CUSTOMER_DEPENDENCY = "customer_dependency"
    REVENUE_DEPENDENCY = "revenue_dependency"
    SERVICE_COMMITMENT = "service_commitment"
    RECOVERY_OBJECTIVE = "recovery_objective"
    DATA_SENSITIVITY = "data_sensitivity"
    OBLIGATION_APPLICABILITY = "obligation_applicability"
    BUSINESS_PROCESS_DEPENDENCY = "business_process_dependency"
    SINGLE_POINT_DECLARATION = "single_point_declaration"
    EXPECTED_IMPACT = "expected_impact"
    OBSERVED_IMPACT = "observed_impact"
    OUTCOME_VALIDATION = "outcome_validation"
    OTHER = "other"
    UNKNOWN = "unknown"


class AttributedBusinessImpactProposition(BaseModel):
    business_impact_proposition_id: str
    proposition_kind: BusinessImpactPropositionKind
    proposition_text: str
    polarity: EvidencePolarity
    resolution_status: ResolutionStatus

    business_impact_subject_ids: list[str] = Field(default_factory=list)
    impact_dimensions: list[ImpactDimension] = Field(default_factory=list)
    attribution_source_record_id: str
    attributed_actor_ref: str | None = None

    valid_from: datetime | None = None
    valid_until: datetime | None = None
    observed_at: datetime

    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
    derivation_method: str | None = None
    derivation_version: str | None = None
```

Example:

```text
Source record:
Policy register version 7 classified Data Domain D as "Restricted - Customer PII"
from 2026-01-01.

Evidence proposition:
Policy register version 7 declared Data Domain D to have classification
"Restricted - Customer PII" from 2026-01-01.

Not an evidence proposition:
Data Domain D creates high knowledge-loss risk.
```

Corroboration is claim-specific. A contract may be strongest for a contractual
commitment, a data catalog for a source-native classification, and a validated
finance report for realized financial outcome. No universal source hierarchy or
weight is defined.

## Retrieval For Knowledge-Risk Analysis

Retrieval should begin with an explicit assessment subject and time context.

For a technical entity, capability, process, product, or data domain, retrieve:

1. resolved and unresolved Business Impact subject references;
2. current and historical criticality declarations with native scales;
3. customer, contract, product, and revenue dependencies;
4. SLOs, SLAs, recovery objectives, exclusions, and validity periods;
5. data sensitivity declarations and policy versions;
6. applicable security, legal, regulatory, compliance, and contractual obligations;
7. direct business-process dependencies and stated fallbacks;
8. explicit single-point declarations and their remediation status;
9. expected, scenario-based, observed, validated, and disputed impact statements;
10. contradictions, superseded records, access restrictions, and ingestion limits.

Retrieval must not automatically traverse architecture dependencies or propagate
criticality to technical neighbors. A downstream business dependency may be
returned only when an explicit Business Impact record links it or a later assessment
requests corroborating architecture context.

The output is consequence evidence for an assessment, not the assessment itself.
The assessment layer must separately retrieve concentration, transferability,
freshness, exposure, expertise, ownership, and observability evidence.

## Time, Freshness, And Change

- Preserve source creation, update, approval, effective, expiration, observation,
  ingestion, event, and measurement-period times separately when available.
- Do not apply current criticality, contracts, customer dependencies, policies,
  obligations, SLOs, or recovery objectives to historical periods without support.
- Preserve policy and scale versions. The same label may change meaning over time.
- Preserve contract terms and customer scope only for their applicable period.
- Keep expired, superseded, revoked, waived, and disputed declarations for
  historical interpretation.
- A review due date is not the same as expiration.
- A stale declaration remains a declaration; suspected staleness should be recorded
  as context or contradiction, not silently corrected.
- No universal freshness window is defined. Freshness depends on the proposition,
  source process, change history, and intended assessment.
- Observed outcomes must preserve the event period and the later report or validation
  time.
- Currency values must preserve the measurement period, original currency, and any
  conversion date.

## Provenance, Identity, And Attribution

- Every normalized record must trace to one or more source record IDs.
- Extracted propositions must record derivation method and version when applicable.
- Named approvers, authors, reviewers, process owners, legal interpreters, and
  business authorities are attributions, not proof that they originated or verified
  every statement.
- Person identities require conservative source-account resolution.
- Team or role attribution must not be expanded to all current team members.
- Contract counterparties, customers, regulators, and external assessors remain
  distinct external principals.
- Generated records must preserve the generating system and must not be presented as
  person-authored declarations.
- Raw payload references should retain source-native details subject to retention and
  access controls.

## Privacy, Access, And Sensitivity

Business Impact evidence may itself be highly sensitive. It can expose:

- customer names, contracts, entitlements, and service commitments;
- revenue, margins, penalties, credits, and commercial concentration;
- regulated data categories and processing scope;
- internal control gaps, audit findings, exceptions, and legal interpretations;
- continuity weaknesses and technical or organizational single points of failure;
- unreleased products, strategic capabilities, vendors, and migration plans;
- employee key-person dependencies;
- security-sensitive recovery and resilience information.

Connectors and retrieval must preserve source authorization, purpose limitations,
redactions, legal holds, geographic restrictions, and field-level access. A user
authorized to see that a restricted obligation exists may not be authorized to see
its text, affected customer, financial value, or cited control gap.

Normalized records should use stable internal customer, contract, and external-party
references where possible. Exact customer and financial details should not be copied
into broadly visible evidence when aggregates or access-controlled references
suffice.

Restricted or redacted content may support only a correspondingly narrow proposition,
such as "an access-restricted obligation record exists for this subject." It must
not be interpreted beyond visible fields. Missing access is an observability
limitation, not evidence that impact, obligations, customers, or dependencies are
absent.

## Contradictions And Evidence Resolution

Business Impact sources may disagree because they have different scopes, dates,
authorities, methods, or vocabularies:

- a service catalog and business-impact analysis assign different criticality
  labels;
- two policy versions classify the same data differently;
- a contract has a stricter commitment than an internal SLO;
- a process catalog says a manual fallback exists while an exercise says it failed;
- a risk register identifies a sole provider while procurement records list an
  alternate;
- an incident estimate differs from a later finance-validated outcome;
- a legal register says a regulation applies while an approved exception narrows
  scope;
- a current customer dependency is incorrectly applied to a historical period.

```python
class BusinessImpactContradictionKind(str, Enum):
    SUBJECT_IDENTITY = "subject_identity"
    CRITICALITY_CLASSIFICATION = "criticality_classification"
    SCALE_DEFINITION = "scale_definition"
    CUSTOMER_OR_CONTRACT_SCOPE = "customer_or_contract_scope"
    FINANCIAL_ATTRIBUTION = "financial_attribution"
    SERVICE_OBJECTIVE = "service_objective"
    RECOVERY_OBJECTIVE = "recovery_objective"
    DATA_CLASSIFICATION = "data_classification"
    OBLIGATION_APPLICABILITY = "obligation_applicability"
    PROCESS_DEPENDENCY = "process_dependency"
    FALLBACK_AVAILABILITY = "fallback_availability"
    SINGLE_POINT_STATUS = "single_point_status"
    IMPACT_OUTCOME = "impact_outcome"
    VALIDITY_PERIOD = "validity_period"
    OTHER = "other"
    UNKNOWN = "unknown"


class BusinessImpactContradiction(BaseModel):
    business_impact_contradiction_id: str
    contradiction_kind: BusinessImpactContradictionKind
    description: str
    resolution_status: ResolutionStatus

    business_impact_subject_ids: list[str] = Field(default_factory=list)
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
    resolution_method: str | None = None
    resolved_at: datetime | None = None
```

Do not resolve contradictions by choosing the numerically largest label, the newest
record without checking validity, or a fixed source ranking. Resolution is
proposition-specific and must preserve dissenting records.

## Supported Assessment Uses

When sufficiently scoped, current, and corroborated, Business Impact evidence may
contribute to assessments of:

- organization-declared importance of a subject;
- customer, contract, product, or revenue dependence on a subject;
- stated availability and recovery expectations;
- sensitivity of data associated with a subject;
- stated security, legal, regulatory, compliance, or contractual significance;
- business processes and populations that may be affected;
- explicit resilience concerns and declared single points of failure;
- expected and historically reported consequence types;
- contradiction, staleness, access, and observability limits in impact context.

A later knowledge-risk assessment may use these as criticality and consequence
inputs, while separately evaluating:

- who appears to hold relevant knowledge;
- whether that knowledge is concentrated;
- whether it is current and transferable;
- whether the knowledge holders may become unavailable;
- whether alternative people, documentation, procedures, or systems exist;
- how complete the observable evidence is.

## Prohibited Claims

Business Impact evidence must not, by itself, be used to claim:

- "This is universally a high-criticality system."
- "Tier 0 is more critical than every Tier 1 or Critical classification."
- "This incident was severe" from a standing criticality declaration.
- "This critical incident proves the system is business-critical."
- "This system caused the reported customer or revenue outcome."
- "The full attributed revenue would be lost if knowledge were lost."
- "Missing an SLO proves customer harm."
- "An SLA breach occurred" from the commitment alone.
- "The organization can recover within the RTO."
- "The RPO defines actual data loss."
- "This data is legally regulated" from a name or inferred content alone.
- "The organization is compliant" because a control or obligation is recorded.
- "The organization violated a law" because an audit finding exists.
- "This technical dependency is business-critical" without an explicit impact link.
- "This business-process dependency proves a runtime architecture edge."
- "This declared fallback works."
- "This element is actually the only point of failure" from one declaration.
- "This named person is uniquely knowledgeable" from a key-person declaration.
- "This team owns the subject" from a business-impact record.
- "This person is an expert" because they authored, approved, or reviewed the record.
- "No impact exists" because records are missing, inaccessible, or redacted.
- "Knowledge-loss risk is high" from business criticality alone.
- "A successor is adequate" because the impact context is known.

No universal severity ranking, threshold, source weight, financial formula,
criticality score, or combined risk score is defined.

## Canonical Failure Cases

The synthetic evaluation set should include at least these scenarios:

1. `Tier 1` means most critical in one policy and least critical in another.
2. A label's definition changes between policy versions.
3. A current criticality label is projected onto an older system state.
4. A review-due declaration is incorrectly treated as expired.
5. An expired contract is treated as a current customer dependency.
6. A customer contract applies to one product region but is attached globally.
7. Aggregated revenue is treated as exact revenue at risk.
8. Revenue attributed by a model is presented as contractual dependency.
9. Currency values from different dates are compared without preserving conversion.
10. A redacted financial category is guessed from neighboring records.
11. An internal SLO is mistaken for a customer SLA.
12. An SLA target is treated as proof of historical attainment.
13. Planned maintenance exclusions are discarded when interpreting a commitment.
14. An RTO is treated as demonstrated recovery capability.
15. An RPO is interpreted as actual data lost in an incident.
16. A data label is mapped to a universal sensitivity rank.
17. A stale data classification is silently replaced with the latest policy label.
18. A policy applicability statement is presented as definitive legal advice.
19. A control mapping is treated as proof of compliance.
20. An audit exception is omitted from an obligation record.
21. A process depends on a service only during month-end, but is marked continuously
    dependent.
22. A declared manual fallback exists on paper but failed during an exercise.
23. A technical architecture edge is converted into business-process dependency.
24. A business-process dependency is converted into a runtime architecture edge.
25. A risk register names a sole vendor while an approved alternate exists.
26. One formal owner is mistaken for a single point of knowledge.
27. One observed contributor is inferred to be a key-person dependency.
28. A key-person declaration is treated as proof of unique expertise.
29. A remediated single point remains active because historical validity is ignored.
30. An incident's source-native severity is copied into standing criticality.
31. A high criticality declaration is used to infer incident root cause.
32. A contemporaneous customer-impact estimate is treated as a validated outcome.
33. A later finance report contradicts an earlier impact estimate, but the estimate
    is silently discarded.
34. A hypothetical business-impact scenario is presented as an observed event.
35. A source reports no customer impact because it could see only one region.
36. Restricted contracts make customer dependency appear absent.
37. A service name collision merges unrelated business subjects.
38. A product, technical service, and business process with the same name are merged.
39. A current technical-entity mapping relabels historical impact records.
40. Criticality is propagated automatically across architecture dependencies.
41. A parent capability's classification is copied to every child without a source
    declaration.
42. Business impact is converted directly into a knowledge-loss risk score.
43. Missing impact records are treated as proof that a system does not matter.
44. A record author is treated as the owner or expert for the subject.
45. A generated catalog classification is presented as an approved human judgment.

## Accepted Decisions

1. Preserve source facts, attributed propositions, and assessments as separate
   layers.
2. Model Business Impact around explicit subjects that may link to, but do not
   replace, technical entities, business processes, products, data domains,
   contracts, or external parties.
3. Keep organization-declared criticality distinct from incident severity,
   priority, ownership, expertise, and final knowledge-risk assessment.
4. Preserve source-native criticality labels, scale definitions, versions, and
   ordering without inventing a universal scale.
5. Preserve exact, ranged, categorical, aggregated, converted, and redacted
   financial values with their source method and measurement period.
6. Define no monetary-loss formula or automatic revenue-at-risk calculation.
7. Distinguish contractual dependency, customer workflow dependency, product usage,
   billing flow, and analytical financial attribution.
8. Distinguish SLI definitions, SLOs, SLAs, internal targets, RTOs, RPOs, maximum
   tolerable disruption, and recovery priorities.
9. Preserve target text, measurement window, scope, exclusions, calendar, contract,
   and validity rather than normalizing away source semantics.
10. Treat objectives and commitments as declarations, not proof of attainment or
    recovery capability.
11. Preserve data classifications under their named policy and version without a
    universal sensitivity ranking.
12. Treat legal, regulatory, security, compliance, contractual, and policy
    applicability as attributed source statements, not legal conclusions.
13. Keep business-process dependency distinct from technical architecture
    dependency.
14. Do not propagate criticality or impact automatically across architecture,
    process, subject hierarchy, ownership, or organization relationships.
15. Model single points of failure only when explicitly declared or separately
    assessed; do not infer them from sparse activity, one owner, or missing records.
16. Treat person or knowledge single-point declarations as attributed impact
    evidence, not proof of unique expertise or concentration.
17. Distinguish hypothetical, expected, estimated, observed, validated, disputed,
    and retrospective impact statements.
18. Keep incident objects, severity, timelines, response, and root cause in
    Production Operations while allowing provenance-bearing links to impact
    statements.
19. Preserve contradictions, superseded records, exceptions, waivers, failed
    fallbacks, and revised outcomes.
20. Use claim-specific corroboration; define no universal source hierarchy or
    source weights.
21. Preserve source, effective, event, measurement, observation, ingestion, review,
    expiration, and supersession times where applicable.
22. Record connector scope, retention, permissions, redactions, inaccessible
    content, unresolved subjects, and omitted history as observability limitations.
23. Enforce source-derived access sensitivity for customer, financial, legal,
    regulatory, security, resilience, and key-person records.
24. Do not infer absence of impact, obligation, dependency, or fallback from missing
    or inaccessible evidence.
25. Define no universal thresholds, freshness cutoffs, criticality weights,
    severity rankings, or combined knowledge-risk score.
26. Keep this document at evidence-model depth; connectors, database schemas, APIs,
    agents, scoring systems, and UI are out of scope.

## Business Impact Summary

The initial Business Impact model covers:

1. Explicit business-impact subjects with conservative resolution to technical and
   business objects
2. Temporal organization-declared criticality with native scales and definitions
3. Customer, contract, product, and revenue dependencies without invented formulas
4. SLOs, SLAs, service targets, RTOs, RPOs, and related recovery objectives
5. Data sensitivity under source-specific policy versions
6. Attributed security, legal, regulatory, compliance, contractual, and policy
   obligations
7. Business-process dependencies distinct from technical architecture
8. Explicit technical, organizational, vendor, process, data, facility, and
   knowledge single-point declarations
9. Expected, scenario-based, estimated, observed, validated, and disputed impact
   statements and outcomes
10. Provenance-bearing evidence propositions, temporal validity, contradictions,
    privacy, access sensitivity, and observability limits

The governing boundary remains:

> Business Impact evidence establishes what an organization or attributed source
> declared about importance, dependencies, commitments, recovery objectives, data
> sensitivity, obligations, resilience concerns, and consequences. It does not
> establish incident severity, ownership, expertise, architecture truth, knowledge
> concentration, transferability, departure exposure, successor adequacy, or final
> knowledge-loss risk without separate evidence and assessment.
