import type { NextApiRequest, NextApiResponse } from 'next'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Simple in-memory cache to reduce Supabase REST calls in high-traffic scenarios
const _cache: { [k: string]: { ts: number; data: any } } = {};
const CACHE_TTL = Number(process.env.AGGREGATES_CACHE_TTL_SECONDS || 60);

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (!SUPABASE_URL || !SUPABASE_KEY) return res.status(500).json({ error: 'supabase not configured' });
  try{
    res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}, stale-while-revalidate=30`);
    const cacheKey = 'aggregates_latest';
    const cached = _cache[cacheKey];
    if (cached && (Date.now() - cached.ts) < CACHE_TTL*1000) {
      return res.status(200).json(cached.data);
    }
    const url = `${SUPABASE_URL}/rest/v1/aggregates_weekly?select=*,countries!inner(*),products!inner(*)&order=week_start.desc&limit=200`;
    const r = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    const rows = await r.json();
    // normalize to frontend shape
    const out = rows.map((r:any)=>({
      country_id: r.country_id,
      product_id: r.product_id,
      week_start: r.week_start,
      inflation_pct_vs_prev_week: r.inflation_pct_vs_prev_week,
      median_price_usd: r.median_price_usd,
      confidence_score: r.confidence_score,
      country_name: r.countries?.name || null,
      lat: r.countries?.lat || null,
      lng: r.countries?.lng || null
    }));
    // store in cache
    _cache[cacheKey] = { ts: Date.now(), data: out };
    res.status(200).json(out);
  }catch(err:any){
    res.status(500).json({ error: String(err) });
  }
}
