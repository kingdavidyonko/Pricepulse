import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 200,
  duration: '1m',
};

export default function(){
  const url = __ENV.SUBMIT_URL || 'http://localhost:54321/functions/v1/convert-and-insert';
  const payload = JSON.stringify({ product_slug:'rice', country_iso2:'BR', price_local: Math.random()*20 + 1 });
  const params = { headers: { 'Content-Type':'application/json' } };
  http.post(url, payload, params);
  sleep(0.06);
}
