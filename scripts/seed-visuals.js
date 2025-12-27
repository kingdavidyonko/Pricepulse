/** Generate 6+ weeks synthetic series with spikes for demo */
const fs = require('fs');
function genSeries(weeks=8){
  const out = [];
  let base = 5 + Math.random()*5;
  for (let i=0;i<weeks;i++){
    // occasional spike
    if (Math.random() < 0.15) base += (Math.random()*10 - 2);
    const val = Math.max(0.1, base + (Math.random()-0.5)*1.5);
    out.push({ week_start: new Date(Date.now() - ((weeks-i-1)*7*24*3600*1000)).toISOString().slice(0,10), median_price_usd: Number(val.toFixed(2)), sample_count: Math.floor(Math.random()*10+3), confidence_score: Number((Math.random()*0.5+0.5).toFixed(2)) });
    base += (Math.random()-0.5)*0.5;
  }
  return out;
}

if (require.main === module){
  const s = genSeries(8);
  fs.writeFileSync('demo/seed-visuals.json', JSON.stringify(s, null, 2));
  console.log('Wrote demo/seed-visuals.json');
}
