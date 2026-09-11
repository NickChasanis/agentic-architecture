# 6. tmux, agent roles, and implementation metrics

[Overview](README.md) · [Coordination](02-agents-and-coordination.md) · [Roadmap](04-roadmap-of-thought.md) · [Contract criteria](05-contracts-and-adaptability.md)

Updated 2026-09-11. tmux is the chosen terminal-session tool for this discussion's operating model. Role assignments and experiments below are proposals. This document does not install tmux, launch agents, or demonstrate a working orchestrator.

## tmux's place in the architecture

tmux manages terminal programs in sessions, windows, and panes, with detach/reattach support. This lets an operator revisit running terminal work after disconnecting. See the [official getting-started guide](https://github.com/tmux/tmux/wiki/Getting-Started).

Our proposed mapping is one named tmux session per experiment, one named window per active agent assignment, and optional panes for that assignment's checks or logs. Use separate sessions for independent experiments. Launch an actual coding-agent process inside its assigned terminal; creating a window alone does not create an agent.

| Concern | Mechanism | Boundary |
|---|---|---|
| Terminal access and reconnect | tmux sessions/windows/panes | Reattachment is not model-context restoration or recovery after host/server failure. |
| Agent reasoning and tool execution | Coding-agent process and its runtime | Profile, permissions, context inheritance, and native subagents depend on the runtime. |
| File ownership | Separate checkout/worktree per concurrent writer, plus explicit path ownership | tmux provides no filesystem or credential isolation. |
| Shared test resources | Per-assignment database/schema, ports, queues, and temporary paths where needed | Different windows do not isolate these resources. |
| Assignment and completion | Versioned task/result protocol and coordinator ledger | Terminal titles and screen output are not authoritative task state. |
| Durable recovery | Task packets, patches/commits, evidence, and handoffs | Terminal scrollback is supplementary evidence, not the sole record. |

Native subagents may execute beneath one runtime without separate terminals. Count the actual active agents against the concurrency budget; do not infer their number from visible panes.

## Example terminal layout

```text
tmux session: architecture-pilot
  coordinator       task ledger, ownership, contract decisions, integration
  product-A01       Track A implementation in its assigned checkout
  coordination-B01  Track B implementation in its assigned checkout
  verification      combined revision and isolated verification resources
```

These are possible windows, not a requirement to run four agents continuously. Start with a coordinator and up to two workers only when their prerequisites are ready; schedule independent review at the next checkpoint. A verification window can hold ordinary test commands without an agent.

Illustrative tmux commands, to adapt after creating and checking the real workspaces:

```bash
tmux new-session -d -s architecture-pilot -n coordinator -c /absolute/path/to/integration-checkout
tmux new-window -t architecture-pilot: -n product-A01 -c /absolute/path/to/product-worktree
tmux new-window -t architecture-pilot: -n coordination-B01 -c /absolute/path/to/coordination-worktree
tmux list-windows -t architecture-pilot
tmux attach-session -t architecture-pilot
```

The paths are placeholders, not directories in this repository. Check the session name is unused before creation. Use `Ctrl-b d` to detach with default key bindings. Reattach with `tmux attach-session -t architecture-pilot`. Commands and key bindings are documented in the [tmux guide](https://github.com/tmux/tmux/wiki/Getting-Started).

After opening a worker terminal, verify its checkout/revision and assigned task before starting the selected agent CLI. Keep independent workers' input separate. Do not use synchronized input or blind terminal keystroke injection as the assignment protocol. A future adapter should use the coding tool's supported structured interface where available and preserve task/result identities regardless of transport.

## Session identity and lifecycle contract

Record this mapping in the coordinator's task ledger, not only in window names:

```text
experiment_id; task_id; assignment_generation; role_profile_version
runtime_session_id, if supplied; runtime capability/version information
tmux session and pane ID; host; assigned checkout and baseline revision
provided/consumed contract versions; owned paths; test-resource allocation
artifact and evidence locations; lifecycle state; last confirmed activity
```

Pane IDs are runtime handles and must be revalidated after server restart. A PID, live pane, or recent screen update alone does not prove that an agent is progressing or that it still owns the assignment.

- **Disconnect:** reconnect to the existing terminal, confirm the process and task identity, then inspect artifacts before resuming work.
- **Process exit or host restart:** restore from durable artifacts using the agent runtime's supported recovery mechanism; tmux alone cannot recover lost agent state.
- **Cancellation or reassignment:** request graceful cancellation, confirm the former writer and relevant child processes can no longer mutate assigned resources, then issue a new assignment generation. Closing a pane alone is insufficient evidence of cancellation.
- **Late completion:** reject results from a superseded generation even if their checks passed. Preserve the artifact for inspection without accepting it as current work.

A shared OS account can often access other workspaces despite task instructions. Where enforced isolation is required, use runtime permissions, separate accounts or containers, and scoped credentials. Track whether ownership is a procedural rule or technically enforced.

## Generic roles as the default

A role is a responsibility contract, not a permanent agent, model choice, or department. Give the generic implementer domain context first; create a specialized profile when different tools, authority, or verification obligations justify it.

| Generic role | Scope and authority | Required deliverable | Measures tied to its purpose |
|---|---|---|---|
| Coordinator / integrator | Own assignment state, prerequisites, write allocations, and integration. Make delegated decisions; escalate product intent to the human owner. | Ready task packets, dependency/contract map, integrated revision, evidence-backed status. | Readiness defects, blocked and review-queue time, integration rework, task-to-evidence completeness. |
| Bounded implementer | Implement one accepted outcome in owned paths; propose shared-contract changes to their owner. | Reviewable artifact, provider/consumer conformance results, handoff with limitations. | Required obligations satisfied, first-submission compatibility, rework, extension effort and change surface. |
| Independent reviewer / verifier | Assess requirements, changed code, consumers, and real behavior. Report findings; cannot waive mandatory obligations or silently redefine requirements. | Reproducible findings or explicit coverage statement, check evidence at the reviewed revision. | Required review-scenario coverage, reproducibility of findings, verification delay, defects found after acceptance. |
| Researcher, on demand | Investigate a bounded uncertainty; no implementation authority unless separately assigned. | Evidence, options, uncertainty, and a decision-ready recommendation. | Blocking question resolved, evidence traceability, investigation time and available cost. |

Independent review means a separate reviewer with access to requirements and source evidence; self-review must be labeled as such. A different role label on the same author's session does not create independence. A human can fill any decision or review role; this design does not require every responsibility to become an agent process.

## Specializations for the two tracks

| Specialized assignment | Parent role and reason to specialize | Track and output | Specific acceptance evidence |
|---|---|---|---|
| Contract steward | Coordinator/reviewer; owns shared compatibility decisions across consumers. | Both: canonical contract changes, supported-version matrix, migration and consumer-impact decisions. | All impacted assignments identified; required provider/consumer checks pass before acceptance. |
| Product/domain implementer | Implementer with tenancy, publication, or another actual domain packet. Usually context specialization only. | A: one vertical slice or bounded provider/consumer change. | Business obligations, authorization/isolation, real journey, and chosen extension scenario. |
| Browser integration verifier | Reviewer/verifier with browser tooling and isolated fixtures. | A: user-facing acceptance scenarios and failure evidence. | Real first-party integration tested; mocked evidence separated; required scenarios and errors checked. |
| Coordination protocol implementer | Implementer with task-state, assignment-generation, and ownership semantics. | B: bounded ledger/protocol behavior. | Invalid transitions, stale submissions, dependency changes, and reassignment scenarios. |
| Session/worker adapter implementer | Implementer with process-management and runtime integration tools. | B: tmux-backed session access and a supported worker adapter. | Identity mapping, reconnect, cancellation, exit handling, and adapter conformance/replacement exercise. |
| Recovery and isolation verifier | Reviewer/verifier with authority for controlled failure exercises in an isolated environment. | Both: evidence for interrupted sessions and resource ownership. | No duplicate authorized writer after reassignment; preserved artifacts and correct rejection of stale results. |

The contract steward must consult affected consumer requirements; the role cannot approve an incompatible change merely to unblock a worker. For a small experiment the coordinator can be steward, with independent review of consequential contract changes. Combine implementation specializations when their tasks are tightly coupled; serialize ownership changes explicitly.

## Measurements without rewarding incompatible output

Use the canonical [contract and adaptability measures](05-contracts-and-adaptability.md#measurement-and-acceptance). The following operational measures add attribution and timing; they do not replace acceptance gates.

| Measure | Operational definition | Owner of collection |
|---|---|---|
| Readiness defects | Started assignments later found to lack a required baseline, dependency, owner, or contract / all started assignments. | Coordinator |
| First-submission compatibility | Initially submitted artifacts passing all required supported-consumer checks without boundary corrections / all initially submitted artifacts in the cohort. Pending checks remain pending, not passing. | Verifier records; coordinator aggregates |
| Review queue time | Time from review-ready submission to review start; report review/rework duration separately. | Coordinator |
| Recovery time and outcome | Time from detected interruption to verified continuation or reassignment; also record interruption-to-detection delay. Record artifact loss and duplicate-writer incidents separately. | Recovery verifier |
| Evidence completeness | Accepted tasks with all required contract, revision, artifact, and check references / all accepted tasks. | Verifier |
| Human intervention effort | Active minutes resolving assignment, contract, environment, or recovery issues, categorized by cause. | Human/coordinator record |
| Escaped defects | Confirmed defects discovered after acceptance, categorized by severity and violated obligation within a declared observation period. | Reviewer/coordinator |

Report counts and denominators alongside ratios; zero observations means not applicable or not measured, never 100% success. Record task complexity, model/runtime configuration, concurrency, elapsed time, and available tool cost so role comparisons have context. Use comparable task cohorts to evaluate whether specialization helps; one specialist success does not establish superiority.

Acceptance requires every mandatory contract and integration obligation in scope to pass. Evidence completeness must be complete for accepted tasks, and any duplicate-writer incident fails the recovery exercise pending correction. Set time/cost/change-surface budgets before each experiment using the baseline where available. Keep defect counts and human-effort results visible even when other metrics improve. Do not rank agents by generated lines, number of tests, commits, or claimed completion speed.

## Additions to the paired implementation experiment

1. **I0 — prepare:** select workspaces and test-resource allocations; define role packets and session/task identity fields. Check tmux availability in the actual execution environment.
2. **I1 — baseline:** run the single-agent task through tmux with durable artifacts. Record session overhead and the same contract gates used later.
3. **I2 — restart:** distinguish terminal detach/reattach from agent-process restart; exercise each separately and record recovery evidence.
4. **I3 — parallel work:** assign product and coordination workers only after their shared contracts are ready. Map both to the ledger; integrate thin increments and schedule independent verification.
5. **I4 — failure:** in an isolated setting, test process exit, cancellation, stale completion, and reassignment. Verify actual process/resource state rather than trusting window appearance.
6. **I5 — adaptability:** add the product consumer and replace a worker adapter under the agreed contracts. Compare generic versus specialized assignments only on comparable workloads, including coordination overhead.

This makes tmux an initial terminal-access choice while keeping the coordination protocol adaptable to other execution environments.
