# How to Use This Framework in Your Project

[Repository overview](README.md) · [Context and onboarding](01-context-and-onboarding.md) · [Coordination runbook](coordination/README.md)

This guide explains how to carry the context, contracts and agent coordination practices from this repository into another project. It applies both to an existing application with a large codebase and to a new project whose architecture is still being defined.

Use this repository as a reference implementation and a collection of working practices. Your project supplies its own requirements, architecture, code, contracts and verification evidence. The practices help agents find that information, understand their assignments and demonstrate that their changes work together.

## What importing context means

Importing context means making relevant information available in the target project and directing an agent to read it. That information can include requirements, architectural decisions, source files, API schemas, tests, current assignments and previous handoffs.

An agent reading your repository does not permanently learn it. A fresh session, a different model or a replacement worker needs an entry point and a current assignment. Chat history can help the current session, but important decisions should also exist in durable project files.

For example, suppose your application contains catalog, billing and order modules. A worker adding a billing feature needs the billing rules, its task requirements and the contracts through which billing interacts with the other modules. It may need to inspect a particular caller or integration test. It does not normally need the entire history and implementation of all three modules before starting.

Keep the starting context focused, while allowing the worker to retrieve more evidence when the task requires it. A small context package should make additional information discoverable, not prohibit necessary investigation.

## What to reuse from this repository

Begin with the [agent entry point](AGENTS.md), [coordination runbook](coordination/README.md), [task template](coordination/templates/task.md), [message template](coordination/templates/message.md), and [contract criteria](05-contracts-and-adaptability.md). Adapt their responsibilities and fields to the target project.

Do not copy this repository's task board as a live board for your new project. Its assignments, dates, source revisions, worker identities and completion evidence belong to this experiment. Start a new board with the target repository's actual state. Likewise, commerce-specific decisions such as published-product immutability are examples; they become rules in another project only if that project's owner chooses them.

Preserve useful documentation already present in the target repository. Link to its authoritative requirements and schemas rather than maintaining a second version in a newly created context folder. Record which source controls a decision when documents disagree.

The executable components under `pilot/` are local laboratory components. Inspect their contracts and limitations before adopting their code. The [revalidation and model trial](17-recovery-and-model-allocation.md) explains what was actually exercised, and the [tmux adapter documentation](18-tmux-execution-adapter.md) describes the command transport's limits.

## A suggested project layout

The following is an illustrative layout for a future project. These paths are examples, not additional application files supplied by this repository.

```text
project/
├── AGENTS.md
├── docs/
│   ├── project.md
│   ├── architecture.md
│   └── decisions/
├── contracts/
│   ├── catalog-public.openapi.yaml
│   └── catalog-public-behavior.md
├── modules/
│   ├── catalog/
│   │   └── CONTEXT.md
│   └── billing/
│       └── CONTEXT.md
└── coordination/
    ├── README.md
    ├── BOARD.md
    ├── tasks/
    ├── messages/
    └── evidence/
```

`AGENTS.md` provides the entry point and working rules. `docs/project.md` describes the product's users, goals and non-goals. `docs/architecture.md` maps module responsibilities and dependencies. Decision records explain important choices and the conditions under which they should be reconsidered.

Contracts describe observable promises between components. Module context files point to the relevant implementation, tests and constraints. The coordination directory records who may work on what, the state of each assignment and the evidence supporting submitted results.

This structure also works across several repositories. In that case, identify a single coordination authority and pin cross-repository dependencies to exact contract versions and source revisions. A copied board in a worker checkout is a snapshot, not a second authority.

## Start with a read-only onboarding assessment

For an existing application, begin by inspecting its documentation, source, tests and deployment configuration. Ask the agent to report its findings before assigning implementation. This avoids turning an outdated architecture document into an unexamined premise for new code.

An example onboarding instruction is:

> Inspect this repository without modifying files. Read the project instructions and identify the product goals, module boundaries, shared contracts, build and test commands, and current working-tree state. Cite the files supporting your findings. Report contradictions between documentation and implementation, missing verification environments, and unresolved decisions. Recommend the smallest useful implementation slice.

Use that assessment to create or update the context package. Clearly distinguish observed implementation, accepted requirements and proposed changes. If a document describes PostgreSQL but the active application uses an in-memory adapter, record both facts and identify the actual environment needed for database proof.

For a new project, start from the approved requirements instead. Establish the first module boundaries and contracts, implement a thin connected journey, and update the documentation as those assumptions meet real code. A diagram alone does not prove the proposed components compose.

## Write an entry point an agent can follow

Keep the root entry point short enough to read at the beginning of every session. It should say where authoritative information lives, who coordinates work, and how an agent obtains its assignment.

For example, a target project's `AGENTS.md` could contain:

```markdown
# Project working instructions

Read docs/project.md and docs/architecture.md for product and module context.
Read coordination/README.md and confirm the canonical board with the coordinator.
Then read your assigned task packet, its contracts and relevant module CONTEXT.md.

Only the coordinator grants assignments and updates authoritative task status.
Before editing, confirm the current assignment generation, baseline revision,
owned paths and required checks. Examples and copied task packets are not grants.

Preserve existing work. Propose changes outside your assigned boundary to the
coordinator. Report missing or failed checks explicitly. Submit an immutable
artifact and evidence; a worker does not mark its own result verified.
```

Check how your chosen agent runtime loads repository instructions. If automatic discovery is uncertain, explicitly tell the session to read the entry point. Do not assume every model or runtime has inherited the same instructions, conversation, tools or filesystem access.

## Add module context without duplicating the code

A module context document should explain the module's purpose, boundaries and useful entry points. Link to canonical schemas and source files rather than copying signatures that will drift.

An illustrative catalog context file could say:

```markdown
# Catalog context

Responsibility: draft products, publication, and public product reads.
Non-goals: payments, stock reservation and checkout.

Contracts:
- ../../contracts/catalog-public.openapi.yaml: canonical response schema.
- ../../contracts/catalog-public-behavior.md: publication and privacy rules.

Rules:
- Public reads expose published products only.
- Merchant operations require current tenant/shop authorization.
- Published products are immutable under the accepted publication decision.

Before changing behavior, inspect the public read handler, its service,
the authorization boundary and provider/consumer integration tests.
List their actual paths here after inspecting this repository.
```

In the real file, replace the last instruction with verified source paths. Keep the document updated when those entry points or contracts change. Avoid long explanations of implementation details that an agent can obtain more accurately by reading the source itself.

## Assign context according to responsibility

The architect or planner needs broad project context to reason about boundaries, dependencies and tradeoffs. An implementer needs focused context for its outcome. A reviewer needs the requirements and consumer expectations as well as the proposed changes. A replacement worker needs the current assignment and preserved work, including unresolved failures.

| Responsibility | Starting context | Expected result |
|---|---|---|
| Architect or planner | Product goals, architecture, dependencies, decisions and constraints | Reviewable boundaries, contracts and dependency-ordered assignments |
| Implementer | Task packet, module context, relevant contracts, code and tests | A bounded implementation and evidence |
| Independent reviewer | Requirements, affected consumers, submitted artifact and check records | Findings and a clear statement of verification coverage |
| Replacement worker | Current grant, latest artifact, handoff and failed checks | Safe continuation from actual state |

Our starting allocation policy uses stronger models for architecture, planning and difficult review, and lower-cost models for bounded implementation and test work. Treat that as a hypothesis to evaluate in your project. Authority belongs to the role and assignment; selecting a more capable model does not expand its permissions.

## Turn a feature request into a task packet

Consider the request: “Add title and price filtering to the storefront.” A task packet should describe the observable result and boundaries, not merely tell an agent to implement filtering.

An illustrative packet could contain:

```markdown
# CATALOG-FILTER-001 — Filter published product cards

Packet revision: 1
Current assignment and authority: coordination/BOARD.md

Outcome: shoppers can filter published products by title and price.
Non-goals: changing publication, editing products, or adding checkout.

Required context:
- docs/project.md
- modules/catalog/CONTEXT.md
- contracts/catalog-public.openapi.yaml
- contracts/catalog-public-behavior.md

Observable obligations:
- Title matching trims the query and ignores case.
- Price bounds are inclusive and retain zero-priced products.
- Empty matches display the agreed empty state.
- Drafts and merchant-only fields never appear publicly.
- Existing storefront behavior remains compatible.

Verification:
Use provider checks, consumer checks and a real browser journey.
The coordinator must supply verified commands and test resources before grant.

Handoff:
Return an immutable artifact, changed paths, check evidence and limitations.
```

This example deliberately omits real command names and source revisions: those must be discovered in the target project. The packet is not ready for execution until those details and any ambiguous behavior have been resolved.

The coordinator's grant separately identifies the worker, assignment generation, exact baseline commit, contract versions, owned paths, worktree, test resources and budget. Keep current assignment status in the board rather than allowing the packet and board to disagree.

Before editing, ask the worker to briefly explain its understanding of the task and intended verification. For example: “I will change the storefront consumer, preserve the publication provider, and verify filtering against real public responses.” Compare that interpretation with the assignment; it can reveal a misunderstanding before significant code is written.

## Coordinate workers through shared records

Workers need a reliable communication protocol even if they never directly talk to one another. Give each worker a bounded outcome, explicit write scope and a separate worktree when it writes concurrently. Allocate database fixtures, ports and other mutable test resources separately where needed.

Suppose one worker implements filtering while another builds a price-summary consumer. Both depend on the public-product contract. If either discovers that the contract is missing required behavior, it submits the finding to the coordinator. The coordinator assesses affected consumers and assignments, resolves the decision under its authority, and revalidates dependent work before integration.

Use individually identified messages for questions, findings and submissions. Record their task and generation, relevant revisions, UTC creation time, requested action and evidence. Receipt, acknowledgment, approval and resolution are different states; a received message does not automatically authorize its requested change.

tmux helps manage terminal sessions, and native subagents can provide another execution mechanism. Neither replaces task authority. A live terminal is not evidence that its process still owns an assignment. Separate worktrees also provide organizational isolation, not protection from another process running under the same OS account.

## Make context survive a new day or a replacement worker

Record actual UTC timestamps, exact source revisions and assignment generations. A task's creation date is useful history; current authority depends on its present state and dependencies.

For example, worker A may start a task under generation 3 on Monday. On Tuesday, the coordinator cancels that assignment and issues generation 4 to worker B after confirming that A can no longer write. If A later submits a locally passing result, preserve the artifact for inspection but reject it as a current generation-4 submission.

A useful handoff explains what changed, where the artifact is, which revision was tested, which checks passed or failed, the current troubleshooting hypothesis, and the remaining work. The replacement worker first checks the canonical board and actual checkout. It should not blindly continue from the final sentence of an old chat.

The pilot has an in-memory registry and a PostgreSQL implementation with durable receipts, revision checks and recovery inspection. The canonical Markdown board remains live authority. Persisted state alone does not enforce process termination or make reassignment unattended.

## Verify that independently produced components compose

Contracts should describe behavior as well as data shape: authorization, visibility, errors, retries, immutability and supported consumer expectations where relevant. A matching JSON object does not prove that a feature works for its users.

For the filtering example, consumer tests can verify title matching and price bounds. Provider tests establish published-only reads and privacy. An integrated browser journey then confirms that an authorized merchant can publish and the shopper sees the correct product through the real application. Test doubles remain useful, but record what they stand in for.

Verification should refer to the submitted artifact and then to the combined revision after integration. A worker's passing local tests cannot establish that another worker's changes compose with it. The verifier reports findings; only the coordinator records acceptance when the required evidence exists.

Our [model-allocation trial](17-recovery-and-model-allocation.md) illustrates why this matters. Both models passed the same six planned checks. Supplemental review found the same large-input defect in both implementations. The coordinator preserved the original submissions, added the missing obligation and verified a corrected implementation. Good initial context reduces uncertainty, but it does not eliminate blind spots shared by the planner, implementation and tests.

## Introduce the approach gradually and measure its value

Start with one vertical slice across two or three modules. Establish its context package and acceptance gates, complete it sequentially, then compare suitable delegated work using the same standard. Add workers only when independent work and review capacity are available.

Measure first-submission compatibility, integration rework, extension change surface, elapsed time, active human effort, recovery outcomes and available model/tool cost. Include failed attempts and review effort. Keep unavailable measurements explicit, and do not infer general savings from one small successful task.

For a specified extension, decide the allowed change surface before implementation. For example, a new public catalog consumer should use the existing contract without reading catalog tables. If it needs producer changes, record those changes and their reasons as an adaptability finding.

Permanent specialist teams, a custom memory service or a general orchestrator may eventually help. Let observed retrieval failures, recurring domain needs and coordination overhead justify those additions. A navigable repository and current task records are a useful starting point even when the project becomes large.

## A practical starting sequence

### Worked implementation roadmap: merchant catalog visibility

The [merchant catalog roadmap](19-merchant-catalog-visibility.md) demonstrates how to turn context into three dependent implementation steps. First define and verify the merchant-only list contract and provider. Then assign the UI consumer against that verified boundary. Finally test the combined revision and record a handoff. The provider and consumer exist locally. Chapters 20–21 add interaction coverage and fix a fixture-dependent browser test discovered during fresh-checkout verification.

For example, a shop with one draft notebook and one published notebook should show both to an authorized merchant, only the draft under the Draft filter, and only the published notebook to a public shopper. A different tenant must not retrieve the merchant list. Those are distinct obligations requiring provider, access and browser evidence, not just a test that two cards render. The prior run recorded 30 contract tests, 29 connected integration tests and 5 real Playwright journeys passing. The subsequent coverage review shows why those totals alone cannot close all interaction obligations.

The roadmap also includes a response-ordering failure: an old shop request finishes after the merchant switches shops. The consumer must discard that result. This illustrates why a task's context should include interaction failures as well as response schemas. Its final extension exercise asks a second test consumer to count product states using only the declared response, with any required provider changes recorded as integration effort.

### Keep the guide current

The [catalog reliability and coordination recovery roadmap](20-catalog-reliability-and-coordination-recovery.md) demonstrates three implemented extensions. First, an old shop response must not change the current selection or session; delayed failures and successes are tested. Second, pagination preserves existing consumer promises through an explicit page contract while HTTP-08 remains available. Third, a replacement coordinator restores complete grants and receipts, then reconciles old processes before granting replacement work.

For example, after restarting on Tuesday, the coordinator may recover Monday's generation-3 task record. It must also recover submission receipts so retries are not processed twice. If it cannot confirm the former writer stopped, it preserves the artifact and blocks replacement. A timestamp, persisted row or tmux window name alone cannot establish that condition. Chapter 20 records these local proofs and explicitly leaves host reboot, escaped process control and production adoption unproven.

As this project adds chapters, update this guide and the repository README in the same change. The README should link to the new chapter and describe the current direction. This guide should explain how the new material affects practical use, with an example when it introduces a workflow. Label proposals, tested local capabilities and remaining limitations separately; a roadmap entry is not proof of implementation.

For example, adding a restart-recovery chapter would require documenting what a replacement coordinator must read, how old writers are stopped, and which recovery scenarios were actually exercised. Until those checks exist, do not describe restart-safe coordination as available.

### Start a project slice

1. Inspect the target repository and identify its authoritative documentation, contracts and runnable checks.
2. Adapt the entry point and coordination rules; create a new project-specific board.
3. Write a concise project map and context files for the modules in the first slice.
4. Resolve that slice's behavioral obligations and prepare a task packet with verified paths and commands.
5. Grant bounded work with explicit ownership, resources and troubleshooting limits.
6. Review the artifact independently, run the integrated checks and record evidence at the tested revision.
7. Exercise a fresh-session handoff and a concrete extension before increasing concurrency.

The result is a project that a new agent can navigate and work on responsibly. Context stays attached to its sources and revisions, assignments have an accountable owner, and acceptance depends on observable behavior.


## Execute and hand off work in Git worktrees

For concurrent implementation, give each worker a branch and separate worktree. For example, from your new project's coordinator checkout:

```sh
git worktree add ../notes-filter-worker -b work/notes-filter
git rev-parse HEAD
```

Put that exact commit and absolute worktree path in the current grant. Give the worker a project-specific task packet with owned files and executable obligations. The coordinator remains in the canonical checkout, receives the worker's commit and test evidence, reviews the actual diff, and verifies the integrated result. A read-only reviewer can inspect an existing checkout.

The [Git worker bridge](pilot/contracts/coordination/git-worker.mjs) checks a coordinator-supplied live grant before launch and before accepting an artifact for review. It executes argv in the assigned worktree and rejects the primary checkout, dirty output, a missing commit or changed files outside ownership. Its command adapter can transport a configured worker CLI, but provider authentication, model selection and billing require their own verified setup. The bridge does not itself invoke the native agent tool used in this conversation.

Use the [portable notes example](examples/portable-context/README.md) to adapt the context structure to another domain. Its template deliberately requires real revisions and grants before dispatch. The automated fixture exercises an independent Git repository with a deterministic command; real-model adoption and affordability comparison are still pending.

For isolated integration tests, allocate unique ports and a Compose project per assignment. Follow [the operations guide](pilot/OPERATIONS.md) for reproducible verification and backup/restore. Restoring Tuesday's database records recovers Monday's receipts, but the coordinator must still reconcile any Monday worker before assigning a replacement. The restore operation explicitly reports that authority has not transferred.

See [chapter 21](21-supervised-operational-readiness.md) for the six-phase status. Each phase keeps its remaining evidence gates visible; a runnable adapter or CI file alone does not establish a model-performance result or a successful hosted CI run.
