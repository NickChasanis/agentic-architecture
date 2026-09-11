# 2. Creating agents and coordinating their work

[Overview](README.md) · [Context onboarding](01-context-and-onboarding.md) · [Enterprise example](03-enterprise-delivery-example.md)

## What it means to create an agent

You usually do not train another model. You start a model session with a role, instructions, relevant context, tools, permissions, a workspace, and a task. Several instances can use the same model and profile.

A Markdown profile is reusable input. It becomes an operational agent only when a coding tool or a person loads it into a session that has the required capabilities.

Three portable execution options:

1. **Manual sessions:** you open separate coding sessions, assign isolated workspaces, and pass task packets. You coordinate results.
2. **Native subagents:** the lead session uses the coding tool's delegation facility. Check which context, filesystem, permissions, and session state the worker receives.
3. **Programmatic orchestration:** an SDK or workflow launches sessions, persists state, and controls execution. Useful when repetition and scale justify maintaining it.

Use the execution mechanism your coding tool already provides before building an orchestration service. **tmux is our terminal-session tool of choice** for organizing multiple manual agent sessions and reconnecting to terminal work. It complements native subagents and programmatic orchestration; it does not supply agent reasoning, workspace isolation, or the coordination protocol. See [tmux, agent roles, and implementation metrics](06-tmux-agent-roles-and-metrics.md) for the proposed operating model.

## Start with three role profiles

| Role | Responsibility | Typical capabilities | Required output |
|---|---|---|---|
| Coordinator / integrator | Clarify outcomes, inspect dependencies, assign work, settle shared contracts, integrate | Read project; maintain task state; edit integration/shared files when assigned | Task packets, integration evidence, concise status |
| Implementer | Deliver one bounded change and its relevant checks | Read relevant dependencies; edit assigned paths; run scoped checks | Patch/branch, results, handoff |
| Reviewer | Independently inspect correctness against requirements and risks | Read proposed changes and dependencies; execute checks in an isolated environment | Evidence-backed findings or no findings with stated coverage |

These are roles, not three permanently running processes. The coordinator can implement sequential work; multiple implementers can share one profile. Invoke reviewers at useful checkpoints. A read-only researcher can be added for a concrete unknown rather than making every task pass through one.

Specialize with a domain context packet first. Add a distinct profile when tools, permissions, or verification methods genuinely differ. A permanent frontend/backend/database/DevOps hierarchy often creates avoidable handoffs for small features.

The [role definitions and measurement plan](06-tmux-agent-roles-and-metrics.md#generic-roles-as-the-default) expand these profiles into explicit authority, deliverables, and metrics. Both tracks use generic implementers by default, with scoped contract, browser-verification, coordination-protocol, worker-adapter, and recovery specializations as needed.

## Define a profile using operational rules

Illustrative implementer profile, suitable for adapting into a tool's supported agent format:

```markdown
# Bounded implementer

Purpose: complete one assigned task in the current project.

Inputs: project entry point, task packet, required domain/contract context,
and an assigned workspace with a recorded baseline.

Workflow:
1. Verify the baseline and inspect relevant code, callers, and tests.
2. Reuse existing project patterns and implement within assigned write paths.
3. Run the task's behavioral checks and required repository checks.
4. Update task-relevant documentation and return a concise handoff.

Boundaries:
- Read dependencies as needed; do not silently expand write ownership.
- Report contract changes or conflicting requirements to the coordinator.
- Do not spawn additional workers unless explicitly permitted.
- Use only the granted environments and credentials.

Completion: required outcomes are supported by recorded verification.
If blocked, preserve work and report the blocker and next useful action.

Output: task status, patch/branch reference, changed paths, check results,
remaining risks, and any integration action required.
```

Writing “you are a senior expert” is less useful than identifying these inputs, boundaries, and outputs. Instructions express intent; tool permissions and isolated environments enforce access limits.

## A task packet is the unit of delegation

A good packet answers all of the following without requiring the worker to reconstruct the coordinator's conversation:

| Field | What to supply |
|---|---|
| Identity | Task ID, owner, status, baseline revision, branch/workspace |
| Outcome | Observable user or system behavior |
| Acceptance | Specific success and failure cases |
| Context | Required files plus relevant optional references |
| Ownership | Allowed edit paths; shared files assigned elsewhere |
| Dependencies | Prerequisite tasks and exact contract versions |
| Constraints | Compatibility, tenancy, performance, or product rules |
| Verification | Actual commands from the repository, environment needs, expected behaviors |
| Effort and escalation | Agreed time/tool budget; when to report a blocker |
| Handoff | Artifact location, checks, remaining issues, integration needs |

Size a task around a reviewable outcome, usually one focused change rather than “build billing.” If it routinely spans unrelated decisions or several session resets, split it. If splitting it requires constant conversation between workers, keep it together.

## The parallelization test

Before spawning a worker, ask:

1. Can its deliverable be described clearly?
2. Are the necessary interfaces already known or can a read-only investigation proceed independently?
3. Does it have exclusive write ownership for its changes?
4. Can it verify meaningful progress without waiting on another unfinished implementation?
5. Is the expected saved time greater than onboarding, coordination, review, and integration time?

If the answer is no, do the prerequisite first or keep the task sequential. Parallel tool calls or one focused agent may already provide sufficient speed.

For an interface shared by several workers, settle the minimum contract first: names, IDs, authorization assumptions, request/response shapes, errors, relevant lifecycle rules, and compatibility. Lock it for that batch. A necessary change is coordinated and redispatched to affected consumers.

## Prefer task ownership over simulated departments

Good: “implement catalog publication in these paths against contract v1.”

Weak: “you are the backend agent; handle all backend work.”

Prefer end-to-end feature ownership when one worker can deliver a small vertical slice without collisions. Split UI and API work when the contract is stable and each side has enough substantial work to justify the handoff.

Do not assign an agent to every customer or shop. Most tenants use the same product code and configuration. Genuine customer-specific extensions should have explicit boundaries, not duplicated platforms by default.

## Workspace and shared-resource isolation

- Use a separate branch and worktree or equivalent isolated checkout per concurrent writer, when supported.
- A branch name alone does not isolate files if sessions share one working directory.
- Assign one owner for each shared contract, migration sequence, lockfile, generated client, and root configuration during a batch.
- Parallel writers should have separate test databases/schemas, temporary paths, ports, and queue namespaces where their checks mutate state.
- Worktrees isolate working files, not a shared database or remote environment; they also share Git repository metadata.
- Keep production access separate from ordinary implementation. Use authorized sandbox credentials and enforce permissions in tooling.

If the tool cannot isolate writers, serialize edits. Parallel read-only investigations can still help. In a non-Git environment, use separate copies and reviewed patches rather than concurrent edits to the same files.

## Keep coordination lightweight but explicit

Use the existing issue tracker or a small task board. The coordinator is its single status writer; workers report their own results and blockers. Avoid several agents rewriting one shared progress document.

Suggested states:

`ready → running → review → integrated → verified`

Use `blocked` when a dependency or environment prevents progress. “Worker finished” means ready for review; project completion requires integrated verification.

Communicate on meaningful events: a blocked dependency, proposed contract change, completed artifact, failed check, or need to stop. Do not forward every tool output or start endless agent-to-agent discussion.

Set a concurrency cap and budget. If review queues or provider rate limits grow, stop launching work and finish integration. A coordinator should handle discrete decisions and artifacts rather than route every implementation detail through its own context.

## Review and integration loop

Every task declares the contracts it provides and consumes, their versions, and required behavioral obligations. Independent workers coordinate through those shared artifacts even without direct conversation. Contract changes must reach affected assignments before integration. See [contract gates and extensibility measures](05-contracts-and-adaptability.md) for the shared rules across product delivery and coordination-system design.

1. Worker produces a small change, focused verification, and a handoff.
2. Reviewer checks the actual change against acceptance criteria, surrounding code, callers, and failure cases. Provide requirements and source evidence rather than only the author's reassuring summary.
3. Coordinator resolves findings and integrates in dependency order using the project's normal review process.
4. On the merged state, rerun affected tests, contract checks, required CI, and the relevant real end-to-end flow.
5. Record the integrated revision and result. Update canonical context when behavior changed.

Passing on separate branches does not prove the combined application works. Two agents agreeing does not prove correctness either. Review assists deterministic checks and human judgment; it does not replace them.

## Failure recovery

| Failure | Response |
|---|---|
| Worker times out or loses context | Inspect saved artifacts and running processes; resume from a verified handoff |
| Task is reassigned | Stop the previous writer and confirm it cannot keep mutating the workspace before activating the replacement |
| Worker needs an unowned file | Ask coordinator to transfer ownership, sequence the change, or split a shared prerequisite |
| Contract changes mid-batch | Mark affected tasks stale/blocked, publish the change, update consumers and their baselines |
| A check cannot run | Record the environment blocker; do not relabel an unverified change as passing |
| Agents repeatedly disagree | Return to requirements, source evidence, and a minimal reproducing check; involve the decision owner if intent is unclear |

Prefer preserving useful work to restarting the entire task. Bound retries: repeating the same unsuccessful attempt without new evidence is not progress.

## Choosing models and measuring the setup

Use a model capable of the ambiguity and risk of the task. Stronger reasoning is often valuable for decomposition, cross-module changes, and difficult debugging. A cheaper/faster model may suit well-specified mechanical changes after evaluation. Different role names do not require different models.

Compare similar changes with a single-agent baseline. Track:

- Wall-clock time to integrated, verified completion.
- Review/rework time and escaped defects.
- Contract churn, conflicts, and blocked time.
- Total token/tool cost and time spent rediscovering context.

Increase concurrency only when it improves delivery without unacceptable regression in quality or cost. If integration is the bottleneck, another implementer is usually the wrong addition.
