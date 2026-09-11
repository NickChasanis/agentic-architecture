# Agentic Architecture

![Purple synthwave computing modules connected to a central coordination hub across a neon grid](assets/agentic-architecture-synthwave.png)

> A roadmap of thought for adaptable software and the agent systems that build it.

This repository explores two connected concerns: using agents to deliver modular software, and designing the coordination system that manages their work. Shared contracts, verified integration, and measurable extension exercises connect both tracks.

**Status:** active architecture discussion and proposed experiments. The repository contains notes and examples; no application or orchestration runtime is implemented yet.

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

These are portable guidance and illustrative templates. The repository paths shown inside the notes describe a hypothetical application; they are not application files created here. Exact instruction-file discovery, subagent APIs, and permissions depend on the coding tool.

## The example and assumptions

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

Next, draft a product behavior contract and an agent work-submission contract together, each including failure and extension scenarios. For the commerce example, the product outcome remains: **a merchant creates a shop, publishes a product, and a shopper can see it without cross-tenant leakage.**

The [dual-track roadmap](04-roadmap-of-thought.md) sequences both concerns. [Contract and adaptability criteria](05-contracts-and-adaptability.md) define how to assess them. These are discussion guides, not a commitment to build the example platform.

---

Cover artwork generated with AI for this repository. [Artwork prompt and provenance](assets/ARTWORK.md).
