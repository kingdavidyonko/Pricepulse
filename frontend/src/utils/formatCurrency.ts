export default function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'){
  try{
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  }catch(e){
    // Fallback simple formatting
    const sign = amount < 0 ? '-' : '';
    const v = Math.abs(Number((amount || 0).toFixed(2)));
    return `${sign}${currency} ${v.toFixed(2)}`;
  }
}
