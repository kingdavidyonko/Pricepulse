import React, { useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

export default function TrendChart({ data, wbData, labelP = 'PricePulse', labelW = 'World Bank CPI' }: any) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext('2d');
    if (!ctx) return;

    const datasets = [
      {
        label: labelP,
        data: data.map((d: any) => d.median_price_usd || d.value || 0),
        borderColor: '#4f46e5',
        backgroundColor: '#4f46e5',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3
      }
    ];

    if (wbData && wbData.length > 0) {
      // Normalize dates or just show trend
      datasets.push({
        label: labelW,
        data: wbData.map((d: any) => d.value),
        borderColor: '#94a3b8',
        backgroundColor: '#94a3b8',
        borderWidth: 2,
        borderDash: [5, 5], // Dotted line
        tension: 0.3,
        pointRadius: 0
      } as any);
    }

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((d: any) => d.week_start || d.date || ''),
        datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' as const }
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    });

    return () => chart.destroy();
  }, [data, wbData]);
  return <canvas ref={ref} />
}
