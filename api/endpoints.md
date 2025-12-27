# PricePulse API Endpoints (MVP)

GET /aggregates/latest
- Returns latest weekly aggregates for all countries/products.

GET /history/:country/:product
- Returns historical aggregates for a country and product (time series).

POST /submit
- Accepts JSON: { product_slug, country_iso2, price_local, currency?, reporter? }
- Example curl:

```bash
curl -X POST https://your-supabase-edge.example/convert-and-insert \
  -H "Content-Type: application/json" \
  -d '{"product_slug":"rice","country_iso2":"BR","price_local":10.5,"currency":"BRL","reporter":"demo"}'
```

Notes:
- The `/convert-and-insert` function converts local price to USD using exchangerate.host and inserts into `price_submissions`.
- Aggregation runs weekly via `/edge/aggregate` (cron) or can be triggered manually.
