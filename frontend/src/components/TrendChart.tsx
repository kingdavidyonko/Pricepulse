import React, { useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

export default function TrendChart({ data }: any){
  const ref = useRef<HTMLCanvasElement|null>(null);
  useEffect(()=>{
    if (!ref.current) return;
    const ctx = ref.current.getContext('2d');
    if (!ctx) return;
    const chart = new Chart(ctx, { type: 'line', data: { labels: data.map((d:any)=>d.week_start || ''), datasets: [{ label: 'Price (USD)', data: data.map((d:any)=>d.median_price_usd || 0) }] } });
    return ()=>chart.destroy();
  },[data]);
  return <canvas ref={ref} />
}
