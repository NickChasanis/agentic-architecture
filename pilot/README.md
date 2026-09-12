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

The five foundation steps and six catalog/publication steps are implemented. The pilot proves draft editing, atomic/idempotent publication, immutable published products, tenant-scoped merchant access and privacy-preserving public projections. A second catalog consumer, production deployment, multi-agent runtime coordination and model cost comparison remain future work.
