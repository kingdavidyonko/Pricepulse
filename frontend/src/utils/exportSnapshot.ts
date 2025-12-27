import html2canvas from 'html2canvas';

export async function exportSnapshot(el: HTMLElement){
  const canvas = await html2canvas(el, { useCORS: true, logging: false });
  return await new Promise<Blob>((res)=> canvas.toBlob((b)=>res(b as Blob), 'image/png'));
}
