/**
 * Simple simulator to POST a few sample submissions to the convert-and-insert endpoint
 * Usage: NODE_ENV=development node data/seed-simulator.js
 */
const fetch = require('node-fetch');

const ENDPOINT = process.env.SUPABASE_EDGE_URL || 'http://localhost:54321/functions/v1/convert-and-insert';

async function send(sub){
  const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(sub) });
  return r.json();
}

async function run(){
  const samples = [
    { product_slug:'rice', country_iso2:'BR', price_local:12.5, currency:'BRL', reporter:'sim' },
    { product_slug:'bread', country_iso2:'GB', price_local:1.1, currency:'GBP', reporter:'sim' },
    { product_slug:'milk', country_iso2:'AU', price_local:1.6, currency:'AUD', reporter:'sim' }
  ];
  for (const s of samples){
    console.log('sending', s);
    console.log(await send(s));
  }
}

if (require.main === module) run();
