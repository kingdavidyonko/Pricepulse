import formatCurrency from '../../../frontend/src/utils/formatCurrency';

describe('formatCurrency', ()=>{
  test('formats USD for en-US', ()=>{
    const s = formatCurrency(1234.5, 'USD', 'en-US');
    expect(typeof s).toBe('string');
    expect(s).toMatch(/1,234/);
  });

  test('formats negative values and other currencies', ()=>{
    const s = formatCurrency(-9.5, 'EUR', 'de-DE');
    expect(typeof s).toBe('string');
  });
});
