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

The foundation and catalog steps are implemented. Public consumer helpers now support title/price filtering and price summaries, including large inputs. The registry validates grants and scopes; recovery tests confirm process termination before reassignment. tmux provides session windows, and the fake adapter remains a test double. A real sequential model-allocation trial is recorded in [the evaluation](../17-recovery-and-model-allocation.md). Durable coordination, real adapter replacement and a parallel-worker comparison remain incomplete.
