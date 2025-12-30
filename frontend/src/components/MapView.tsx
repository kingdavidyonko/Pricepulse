import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

function colorForInflation(pct: number | null) {
  if (pct === null || pct === undefined) return '#ccc';
  if (pct > 5) return '#b30000';
  if (pct > 2) return '#ff7f0f';
  if (pct > 0) return '#ffdf6b';
  return '#6bbf6b';
}

export default function MapView({ aggregates, onCountrySelect }: any) {
  // aggregates: [{ country_name, iso2, lat, lng, inflation_pct_vs_prev_week }]
  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {aggregates && aggregates.map((a: any, idx: number) => (
        <CircleMarker
          key={`${a.iso2}-${idx}`}
          center={[a.lat || 0, a.lng || 0]}
          radius={10}
          pathOptions={{
            color: colorForInflation(a.inflation_pct_vs_prev_week),
            fillColor: colorForInflation(a.inflation_pct_vs_prev_week),
            fillOpacity: 0.6,
            weight: 2
          }}
          eventHandlers={{
            click: () => onCountrySelect && onCountrySelect(a)
          }}
        >
          <Popup>
            <div style={{ padding: '4px' }}>
              <strong style={{ fontSize: '14px' }}>{a.country_name}</strong>
              <div style={{ marginTop: '4px' }}>
                Inflation: <span style={{ color: colorForInflation(a.inflation_pct_vs_prev_week), fontWeight: 700 }}>
                  {a.inflation_pct_vs_prev_week ? a.inflation_pct_vs_prev_week.toFixed(2) + '%' : 'N/A'}
                </span>
              </div>
              <button
                onClick={() => onCountrySelect && onCountrySelect(a)}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '5px',
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                View Details
              </button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
