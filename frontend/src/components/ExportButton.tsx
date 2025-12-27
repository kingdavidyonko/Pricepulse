import React from 'react';
import { exportSnapshot } from '../utils/exportSnapshot';

export default function ExportButton({ selector='body' }: any){
  async function run(){
    const el = document.querySelector(selector) as HTMLElement;
    if (!el) return;
    const blob = await exportSnapshot(el);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'snapshot.png'; a.click();
  }
  return <button onClick={run}>Export Snapshot</button>;
}
