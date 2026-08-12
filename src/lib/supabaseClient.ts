import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://enoimlsdlbxfpvnjgrer.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_JV0J6Ku-GHxSYrUgEGZbrw_wMV3bX2h';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
