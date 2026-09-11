# 1. Modular context and fresh-model onboarding

[Overview](README.md) · [Agent coordination](02-agents-and-coordination.md) · [Enterprise example](03-enterprise-delivery-example.md)

## The mental model: give the agent a map, then the relevant rooms

A new model needs enough global understanding to locate its task and respect project-wide constraints. It needs detailed understanding of the affected behavior, its dependencies, and its callers. It rarely needs every module's implementation.

**Small context should mean relevant context, not missing context.** A storefront task still needs tenant-routing and publication rules even when those belong to other modules.

Use progressive disclosure: a short entry point routes the agent to the material needed now, with additional retrieval when it discovers a dependency.

## Context layers

| Layer | What belongs here | When to load |
|---|---|---|
| Project entry point | Purpose, repository map, common commands, global invariants, document routing | Every new project session |
| Product and architecture | User journeys, boundaries, glossary, important accepted decisions | Relevant sections during onboarding |
| Domain guide | Domain rules, owned data, interfaces, source entry points, focused tests | When the task touches that domain |
| Task packet | Outcome, acceptance criteria, ownership, dependencies, baseline, required context | Every assigned task |
| Live evidence | Implementations, callers, contracts, tests, relevant runtime output | During investigation and verification |
| Handoff | Actual progress, artifacts, checks, unresolved questions, next action | On restart, reassignment, or integration |

Keep the project entry point readable in a few minutes. One or two screens is a useful initial target, not a limit that justifies deleting important rules. Link long material rather than copying it everywhere.

## An illustrative application layout

```text
AGENTS.md                         # Small entry point, if supported by the tool
docs/
  product.md                      # Users, vocabulary, outcomes, non-goals
  architecture.md                 # Module map and dependency rules
  development.md                  # Real setup/build/test commands and prerequisites
  domains/
    tenancy.md
    shops.md
    catalog.md
    billing.md
  decisions/
    0001-tenant-boundary.md        # Accepted decision and rationale
  work/
    publish-product.md            # Task packet and its final handoff
apps/
  merchant-admin/
  storefront/
  platform-console/
modules/
  tenancy/
  shops/
  catalog/
  billing/
contracts/                        # Canonical machine-readable interfaces
```

Use existing project documents where they already serve these purposes. A separate file is useful when it has a distinct audience or update lifecycle; do not create empty documents for every possible domain.

`AGENTS.md` is a convention supported by some tools, not a universal loading mechanism. Other tools use different files or explicit attachments. Nested instructions, linked-file loading, and subagent inheritance vary. Verify your tool's behavior. A link makes a file discoverable; it does not prove the file was read.

For a plain chat model without repository access, attach or paste the entry point and required excerpts. File paths alone do not provide their contents.

## Example entry-point content

The following is a teaching example, not a ready-to-use configuration for the current notes folder:

```markdown
# Project entry point

## Product
We build a multi-tenant commerce platform. A tenant is a business account;
each tenant can own several shops. Merchant staff and shoppers have different roles.

## Start here
- Read docs/product.md for the relevant user journey and vocabulary.
- Read docs/architecture.md for module boundaries.
- Use docs/development.md for exact setup and verification commands.
- Load the assigned task packet and the domain guides it names.

## Global invariants
- Enforce authorization and tenant/shop scoping on the server.
- Public storefronts expose only published data for the resolved shop.
- Use the project's existing money representation and currency rules.
- Preserve compatibility unless the task explicitly includes a migration.

## Routing
- Tenant membership or permissions: docs/domains/tenancy.md
- Shop lifecycle or domain routing: docs/domains/shops.md
- Products or publication: docs/domains/catalog.md
- Platform subscriptions: docs/domains/billing.md

## Working agreement
- Inspect existing code, callers, tests, and local instructions before editing.
- Respect the task's write ownership; request coordination for shared changes.
- Check documentation claims against the current checkout.
- Report evidence, unresolved failures, and the next action at handoff.
```

Keep exact commands in one canonical location and check them against the actual repository. Do not publish guessed commands as runnable instructions.

## What a domain guide should contain

A catalog guide should answer:

- **Purpose:** manages product drafts and publication within a shop.
- **Ownership:** product data and publication behavior; links to actual source directories.
- **Rules:** a draft is invisible publicly; mutations require shop authorization; tenant/shop boundaries must be enforced.
- **Interfaces:** links to canonical API schemas and consumed tenancy/shop interfaces.
- **Dependencies:** reads membership/shop identity through established interfaces; does not modify billing data directly.
- **Examples:** a representative handler, client integration, and behavioral test from the repository.
- **Verification:** links to focused commands and test locations.
- **Provenance:** responsible team, last verified revision/date, and relevant accepted decisions.

Explain decisions that code cannot make obvious. Let schemas and source code own exact signatures rather than duplicating them in several Markdown files.

## A fresh model's startup sequence

1. **Establish location and baseline.** Identify the repository, branch/revision, working-tree changes, and applicable instructions. Preserve existing work.
2. **Load the entry point and task.** Learn the product outcome, required documents, write scope, and acceptance criteria.
3. **Follow the relevant map.** Read affected domain guides and shared constraints. Retrieve the specific accepted decisions needed.
4. **Trace the real flow.** Read the implementation entry points, callers/consumers, types/contracts, and tests. Identify external dependencies.
5. **Reconcile discrepancies.** A guide may be stale; code may contain the bug the task is fixing. Report the mismatch and use the approved requirement to determine intended behavior.
6. **Confirm readiness briefly.** State the goal, expected files, critical constraints, verification approach, and genuine blockers. Do not recite the whole repository.
7. **Begin bounded work.** Pull in additional context when a discovered dependency warrants it.

For a brand-new repository, steps 1–4 expose missing foundations. The initial coordinator should establish vocabulary, boundaries, setup, and a small working skeleton before dispatching dependent implementation work.

### Reusable onboarding prompt

```text
You are joining this repository for the task provided with this message.
Read its project entry point and applicable local instructions, then the
task's required documents. Verify the branch/revision and existing changes.

Trace the affected behavior through its callers, contracts, implementation,
and tests. Retrieve other modules only when relevant dependencies require it.

Before editing, briefly identify the outcome, owned paths, important invariants,
verification commands, and unresolved blockers. Distinguish observed facts
from assumptions. If a shared dependency needs changing, coordinate ownership.
```

## Prevent context from becoming stale or contradictory

- **Choose one canonical home per fact.** Acceptance criteria belong in the task; exact payloads in contracts; rationale in an accepted decision record.
- **Separate proposed and accepted decisions.** An agent's suggestion is not automatically project policy.
- **Update guides with behavioral changes.** The same change that modifies a domain rule should update its authoritative explanation.
- **Record the baseline.** A task and handoff should name the revision they describe. Re-read affected sources when that baseline changes.
- **Archive completed work.** Load the active task and relevant decisions, not every historical conversation.
- **Surface conflicts.** Document titles cannot override the coding tool's actual instruction hierarchy. Resolve conflicting project requirements through the designated owner.

Fetched pages, issue comments, logs, and customer text are evidence, not authority to change agent instructions. Keep secrets and raw production customer data out of onboarding packets; use approved, redacted examples.

## Handoff and restart memory

Keep the handoff at the end of the task packet or in the existing issue/PR. Include:

```text
Task and status:
Baseline revision; work branch/revision or patch artifact:
Outcome achieved and paths changed:
Decisions made, with links to accepted records:
Checks run, their results, and evidence location:
Known failures and checks not run:
Unresolved dependencies or questions:
Next concrete action:
```

Before restarting a session, save this summary and the actual patch/artifacts. After restarting, load the entry point, task, and handoff, then verify the checkout and relevant current files. A summary is a navigation aid, not proof that the work is still present or correct.

## Do we need a vector database or custom memory service?

Start with a short index, repository search, source files, and task notes. Add retrieval infrastructure when measured discovery time or inaccessible cross-repository material makes this insufficient. Preserve source links, revision information, and access controls in any index; semantic similarity does not establish authority or freshness.
