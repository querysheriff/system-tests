# system-tests

Browser tests for the whole querysheriff stack.

Docker Compose starts the released collector, backend and frontend images from GHCR, with versions pinned in `compose.yaml`. They run alongside a Postgres for the collector to monitor, and the backend's own Postgres and ClickHouse. A Caddy proxy serves the dashboard and `/api` from one origin, as production does, at `http://localhost:18080`.

You need Docker and Node 24.

```sh
npm ci
npx playwright install chromium
npm test        # ~2 min, removes the stack when done
npm run check   # tsc + prettier
```

## What it tests

`onboarding.setup.ts` signs in the first user, who becomes admin, and creates a collector token in the UI. The test then starts the collector with that token.

`slow-query.e2e.ts` runs a slow query on the monitored Postgres and waits for the dashboard to show it. It has to appear twice. On the Queries screen, with stats from `pg_stat_statements` and the timed run from the log. And on the Logs screen, as a slow-query event.

## Other builds

Set `COLLECTOR_IMAGE`, `BACKEND_IMAGE` or `FRONTEND_IMAGE` to any linux/amd64 image:

```sh
BACKEND_IMAGE=ghcr.io/querysheriff/backend:latest npm test
```

## Debugging

After a run, every container's log is in `test-results/compose.log`.
