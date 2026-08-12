const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://enoimlsdlbxfpvnjgrer.supabase.co', 'sb_publishable_JV0J6Ku-GHxSYrUgEGZbrw_wMV3bX2h');

async function fixAlbumCover() {
  const albumId = '1uVn8Fim7VI2lSA7B6tIsRc9msTEaqlYm';
  const { data: firstImg } = await supabase
    .from('images')
    .select('id')
    .eq('album_id', albumId)
    .order('name', { ascending: true })
    .limit(1)
    .single();

  if (firstImg) {
    const publicCoverUrl = `https://drive.google.com/thumbnail?id=${firstImg.id}&sz=w1200`;
    console.log('Setting public cover URL:', publicCoverUrl);
    const { error } = await supabase.from('albums').update({ cover_image_url: publicCoverUrl }).eq('id', albumId);
    console.log('Update result error:', error);
  }
}

fixAlbumCover();
