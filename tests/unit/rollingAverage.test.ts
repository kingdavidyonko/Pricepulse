const { rollingAverage } = require('../../frontend/src/utils/rollingAverage');

test('rollingAverage computes 4-week correctly', ()=>{
  const arr = [1,2,3,4,5,6];
  const r = rollingAverage(arr, 3);
  expect(r.length).toBe(arr.length);
  expect(r[2]).toBeCloseTo((1+2+3)/3);
});
