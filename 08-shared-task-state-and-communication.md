# 8. Shared task state, communication, and freshness

[Overview](README.md) · [Coordination](02-agents-and-coordination.md) · [Session model](06-tmux-agent-roles-and-metrics.md) · [Authority and budgets](07-authority-model-policy-and-assumptions.md)

Accepted need: models must be able to discover each other's current assignments, exchange relevant information, and distinguish current work from obsolete tasks across days and sessions. The protocol and storage choices below are proposed; no task service, locking mechanism, or message transport is implemented here.

## Separate explanation, state, and messages

| Information | Purpose | Proposed ownership |
|---|---|---|
| Markdown task packet | Outcome, rationale, context links, obligations, and handoff. | Coordinator maintains accepted scope; workers submit proposed changes and handoffs. |
| Canonical task registry | Current status, owner, versions, prerequisites, claim validity, and evidence pointers. | One coordinator in the manual pilot; a transactional state service for automated claims. |
| Message/event record | Questions, findings, blockers, contract-change proposals, acknowledgments, and results. | Each sender submits individually identified messages; registry authority decides state changes. |
| Readable board | What each agent is doing, dependencies, last activity, and next action. | Generated or maintained from the registry; displays its revision and generation time. |

All agents read the same authoritative registry endpoint or shared location. Task copies inside separate Git worktrees may be stale; they are context snapshots, not an authoritative queue. The task packet names the registry location and pinned packet revision. A Markdown board may serve as the canonical registry in a strictly single-writer manual pilot, but must not compete with another independent status source.

tmux provides terminal access. These artifacts provide coordination. Agents communicate through messages and shared evidence even when they use different model providers or never share a conversation.

## Minimal task record

The following is a field specification, not a runnable queue entry:

```text
task_id; experiment_id; title; status
record_version; packet_revision; packet_location
created_at; updated_at; last_validated_at; revalidate_after
owner_agent_id; assignment_generation; claimed_at
heartbeat_at; last_progress_at; lease_expires_at, when automated leases are used
baseline_revision; provided_contract_versions; consumed_contract_versions
dependency_task_ids and required integrated artifact/revision references
owned_paths; workspace; runtime/session reference
current_activity; next_action; blocker; troubleshooting_budget_remaining
artifact_refs; evidence_refs; superseded_by; cancellation_reason
```

Use full UTC timestamps such as `2026-09-11T09:30:00Z`; local time may be shown as a convenience. Preserve creation time. A heartbeat changes activity metadata but must not renew `last_validated_at` or reset the task's revalidation deadline. Only an explicit readiness review does that.

The registry assigns monotonically increasing record versions and records receipt time for messages. Sender timestamps are useful context but do not establish event order across machines. Baseline and contract references carry semantic validity; dates alone cannot establish it.

## Old is not necessarily stale, and new is not necessarily valid

A task created yesterday may still be required. A task created five minutes ago may already have an incompatible dependency. Before any initial claim, resume, or reassignment, validate all of the following:

1. The authoritative status permits the action, and the record has not been cancelled or superseded.
2. The packet revision and accepted outcome are current.
3. Required dependency artifacts are integrated at the expected revisions; contract versions are still supported.
4. The workspace baseline and write ownership are suitable, with no conflicting active writer.
5. The current assignment identity is valid, or a new assignment can be issued.
6. The task has not passed its readiness revalidation deadline; if it has, the coordinator must revalidate it first.

Proposed rule for an agent starting on a new day: refresh the canonical registry and revalidate the selected task before changing files. Do not auto-cancel all yesterday's work or claim the first unchecked item in a dated Markdown file. Apply the same rule after context restart or a material dependency change, even on the same day.

If the registry cannot be refreshed or claim validity cannot be confirmed, preserve work and pause mutations. Read-only investigation can continue where useful. A cached board or expired lease cannot authorize continued writes.

## Claims and state transitions

Proposed lifecycle:

`draft → ready → running → review → integrated → verified`

`blocked`, `cancelled`, and `superseded` are explicit states with reasons. A discovered dependency change can move affected work to `blocked`; revalidation determines the next state. Review findings can return work to `running` under a valid assignment and budget. There is no direct worker-authorized jump from `running` to `verified`.

In the Markdown pilot, workers request work; only the coordinator grants the claim and updates status. Workers never independently edit `owner` or mark themselves running. This serializes assignment decisions without pretending that concurrent Markdown writes are atomic.

In an automated system, claim is one atomic operation against an expected record version: check readiness and availability, then set owner, increment assignment generation, and return the new version. Two contenders for the same version cannot both succeed. Enforce overlapping-path/resource ownership as well; unique ownership of two different task IDs does not prevent their file scopes from colliding.

If leases are introduced, define renewal and expiry using the authority's clock. Expiry means ownership needs recovery, not proof that the previous process stopped. Before replacement, revoke or fence the old writer's mutation authority, or verify the process and its relevant children are stopped. Assignment-generation checks must protect result acceptance; they do not by themselves prevent a stale process from editing shared files.

## Messages that models can exchange

```text
message_id; task_id; assignment_generation; sender; recipient(s)
kind: question / finding / blocker / contract_change / progress / result / acknowledgment
created_at; received_at; registry_event_sequence
in_reply_to; expected_task_version; relevant_contract_versions
summary; artifact_or_evidence_refs; requested_action
acknowledgment_required; resolution_status
```

Use compact messages with links to durable evidence. A question can go directly to the relevant worker; proposals changing scope, ownership, or contracts go to the coordinator/steward. Peer advice is evidence or a suggestion, not a new instruction overriding the assigned task.

Receiving a message, acknowledging it, and resolving its request are separate events. Deduplicate repeated delivery by message ID. Reject or flag messages tied to old assignment generations or contract versions rather than applying them to current work silently. Preserve rejected messages for diagnosis.

Before starting, resuming, submitting, and at agreed checkpoints, each worker refreshes its task and relevant inbox. Notifications may improve responsiveness, but missed notifications must not be the only barrier against stale work. Changes that invalidate a contract should block affected assignments centrally until they acknowledge the new baseline and are revalidated.

Do not let all workers append to one shared Markdown log. In a manual file-based pilot, use one uniquely named message file per submission and have the coordinator ingest completed submissions. Automated file transport would need defined atomic publication, acknowledgment, and deduplication behavior before being treated as reliable.

## Storage options and starting recommendation

| Option | Appropriate use | Limitation to address |
|---|---|---|
| Markdown packets and coordinator-owned board, individual message files | Initial supervised experiments with one assignment authority. | Manual serialization, freshness checks, and message ingestion; no autonomous concurrent claims. |
| Markdown packets plus structured transactional registry | Automated claiming, version checks, message ingestion, and multiple independent runtimes. | Requires an implemented and tested authority service, persistence, and recovery. |
| Existing issue/task system plus a coordinator adapter | A team already has an authoritative workflow there. | Map its actual versioning, ownership, notifications, and atomicity capabilities; do not assume labels prevent claim races. |

Proposed progression: begin with Markdown packets and a coordinator-owned board to test the communication contract. Track B can then implement a small structured registry behind the same contract. Keep readable Markdown views and historical decisions, but make the registry the sole authority once migrated. Freeze the old writer and verify imported state before switching the canonical location; do not run two independent queues.

The precise storage technology, revalidation interval, heartbeat cadence, and lease duration remain open. These are protocol requirements, not a commitment to deploy a database or publish live operational state to this public repository.

## Contract scenarios and measurements

| Scenario | Required behavior |
|---|---|
| Worker opens yesterday's completed packet | Canonical state prevents a new claim; no duplicate implementation starts. |
| Yesterday's ready task still has valid dependencies | Coordinator revalidates it and can issue a current assignment. |
| Two workers request the same task | Exactly one grant; the other gets current state and no write authority. |
| Two tasks overlap in write scope | Assignment authority blocks conflicting concurrent grants. |
| Contract changes after a worker reads the board | Version/assignment checks prevent acceptance against the obsolete baseline; affected work is revalidated. |
| Heartbeats continue but troubleshooting stalls | Progress/budget policy triggers review; heartbeat alone does not establish progress. |
| Worker misses a notification or loses registry access | Refresh/checkpoint rules detect the mismatch; unconfirmed ownership pauses mutations. |
| Old worker returns after reassignment | Old-generation result is rejected and former mutation authority is already stopped or fenced. |
| Message is delivered twice or out of order | ID and version checks prevent duplicate or obsolete state changes. |

Measure stale claims rejected, duplicate grants (required: zero), obsolete results accepted (required: zero), missed-message detection latency, unresolved-question age, task-revalidation overhead, and human coordination effort. Include denominators and tested scenarios. A rising stale-rejection count may show that a safeguard works or that discovery is poor; inspect causes rather than treating it as an automatic success score.

Acceptance requires the selected freshness, ownership, communication, and recovery scenarios to pass alongside the existing product/coordination contracts. The next decision is whether to start with supervised Markdown coordination or implement the structured registry before allowing workers to claim tasks themselves.
