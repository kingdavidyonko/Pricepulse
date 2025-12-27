# Pricepulse

## Runbook / Quickstart

- Install dependencies (root):

```bash
npm install
cd frontend
npm install
```

- Run frontend in dev mode:

```bash
npm run dev
```

- Run seed simulator against local Supabase Edge function (set `SUPABASE_EDGE_URL`):

```bash
SUPABASE_EDGE_URL=http://localhost:54321/functions/v1/convert-and-insert node data/seed-simulator.js
```

- Run tests:

```bash
npm test
```

- Deploy notes:
	- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` env vars are set for edge functions and `frontend/.env`.
	- Schedule `supabase/edge/aggregate.ts` to run weekly via Supabase Cron or external scheduler.
