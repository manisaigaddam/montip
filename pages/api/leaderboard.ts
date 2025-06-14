
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

// Server-side cache
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedData: any = null;
let lastFetchTime = 0;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = Date.now();
    
    // Check if we have fresh cached data
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      console.log('Serving cached leaderboard data');
      return res.status(200).json(cachedData);
    }

    console.log('Fetching fresh leaderboard data from database');
    
    // Fetch fresh data from database (excluding self-tips)
    const { data, error } = await supabase
      .from('tip_transactions')
      .select('*')
      .eq('tx_status', 'success')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Filter out self-tips (where tipper_fid equals recipient_fid)
    const filteredData = (data || []).filter(tx => tx.tipper_fid !== tx.recipient_fid);

    // Update cache
    cachedData = filteredData;
    lastFetchTime = now;

    res.status(200).json(cachedData);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
