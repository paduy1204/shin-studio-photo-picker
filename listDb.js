const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://enoimlsdlbxfpvnjgrer.supabase.co';
const supabaseAnonKey = 'sb_publishable_JV0J6Ku-GHxSYrUgEGZbrw_wMV3bX2h';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listAlbums() {
  const { data, error } = await supabase.from('albums').select('*');
  console.log('Albums count:', data ? data.length : 0);
  console.log('Albums:', data);

  const { data: images, error: imgError } = await supabase.from('images').select('id, album_id, name').limit(10);
  console.log('Images sample:', images);
}

listAlbums();
