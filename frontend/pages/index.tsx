import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ApiClient from '../src/ApiClient';
import ProductSelector from '../src/components/ProductSelector';
import CountryDetailEnhanced from '../src/components/CountryDetailEnhanced';

const MapView = dynamic(() => import('../src/components/MapView'), { ssr: false });

export default function Dashboard() {
    const [aggregates, setAggregates] = useState<any[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState('rice');
    const [series, setSeries] = useState<any[]>([]);

    useEffect(() => {
        ApiClient.getLatestAggregates().then(data => {
            // For demo, if no data, we'll mock some
            if (!data || data.length === 0) {
                setAggregates([
                    { country_name: 'Nigeria', iso2: 'NG', lat: 9.082, lng: 8.675, inflation_pct_vs_prev_week: 12.5 },
                    { country_name: 'Brazil', iso2: 'BR', lat: -14.235, lng: -51.925, inflation_pct_vs_prev_week: 4.2 },
                    { country_name: 'United Kingdom', iso2: 'GB', lat: 55.378, lng: -3.436, inflation_pct_vs_prev_week: 2.1 }
                ]);
            } else {
                setAggregates(data);
            }
        });
    }, []);

    const handleCountrySelect = (country: any) => {
        setSelectedCountry(country);
        // Fetch series for this country/product
        // For demo, we'll mock a series
        setSeries([
            { week_start: '2023-10-01', median_price_usd: 1.2, sample_count: 45, confidence_score: 0.85 },
            { week_start: '2023-10-08', median_price_usd: 1.25, sample_count: 50, confidence_score: 0.88 },
            { week_start: '2023-10-15', median_price_usd: 1.32, sample_count: 42, confidence_score: 0.82 },
            { week_start: '2023-10-22', median_price_usd: 1.35, sample_count: 55, confidence_score: 0.91 }
        ]);
    };

    return (
        <div className="dashboard">
            <header>
                <h1>PricePulse<span>7</span></h1>
                <div className="description">Real-time inflation monitoring powered by community submissions and validated against World Bank data.</div>
            </header>

            <main>
                <div className="sidebar">
                    <section className="controls">
                        <ProductSelector selected={selectedProduct} onSelect={setSelectedProduct} />
                    </section>

                    <section className="detail-view">
                        {selectedCountry ? (
                            <CountryDetailEnhanced country={selectedCountry} series={series} />
                        ) : (
                            <div className="empty-state">
                                <div className="icon">📍</div>
                                <p>Select a country on the map to see real-time vs official CPI comparison.</p>
                            </div>
                        )}
                    </section>
                </div>

                <div className="map-container">
                    <MapView aggregates={aggregates} onCountrySelect={handleCountrySelect} />
                </div>
            </main>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background: #f1f5f9;
          color: #1e293b;
        }
        
        .dashboard {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }

        header {
          padding: 16px 32px;
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        h1 span { color: #4f46e5; }

        .description {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }

        main {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .sidebar {
          width: 450px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #e2e8f0;
          background: #fff;
          overflow-y: auto;
          z-index: 10;
        }

        .controls {
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-view {
          padding: 20px;
          flex: 1;
        }

        .map-container {
          flex: 1;
          position: relative;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #94a3b8;
        }

        .empty-state .icon {
          font-size: 40px;
          margin-bottom: 16px;
        }

        .empty-state p {
          font-size: 14px;
          line-height: 1.5;
        }
      `}</style>
        </div>
    );
}
