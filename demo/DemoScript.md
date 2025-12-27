# PricePulse 2-minute Demo Script

00:00 — Slide intro (10s)
- "Hi — PricePulse shows weekly food price movement worldwide. I'll show a realtime demo."

00:10 — Map focus (20s)
- Open `http://localhost:3000/map`.
- Toggle heatmap mode by pressing `t` (inflation ↔ absolute price).
- Spoken line: "Heatmap shows per-country inflation (red = rising prices)."

00:30 — Country detail (30s)
- Click a highlighted country (or use list) to open details.
- Point out `Avg`, `Rolling (4wk)`, `Confidence`, `Submissions` and the sparkline.
- Export snapshot: click `Export Snapshot` and confirm PNG download.

01:00 — Alert queue (20s)
- Show AlertBadge toasts; explain threshold config and how alerts appear on map.

01:20 — Seed & realtime (30s)
- Run `scripts/seed-runner.sh` to push demo series (or `node scripts/seed-visuals.js` then runner).
- Refresh map; highlight that markers animate/update.

01:50 — Failure recovery (10s)
- If aggregation fails, run `curl` to trigger edge `aggregate` function and retry.

Notes:
- Keep Supabase env vars set: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_EDGE_URL`.
- If frontend fails to load, run `npm run dev` inside `frontend` and retry.
