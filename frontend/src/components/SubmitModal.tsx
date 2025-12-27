import React, { useState } from 'react';

export default function SubmitModal({ onSubmit }: any){
  const [product, setProduct] = useState('rice');
  const [country, setCountry] = useState('BR');
  const [price, setPrice] = useState('');
  return (
    <div style={{ padding: 10 }}>
      <h3>Submit Price</h3>
      <div>
        <input value={product} onChange={e=>setProduct(e.target.value)} />
        <input value={country} onChange={e=>setCountry(e.target.value)} />
        <input value={price} onChange={e=>setPrice(e.target.value)} />
        <button onClick={()=>onSubmit({ product_slug: product, country_iso2: country, price_local: Number(price) })}>Send</button>
      </div>
    </div>
  )
}
