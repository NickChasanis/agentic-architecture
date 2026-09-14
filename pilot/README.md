# Commerce pilot runtime

This is the local-only connected identity, tenancy, shop and catalog publication pilot. It uses Fastify, PostgreSQL, Keycloak OIDC, Angular and Playwright with synthetic users. It is not a production deployment.

Run from pilot/:

    node infra/setup.mjs
    /snap/docker/current/usr/libexec/docker/cli-plugins/docker-compose --env-file .local/compose.env -f infra/compose.yaml up -d
    node infra/database.ts
    npm run check:provider
    npm run check:boundaries
    npm run build:merchant
    npm run test:integration
    npm run test:e2e

The setup creates ignored local secrets, a disposable realm fixture and a short-lived localhost certificate. Existing host/PostgreSQL workloads are not used.

Verified 2026-09-12: provider fixture verification, TypeScript compile, import boundaries, 19 database/API integration tests (including catalog publication and concurrent publish), 4 real Keycloak browser tests, 28 Fastify contract tests, 74 offline payload cases and 22 coordination-envelope tests. npm audit reports no vulnerabilities for the pinned tree. Angular reports two known CommonJS optimization warnings for Ajv.

The foundation, catalog, merchant catalog-list, reliability, pagination and durable-coordination slices are implemented locally. The merchant list adds authenticated shop-scoped draft/published filtering and a contract-validated Angular consumer; HTTP-09 adds bounded keyset pages without changing HTTP-08. Durable coordination persists grants, complete receipts, revisions and events, with supervised recovery inspection. tmux provides session windows, and the fake adapter remains a test double. A real sequential model-allocation trial is recorded in [the evaluation](../17-recovery-and-model-allocation.md). Production deployment, host-reboot/process-control proof, real adapter replacement and a parallel-worker cost/speed comparison remain incomplete.

## Reproducible operations

[Operational instructions](OPERATIONS.md) cover isolated port allocation, fresh-checkout setup, the supervised Git worker bridge, logical coordination backup/restore and CI. Run `npm run verify` for offline checks or `npm run verify:connected` with the initialized disposable stack. Both stop on the first failure and report source revision and dirty state. [Chapter 21](../21-supervised-operational-readiness.md) records actual evidence and pending model/review gates.
