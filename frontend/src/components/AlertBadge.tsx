import React from 'react';

export default function AlertBadge({ level, text }: any){
  const color = level === 'high' ? '#b30000' : level === 'warn' ? '#ff7f0f' : '#6bbf6b';
  return <span role="status" aria-live="polite" style={{ background: color, color: '#fff', padding: '4px 8px', borderRadius: 6 }}>{text}</span>;
}
