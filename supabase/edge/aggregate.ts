/**
 * Supabase Edge Function: weekly aggregation
 * - Fetches price_submissions for the previous week
 * - Trims outliers (IQR), computes median, sample_count
 * - Calculates inflation vs previous week and 4-week rolling average
 * - Writes results to aggregates_weekly via Supabase REST
 *
 * Environment variables required:
 * SUPABASE_URL, SUPABASE_SERVICE_KEY
 *
 * Scheduling: Configure a cron trigger in Supabase to call this function weekly.
 */

import fetch from 'node-fetch';
import { computeWeeklyAggregate, pctChange } from '../../lib/aggregator';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

function isoWeekStart(date: Date) {
  // return ISO week Monday date string (YYYY-MM-DD)
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7; // Sunday=0 -> 7
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0,10);
}

async function fetchSubmissions(week_start: string) {
  // fetch submissions where created_at >= week_start and < week_start + 7 days
  const from = week_start;
  const toDate = new Date(week_start + 'T00:00:00Z');
  toDate.setUTCDate(toDate.getUTCDate() + 7);
  const to = toDate.toISOString().slice(0,10);
  const url = `${SUPABASE_URL}/rest/v1/price_submissions?select=product_id,country_id,price_usd&created_at=gte.${from}&created_at=lt.${to}`;
  const r = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  return r.json();
}

async function insertAggregate(row: any) {
  const url = `${SUPABASE_URL}/rest/v1/aggregates_weekly`;
  const r = await fetch(url, { method: 'POST', headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type':'application/json' }, body: JSON.stringify(row) });
  return r.json();
}

export default async function handler(req: any, res: any) {
  try {
    // default: aggregate previous ISO week
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setUTCDate(now.getUTCDate() - 7);
    const week_start = isoWeekStart(lastWeek);

    const subs: any[] = await fetchSubmissions(week_start);
    if (!Array.isArray(subs) || subs.length === 0) {
      res.status(200).json({ message: 'no submissions' });
      return;
    }

    // group by country_id + product_id
    const groups: Record<string, any[]> = {};
    subs.forEach(s => {
      const key = `${s.country_id}::${s.product_id}`;
      groups[key] = groups[key] || [];
      groups[key].push({ price_usd: Number(s.price_usd) });
    });

    const inserts = [];
    for (const key of Object.keys(groups)) {
      const [country_id, product_id] = key.split('::');
      const agg = computeWeeklyAggregate(groups[key]);
      // fetch previous week's median to compute inflation (best-effort)
      const prevWeekDate = new Date(week_start + 'T00:00:00Z');
      prevWeekDate.setUTCDate(prevWeekDate.getUTCDate() - 7);
      const prevWeek = prevWeekDate.toISOString().slice(0,10);
      const prevUrl = `${SUPABASE_URL}/rest/v1/aggregates_weekly?select=median_price_usd&country_id=eq.${country_id}&product_id=eq.${product_id}&week_start=eq.${prevWeek}`;
      const prevRes = await fetch(prevUrl, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
      const prevRows = await prevRes.json();
      const prevMedian = (Array.isArray(prevRows) && prevRows[0]) ? Number(prevRows[0].median_price_usd) : null;
      const inflation = prevMedian ? pctChange(prevMedian, agg.median_price_usd) : null;

      // rolling avg 4wk (best-effort): fetch last 3 weeks + current
      const rollRows: number[] = [];
      for (let i=0;i<4;i++){
        const d = new Date(week_start + 'T00:00:00Z');
        d.setUTCDate(d.getUTCDate() - (7*i));
        const ws = d.toISOString().slice(0,10);
        const rurl = `${SUPABASE_URL}/rest/v1/aggregates_weekly?select=median_price_usd&country_id=eq.${country_id}&product_id=eq.${product_id}&week_start=eq.${ws}`;
        const rres = await fetch(rurl, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
        const rr = await rres.json();
        if (Array.isArray(rr) && rr[0]) rollRows.push(Number(rr[0].median_price_usd));
      }
      const rolling_avg = rollRows.length ? rollRows.reduce((a,b)=>a+b,0)/rollRows.length : null;

      const row = {
        country_id,
        product_id,
        week_start,
        sample_count: agg.sample_count,
        median_price_usd: agg.median_price_usd,
        inflation_pct_vs_prev_week: inflation,
        rolling_avg_4wk: rolling_avg,
        confidence_score: agg.confidence_score
      };
      inserts.push(row);
    }

    // bulk insert; Supabase allows upsert, but we'll insert one-by-one to keep code simple
    const results = [];
    for (const r of inserts) {
      results.push(await insertAggregate(r));
    }

    res.status(200).json({ inserted: results.length, details: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
}
