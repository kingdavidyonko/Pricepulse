import React from 'react';

export default function ProductSelector({ selected, onSelect }: any) {
  const products = [
    { slug: 'rice', name: '🍚 Rice', icon: '🍚' },
    { slug: 'bread', name: '🍞 Bread', icon: '🍞' },
    { slug: 'milk', name: '🥛 Milk', icon: '🥛' },
    { slug: 'eggs', name: '🥚 Eggs', icon: '🥚' },
    { slug: 'oil', name: '🛢️ Cooking Oil', icon: '🛢️' }
  ];

  return (
    <div className="product-selector">
      <label>Track Commodity</label>
      <div className="product-grid">
        {products.map(p => (
          <button
            key={p.slug}
            className={selected === p.slug ? 'active' : ''}
            onClick={() => onSelect(p.slug)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <style jsx>{`
        .product-selector label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: 0.05em;
        }
        .product-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        button {
          padding: 10px;
          text-align: left;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          color: #475569;
          transition: all 0.2s;
        }
        button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        button.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #2563eb;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}
