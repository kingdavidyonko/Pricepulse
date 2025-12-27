import React from 'react';
import TrendChart from './TrendChart';
import { exportSnapshot } from '../utils/exportSnapshot';
import { rollingAverage } from '../utils/rollingAverage';

export default function CountryDetailEnhanced({ country, series }: any){
  const rolling = rollingAverage(series.map((s:any)=>Number(s.median_price_usd||0)), 4);
  const avg = series.length ? series.reduce((a:any,b:any)=>a+Number(b.median_price_usd||0),0)/series.length : null;
  const confidence = series.length ? (series[0].confidence_score || null) : null;
  const submissions_count = series.length ? series.reduce((a:any,b:any)=>(a + (b.sample_count||0)), 0) : 0;

  return (
    <div aria-label={`country-detail-${country?.iso2 || country?.id}`}>
      <h3>{country?.name || 'Country'}</h3>
      <div>Avg: {avg ? avg.toFixed(2) : 'N/A'}</div>
      <div>Rolling (4wk): {rolling.length ? rolling[rolling.length-1].toFixed(2) : 'N/A'}</div>
      <div>Confidence: {confidence ?? 'N/A'}</div>
      <div>Submissions: {submissions_count}</div>
      <TrendChart data={series} />
      <button onClick={async ()=>{ const blob = await exportSnapshot(document.querySelector('body') as HTMLElement); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='snapshot.png'; a.click(); }}>Export Snapshot</button>
    </div>
  );
}
