# 3. Worked example: a multi-tenant commerce platform

[Overview](README.md) · [Context onboarding](01-context-and-onboarding.md) · [Agent coordination](02-agents-and-coordination.md)

## Product boundaries before agent assignments

Our example platform has three user-facing surfaces:

| Surface | Users | Typical capabilities |
|---|---|---|
| Merchant administration | Business owners and their staff | Create shops, edit catalogs, configure storefronts, manage orders |
| Customer storefront | Shoppers | Browse published products, cart, checkout, order status |
| Platform operations | Authorized internal staff | Support, provisioning, tenant lifecycle, operational controls |

These surfaces reuse domain capabilities. Example modules include tenancy and identity, shops, catalog, ordering, payments, platform subscriptions, and operations.

Keep **merchant subscription billing** separate in the domain model from **shopper payment processing**. They have different customers, money flows, permissions, and failure handling.

For a greenfield project without demonstrated independent deployment requirements, a modular monolith with separate client applications is a reasonable starting proposal. Agents can work within strong module boundaries in one deployment. Existing enterprise platforms may already require services for scale, ownership, compliance, or operations; preserve justified boundaries rather than forcing this starting point onto them.

Agent parallelism is not a reason to introduce microservices. Stable interfaces and ownership are the useful properties.

## First vertical slice: publish and view a product

**Outcome:** an authenticated merchant creates a shop, adds a product, publishes it, and a shopper sees it on the correct storefront.

This tests the foundation across identity, tenancy, shops, catalog, merchant UI, and public delivery. It deliberately leaves checkout for a later slice; it is a useful integrated milestone, not a complete commerce launch.

### Cross-cutting rules

- A tenant may own several shops; identities and memberships determine which shops staff can operate.
- The server validates merchant permissions and tenant/shop scope. A request's tenant ID alone grants no authority.
- Storefront identity comes from a validated shop route/domain mapping. Public reads expose only that shop's published data.
- Database reads, caches, assets, background jobs, and events must retain the appropriate tenant/shop boundary when used by the feature.
- Internal support access is explicit and auditable, not an accidental bypass of normal isolation.
- Money representation and currency behavior follow one accepted project convention.

Put these shared rules in canonical context documents and reference them from each task. Tenant isolation is part of initial behavior, not a final hardening exercise.

## Wave 0: establish the minimum shared foundation

The coordinator, or one foundation implementer, resolves the decisions that would otherwise make parallel workers invent incompatible systems:

1. Product vocabulary, first journey, and acceptance criteria.
2. Repository boundaries, local startup, CI, and test-environment setup.
3. Tenant/shop identity and authorization interfaces.
4. Minimum shop creation/resolution capability and fixtures for two tenants and multiple shops.
5. Canonical product-publication API contract, error semantics, and compatible client usage.
6. One minimal runnable path through the application to prove the foundation is connected.

This is enough design to unblock a slice, not a complete specification of the entire corporate platform. Independent discovery can run in parallel, but dependent writers wait for the relevant foundation.

### Decisions the publication contract must settle

- Product identifier, tenant/shop association, and draft/published lifecycle.
- Create, update, publish, and public-read request/response shapes.
- Authentication, authorization, validation, and error behavior.
- Whether publication is immediately visible or eventual; the example assumes visibility on the next completed read, including cache invalidation.
- Public projection: which fields are safe for unauthenticated shoppers.
- Retry/repeated-publication behavior and compatibility expectations.

The exact schema depends on the selected stack and product decisions. Workers consume the canonical contract rather than inventing payloads from this prose.

## Wave 1: parallel implementation against the shared contract

The following paths are illustrative. Assign actual paths and contract revisions in a real task packet.

| Worker | Deliverable | Write ownership | Context needed | Local evidence |
|---|---|---|---|---|
| Catalog implementer | Product persistence, publication, public projection | `modules/catalog/` and its tests | Catalog rules, tenancy/shop interfaces, API contract | API/lifecycle and isolation tests |
| Merchant UI implementer | Product edit/publish flow | `apps/merchant-admin/` feature paths and tests | Merchant journey, design system, contract, permission/error semantics | Form, interaction, accessibility, and contract-based tests |
| Storefront implementer | Published product display | `apps/storefront/` feature paths and tests | Storefront journey, routing, public projection, design system | Public visibility, loading/error, and contract-based tests |

The coordinator owns shared contracts, cross-module wiring, and integration checks for the batch. If schema migrations live in a shared directory, assign one owner or a reserved migration file before work starts. Root manifests, lockfiles, and generated API clients also need explicit ownership.

UI workers can use contract-valid fixtures while the API is being implemented. Such checks demonstrate progress, not successful live integration. If the contract remains too uncertain, keep the API and UI in one sequential task instead.

## Example task packet: catalog publication

The revision, workspace, and exact command fields below must be filled from the real repository by the coordinator before dispatch. Their absence is a readiness blocker, not permission for a worker to guess.

```markdown
# CAT-01 — Publish products within an authorized shop

## Outcome
Authorized merchant staff can create a draft and publish it. Public reads
return only published products for the resolved shop.

## Baseline and dependencies
Record the actual base revision, assigned branch/worktree, and contract revision.
The tenancy interface, shop resolver, test fixtures, and publication contract
must already be available at this baseline.

## Required context
- Project entry point and docs/development.md
- docs/domains/catalog.md
- Relevant tenancy/shop guide sections and accepted boundary decision
- Canonical product-publication API contract
- Existing authorization helpers and analogous API tests

## Write ownership
- modules/catalog/ and its local tests
- Catalog guide updates required by this change
- Any shared-directory migration only if explicitly assigned in this packet

## Acceptance criteria
1. An authorized member can create and publish a product in their shop.
2. Unauthorized mutations fail according to the accepted API contract.
3. Changing a tenant/shop/product identifier does not bypass authorization.
4. Draft products are absent from public reads.
5. Published products appear only in the correctly resolved shop.
6. A repeated publish request has the agreed safe behavior.
7. Invalid input produces the agreed error without partial state changes.
8. Public responses exclude merchant-only/internal fields.

## Constraints
Reuse established authorization, persistence, and money conventions.
Coordinate any contract or shared tenancy change before implementing it.

## Verification
Coordinator records exact focused test/build commands from the repository,
the required isolated test database, and relevant integration test locations.
Worker records executed commands, outcomes, and any unrun checks at handoff.

## Escalation and output
Report missing dependencies, ownership conflicts, or a contract mismatch.
Return the patch/branch reference, changed paths, verification evidence,
migration needs, unresolved issues, and integration actions.
```

The worker receives this packet and the required context, not the entire platform roadmap or all other workers' conversations. It can still inspect dependencies and callers as needed.

## Wave 2: integrate and prove the journey

Integrate in dependency order, then exercise the real application at the combined revision:

1. Create two tenants, with more than one shop under one tenant.
2. Sign in as merchant staff and create a product draft in an authorized shop.
3. Confirm it is absent from that shop's public storefront.
4. Publish it from the merchant UI and confirm the real storefront displays it.
5. Confirm another shop and the other tenant's storefront do not expose it.
6. Attempt unauthorized reads/mutations and verify the accepted error behavior and absence of leaked data.
7. Exercise relevant caching/routing paths so an API-only test cannot hide a storefront isolation bug.
8. Run the required CI and review the feature's accessibility and error states.

The coordinator records the integrated revision and results. A reviewer examines the changed authorization boundaries, public projection, and relevant failure handling. Production release follows the project's normal release ownership and criteria.

## Expand in useful slices

These are candidate outcomes, not a fixed schedule or an instruction to build everything immediately:

| Slice | End-to-end outcome | Main dependencies |
|---|---|---|
| Shop setup and publication | Merchant publishes; shopper sees correct content | Tenancy, shops, catalog |
| Purchase | Shopper places an order and receives reliable payment status | Prices, order state, payment integration, retry semantics |
| Merchant subscriptions | Business subscribes, changes plan, and receives correct entitlements | Tenant identity, provider events, entitlement policy |
| Shop provisioning tooling | Merchant creates another shop from supported configuration | Shop lifecycle, domain resolution, idempotent provisioning |
| Operations/support | Staff diagnose and perform authorized support actions | Auditing, observability, support permissions |

Separate customer storefront configuration from arbitrary per-customer forks. Shop creation may be records, configuration, and assets within a shared platform; it does not inherently require generating or deploying a new application each time.

When purchase work begins, payment retries, webhook authenticity, duplicate delivery, ordering of events, and reconciliation become task requirements. For provisioning, retries and partial-failure recovery become requirements. Give each worker the risks of its actual domain rather than every domain's full checklist.

## Enterprise scale changes the questions, not the basic coordination rule

Before selecting deployment topology or promising dates, obtain concrete requirements: existing customers and compatibility commitments, expected tenant/shop counts, traffic patterns, geographic/data-residency needs, availability targets, and operational ownership.

For an existing customer-facing platform, include migration and rollout concerns in affected packets: old/new contract compatibility, data migration verification, feature exposure, and recovery if rollout fails. A large rewrite split across many agents can be slower and riskier than incremental changes behind stable interfaces.

Use proven platform capabilities already available to the team for identity, payment processing, deployment, and observability when they meet the requirements. Creating custom agent infrastructure and custom commodity product infrastructure at once adds two sources of delivery risk.

## What transfers to a Netflix-like product?

The same context and delegation method applies, with a different domain map:

- Playback tasks need entitlement, DRM, device, and delivery contracts.
- Media-ingestion tasks need asset lifecycle, processing, retry, and publication rules.
- Recommendation tasks need event/data contracts, privacy boundaries, and evaluation criteria.
- Internal operations tasks need service health and authorized operational controls.

Do not import commerce assumptions about tenants, shops, payments, or deployment units without checking the real product. The transferable idea is a small global map plus task-relevant domain contracts.

## Practical starting recipe

1. Choose one valuable, testable user journey.
2. Give the initial model the project map, existing code access, and that outcome.
3. Establish only the missing shared decisions needed for the journey.
4. Create bounded task packets and isolate concurrent writers.
5. Start two or three workers only where dependencies permit.
6. Integrate quickly, verify the real flow, and update canonical context.
7. Compare elapsed time and rework against simpler execution before adding agents.

**The fastest useful team is the smallest one that keeps genuinely independent work moving and finishes integration reliably.**
