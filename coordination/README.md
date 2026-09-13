# Supervised coordination workspace

[Project overview](../README.md) · [Protocol](../08-shared-task-state-and-communication.md) · [Current board](BOARD.md)

Mode: Markdown packets, one coordinator-owned canonical board, and individually submitted message files. This is a manual workflow. Atomic claims, automatic notifications, leases, and enforced write isolation are not implemented.

## Authority and location

For the current discussion, the human-facing lead session maintains `coordination/BOARD.md` in the originating checkout. Other checkouts and the public GitHub copy are published snapshots. At each new session, confirm which checkout and lead session currently hold authority; never infer ownership solely from a copied file. When moving coordination to another host, stop the old coordinator's writes, transfer the latest records, and confirm the new authority with the owner.

Only one coordinator writes `BOARD.md`. The board owns current status, owner, task record version, assignment generation, validation times, and message receipts. Task packets own requirements and context; their status must not compete with the board. Completed packets remain available for history.

Supervised recovery and model-allocation worker grants have been exercised; consult BOARD.md for current states. Native collaboration carried the observed submissions. No autonomous dispatch is enabled.

## File layout

```text
coordination/
  BOARD.md                    authoritative state in the confirmed checkout
  tasks/                      accepted or draft requirements, by stable task ID
  decisions/                  accepted choices and decision-review evidence
  messages/README.md          submission rules; each actual message gets its own file
  templates/task.md           task packet template, not a queue entry
  templates/message.md        message template, not an actual message
```

## Coordinator procedure

1. Refresh the board and inspect the checkout, packet revisions, affected dependencies, and current processes. Confirm that no other coordinator is active.
2. Review prerequisites and budget with the owner where decisions remain open. Keep unresolved tasks `draft` or `blocked`; do not invent accepted requirements to make them ready.
3. Before a grant, check the worker's actual workspace, non-overlapping write scope, contract baselines, and test resources. Set `last_validated_at` to current UTC, and explicitly record the next revalidation trigger. All current tasks require validation at each claim/resume; there is no unattended time lease.
4. Serialize the grant: increment the task's record version and assignment generation; set owner, claimed time, workspace, scope, budget, and `running`. Record the grant message and acknowledgment. A request is not a grant.
5. Ingest complete messages in a single order. Assign receipt time and event sequence, reject stale/duplicate messages, update the relevant record version when state changes, and increment the board revision for every board edit.
6. Review results against the task's generation, packet/contracts, artifact revision, and obligations. Record checks and limitations. Only the coordinator advances integrated/verified state after required evidence exists.
7. On cancellation/reassignment, preserve artifacts and confirm the former writer and relevant child processes cannot continue writes before granting replacement authority. A new generation protects result acceptance but does not itself stop processes.

Preserve `created_at`. Update `updated_at` for state changes; record contact and substantive progress separately. Routine status messages cannot extend the troubleshooting budget or establish readiness. For every transition, add an event entry with previous/new state and rationale; do not silently erase ownership history.

For a discussion task resolved directly by the human, the coordinator can record the accepted decision and review its obligations, then close it as `verified` with an explicit human-resolution event. Keep assignment generation 0 when no worker was dispatched. This narrow decision-closure path does not bypass the review/integration gates for implementation tasks.

## Worker procedure

1. Locate the confirmed canonical board. If unavailable, pause mutations and report the problem.
2. Read current packet, dependencies, contract references, and relevant messages. Check required revisions, not just calendar date.
3. Request assignment through an individual message. Start only after the coordinator's recorded grant names this worker and workspace; acknowledge the granted generation and packet revision.
4. Refresh task state before starting, resuming, submitting, and at the task's agreed checkpoints. After a new day, session restart, or dependency change, request revalidation before further edits.
5. Troubleshoot within the assigned budget, recording new hypotheses and evidence. Send a progress checkpoint when the agreed interval is reached or an important finding changes the next action. Escalate contract/scope/authority conflicts immediately.
6. Submit an artifact and check evidence with the current assignment generation. Do not mark your own work verified or modify another worker's packet/board.

## Message delivery for the manual pilot

Create one new file from [the message template](templates/message.md) using a UTC timestamp, sender ID, and unique suffix. Do not edit another message or append to a shared log. Use replies for corrections. The sender completes the file and tells the coordinator its path through the active session. Only explicitly submitted complete files are ingested; merely seeing a partly written file is not delivery.

The coordinator records receipt and resolution in the board's message table. Acknowledgment of receipt is distinct from approval of a requested change. Workers check relevant replies at checkpoints. No filesystem watcher, automatic notification, or cross-machine transport is assumed. If a worker lacks access to the confirmed shared location, establish an explicit delivery channel before dispatch.

Taskless messages may request clarification with `task_id: project` and `assignment_generation: 0`; they grant no execution authority. Assigned workers use their actual generation. Late messages are preserved and marked stale rather than silently applied to current tasks.

## Verification scope

Before claiming this workflow works across multiple models, execute the freshness, claim-collision, missed-message, stale-result, and reassignment scenarios in document 8. The presence of these files proves the manual workflow is documented; it does not prove concurrent runtime behavior.
