import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ApiClient from '../src/ApiClient';

const MapView = dynamic(() => import('../src/components/MapView'), { ssr: false });

export default function MapPage(){
  const [aggregates, setAggregates] = useState<any[]>([]);

  useEffect(()=>{
    ApiClient.getLatestAggregates().then(setAggregates).catch(()=>setAggregates([]));
  },[]);

  return (
    <div style={{ height: '100vh' }}>
      <MapView aggregates={aggregates} />
    </div>
  )
}
