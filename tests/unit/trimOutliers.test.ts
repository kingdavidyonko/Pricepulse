const { trimOutliers } = require('../../frontend/src/utils/trimOutliers');

test('trimOutliers removes extreme outliers', ()=>{
  const arr = [1,1,1,2,2,1000];
  const t = trimOutliers(arr);
  expect(t).not.toContain(1000);
});
