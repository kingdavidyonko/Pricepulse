/**
 * Supabase Edge Function: weekly aggregation
 * - Fetches price_submissions for the previous week
 * - Trims outliers (IQR), computes median, sample_count
 * - Calculates inflation vs previous week and 4-week rolling average
 * - Writes results to aggregates_weekly via Supabase REST
 *
 * Environment variables required:
 * SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Scheduling: Configure a cron trigger in Supabase to call this function weekly.
 */

// Inline the aggregator logic since Edge Functions need self-contained code
type Submission = { price_usd: number };

function median(values: number[]) {
    if (values.length === 0) return 0;
    const s = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function iqrFilter(values: number[]) {
    if (values.length < 4) return values.slice();
    const s = values.slice().sort((a, b) => a - b);
    const q1 = median(s.slice(0, Math.floor(s.length / 2)));
    const q3 = median(s.slice(Math.ceil(s.length / 2)));
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    return s.filter((v) => v >= lower && v <= upper);
}

function computeWeeklyAggregate(submissions: Submission[]) {
    const prices = submissions.map((s) => Number(s.price_usd)).filter((n) => !isNaN(n));
    const filtered = iqrFilter(prices);
    const med = median(filtered);
    const sample_count = filtered.length;
    const variance = filtered.length
        ? filtered.reduce((acc, v) => acc + Math.pow(v - med, 2), 0) / filtered.length
        : 0;
    const confidence = Math.min(1, sample_count / (sample_count + 10)) * (1 / (1 + Math.sqrt(variance || 0)));
    return { median_price_usd: med, sample_count, confidence_score: Number(confidence.toFixed(4)) };
}

function pctChange(prev: number, cur: number) {
    if (!prev || prev === 0) return null;
    return ((cur - prev) / prev) * 100;
}

function isoWeekStart(date: Date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() - day + 1);
    return d.toISOString().slice(0, 10);
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

async function fetchSubmissions(week_start: string) {
    const from = week_start;
    const toDate = new Date(week_start + "T00:00:00Z");
    toDate.setUTCDate(toDate.getUTCDate() + 7);
    const to = toDate.toISOString().slice(0, 10);
    const url = `${SUPABASE_URL}/rest/v1/price_submissions?select=product_id,country_id,price_usd&created_at=gte.${from}&created_at=lt.${to}`;
    const r = await fetch(url, {
        headers: { apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    return r.json();
}

async function insertAggregate(row: Record<string, unknown>) {
    const url = `${SUPABASE_URL}/rest/v1/aggregates_weekly`;
    const r = await fetch(url, {
        method: "POST",
        headers: {
            apikey: SUPABASE_KEY!,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(row),
    });
    return r.json();
}

Deno.serve(async (req) => {
    try {
        // Only accept POST requests (Supabase cron uses POST)
        if (req.method !== "POST" && req.method !== "GET") {
            return new Response(JSON.stringify({ error: "Method not allowed" }), {
                status: 405,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Default: aggregate previous ISO week
        const now = new Date();
        const lastWeek = new Date(now);
        lastWeek.setUTCDate(now.getUTCDate() - 7);
        const week_start = isoWeekStart(lastWeek);

        const subs: { country_id: string; product_id: string; price_usd: number }[] = await fetchSubmissions(week_start);
        if (!Array.isArray(subs) || subs.length === 0) {
            return new Response(JSON.stringify({ message: "no submissions" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Group by country_id + product_id
        const groups: Record<string, { price_usd: number }[]> = {};
        subs.forEach((s) => {
            const key = `${s.country_id}::${s.product_id}`;
            groups[key] = groups[key] || [];
            groups[key].push({ price_usd: Number(s.price_usd) });
        });

        const inserts = [];
        for (const key of Object.keys(groups)) {
            const [country_id, product_id] = key.split("::");
            const agg = computeWeeklyAggregate(groups[key]);

            // Fetch previous week's median to compute inflation
            const prevWeekDate = new Date(week_start + "T00:00:00Z");
            prevWeekDate.setUTCDate(prevWeekDate.getUTCDate() - 7);
            const prevWeek = prevWeekDate.toISOString().slice(0, 10);
            const prevUrl = `${SUPABASE_URL}/rest/v1/aggregates_weekly?select=median_price_usd&country_id=eq.${country_id}&product_id=eq.${product_id}&week_start=eq.${prevWeek}`;
            const prevRes = await fetch(prevUrl, {
                headers: { apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}` },
            });
            const prevRows = await prevRes.json();
            const prevMedian = Array.isArray(prevRows) && prevRows[0] ? Number(prevRows[0].median_price_usd) : null;
            const inflation = prevMedian ? pctChange(prevMedian, agg.median_price_usd) : null;

            // Rolling avg 4wk
            const rollRows: number[] = [];
            for (let i = 0; i < 4; i++) {
                const d = new Date(week_start + "T00:00:00Z");
                d.setUTCDate(d.getUTCDate() - 7 * i);
                const ws = d.toISOString().slice(0, 10);
                const rurl = `${SUPABASE_URL}/rest/v1/aggregates_weekly?select=median_price_usd&country_id=eq.${country_id}&product_id=eq.${product_id}&week_start=eq.${ws}`;
                const rres = await fetch(rurl, {
                    headers: { apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}` },
                });
                const rr = await rres.json();
                if (Array.isArray(rr) && rr[0]) rollRows.push(Number(rr[0].median_price_usd));
            }
            const rolling_avg = rollRows.length ? rollRows.reduce((a, b) => a + b, 0) / rollRows.length : null;

            const row = {
                country_id,
                product_id,
                week_start,
                sample_count: agg.sample_count,
                median_price_usd: agg.median_price_usd,
                inflation_pct_vs_prev_week: inflation,
                rolling_avg_4wk: rolling_avg,
                confidence_score: agg.confidence_score,
            };
            inserts.push(row);
        }

        // Insert all aggregates
        const results = [];
        for (const r of inserts) {
            results.push(await insertAggregate(r));
        }

        return new Response(JSON.stringify({ inserted: results.length, details: results }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
