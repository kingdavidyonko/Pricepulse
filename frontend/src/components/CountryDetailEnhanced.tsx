import React, { useEffect, useState } from 'react';
import TrendChart from './TrendChart';
import { exportSnapshot } from '../utils/exportSnapshot';
import { rollingAverage } from '../utils/rollingAverage';
import WorldBankClient from '../utils/WorldBankClient';

export default function CountryDetailEnhanced({ country, series }: any) {
  const [wbData, setWbData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (country?.iso2) {
      setLoading(true);
      WorldBankClient.getCountrySummary(country.iso2).then(data => {
        setWbData(data);
        setLoading(false);
      });
    }
  }, [country?.iso2]);

  const rolling = rollingAverage(series.map((s: any) => Number(s.median_price_usd || 0)), 4);
  const avg = series.length ? series.reduce((a: any, b: any) => a + Number(b.median_price_usd || 0), 0) / series.length : null;
  const confidence = series.length ? (series[0].confidence_score || null) : null;
  const submissions_count = series.length ? series.reduce((a: any, b: any) => (a + (b.sample_count || 0)), 0) : 0;

  return (
    <div className="country-detail-container" aria-label={`country-detail-${country?.iso2 || country?.id}`}>
      <div className="detail-header">
        <h3>{country?.name || 'Country'} ({country?.iso2})</h3>
        <div className="lag-badge" title="World Bank CPI updates monthly. PricePulse updates in real time.">
          ℹ️ Real-time vs Official Lag
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card pricepulse">
          <label>PricePulse Avg</label>
          <div className="value">${avg ? avg.toFixed(2) : 'N/A'}</div>
          <div className="subtext">Based on {submissions_count} submissions</div>
        </div>

        {wbData?.inflation && (
          <div className="stat-card macro">
            <label>Annual Inflation (WB)</label>
            <div className="value">{wbData.inflation.value.toFixed(1)}%</div>
            <div className="subtext">Year: {wbData.inflation.date}</div>
          </div>
        )}

        <div className="stat-card rolling">
          <label>4-Week Rolling</label>
          <div className="value">${rolling.length ? rolling[rolling.length - 1].toFixed(2) : 'N/A'}</div>
          <div className="subtext">Confidence Score: {confidence ?? 'N/A'}</div>
        </div>
      </div>

      <div className="chart-section">
        <h4>Price Trend vs Official CPI</h4>
        <div className="chart-wrapper">
          <TrendChart
            data={series}
            wbData={wbData?.history?.cpi?.slice().reverse()}
            labelP="PricePulse (Weekly)"
            labelW="World Bank CPI (Monthly)"
          />
        </div>
        <p className="chart-note">Solid line: PricePulse | Dotted line: World Bank CPI</p>
      </div>

      <div className="actions">
        <button className="export-btn" onClick={async () => { const blob = await exportSnapshot(document.querySelector('.country-detail-container') as HTMLElement); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${country?.iso2 || 'country'}_snapshot.png`; a.click(); }}>
          📷 Export Snapshot
        </button>
      </div>

      <style jsx>{`
        .country-detail-container {
          padding: 20px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          max-width: 600px;
        }
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .lag-badge {
          font-size: 12px;
          background: #f1f5f9;
          padding: 4px 8px;
          border-radius: 20px;
          color: #64748b;
          cursor: help;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }
        .stat-card {
          padding: 12px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .stat-card.pricepulse { border-top: 4px solid #4f46e5; }
        .stat-card.macro { border-top: 4px solid #10b981; }
        .stat-card label {
          font-size: 11px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 600;
        }
        .stat-card .value {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin: 4px 0;
        }
        .stat-card .subtext {
          font-size: 10px;
          color: #94a3b8;
        }
        .chart-section { margin-top: 20px; }
        .chart-note {
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
          margin-top: 8px;
        }
        .export-btn {
          width: 100%;
          padding: 10px;
          background: #1e293b;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
