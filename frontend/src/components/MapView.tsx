import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

function colorForInflation(pct:number|null){
  if (pct === null || pct === undefined) return '#ccc';
  if (pct > 5) return '#b30000';
  if (pct > 2) return '#ff7f0f';
  if (pct > 0) return '#ffdf6b';
  return '#6bbf6b';
}

export default function MapView({ aggregates }: any){
  // aggregates: [{ country_id, product_id, week_start, inflation_pct_vs_prev_week, lat, lng }]
  return (
    <MapContainer center={[20,0]} zoom={2} style={{ height: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {aggregates && aggregates.map((a:any, idx:number)=> (
        <CircleMarker key={idx} center={[a.lat||0, a.lng||0]} radius={8} pathOptions={{ color: colorForInflation(a.inflation_pct_vs_prev_week) }}>
          <Popup>
            <div>
              <strong>{a.country_name}</strong>
              <div>Inflation: {a.inflation_pct_vs_prev_week ? a.inflation_pct_vs_prev_week.toFixed(2) + '%' : 'N/A'}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
