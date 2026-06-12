# Communication And Collaboration Schema

> Status: Initial model complete.

## Purpose

Communication and collaboration data records informal coordination and attributed
technical discussion that may not appear in code, tickets, incidents, or documents.

It may help establish:

- who asked or answered a recorded question;
- who was explicitly sought out or referred to for help;
- what technical explanation, constraint, decision, or uncertainty was stated;
- whether informal discussion corroborates or contradicts formal evidence;
- where relevant communication is unobservable because of access restrictions.

Communication activity does not establish expertise, correctness, comprehension, or
successful knowledge transfer. Message volume, mentions, channel membership, and
meeting attendance are contextual metadata, not expertise measures.

## Objects

1. Conversation container
2. Message
3. Thread and reply relationship
4. Attributed communication proposition
5. Explicit help-seeking or referral
6. Reaction and acknowledgment
7. Membership and meeting metadata
8. Access and observability scope

## Retrieval

Records may be retrieved from:

- Slack and Microsoft Teams APIs and exports;
- approved public or private channel archives;
- internal technical Q&A systems;
- email or meeting systems under an explicitly approved access profile;
- approved transcripts or meeting notes;
- synthetic JSON for the demo.

Public and team-channel content should be the normal baseline. Private channels,
direct messages, email, recordings, and transcripts require explicit organizational
authorization, purpose limitation, and source-consistent access controls.

The ingestion scope must record included containers, excluded or inaccessible
content, history limits, deleted or redacted messages, actor-resolution limitations,
and whether replies, edits, files, and transcripts were available.

## Conversation Container

```python
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class CommunicationPlatform(str, Enum):
    SLACK = "slack"
    TEAMS = "teams"
    EMAIL = "email"
    TECHNICAL_QA = "technical_qa"
    MEETING_SYSTEM = "meeting_system"
    OTHER = "other"
    UNKNOWN = "unknown"


class ContainerAccessKind(str, Enum):
    PUBLIC = "public"
    ORGANIZATION = "organization"
    TEAM = "team"
    PRIVATE = "private"
    DIRECT = "direct"
    UNKNOWN = "unknown"


class ConversationContainer(BaseModel):
    conversation_container_id: str
    platform: CommunicationPlatform
    source_tenant_id: str
    external_container_id: str

    name: str | None = None
    access_kind: ContainerAccessKind
    parent_container_id: str | None = None

    first_observed_at: datetime
    last_observed_at: datetime
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Container membership establishes possible access only. It does not establish that a
person read, understood, or retained any discussion.

## Message

### Layer 1: Faithful Source Record

```python
class SourceCommunicationMessageRecord(BaseModel):
    source_record_id: str
    source_system: str
    source_tenant_id: str

    external_container_id: str
    external_message_id: str
    external_thread_id: str | None = None
    parent_external_message_id: str | None = None

    author_external_actor_id: str | None = None
    body_ref: str | None = None
    message_type_reported: str | None = None

    mentioned_external_actor_ids: list[str] = Field(default_factory=list)
    linked_external_refs: list[str] = Field(default_factory=list)
    attachment_refs: list[str] = Field(default_factory=list)
    reactions_reported: list[dict[str, str]] = Field(default_factory=list)

    source_created_at: datetime | None = None
    source_edited_at: datetime | None = None
    source_deleted_at: datetime | None = None

    source_uri: str | None = None
    observed_at: datetime
    raw_payload_ref: str
```

### Layer 2: Normalized Message

```python
class MessageActorKind(str, Enum):
    PERSON = "person"
    BOT = "bot"
    SHARED_ACCOUNT = "shared_account"
    EXTERNAL_PARTY = "external_party"
    UNRESOLVED = "unresolved"
    UNKNOWN = "unknown"


class CommunicationAct(str, Enum):
    QUESTION = "question"
    ANSWER = "answer"
    EXPLANATION = "explanation"
    CLARIFICATION = "clarification"
    DECISION = "decision"
    DISAGREEMENT = "disagreement"
    HELP_REQUEST = "help_request"
    REFERRAL = "referral"
    STATUS_UPDATE = "status_update"
    REFERENCE = "reference"
    ACKNOWLEDGMENT = "acknowledgment"
    SOCIAL_OR_ADMINISTRATIVE = "social_or_administrative"
    AUTOMATED = "automated"
    UNKNOWN = "unknown"


class CommunicationMessage(BaseModel):
    communication_message_id: str
    conversation_container_id: str
    external_message_id: str

    thread_id: str | None = None
    parent_message_id: str | None = None
    actor_kind: MessageActorKind
    author_source_account_id: str | None = None
    body_ref: str | None = None

    communication_acts: list[CommunicationAct] = Field(default_factory=list)
    mentioned_source_account_ids: list[str] = Field(default_factory=list)
    linked_source_record_ids: list[str] = Field(default_factory=list)

    created_at: datetime | None = None
    edited_at: datetime | None = None
    deleted_at: datetime | None = None

    classification_method: str | None = None
    classifier_version: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Several communication acts may apply to one message. Classification must permit
`UNKNOWN` and preserve the source content reference for inspection.

## Thread And Reply Relationship

Threads preserve directed context without claiming that the discussion was correct
or resolved.

```python
class ConversationThread(BaseModel):
    conversation_thread_id: str
    conversation_container_id: str
    starter_message_id: str
    message_ids: list[str] = Field(default_factory=list)

    started_at: datetime | None = None
    last_message_at: datetime | None = None
    source_reported_resolved: bool | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

A reply after a question supports that a response occurred. It does not establish
that the reply answered the question, was independently authored, or transferred
knowledge.

## Attributed Communication Proposition

Technical content may be extracted into narrow attributed propositions:

```python
class CommunicationPropositionKind(str, Enum):
    TECHNICAL_CLAIM = "technical_claim"
    PROCEDURE = "procedure"
    CONSTRAINT = "constraint"
    DECISION_OR_RATIONALE = "decision_or_rationale"
    FAILURE_MODE = "failure_mode"
    UNCERTAINTY = "uncertainty"
    HELP_NEED = "help_need"
    REFERRAL = "referral"
    OTHER = "other"
    UNKNOWN = "unknown"


class CommunicationResolutionStatus(str, Enum):
    ATTRIBUTED = "attributed"
    CORROBORATED = "corroborated"
    CONTRADICTED = "contradicted"
    CONTESTED = "contested"
    SUPERSEDED = "superseded"
    UNRESOLVED = "unresolved"


class CommunicationProposition(BaseModel):
    communication_proposition_id: str
    communication_message_id: str
    proposition_kind: CommunicationPropositionKind
    proposition_text: str

    attributed_source_account_id: str | None = None
    subject_system_id: str | None = None
    subject_component_id: str | None = None
    resolution_status: CommunicationResolutionStatus

    extraction_method: str
    extractor_version: str | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
    contradicting_source_record_ids: list[str] = Field(default_factory=list)
```

A confident tone does not make a proposition correct. Later code, documentation,
incidents, or validation may corroborate or contradict it.

## Help-Seeking And Referral

Explicit requests and referrals are stronger evidence of perceived relevance than
raw mention or message counts.

```python
class HelpInteractionKind(str, Enum):
    DIRECT_HELP_REQUEST = "direct_help_request"
    OPEN_HELP_REQUEST = "open_help_request"
    REFERRAL_TO_PERSON = "referral_to_person"
    REFERRAL_TO_TEAM = "referral_to_team"
    ESCALATION = "escalation"
    UNKNOWN = "unknown"


class HelpInteraction(BaseModel):
    help_interaction_id: str
    source_message_id: str
    interaction_kind: HelpInteractionKind

    requester_source_account_id: str | None = None
    referred_source_account_id: str | None = None
    referred_team_id: str | None = None
    subject_system_id: str | None = None
    subject_component_id: str | None = None

    occurred_at: datetime | None = None
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Repeated explicit referrals may support that the organization perceived a person or
team as relevant to a domain. They do not establish that the referral was justified
or that help was successfully provided.

## Lightweight Metadata

### Reactions

Reactions establish recorded engagement only. Emoji meaning is organization- and
context-dependent, so reactions are not correctness or expertise signals.

```python
class ReactionObservation(BaseModel):
    reaction_observation_id: str
    communication_message_id: str
    reaction_reported: str
    reactor_source_account_ids: list[str] = Field(default_factory=list)
    observed_at: datetime
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

### Membership And Meeting Participation

```python
class CommunicationParticipationObservation(BaseModel):
    participation_observation_id: str
    platform: CommunicationPlatform
    conversation_container_id: str | None = None
    meeting_external_id: str | None = None
    source_account_id: str | None = None

    joined_at: datetime | None = None
    left_at: datetime | None = None
    observed_at: datetime
    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

Attendance or membership does not establish attention, topic exposure,
understanding, teaching, or learning.

### Private Communication

Direct-message counts without content may establish only that communication occurred
between observed accounts during a period. They cannot support topic, expertise, or
knowledge-flow claims. Topic metadata must not be inferred when content is
unavailable.

## Supported Propositions

Communication records may support:

- an account authored, replied to, mentioned, or reacted to an observed message;
- a person asked or responded to a recorded question;
- an account stated a technical claim, explanation, constraint, decision, or
  uncertainty;
- a person or team was explicitly asked for help or named in a referral;
- informal statements corroborated or contradicted evidence from another source;
- relevant communication was inaccessible under the observed access profile.

Repeated substantive responses and referrals may support perceived relevance or
recorded informal exposure. They do not independently establish expertise.

## Cannot Establish

Communication evidence alone cannot establish:

- that technical advice was correct;
- expertise depth, judgment quality, or operational capability;
- that the respondent independently produced the answer;
- that the asker understood or retained the response;
- that knowledge transfer occurred or endured;
- that silence or absence means lack of knowledge;
- that mentions, message count, response speed, or reactions imply expertise;
- that channel membership or meeting attendance produced exposure;
- that an inaccessible private discussion did or did not contain relevant knowledge.

## Time, Freshness, And Contradictions

- Preserve message creation, edit, deletion, and observation times separately.
- Interpret identity, team, and role context at message time.
- Do not define a universal freshness window.
- Preserve edited, deleted, contradicted, and superseded statements.
- Do not infer causality or learning from message order.
- Cross-posted or quoted content should retain its original attribution when known.

## Privacy And Access

Communication sources are unusually sensitive. Connectors must preserve source
authorization and avoid broadening access through extracted propositions.

The model should record:

- whether content was public, team-restricted, private, direct, redacted, or absent;
- consent and authorization basis for private content;
- content-retention and deletion requirements;
- whether sensitive HR, legal, customer, or personal material was excluded;
- whether only metadata was available.

Private content should not be required for baseline operation. Its absence is an
observability limitation, not negative evidence.

## Canonical Failure Cases

1. A person repeatedly links to documentation without providing technical guidance.
2. A hidden expert answers only verbally or in inaccessible private channels.
3. A bot posts technically correct answers under a human-looking name.
4. A short reply contains an important correction when read in thread context.
5. A long answer is confidently wrong.
6. A referral names the formal owner rather than the actual helper.
7. Two people share the same display name.
8. A quoted answer is credited to the person who reposted it.
9. Reactions are interpreted as correctness votes.
10. Channel membership is interpreted as learning.
11. A meeting attendee is treated as a teacher or learner without content evidence.
12. A deleted message contained the only contradiction.
13. A team migrates channels and activity is split or duplicated.
14. Restricted content makes one person appear to be the sole respondent.
15. A question is answered after the solution was supplied elsewhere.

## Accepted Decisions

1. Treat communication as attributed informal discussion and coordination evidence.
2. Do not describe answer or referral patterns as validated expertise.
3. Preserve message, thread, actor, time, edit, deletion, and access provenance.
4. Use broad, inspectable communication-act classifications with abstention.
5. Extract narrow technical propositions as attributed claims.
6. Model explicit help requests and referrals separately from generic mentions.
7. Keep reactions, membership, and meeting attendance lightweight.
8. Do not infer topic from inaccessible direct-message content.
9. Do not use message volume, response speed, mention count, or reactions as direct
   expertise measures.
10. Require Knowledge Validation for claims that communication produced transferable
    or durable knowledge.
11. Preserve automation, shared accounts, quotation, and unresolved identity.
12. Keep private communication optional and access-profile dependent.

## Communication And Collaboration Summary

The initial model covers:

1. Conversation containers and access scope
2. Messages, threads, replies, edits, and deletions
3. Attributed technical propositions
4. Explicit help-seeking, referral, and escalation
5. Lightweight reactions, membership, and meeting participation
6. Private-content observability limitations

The governing boundary remains:

> Communication data establishes what informal interaction and attributed discussion
> were recorded. It may reveal perceived relevance and informal exposure, but it
> does not establish correctness, expertise, comprehension, or successful knowledge
> transfer without corroboration and validation.
