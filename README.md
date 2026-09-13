# Agentic Architecture

![Purple synthwave computing modules connected to a central coordination hub across a neon grid](assets/agentic-architecture-synthwave.png)

> A roadmap of thought for adaptable software and the agent systems that build it.

This repository explores two connected concerns: using agents to deliver modular software, and designing the coordination system that manages their work. Shared contracts, verified integration, and measurable extension exercises connect both tracks.

## Using this framework in your project

Start with [How to Use This Framework](howtouse.md) for a complete onboarding guide with examples of project context, module documentation, task packets, worker handoffs and contract-based verification.

The guide explains how to assess an existing codebase, adapt these practices to a new project, and give each agent the context required for its assignment. Create a project-specific board and grants using actual revisions and test evidence; this repository's historical assignments do not transfer to another project. Begin with one verified vertical slice, then expand delegation based on measured integration and review effort.

Documentation evolves with the project: each new chapter or supported workflow must be reflected here and in `howtouse.md`, including practical examples and the distinction between proposals and verified capabilities.

**Status:** active architecture discussion with a local commerce pilot. The pilot is disposable and local-only; no production service or orchestration runtime is claimed.

**Coordination workspace:** the supervised Markdown workflow has a [runbook](coordination/README.md), [task board](coordination/BOARD.md), task packets, and message templates. Actual worker trials and recovery-readiness findings are recorded in [the model-allocation evaluation](17-recovery-and-model-allocation.md). Fresh agents start with [AGENTS.md](AGENTS.md).

**Current discussion artifacts:** [publication and work-submission contract drafts](contracts/README.md), with product and coordination acceptance scenarios. Proposed behavior is separated from accepted decisions and executed evidence.

**Executable pilot artifacts:** [schemas, operation mappings, contract harness, connected runtime and coordination checks](pilot/README.md). The application and identity provider are disposable/local; no production service is claimed.

**Current implementation roadmaps:** [Identity, Tenancy and Shop Foundation](12-identity-tenant-shop-foundation.md), [Catalog Publication Foundation](13-catalog-publication-foundation.md), and the completed local [Catalog Reliability and Coordination Recovery](20-catalog-reliability-and-coordination-recovery.md). [Keycloak plus backend `openid-client`](coordination/decisions/IDENTITY-001-commerce-pilot.md) is the accepted identity direction.

## Two tracks, shared contracts

| Track | Focus | Evidence of progress |
|---|---|---|
| Software delivery | Context, module boundaries, bounded assignments, and adaptable implementations | Compatible providers and consumers, real integrated journeys, and measured extension effort |
| Agent coordination | Task lifecycle, authority, dependencies, artifacts, worker adapters, and recovery | Protocol conformance, rejection of stale results, safe reassignment, and adapter replacement |

Start with the [roadmap](04-roadmap-of-thought.md) for the next decisions and [contract criteria](05-contracts-and-adaptability.md) for how we will evaluate them. For the foundations, follow the reading order below.

**Recommendation:** use a small shared project brief, task-specific context, one coordinator, and a few independently working agents. Optimize for time to an integrated, verified feature.

## Read in this order

1. [Modular context and fresh-model onboarding](01-context-and-onboarding.md)
2. [Creating agents and coordinating their work](02-agents-and-coordination.md)
3. [Worked example: a multi-tenant commerce platform](03-enterprise-delivery-example.md)
4. [Roadmap of thought and implementation experiments](04-roadmap-of-thought.md)
5. [Contracts, compatibility, and extensibility](05-contracts-and-adaptability.md)
6. [tmux, agent roles, and implementation metrics](06-tmux-agent-roles-and-metrics.md)
7. [Authority, model allocation, and assumptions](07-authority-model-policy-and-assumptions.md)
8. [Shared task state, communication, and freshness](08-shared-task-state-and-communication.md)
9. [Module dependencies and contract ownership](09-module-dependencies-and-ownership.md)
10. [Stack and workspace proposal](10-stack-and-workspace-proposal.md)
11. [Identity provider and test profile](11-identity-provider-and-test-profile.md)
12. [Identity, Tenancy and Shop Foundation](12-identity-tenant-shop-foundation.md)
13. [Catalog Publication Foundation](13-catalog-publication-foundation.md)
14. [Pilot evaluation and decision](14-pilot-evaluation.md)
15. [Controlled agent comparison](15-controlled-comparison.md)
16. [Controlled experiment packet](16-controlled-experiment-packet.md)
17. [Recovery Readiness and Model Allocation Trial](17-recovery-and-model-allocation.md)
18. [tmux Execution Adapter](18-tmux-execution-adapter.md)
19. [Merchant Catalog Visibility Implementation Roadmap](19-merchant-catalog-visibility.md)
20. [Catalog Reliability and Coordination Recovery](20-catalog-reliability-and-coordination-recovery.md)

**Session tool of choice:** tmux for multiple terminal sessions and agent processes. Use explicit workspace isolation and task/result contracts alongside it. The [operating model](06-tmux-agent-roles-and-metrics.md) defines generic roles, justified specializations, and evidence-based implementation metrics for both tracks.

The [usage guide](howtouse.md) and architecture notes include illustrative layouts for future projects; the executable local example lives under `pilot/`. Exact instruction-file discovery, subagent APIs, and permissions depend on the coding tool.

## The example and assumptions

The owner has selected this commerce publication example as the experiment setting. The [accepted scope](coordination/decisions/SETTING-001-commerce-publication.md) covers publish-and-view followed by a second catalog consumer. The [stack family/layout](coordination/decisions/STACK-001-commerce-pilot.md) is accepted; budgets and implementation assignments remain open.

We are discussing agents **building** a corporate software product. The example is a Shopify-like platform:

- Businesses sign up, configure shops, manage products, and pay platform subscriptions.
- Shoppers browse storefronts and place orders.
- Platform staff operate provisioning, support, billing, and administrative tooling.
- Shared capabilities include identity, tenant isolation, observability, and deployment.

A business account is a **tenant**; it may own multiple shops. A shop is not automatically a separate tenant, codebase, service, or development agent.

Netflix is useful as another example of a large customer-facing platform with internal tooling, but its product domains differ: playback, media processing, rights, subscriptions, and recommendations. These notes do not describe either company's actual architecture.

## Three coordination approaches

| Approach | Good fit | Main trade-off |
|---|---|---|
| One agent, sequential tasks | Exploration, small changes, tightly coupled changes | Low overhead, limited parallel throughput |
| **Coordinator with bounded workers** | Features with identifiable independent parts | Requires explicit contracts and integration ownership |
| Peer-to-peer swarm | Specialized experimentation with mature coordination machinery | More communication, conflicting decisions, harder recovery |

Start with one agent. Introduce workers for concrete independent tasks. For the worked example, one coordinator and two or three workers is a starting experiment, not a universal optimum.

## What actually makes this faster?

1. **A navigable project:** agents find the correct code and rules without rediscovering everything.
2. **Stable boundaries:** workers agree on inputs, outputs, ownership, and errors before implementing independently.
3. **Small deliverables:** review and integrate one useful slice before starting several more.
4. **Executable feedback:** builds, tests, and running the real flow settle claims about correctness.
5. **Controlled concurrency:** only start work that has its prerequisites and an available reviewer/integrator.

For a batch of independent tasks, a useful approximation is:

`elapsed time ≈ preparation + longest parallel task + integration + verification + rework`

Across several batches, the dependency graph's longest path determines the minimum duration. More agents do little for a serial dependency and can increase rework. An agent that saves an hour of implementation but causes two hours of integration has slowed the project down.

## Important distinctions

- **Context is working material:** instructions, task details, code, tools, and retrieved documents currently available to the model.
- **Memory is stored material:** notes and artifacts only influence a new session after they are loaded.
- **An agent profile is a reusable setup:** role instructions, tool permissions, and defaults.
- **An agent instance is an actual run:** a model session with a specific task, context, and workspace.
- **A software module is a product boundary:** agent assignments can follow it, but agent count does not dictate service count.

The model does not learn your repository permanently because it read it once. A new session needs a reliable entry point. A worker's access to its parent's conversation or filesystem must be verified rather than assumed.

## Evidence and limits

The operating model in these notes is a practical recommendation, not a benchmark-proven optimum for every codebase. Agent counts and document sizes are starting heuristics to measure locally.

Relevant primary sources, consulted on 2026-09-10:

- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — simple workflows, parallelization, and orchestrator-worker patterns. Originally published 2024-12-19; the page notes that tooling has evolved.
- [Anthropic: How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) — explicit delegation, artifact handoffs, coordination costs, and evaluation. Published 2025-06-13. Its research results should not be interpreted as equivalent software-delivery speedups; it explicitly discusses coding's tighter dependencies.
- [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — progressive retrieval, compact context, durable notes, and session handoffs. Published 2025-09-29.

## Direction for our next discussion

Pursue both concerns as separate, connected tracks: **delivering adaptable software with agents** and **designing the system that coordinates them**. Their shared checkpoints are executable contracts, verified integration, and measured extension exercises.

The local publication pilot, bounded model trial and second command transport are documented in chapters 14–18. Chapter 19 adds the merchant catalog provider and basic list/filter UI. Source review has reopened its interaction acceptance: delayed responses, session transitions and error/retry behavior still need focused verification and fixes.

The local pilot now includes durable restart/recovery exercises and compatible catalog pagination; tmux remains an orchestration tool, not proof of process control. Production adoption and a real multi-worker concurrency comparison are still open. The [dual-track roadmap](04-roadmap-of-thought.md) and [contract criteria](05-contracts-and-adaptability.md) remain the conceptual guides. Multi-agent refactoring stays deferred by the owner.

The [three-step roadmap](20-catalog-reliability-and-coordination-recovery.md) covers merchant interaction reliability, compatible catalog pagination and durable coordination recovery. All three are implemented and verified in the disposable local pilot; the chapter records exact evidence and the remaining production proof boundaries.

---

Cover artwork generated with AI for this repository. [Artwork prompt and provenance](assets/ARTWORK.md).
