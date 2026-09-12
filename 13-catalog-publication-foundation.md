# 13. Catalog Publication Foundation

This roadmap follows the completed identity, tenancy and shop foundation. It keeps product delivery and coordination/adaptability as separate tracks, with contract-shaped exit gates.

1. **Persist the catalog boundary.** Product schema, money representation, status invariant, indexes and tenant/shop foreign keys.
2. **Implement merchant drafts.** Create, read and update with strict validation, normalization, owner/staff authorization and generic not-found behavior.
3. **Make publication atomic.** Row-locked, idempotent publish; published products reject edits.
4. **Expose the public projection.** Published-only reads with public fields only and no cross-shop or cross-tenant leakage.
5. **Connect consumers.** Fastify routes and Angular merchant UI, verified through the real Keycloak → Angular → API → PostgreSQL path.
6. **Measure adaptability.** Run the full contract, integration, build and browser gates; record proof boundaries and prepare the second-consumer experiment.

## Current evidence

All six steps are implemented in `pilot/`. Evidence includes 28 offline contract tests, 22 coordination tests, 19 connected integration tests, 4 Playwright journeys, TypeScript compilation and Angular build. The pilot is disposable local evidence, not production proof or proof of autonomous multi-agent coordination.

## Next experiment

Add an independent storefront or order-preview consumer against the published-product contract without changing catalog internals. Measure contract changes, files touched, integration defects, human/agent effort and time to verified composition.
