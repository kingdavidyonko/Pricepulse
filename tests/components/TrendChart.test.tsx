test('TrendChart module exports a function', ()=>{
  const mod = require('../../frontend/src/components/TrendChart');
  expect(typeof mod.default === 'function' || typeof mod === 'function').toBeTruthy();
});
