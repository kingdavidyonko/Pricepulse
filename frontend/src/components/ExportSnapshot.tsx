import React from 'react';

type Props = {
  targetId?: string;
  filename?: string;
  className?: string;
};

export default function ExportSnapshot({ targetId = 'root', filename = 'pricepulse-snapshot.png', className }: Props){
  const handleClick = async ()=>{
    try{
      // Prefer existing util if present
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: exportSnapshot } = await import('../utils/exportSnapshot').catch(()=>({ default: null }));
      if(exportSnapshot){
        await exportSnapshot(targetId, filename);
        return;
      }

      // Fallback: use html2canvas directly
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const html2canvas = await import('html2canvas').then(m=>m.default || m);
      const el = document.getElementById(targetId) || document.body;
      const canvas = await html2canvas(el as HTMLElement);
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }catch(e){
      // eslint-disable-next-line no-console
      console.error('Export snapshot failed', e);
      alert('Export failed. See console for details.');
    }
  };

  return (
    <button aria-label="Export snapshot" className={className} onClick={handleClick}>
      Export snapshot
    </button>
  );
}
