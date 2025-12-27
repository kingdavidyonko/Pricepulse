import React from 'react';
import TrendChart from '../src/components/TrendChart';

export default function Compare(){
  return (
    <div style={{ padding: 20 }}>
      <h1>Compare</h1>
      <TrendChart data={[]} />
    </div>
  )
}
