# Supervised local operations

The canonical Markdown board remains authority. Git worktrees isolate edits; they do not enforce filesystem permissions. The Git worker bridge accepts a coordinator-provided live grant callback and explicit command argv. It rejects the primary checkout, dirty worktrees, stale baselines and scope violations in submitted commits. It never merges, grants itself work, or verifies a model's identity.

## Reproduce from a fresh checkout

Use Node 22, Python 3, Git, tmux, Docker with Compose, OpenSSL and Chrome/Chromium. From `pilot/`:

```sh
npm ci
PILOT_APP_PORT=3543 PILOT_IDENTITY_PORT=8543 PILOT_DB_PORT=56432 node infra/setup.mjs
docker compose -p agentic-operational --env-file .local/compose.env -f infra/compose.yaml up -d
node --import tsx infra/database.ts
npm run check:provider
npm run verify:connected
```

Wait for Keycloak to finish starting before the provider check. Setup preserves existing configuration: changing environment variables later does not migrate an existing stack. Choose three unused ports and a unique Compose project on each host; never reuse another assignment's fixtures concurrently. PostgreSQL and Keycloak have 384 MiB and 1024 MiB memory limits in Compose. HTTP binds only to loopback. Existing defaults remain 3443, 8443 and 55432.

If `/usr/bin/google-chrome` is unavailable, install Playwright Chromium and set `PILOT_CHROME` to its executable path. Generated secrets stay in ignored `.local/`; never commit, upload as evidence, or print this directory. Ordinary `npm run verify` runs the offline checks without the services. `verify:connected` fails if runtime configuration is absent and stops at the first failing command.

## Backup and supervised recovery

With the coordination schema initialized and an existing namespace, run:

```sh
node contracts/coordination/backup-cli.mjs export exercise-1 /absolute/private/path/exercise-1.json
node contracts/coordination/backup-cli.mjs restore exercise-1-restored /absolute/private/path/exercise-1.json
node contracts/coordination/recovery-inspection.mjs exercise-1-restored
```

Export writes a new mode-0600 file and refuses overwrite. It reads a transactionally consistent namespace containing grants, complete receipts, events and revisions. Restore accepts only a new namespace in an initialized schema, preserving the source and existing targets. The checksum detects accidental corruption; trusted storage and operator review remain necessary. This is a logical coordination backup, not a commerce database backup.

Restoring records does not activate them. Keep writers stopped, inspect interrupted grants, reconcile processes and artifacts, confirm termination, and record any replacement under a new generation. An operator must explicitly select one authority before switching away from Markdown; do not run both stores as live authority. Current APIs trust termination evidence supplied by the coordinator. Host reboot, escaped process groups and unattended process adoption have not been proved.

## Readiness and observability

Each verification run prints revision, dirty state, UTC start/end and outcome; each worker result includes task, worker, generation and artifact revision. Correlate those with the board event and full check evidence. Use recovery inspection for interrupted assignments and storage/schema errors. Never expose passwords, provider tokens or full worker output as public telemetry.

The CI workflow exercises the same offline and connected commands with disposable services. A checked-in workflow is only configuration until GitHub reports a run result. Staging remains **not ready** until real worker/reviewer capacity, bounded process control, a named deployment target, backup retention/access policy and authority ownership are settled.

To stop only this exercise's services while preserving its database:

```sh
docker compose -p agentic-operational --env-file .local/compose.env -f infra/compose.yaml stop
```

Never stop another project's workloads to make room for these tests.

CI configuration follows [GitHub's Node.js guidance](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs) and [Playwright's CI setup](https://playwright.dev/docs/ci-intro), consulted 2026-09-14. Action references are pinned to the resolved v6 checkout and v7 setup-node commits.
