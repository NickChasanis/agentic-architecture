# 17. Recovery Readiness and Model Allocation Trial

## Controls and scope

On 2026-09-13 the owner instructed the coordinator to proceed and apply recommendations. The proposed 90-minute worker limit, 15-minute checkpoint and 30-minute coordinator/review threshold apply to this exercise. No separate paid API invocation is authorized. Model usage cost and active human time are unavailable from this runtime and are not estimated.

The originating checkout remains canonical board authority. RECOVERY-001 delegated adapter implementation to a separate session while the coordinator implemented registry/evaluation corrections. Both used the same integration worktree with disjoint file ownership; this is procedural isolation, not filesystem enforcement. Three follow-up review requests were needed before coordinator integration corrections. These are observed rework, not clean first-submission acceptance.

## Corrected evidence boundaries

- The registry is single-coordinator and in-memory. It rejects malformed grants, overlapping scopes, changed grants, and stale reassignment receipts. It trusts a coordinator's termination evidence; it cannot enforce filesystem access or authenticate a caller.
- The local adapter exercises POSIX process groups, bounded TERM/KILL cancellation, output limits, spawn errors and premature-result rejection. Processes escaping their group need a stronger sandbox; no such guarantee is claimed.
- The recovery test observes artifact writes, confirms cancellation, verifies the artifact stops changing, issues generation2, and rejects generation1 submissions.
- The fake adapter is an independent test double. Real runtime replacement remains unverified.
- tmux session comparison-20260913 was created and its three window working directories checked. Agent reasoning runs through native collaboration; tmux windows are supplementary session transport.
- Evaluator checks from one revision cannot hide a failed mandatory obligation behind a passing one. No-observation coverage is null, not 100%.

## Model allocation trial

Identical EXT-01–06 obligations are frozen at 608c291d3fcec2b38e9b346a0dd3fce54b3da193. Two fresh worker sessions implement public-product filtering and summary helpers in separate worktrees. The coordinator supplies the same requirements and acceptance tests, then independently reruns checks. Consumers receive already validated public products and do not access catalog storage.

Trials are sequential so model allocation changes while concurrency stays fixed. The first uses the inherited default model; the second requests gpt-5.6-luna. Only one worker plus coordinator can be active under the current two-session limit. No parallel-worker speed comparison is claimed. Identical tasks control scope but one pair, ordering and shared host conditions prevent a general performance conclusion. Cross-worktree read isolation is procedural.

## Results

| Trial | Frozen obligations, independently rerun | Worker-reported duration | Submitted artifact |
|---|---|---|---|
| Inherited default model | 6/6 pass | 32 seconds | 226ed7f459b3f746856a515da13f9716bf5957e3 |
| gpt-5.6-luna | 6/6 pass | 34 seconds | f5d80d4da80f33c8e4744ac491b7a0105808dc18 |

These durations exclude planning, review, integration and queue time; they are not end-to-end speed measurements. Raw structured records are in [model-trial.json](pilot/evaluation/model-trial.json). Both cohorts initially failed because helpers were absent, then passed the unchanged frozen tests. Neither changed the producer, public contract, dependencies or tests. Each submitted exactly the two owned helper files.

Independent supplemental review found the same large-input defect in both implementations: Math.min/Math.max with an expanded array exhausted function argument capacity at 200,000 products. Frozen acceptance stays 6/6; broader acceptance needed remediation. The coordinator added EXT-07 and integrated the Luna implementation with a constant-extra-memory summary loop. This was a shared planner/test-coverage blind spot as well as an implementation defect. A connected API test now feeds a real published product to both helpers.

## Decision and remaining phases

Adopt the smaller model for further bounded consumer tasks with independent checks and review: it met this task's frozen obligations. Keep the same quality gates for both tiers. Do not infer savings, superiority or general suitability from this single pair.

Completed here: operating controls, recovery-readiness fixes, actual bounded delegation with review/rework, a sequential model-allocation trial, and a recorded evaluation. The regression run passed 28 Fastify checks, 22 work-envelope checks, 21 existing integration tests and 4 browser journeys, plus TypeScript, boundary, provider and build checks. Additional checks cover the repaired registry/process/recovery/evaluator and the extended public consumer.

Remaining: representative merchant-list work, repeated counterbalanced task cohorts, actual multi-worker concurrency comparison, durable registry/restart behavior and a second real execution adapter. Current native capacity is one coordinator plus one worker; a two-worker concurrency experiment needs another slot or an explicitly configured external worker runtime. The native workers here did not execute through tmux. The broader comparison and real adapter replacement are **not complete**.
