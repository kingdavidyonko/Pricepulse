export function colorForValue(val:any, mode='inflation'){
  if (val === null || val === undefined || isNaN(Number(val))) return '#ccc';
  const v = Number(val);
  if (mode === 'price'){
    // map price 0..50 to green->red
    const p = Math.max(0, Math.min(1, v/50));
    const r = Math.round(255*p); const g = Math.round(200*(1-p));
    return `rgb(${r},${g},50)`;
  }
  // inflation percent scale: <-10 deep green, 0 neutral, >10 deep red
  const clamp = Math.max(-10, Math.min(10, v));
  const t = (clamp + 10) / 20; // 0..1
  const r = Math.round(200*t + 55*t);
  const g = Math.round(200*(1-t));
  return `rgb(${r},${g},100)`;
}
