import { useEffect, useState, useRef } from 'react';

export default function useInflationAlerts(aggregates:any[], opts:any={threshold:5}){
  const [queue, setQueue] = useState<any[]>([]);
  const seen = useRef(new Set());

  useEffect(()=>{
    const hits = (aggregates||[]).filter(a=>Math.abs(Number(a.inflation_pct_vs_prev_week||0)) >= (opts.threshold||5));
    hits.forEach(h=>{ const id = `${h.country_id}::${h.product_id}::${h.week_start}`; if (!seen.current.has(id)){ seen.current.add(id); setQueue(q=>[...q, { id, row:h }]); } });
  },[aggregates, opts.threshold]);

  function pop(){ setQueue(q=>{ const [_,...rest]=q; return rest; }); }

  return { queue, pop };
}
