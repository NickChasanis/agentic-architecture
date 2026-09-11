# 10. Stack and workspace proposal

[Overview](README.md) · [Module map](09-module-dependencies-and-ownership.md) · [Contracts](contracts/README.md) · [Task board](coordination/BOARD.md)

Status: technology family and workspace direction accepted, recorded in [STACK-001](coordination/decisions/STACK-001-commerce-pilot.md) at 2026-09-11T16:16:51Z. Original proposal recorded 2026-09-11T16:08:25Z. No packages, application directories, containers, or worker sessions have been created. Exact versions, authentication, and execution configuration remain open; implementation details below still require verification.

## Recommended pilot stack

| Concern | Proposed choice | Purpose and tradeoff |
|---|---|---|
| Client surfaces | Angular with TypeScript; one merchant app and one storefront app | Explicit consumer boundaries and consistent implementation language; two apps add some build/configuration work. |
| Commerce backend | Node.js/TypeScript with Fastify; one backend process | Keep module boundaries explicit and make schema-based request/response handling part of the foundation. Domain modules remain independent of HTTP handlers. |
| Persistence | PostgreSQL, one pilot database with module-owned tables | Exercise real persistence, isolation queries, and publication concurrency. Requires a controlled database environment per independent test run. |
| Wire contracts | Canonical JSON Schema files plus an HTTP operation manifest | Exact input/output/error definitions are reviewed before dependent workers start. Generate documentation/client types from the same source where tooling supports it. |
| Integration checks | Provider/consumer checks plus Playwright API and browser scenarios | Cover HTTP semantics and visible behavior on the actual combined application. |
| Agent session access | tmux and isolated Git worktrees | Preserve the accepted session model; allocate database/port/temp resources separately. |
| Coordination pilot | Existing Markdown board, packets, and messages | Test procedures before implementing an automated registry. Later runtime adapters may use TypeScript, but that choice is not required now. |

The rationale for one main implementation language is to reduce the number of toolchains and language boundaries in the first comparison. It does not establish that lower-cost models will perform better; measure that hypothesis. Framework choice does not replace contract ownership, tests, or review.

An Angular plus Java/Spring backend is a valid alternative if matching a Java application's environment matters more than minimizing pilot toolchains. A small plain-browser client is another alternative if Angular setup becomes the dominant cost. Neither alternative changes the required isolation, publication, compatibility, or extension obligations. Do not change stacks halfway through a measured comparison without recording a new baseline.

## Framework capabilities and their limits

Fastify supports JSON Schema request validation and response serialization. Use reviewed schemas as trusted application code and define authorization/domain checks separately; a schema-valid request is not necessarily authorized. Response projection must be intentional and checked for private-field leakage. See [Fastify validation and serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/).

Angular's typed HTTP calls do not validate returned JSON against the declared TypeScript type. Add runtime validation at the selected consumer boundary or explicit consumer-contract checks; shared TypeScript types alone cannot prove compatibility. See [Angular HTTP requests](https://angular.dev/guide/http/making-requests).

Playwright supports direct HTTP API testing as well as browser-linked workflows. Use API checks for exact publication ordering/errors and browser checks for the complete merchant-to-storefront journey. See [Playwright API testing](https://playwright.dev/docs/api-testing).

PostgreSQL schemas can organize objects, but a schema name alone does not isolate data. Permissions and application ownership rules determine access. Use separate databases/roles or properly isolated schemas for concurrently mutating tests, according to the actual environment. See [PostgreSQL schemas](https://www.postgresql.org/docs/current/ddl-schemas.html).

Sources checked 2026-09-11. These capability checks do not establish a compatible package-version set or validate this host's setup. Select supported versions together, verify their compatibility, and pin them before the foundation task; do not assume an unspecified latest combination works.

## Proposed repository layout

Keep the existing discussion repository as the pilot's starting home, with application work isolated under a new directory. This avoids introducing another repository during the first experiment. The tree is illustrative; none of these application paths exists yet.

```text
AGENTS.md, README.md, 01-...md through 10-...md
coordination/                     existing supervised task state and decisions
contracts/                        existing behavioral discussion documents
pilot/
  package.json                    one workspace manifest and one root lockfile
  apps/
    api/                          composition root, HTTP adapters, startup
    merchant-admin/               merchant consumer
    storefront/                   public consumer
  modules/
    identity-tenancy/             principal and permission interfaces/logic
    shops/                        shop lifecycle and route resolution
    catalog/                      draft/publication rules and projection
  contracts/
    schemas/                      canonical wire shapes, including errors
    operations/                   method/path/auth/schema associations
  tests/
    contracts/                    provider and supported-consumer obligations
    integration/                  real persistence and module composition
    e2e/                          real browser journeys
  infra/                          local test database configuration
```

Domain modules export public interfaces; HTTP/framework details stay in adapters and the composition root. Each module owns its persistence code and migrations, with one integration owner coordinating application of migrations. Consumer applications may import contract artifacts but not backend modules or repositories. Import-rule enforcement and a dependency graph check are foundation deliverables, not properties guaranteed by folder names.

The existing `contracts/` documents retain behavioral rationale and acceptance IDs. Exact wire facts live once under `pilot/contracts/`; link them from the prose rather than maintaining parallel payload definitions. Generator/validator choice and schema-dialect compatibility must be checked before committing the exact schemas.

Allocate one worktree per concurrent writer outside the canonical coordination checkout. The lead checkout's board remains authoritative as described in the runbook; copies in worktrees are snapshots. The coordinator owns root configuration, lockfile changes, contract generation, and shared integration wiring for each batch.

## Identity and public routing need an explicit foundation decision

Proposed first routing form: a stable shop slug in the public URL, resolved on the server. Custom domains are not needed for the pilot. Prevent collisions through a declared uniqueness rule; changing a slug is outside the initial journey unless explicitly added.

The authentication mechanism is still open. Before foundation implementation, choose an established authentication integration or a clearly isolated test identity mechanism. If using a test mechanism, label the resulting proof as authenticated-fixture integration, not production login readiness. Never let a production-accessible endpoint accept arbitrary tenant/principal headers as authentication.

Regardless of login mechanism, the application must enforce real server-side shop/tenant permissions and deny identifier substitution. This distinction makes the scope of the experiment's evidence honest without silently omitting authorization.

## Foundation gate and evidence

Before assigning catalog/UI work independently, establish:

1. Reproducible dependency installation, builds, database setup, and isolated fixture reset; exact commands recorded from the real workspace.
2. Reviewed operation/schema mappings, error conventions, public field allowlist, price/currency limits, and authorization/resource-context contracts.
3. One connected client-to-API-to-database path, with shop resolution and a denied cross-scope request.
4. Consumer/runtime schema checks and an import-boundary check that fail when intentionally violated in a controlled validation exercise.
5. A recorded baseline, assigned paths, test resources, task budget, and required obligation IDs for each subsequent worker.

Full publication/concurrency/extension scenarios follow the foundation and remain mandatory at their respective integration gates. Initial setup passing does not mean those later obligations have passed.

## Cost and execution boundary

This proposal makes no choice between subscription usage and separately billed APIs. No new billing or model runs are authorized. Continue reviewing schemas and operating procedures in this discussion; resolve BUDGET-001 before dispatching workers or scheduling a measured experiment.

Next concrete design artifact: a reviewed operation table for create shop, create/update draft, publish, public list/detail, and their errors, using the proposed stack only after its selection is settled. Multi-agent refactoring remains deferred.
