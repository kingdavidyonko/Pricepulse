import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { colorForValue } from '../utils/colorScale';
import debounce from 'lodash/debounce';

type Aggregate = any;

function KeyboardControls({ onToggle }: { onToggle: (mode: string)=>void }){
  useMapEvents({ keypress(e){ if (e.originalEvent.key === 't') onToggle('toggle'); } });
  return null;
}

export default function HeatmapChoropleth({ aggregates, geojson, mode='inflation' }: { aggregates: Aggregate[], geojson: any, mode?: string }){
  const [viewMode, setViewMode] = useState(mode);
  useEffect(()=> setViewMode(mode), [mode]);
  const aggByIso: Record<string, Aggregate> = useMemo(()=>{
    const m: Record<string, Aggregate> = {};
    (aggregates||[]).forEach(a=>{ if (a.iso2) m[a.iso2.toUpperCase()]=a; });
    return m;
  },[aggregates]);

  const style = useCallback((feature:any)=>{
    const iso = (feature.properties && (feature.properties.iso_a2 || feature.properties.ISO_A2)) || feature.id;
    const row = iso ? aggByIso[String(iso).toUpperCase()] : null;
    const val = row ? (viewMode === 'price' ? Number(row.median_price_usd) : Number(row.inflation_pct_vs_prev_week)) : null;
    return {
      fillColor: colorForValue(val, viewMode),
      weight: 1,
      color: '#444',
      fillOpacity: 0.8
    };
  },[aggByIso, viewMode]);

  const onEachFeature = (feature:any, layer:any)=>{
    const iso = (feature.properties && (feature.properties.iso_a2 || feature.properties.ISO_A2)) || feature.id;
    const row = iso ? aggByIso[String(iso).toUpperCase()] : null;
    const title = feature.properties && feature.properties.ADMIN || iso;
    layer.bindTooltip(`${title}\n${viewMode}: ${row ? (viewMode==='price'?row.median_price_usd:row.inflation_pct_vs_prev_week) : 'N/A'}`);
  };

  const toggleMode = ()=> setViewMode(m=> m==='price'?'inflation':'price');

  return (
    <MapContainer center={[20,0]} zoom={2} style={{ height: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <KeyboardControls onToggle={toggleMode} />
      {geojson && <GeoJSON data={geojson} style={style} onEachFeature={onEachFeature} />}
    </MapContainer>
  );
}
