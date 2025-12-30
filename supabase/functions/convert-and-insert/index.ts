/**
 * Supabase Function: convert local price to USD and insert into price_submissions
 * Expects JSON body: { product_slug, country_iso2?, price_local, currency?, reporter?, lat?, lng? }
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const EXCHANGERATE_API_KEY = Deno.env.get("EXCHANGERATE_API_KEY");
const GEOLOCATION_API_URL = Deno.env.get("GEOLOCATION_API_URL") || "https://nominatim.openstreetmap.org/reverse";

async function getCountryFromLatLng(lat: number, lng: number) {
    try {
        const url = `${GEOLOCATION_API_URL}?format=jsonv2&lat=${lat}&lon=${lng}`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "PricePulse/1.0 (contact@example.com)",
            },
        });
        const data = await res.json();
        return data?.address?.country_code?.toUpperCase() || null;
    } catch (e) {
        console.error("Geolocation error:", e);
        return null;
    }
}

async function getCurrencyFromCountry(iso2: string) {
    const map: Record<string, string> = { US: "USD", GB: "GBP", EU: "EUR", BR: "BRL" };
    return map[iso2.toUpperCase()] || null;
}

Deno.serve(async (req) => {
    try {
        const method = req.method;
        let body;

        if (method === "GET") {
            const url = new URL(req.url);
            body = Object.fromEntries(url.searchParams.entries());
        } else {
            body = await req.json();
        }

        let { product_slug, country_iso2, price_local, currency, reporter, lat, lng } = body;

        // Resolve country from lat/lng if iso2 is missing
        if (!country_iso2 && lat && lng) {
            country_iso2 = await getCountryFromLatLng(Number(lat), Number(lng));
        }

        if (!product_slug || !country_iso2 || !price_local) {
            return new Response(JSON.stringify({ error: "missing fields (product_slug, country_iso2/lat-lng, price_local)" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const cur = currency || (await getCurrencyFromCountry(country_iso2)) || "USD";

        // Using exchangerate.host with the provided key
        let price_usd = null;
        const convUrl = `https://api.exchangerate.host/convert?access_key=${EXCHANGERATE_API_KEY}&from=${encodeURIComponent(cur)}&to=USD&amount=${encodeURIComponent(String(price_local))}`;

        try {
            const cr = await fetch(convUrl);
            const cj = await cr.json();
            // exchangerate.host returns { success: true, result: ... } for some plans, or { result: ... }
            price_usd = cj && cj.result ? Number(cj.result) : (cj && cj.info?.rate ? Number(cj.info.rate) * Number(price_local) : null);
        } catch (e) {
            console.error("Currency API error:", e);
        }

        if (price_usd === null) {
            // Fallback
            if (cur === "USD") price_usd = Number(price_local);
            else if (cur === "GBP") price_usd = Number(price_local) * 1.27;
            else if (cur === "EUR") price_usd = Number(price_local) * 1.09;
            else if (cur === "BRL") price_usd = Number(price_local) * 0.20;
        }

        if (price_usd === null) {
            return new Response(JSON.stringify({ error: "conversion failed" }), { status: 500 });
        }

        // Resolve product_id and country_id
        const pUrl = `${SUPABASE_URL}/rest/v1/products?select=id&slug=eq.${product_slug}`;
        const pRes = await fetch(pUrl, {
            headers: { apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}` },
        });
        const pRows = await pRes.json();
        const product_id = Array.isArray(pRows) && pRows[0] ? pRows[0].id : null;

        const cUrl = `${SUPABASE_URL}/rest/v1/countries?select=id&iso2=eq.${country_iso2}`;
        const cRes = await fetch(cUrl, {
            headers: { apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}` },
        });
        const cRows = await cRes.json();
        const country_id = Array.isArray(cRows) && cRows[0] ? cRows[0].id : null;

        if (!product_id || !country_id) {
            return new Response(JSON.stringify({ error: `product (${product_slug}) or country (${country_iso2}) not found` }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const insertUrl = `${SUPABASE_URL}/rest/v1/price_submissions`;
        const newRow = {
            product_id,
            country_id,
            price_local: Number(price_local),
            currency: cur,
            price_usd,
            reporter,
            metadata: {
                source: "convert-and-insert",
                lat: lat ? Number(lat) : undefined,
                lng: lng ? Number(lng) : undefined
            },
        };

        const insertRes = await fetch(insertUrl, {
            method: "POST",
            headers: {
                apikey: SUPABASE_KEY!,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newRow),
        });

        return new Response(JSON.stringify({ success: true, country_iso2, price_usd }), {
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
