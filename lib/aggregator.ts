// Utility aggregation logic shared by edge function and tests
type Submission = { price_usd: number };

function median(values: number[]) {
  if (values.length === 0) return 0;
  const s = values.slice().sort((a,b)=>a-b);
  const mid = Math.floor(s.length/2);
  return s.length%2 ? s[mid] : (s[mid-1]+s[mid])/2;
}

function iqrFilter(values: number[]) {
  if (values.length < 4) return values.slice();
  const s = values.slice().sort((a,b)=>a-b);
  const q1 = median(s.slice(0, Math.floor(s.length/2)));
  const q3 = median(s.slice(Math.ceil(s.length/2)));
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  return s.filter(v => v >= lower && v <= upper);
}

export function computeWeeklyAggregate(submissions: Submission[]) {
  const prices = submissions.map(s=>Number(s.price_usd)).filter(n=>!isNaN(n));
  const filtered = iqrFilter(prices);
  const med = median(filtered);
  const sample_count = filtered.length;
  const variance = filtered.length ? filtered.reduce((acc,v)=>acc+Math.pow(v-med,2),0)/filtered.length : 0;
  // confidence: logistic-ish mapping of sample_count and variance
  const confidence = Math.min(1, sample_count / (sample_count + 10)) * (1/(1+Math.sqrt(variance||0)));
  return { median_price_usd: med, sample_count, confidence_score: Number(confidence.toFixed(4)) };
}

export function pctChange(prev: number, cur: number) {
  if (!prev || prev === 0) return null;
  return ((cur - prev) / prev) * 100;
}

// convenience alias: faster implementations or variants can be added later
export function computeWeeklyAggregateFast(submissions: Submission[]) {
  return computeWeeklyAggregate(submissions);
}

export default { median, iqrFilter, computeWeeklyAggregate, computeWeeklyAggregateFast, pctChange };
