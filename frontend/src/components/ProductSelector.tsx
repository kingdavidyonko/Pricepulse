import React from 'react';

export default function ProductSelector({ products, value, onChange }: any){
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}>
      {products.map((p:any)=>(<option key={p.slug} value={p.slug}>{p.name}</option>))}
    </select>
  )
}
