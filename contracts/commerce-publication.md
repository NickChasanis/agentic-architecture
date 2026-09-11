# COMMERCE-PUBLICATION — 0.1-draft

Status: proposed. Owner/steward: coordinator. Providers: shop/authorization foundation and catalog module. Consumers: merchant administration, storefront, and later a second public catalog listing. Context: [accepted setting](../coordination/decisions/SETTING-001-commerce-publication.md).

## Required foundation

Accepted lifecycle constraint: drafts are editable, published products are immutable for the first experiment. [PUBLICATION-001](../coordination/decisions/PUBLICATION-001-immutable-pilot.md) records the decision. Remaining contract details still have draft status.

An authenticated principal and server-validated tenant/shop membership are available. The merchant can create a shop under an authorized tenant, and the public route resolves to exactly one shop. Identity-provider implementation and the route format are still design choices. Shop creation, shop resolution, and authorization must be connected and checked before catalog-dependent assignments start.

Fixtures must include tenant A with shops A1/A2, tenant B with shop B1, and authenticated principals whose memberships make cross-shop and cross-tenant denial observable. A caller-supplied tenant or shop identifier never grants access.

## Proposed data vocabulary

| Value | Meaning and obligations |
|---|---|
| TenantId, ShopId, ProductId | Opaque stable identifiers. Product identity resolves to its actual shop/tenant before authorization. |
| ProductDraftInput | Nonblank title, plain-text description, and price as nonnegative integer minor units plus currency. Concrete length/amount limits and pilot currency are unresolved schema decisions. |
| MerchantProduct | ID, shop/tenant association, draft/published state, content, and price; available only after authorization. |
| PublicProduct | ID, title, plain-text description, and price. A minimal explicit allowlist; excludes membership, tenant metadata, and internal state/history. |

No arbitrary HTML or assets are needed for this pilot. Public clients must render text as text. Currency representation is agreed once before implementation, not chosen independently by UI and provider workers.

## Operations and behavior

Operation names are logical boundaries, not finalized HTTP routes. A later schema must encode these operations, errors, and validation rules in the chosen stack.

The [0.2-draft HTTP specification](commerce-http-api.md) now proposes those mappings and adds an authorized merchant detail read for UI reload/recovery. It is the current wire proposal; this document retains the behavioral contract.

| Operation | Preconditions | Observable result |
|---|---|---|
| CreateShop(principal, tenant, input) | Authenticated, authorized tenant member; valid input. | One shop with stable identity and resolvable public route. |
| CreateDraft(principal, shop, input) | Authorized shop access and valid content. | Persisted draft scoped to that shop; absent from public reads. |
| UpdateDraft(principal, shop, product, input) | Same authorization, matching resource scope, draft state. | Valid content replaced atomically. Published-state update fails with a state conflict. |
| Publish(principal, shop, product) | Same authorization and valid stored content. | Draft becomes published; successful response identifies that published product. |
| ListPublished(publicShopRoute) | Route resolves to a shop. | Only that shop's published PublicProduct values; empty list is valid. |
| ReadPublished(publicShopRoute, product) | Resolved shop owns the product and it is published. | Its PublicProduct; otherwise the public not-found outcome. |

Draft creation retries can create another draft in this initial proposal; clients must not silently replay non-idempotent creates. Publish is idempotent: repeated or concurrent publication of the same product produces one logical state transition and no duplicated downstream effect. If events/jobs are introduced, their duplicate-delivery obligations must be added before dispatch.

Proposed error categories: unauthenticated, access denied/resource unavailable, invalid input, invalid state, unknown public shop, public product not found, and temporary service failure. Exact wire codes and error envelopes remain to be formalized. Cross-scope merchant requests must not disclose whether an inaccessible product exists; public requests treat drafts and wrong-shop products like missing products.

Validation failure causes no partial mutation. Authorization applies on every operation; public lookup and merchant mutation paths must not bypass it via altered identifiers. A success response follows durable publication and the required visibility handling. A temporary failure must not be presented as confirmed success; publication can be retried safely to resolve an uncertain result.

## Visibility and composition

After Publish returns success, a new ListPublished/ReadPublished request for that shop must observe the published product. Requests already in flight may return the older view. If caches are used, this obligation includes them; a long retry window in a browser test must not hide a violation of next-read visibility.

The integrated acceptance journey creates a shop, drafts and publishes from the actual merchant UI, then checks the real public storefront and API with controlled fixtures. The first-party provider and persistence must be real for this gate. Mocked UI tests remain useful but have a distinct evidence label.

## Extension acceptance proposal

Add a second read-only catalog listing through ListPublished/ReadPublished. It must consume the public interface without importing provider internals or accessing storage directly. Both old and new consumers must pass their required checks at the integrated revision.

Proposed change-surface budget: zero existing provider-module or original-storefront source changes to add this consumer. New consumer code/tests and explicit integration registration are allowed; record such wiring separately. If a needed behavior is missing from the contract, report it as an experiment finding and propose evolution rather than weakening the budget retrospectively. This budget is a draft acceptance criterion, not a claim that the extension has passed.

## Still unresolved before executable implementation

Review the concrete field/currency, route/error, and concurrency defaults in the HTTP draft; then finalize executable schemas, identity setup, package versions, persistence wiring, and test commands. The accepted stack and modular backend do not settle those details automatically. Workers cannot independently choose incompatible shared values.
