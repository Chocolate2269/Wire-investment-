import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  let {data: payouts} = await supabase.from('transactions').select('*').eq('type','Payout Due').lte('due_date', new Date().toISOString().split('T')[0]);
  for(let p of payouts){
    let {data:user} = await supabase.from('users').select('*').eq('id', p.user_id).single();
    await supabase.from('users').update({balance: user.balance + p.amount}).eq('id', p.user_id);
    await supabase.from('transactions').update({type:'Payout Sent'}).eq('id', p.id);
  }
  res.status(200).json({paid: payouts.length});
}
