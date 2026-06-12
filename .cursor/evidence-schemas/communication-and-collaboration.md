# Communication And Collaboration Schema

> Status: Initial model in progress.

## Purpose

Communication and collaboration data establishes:

- who answers questions and provides guidance in informal channels;
- which people are sought out for domain-specific help;
- whether knowledge is transferred through conversation, not just code or docs;
- what topics a person is recognized as expert in by their peers;
- whether knowledge concentration observed in formal channels (code, PRs) is
  corroborated or contradicted by informal interaction patterns.

It does not establish expertise quality, correctness of advice given, or work
output. It provides behavioral evidence of perceived expertise and knowledge flow
direction.

## Product Questions This Source Answers

1. When someone asks an auth question in Slack, who answers?
2. Is there a single person who receives most domain-specific questions?
3. Are there informal knowledge-sharing sessions (threads, huddles) that
   indicate knowledge transfer has or has not occurred?
4. Does the pattern of questions and answers corroborate or contradict the
   bus-factor signals from code and incident data?
5. Are there people who have received knowledge informally but have not yet
   demonstrated it in code or incidents?

## Objects

| Object | Evidentiary weight | Treatment |
|---|---|---|
| Channel message | Medium–High | Full schema |
| Thread and reply | Medium–High | Full schema |
| Reaction and acknowledgment | Low | Lightweight |
| Channel membership | Low | Lightweight |
| Direct message summary | Low (privacy-constrained) | Metadata only |
| Huddle or call record | Low | Metadata only |

## Channel Message

### Purpose And Scope

Channel messages are the primary evidence for informal knowledge sharing. A message
in a public channel where person A asks about auth and person B answers is behavioral
evidence that B is a perceived authority on auth topics within the team.

Messages are most valuable when they contain technical questions and answers. Routine
social messages, standup updates, and bot-generated content have minimal evidentiary
value for knowledge-concentration analysis.

### Retrieval

#### Preferred Authoritative Sources

- Slack Web API (`conversations.history`, `conversations.replies`)
- Microsoft Teams Graph API (channel messages)
- Discord API (guild channel messages)

#### Supplementary Sources

- Google Chat API
- Exported Slack archives (JSON format)
- Manually transcribed conversations

#### Access Constraints

- Requires appropriate OAuth scopes (e.g., Slack `channels:history`)
- Private channels require membership or admin-level access
- Direct messages are excluded from retrieval by default due to privacy
- Message content may contain sensitive information requiring redaction
- Rate limits apply; full history retrieval may require pagination over days

### Layer 1: Faithful Source Record

```python
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class MessagePlatform(str, Enum):
    SLACK = "slack"
    TEAMS = "teams"
    DISCORD = "discord"
    OTHER = "other"


class ChannelType(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    SHARED = "shared"
    UNKNOWN = "unknown"


class SourceMessageRecord(BaseModel):
    source_record_id: str
    platform: MessagePlatform
    source_tenant_id: str

    channel_id: str
    channel_name: str | None = None
    channel_type: ChannelType = ChannelType.UNKNOWN

    author_external_id: str
    author_display_name: str | None = None

    thread_id: str | None = None
    is_thread_reply: bool = False
    reply_to_message_id: str | None = None

    text_content: str
    text_length: int
    has_code_block: bool = False
    has_link: bool = False
    has_file_attachment: bool = False

    reactions: list[dict] = Field(default_factory=list)
    reply_count: int = 0

    source_created_at: datetime
    source_edited_at: datetime | None = None
    observed_at: datetime

    raw_payload_ref: str
    source_uri: str | None = None
```

Fields such as `text_content` are stored for classification purposes but may be
redacted after topic extraction to reduce privacy exposure. The presence of code
blocks and links is preserved as a lightweight signal of technical content.

### Layer 2: Normalized Record

```python
class MessageIntent(str, Enum):
    QUESTION = "question"
    ANSWER = "answer"
    EXPLANATION = "explanation"
    REFERENCE = "reference"
    SOCIAL = "social"
    ANNOUNCEMENT = "announcement"
    BOT_GENERATED = "bot_generated"
    UNKNOWN = "unknown"


class TopicMention(BaseModel):
    topic: str
    confidence: float | None = None
    extraction_method: str


class NormalizedMessage(BaseModel):
    internal_message_id: str
    source_record_id: str
    platform: MessagePlatform

    person_id: str | None = None
    channel_id: str
    channel_name: str | None = None

    intent: MessageIntent
    topics: list[TopicMention] = Field(default_factory=list)

    is_thread_reply: bool = False
    thread_id: str | None = None
    responds_to_person_id: str | None = None

    text_length: int
    has_code_block: bool = False
    has_substantive_content: bool = False

    source_created_at: datetime
    observed_at: datetime

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

`intent` is derived by classification and may be `UNKNOWN` when the classifier
cannot determine whether a message is a question, answer, or social content.
`responds_to_person_id` is set when this message directly replies to or answers
a specific person's question in a thread.

### Supported Propositions

A channel message, appropriately classified, can support:

- "Person B answered a question about topic X in channel Y."
- "Person A asked a question about topic X, and person B was the respondent."
- "Person B provided N answers about topic X in channel Y over time period T."
- "Person B is sought out for topic X (behavioral evidence of perceived expertise)."
- "No other person answered questions about topic X in this channel."
- "Topic X discussions are concentrated around person B in informal channels."

When corroborated by code ownership and incident data:

- "Knowledge concentration in topic X is consistent across formal and informal channels."

### Cannot Establish

- That the advice given was correct or high-quality.
- That the answerer has deep expertise (they may be relaying surface knowledge).
- That silence from other team members means they lack knowledge (they may prefer
  DMs, verbal communication, or simply not monitor the channel).
- That the question-asker learned from the answer.
- That knowledge transfer occurred (answering ≠ transferring).
- That the answerer wrote the relevant code or designed the system.
- Expertise depth, judgment quality, or operational capability.

### Time And Freshness

- Messages have precise timestamps from the source platform.
- Recency matters: a person who answered auth questions 18 months ago but not in
  the last 6 months may no longer hold current knowledge.
- Thread timestamps establish temporal ordering of question-answer pairs.
- Freshness windows should be defined per product claim, not globally.

### Privacy And Access

- Public channel messages are generally accessible with appropriate API scopes.
- Private channel messages require explicit access grants.
- Direct messages are excluded by default; only metadata (participant IDs, message
  count per topic) may be ingested with organizational consent.
- Message content may be redacted after topic and intent extraction.
- Personal, HR, and off-topic content should be filtered during ingestion.
- GDPR and data-retention policies may limit historical retrieval.

### Canonical Failure Cases

1. **False expertise signal**: A person answers many questions by linking to docs
   or saying "ask Sarah" — high answer count but no actual knowledge transfer.

2. **Hidden expert**: An expert who never posts in public channels but answers
   extensively in DMs or verbally. System correctly shows no public-channel evidence
   rather than inferring absence of knowledge.

3. **Bot or automation confusion**: A bot posts answers sourced from documentation.
   System must distinguish bot-generated responses from human expertise signals.

4. **Channel migration**: Team moved from Slack channel #auth to #platform-eng.
   Historical signal is split across channels and must not be double-counted or lost.

5. **Name collision**: Two people named "Mike" in different channels. System preserves
   ambiguity rather than merging their activity.

### Proposed Decisions

1. **Accepted**: Only public channel messages are ingested by default. Private
   channel and DM ingestion requires explicit organizational consent.

2. **Accepted**: Message intent classification uses a lightweight model or
   heuristic (question marks, thread-reply patterns, code blocks) rather than
   deep NLP. Misclassification is tolerable because volume patterns matter more
   than individual message accuracy.

3. **Proposed**: Messages classified as `SOCIAL`, `BOT_GENERATED`, or containing
   only reactions/acknowledgments without technical content are excluded from
   substantive-answer counts. The filtering criterion is intent classification,
   not message length.

4. **Proposed**: A "question-answer pair" is identified when a thread-reply from
   a different person follows a message classified as a question. The answerer
   receives credit only for the specific thread, not the entire channel.

5. **Proposed**: Reaction counts (emoji responses) are stored but not used as
   expertise signals unless calibrated. A thumbs-up does not confirm correctness.

6. **Deferred**: Whether to weight recent messages more heavily than older ones.
   Requires freshness-window definition per product claim.

7. **Deferred**: Cross-channel deduplication for forwarded or quoted messages.


## Thread And Reply

### Purpose And Scope

Threads provide stronger evidence than standalone messages because they establish
directed question-answer relationships between specific people about specific topics.
A thread where person A asks and person B answers is more attributable than a
standalone message in a busy channel.

### Layer 1: Faithful Source Record

Threads are represented as collections of `SourceMessageRecord` objects sharing the
same `thread_id`. The thread-starter message and its replies are linked by
`thread_id` and `is_thread_reply` fields.

No separate thread-level source record is needed beyond the messages themselves.

### Layer 2: Normalized Record

```python
class NormalizedThread(BaseModel):
    internal_thread_id: str
    channel_id: str
    platform: MessagePlatform

    starter_person_id: str | None = None
    starter_intent: MessageIntent

    respondent_person_ids: list[str] = Field(default_factory=list)
    topics: list[TopicMention] = Field(default_factory=list)

    message_count: int
    unique_participant_count: int
    has_resolution: bool = False

    started_at: datetime
    last_reply_at: datetime | None = None

    supporting_source_record_ids: list[str] = Field(default_factory=list)
```

### Supported Propositions

- "Person A asked about topic X and person B responded in a thread."
- "Person B was the sole respondent to N threads about topic X."
- "Threads about topic X are resolved by person B at a rate of M/N."

### Cannot Establish

- That the thread reached a correct resolution.
- That the question-asker understood or retained the answer.
- That no other communication (DM, verbal) contributed to resolution.


## Reaction And Acknowledgment (Lightweight)

Reactions (emoji responses) indicate engagement but not expertise. They are stored
as counts on the parent `SourceMessageRecord` and may contribute to identifying
which answers are valued by the team, but they are not used as standalone expertise
signals.

```python
class ReactionSummary(BaseModel):
    message_id: str
    total_reaction_count: int
    unique_reactors: int
    has_positive_reaction: bool
```

## Channel Membership (Lightweight)

Channel membership establishes who had access to observe discussions but does not
establish that they read, understood, or could reproduce the knowledge shared.

```python
class ChannelMembershipRecord(BaseModel):
    source_record_id: str
    platform: MessagePlatform
    channel_id: str
    person_id: str | None = None
    external_actor_id: str
    joined_at: datetime | None = None
    observed_at: datetime
```

### Supported Propositions

- "Person X was a member of channel Y and could have observed discussions about topic Z."

### Cannot Establish

- That the person read any messages.
- That the person gained knowledge from the channel.
- That absence from a channel means absence of knowledge.


## Direct Message Summary (Metadata Only)

Due to privacy constraints, DM content is not retrieved. Only organizational-level
metadata may be available with consent:

```python
class DMSummaryRecord(BaseModel):
    source_record_id: str
    platform: MessagePlatform
    participant_external_ids: list[str]
    message_count_in_period: int
    period_start: datetime
    period_end: datetime
    contains_topic_keywords: list[str] = Field(default_factory=list)
    observed_at: datetime
```

This is the weakest evidence source and is included only to acknowledge that
informal knowledge sharing may occur in private channels that the system cannot
observe.


## Huddle Or Call Record (Metadata Only)

Voice/video calls and huddles indicate real-time collaboration but provide no
content evidence without transcription.

```python
class HuddleRecord(BaseModel):
    source_record_id: str
    platform: MessagePlatform
    channel_id: str | None = None
    participant_external_ids: list[str]
    started_at: datetime
    ended_at: datetime | None = None
    duration_seconds: int | None = None
    observed_at: datetime
```

### Supported Propositions

- "Persons A and B participated in a call at time T."
- "Person A participates in frequent calls with the auth team."

### Cannot Establish

- What was discussed.
- Whether knowledge was transferred.
- Who was teaching and who was learning.
