export function rollingAverage(arr:number[], windowSize:number){
  const out:number[] = [];
  for (let i=0;i<arr.length;i++){
    const start = Math.max(0, i-windowSize+1);
    const slice = arr.slice(start, i+1).filter(n=>!isNaN(n));
    const avg = slice.length ? slice.reduce((a,b)=>a+b,0)/slice.length : 0;
    out.push(avg);
  }
  return out;
}
