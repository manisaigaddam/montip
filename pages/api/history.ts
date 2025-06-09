import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fid, mode } = req.query;

  if (!fid || (mode !== 'tipper' && mode !== 'earner')) {
    return res.status(400).json({ error: 'Missing or invalid fid or mode' });
  }

  let query = supabase
    .from('tip_transactions')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(50);

  if (mode === 'tipper') {
    query = query.eq('tipper_fid', fid);
  } else {
    query = query.eq('recipient_fid', fid);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
} 