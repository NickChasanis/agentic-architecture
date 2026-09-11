# WORK-SUBMISSION — 0.1-draft

Status: proposed. Owner/steward: coordinator. Provider: supervised board authority, later a structured registry adapter. Consumers: worker runtimes, coordinator interface, and verifier. Reference: [shared communication protocol](../08-shared-task-state-and-communication.md).

## Assignment grant

The worker requests an assignment against a current task record version. Only the coordinator grants it after checking readiness, packet and contract versions, integrated prerequisites, ownership conflicts, actual workspace, and budget.

The grant contains task ID, record version, packet revision, worker identity, assignment generation, source baseline, provided/consumed contracts, owned paths, test resources, budget, checkpoint policy, and required obligation IDs. UTC claimed/validated timestamps come from the authority. Generation increments when new assignment authority is issued; routine progress updates change record version without silently replacing the assignment.

The worker acknowledges the grant's generation and baseline before implementation. A copied task packet or a `ready` row by itself is insufficient. The manual coordinator serializes grants; an automated adapter must implement an atomic claim and conflict checks before it can advertise autonomous claiming.

## Submission and evidence envelope

```text
submission_id; task_id; worker_id; assignment_generation
observed_task_record_version; packet_revision; contract_versions
source_baseline_revision; submitted_artifact_revision; artifact_location
changed_paths; provided/consumed interfaces affected
check_records: obligation_id, command or manual procedure, environment,
               tested_revision, start/end UTC, outcome, evidence_location
unrun_checks; limitations; unresolved_findings; migration_or_integration_actions
```

A submission references immutable artifacts or a captured patch with a digest. A moving branch name alone cannot identify what passed. Test results must refer to the submitted revision; earlier results are historical evidence unless the verifier explicitly establishes their applicability. Final integration evidence refers to the combined revision.

In this manual mode evidence is inspected by the coordinator/verifier. A claimed pass or fabricated timestamp does not become trusted merely because the envelope is well formed. Verify artifact existence and run or inspect required checks through the selected verification process.

## Acceptance and rejection

- Validate the sender, current assignment generation, packet and contract versions, ownership, required envelope fields, and artifact references.
- If the task record changed since the worker read it, inspect the change and revalidate. A harmless progress update need not discard code; an ownership, scope, contract, dependency, or cancellation change can invalidate the submission. No obsolete result is accepted silently.
- Deduplicate by submission/message ID. Reuse of an ID with different content is a conflict, not a harmless retry.
- A valid submission enters review. It does not mark itself integrated or verified. Required unrun checks remain unverified, and a missing environment is a blocker rather than a passing outcome.
- After integration, the verifier checks the combined product and coordination obligations. Only the coordinator records verified state from sufficient evidence.

## Freshness, messages, and troubleshooting

Refresh canonical task state on claim/resume, submission, agreed checkpoints, session/day changes, and dependency invalidation. A task's creation date is historical context. Revalidation tests its present requirements, baseline, dependency state, and authority.

Messages include ID, sender/recipient, task/generation, relevant versions, UTC creation time, reply reference, evidence, and requested action. Receipt sequence and receipt time belong to the coordinator. Receipt, acknowledgment, approval, and resolution remain distinct.

Workers can investigate several hypotheses within budget. Checkpoints report actual progress and remaining budget; they do not automatically renew authority or spend limits. When ownership cannot be confirmed, pause mutations and preserve artifacts. If communication fails, an old grant cannot be treated as indefinite permission to write.

On reassignment, stop or technically fence the old writer and relevant child processes before granting replacement authority. Reject its later submission by generation even if it passed local checks. Record suspected duplicate writes as a failed recovery scenario requiring investigation.

## Adapter extension

The later worker-adapter exercise preserves assignment/result semantics while changing runtime integration. Each adapter must declare supported start/status/cancel/result/failure capabilities. Unsupported operations are explicit, not simulated as success.

Proposed change-surface budget: zero coordinator-domain logic changes for the second adapter; a new adapter and explicit registration/configuration are allowed. Both adapters must pass the same applicable conformance scenarios and representative execution. A manual Markdown rehearsal validates procedures only; it cannot establish cancellation or atomicity guarantees for an unimplemented adapter.
