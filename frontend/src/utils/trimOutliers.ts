export function trimOutliers(values:number[]){
  if (!values || values.length < 4) return values.slice();
  const s = values.slice().sort((a,b)=>a-b);
  const mid = Math.floor(s.length/2);
  const q1 = median(s.slice(0, mid));
  const q3 = median(s.slice(Math.ceil(s.length/2)));
  const iqr = q3 - q1; const lower = q1 - 1.5 * iqr; const upper = q3 + 1.5 * iqr;
  return s.filter(v => v >= lower && v <= upper);
}

function median(arr:number[]){ if (!arr.length) return 0; const s = arr.slice().sort((a,b)=>a-b); const m = Math.floor(s.length/2); return s.length%2? s[m] : (s[m-1]+s[m])/2; }
