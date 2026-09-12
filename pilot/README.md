# Commerce pilot runtime

This is the local-only connected identity, tenancy and shop foundation from the five-step roadmap. It uses Fastify, PostgreSQL, Keycloak OIDC, Angular and Playwright with synthetic users. It is not a production deployment.

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

Verified 2026-09-12: provider fixture verification, TypeScript compile, import boundaries, 15 identity/access integration tests, 3 real Keycloak browser tests, 28 Fastify contract tests, 74 offline payload cases and 22 coordination-envelope tests. npm audit reports no vulnerabilities for the pinned tree. Angular reports two known CommonJS optimization warnings for Ajv.

The five roadmap steps are complete for the identity/tenant/shop foundation only. Catalog draft/publish, product races, storefront, second consumer, production deployment, multi-agent runtime coordination and model cost comparison remain unimplemented. The next roadmap is catalog publication and the second-consumer adaptability measurement.
