#!/usr/bin/env bash
set -euo pipefail
BASE_URL=${SUPABASE_EDGE_URL:-http://localhost:54321/functions/v1}
echo "Seeding baseline + realtime submits to $BASE_URL"
node -e "const fs=require('fs');const s=JSON.parse(fs.readFileSync('demo/seed-visuals.json'));(async()=>{const fetch=require('node-fetch');for(const row of s){await fetch('$BASE_URL/convert-and-insert',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product_slug:'rice',country_iso2:'BR',price_local:row.median_price_usd})});console.log('sent',row.week_start);await new Promise(r=>setTimeout(r,200));}console.log('done');})();"
