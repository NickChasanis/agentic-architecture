# Five-step execution packet

Owner: current coordinator. Feature worktree: implementation/foundation; canonical board remains in the original checkout. Source: d7b322f. User explicitly authorized completion of all five roadmap steps. No public deployment or paid API use.

1. Freeze contracts/foundation-policy.md, obtain independent read-only review, resolve findings, record accepted baseline.
2. Add coordination/work.schema.json, check-submission.mjs and work.test.mjs. First run failing tests for grants, stale/duplicate/path/evidence checks, then implement pure validation. No live board mutation.
3. Add infra setup.mjs + compose.yaml; isolated PostgreSQL/provider volumes and trusted local TLS. Pin dependencies, verify clean install, database migrations, issuer/fixture revision and import-boundary negative test.
4. Add modules/identity-tenancy/{schema.sql,service.ts}, apps/api/{app.ts,server.ts,oidc.ts}. Tests precede implementation: session/auth endpoints return missing behavior initially; then actual DB and OIDC lifecycle, expiry/replay/CSRF tests. All replies use canonical projections.
5. Add modules/shops/{schema.sql,service.ts}, Angular apps/merchant-admin and Playwright fixtures/journeys. Test discovery/scoped creation before implementing. Run real login/UI/API/database journey and independent code review before integration.

Every code slice follows failing test → minimal implementation → complete affected checks → commit. Exact runtime commands are added to package.json as each executable exists. Test files form the detailed behavioral specification; do not invent a passing environment. Implementation is sequential except read-only review.
