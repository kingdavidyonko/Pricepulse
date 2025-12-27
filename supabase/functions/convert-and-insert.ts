/**
 * Supabase Function: convert local price to USD and insert into price_submissions
 * Expects JSON body: { product_slug, country_iso2, price_local, currency, reporter }
 * Uses exchangerate.host free API to get conversion rate.
 */

import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function getCurrencyFromCountry(iso2: string) {
  // naive mapping for demo; in production use a proper country->currency mapping
  const map: Record<string,string> = { US: 'USD', GB: 'GBP' };
  return map[iso2.toUpperCase()] || null;
}

export default async function handler(req: any, res: any) {
  try {
    const body = req.method === 'GET' ? req.query : req.body;
    const { product_slug, country_iso2, price_local, currency, reporter } = body;
    if (!product_slug || !country_iso2 || !price_local) return res.status(400).json({ error: 'missing fields' });

    const cur = currency || await getCurrencyFromCountry(country_iso2) || 'USD';
    const convUrl = `https://api.exchangerate.host/convert?from=${encodeURIComponent(cur)}&to=USD&amount=${encodeURIComponent(String(price_local))}`;
    const cr = await fetch(convUrl);
    const cj = await cr.json();
    const price_usd = cj && cj.result ? Number(cj.result) : null;
    if (price_usd === null) return res.status(500).json({ error: 'conversion failed' });

    // resolve product_id and country_id via Supabase REST
    const pUrl = `${SUPABASE_URL}/rest/v1/products?select=id&slug=eq.${product_slug}`;
    const pRes = await fetch(pUrl, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    const pRows = await pRes.json();
    const product_id = (Array.isArray(pRows) && pRows[0]) ? pRows[0].id : null;

    const cUrl = `${SUPABASE_URL}/rest/v1/countries?select=id&iso2=eq.${country_iso2}`;
    const cRes = await fetch(cUrl, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    const cRows = await cRes.json();
    const country_id = (Array.isArray(cRows) && cRows[0]) ? cRows[0].id : null;

    if (!product_id || !country_id) return res.status(400).json({ error: 'product or country not found' });

    const insertUrl = `${SUPABASE_URL}/rest/v1/price_submissions`;
    const newRow = { product_id, country_id, price_local: price_local, currency: cur, price_usd, reporter, metadata: { source: 'convert-and-insert' } };
    const insertRes = await fetch(insertUrl, { method: 'POST', headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type':'application/json' }, body: JSON.stringify(newRow) });
    const insertJson = await insertRes.json();

    return res.status(200).json({ inserted: insertJson, price_usd });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
}
