const { computeWeeklyAggregate, pctChange } = require('../lib/aggregator');

const { computeWeeklyAggregateFast } = require('../lib/aggregator');

test('computeWeeklyAggregate handles simple data', ()=>{
  const subs = [{ price_usd: 1 },{ price_usd: 1.2 },{ price_usd: 0.9 },{ price_usd: 100 }];
  const out = computeWeeklyAggregate(subs);
  expect(out.sample_count).toBeGreaterThan(0);
  expect(typeof out.median_price_usd).toBe('number');
});

test('pctChange computes percentage', ()=>{
  expect(pctChange(10,12)).toBeCloseTo(20);
});

test('fast alias returns same shape', ()=>{
  const subs = [{ price_usd: 1 },{ price_usd: 1.2 },{ price_usd: 0.9 }];
  const a = computeWeeklyAggregate(subs);
  const b = computeWeeklyAggregateFast(subs);
  expect(b.sample_count).toEqual(a.sample_count);
  expect(typeof b.median_price_usd).toBe('number');
});
