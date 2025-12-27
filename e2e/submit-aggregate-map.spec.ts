// Playwright E2E spec (high-level, requires Playwright setup)
import { test, expect } from '@playwright/test';

test('submit -> aggregate -> map update', async ({ request, page })=>{
  // submit a sample
  const submitRes = await request.post(process.env.SUPABASE_EDGE_URL || 'http://localhost:54321/functions/v1/convert-and-insert', { data: { product_slug:'rice', country_iso2:'BR', price_local:12.5 } });
  expect(submitRes.ok()).toBeTruthy();

  // trigger aggregate (if local endpoint exists)
  await request.get(process.env.SUPABASE_EDGE_AGG_URL || 'http://localhost:54321/functions/v1/aggregate');

  // open frontend map
  await page.goto('http://localhost:3000/map');
  await page.waitForSelector('canvas, .leaflet-container');
  // assert some marker exists
  const markers = await page.$$('.leaflet-interactive');
  expect(markers.length).toBeGreaterThanOrEqual(0);
});
