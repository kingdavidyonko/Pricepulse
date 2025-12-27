import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const ApiClient = {
  async getLatestAggregates(){
    try{
      const res = await fetch('/api/aggregates/latest');
      if (!res.ok) return [];
      return await res.json();
    }catch(e){
      return [];
    }
  },
  // Example realtime subscription (needs server-side setup)
  subscribeToAggregates(cb: (payload:any)=>void){
    // supabase.channel('public:aggregates_weekly')... (left as example)
    return { unsubscribe(){ } };
  }
}

export default ApiClient;
