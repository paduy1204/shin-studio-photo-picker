const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://enoimlsdlbxfpvnjgrer.supabase.co';
const supabaseAnonKey = 'sb_publishable_JV0J6Ku-GHxSYrUgEGZbrw_wMV3bX2h';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugMetadata(albumId) {
  console.log('Testing generateMetadata logic for albumId:', albumId);

  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select('name, client, cover_image_url')
    .eq('id', albumId)
    .maybeSingle();

  console.log('Album data:', album);
  console.log('Album error:', albumError);

  let coverUrl = album?.cover_image_url || null;

  if (!coverUrl) {
    const { data: firstImg, error: imgError } = await supabase
      .from('images')
      .select('id, thumbnail_link')
      .eq('album_id', albumId)
      .order('name', { ascending: true })
      .limit(1)
      .maybeSingle();

    console.log('First img data:', firstImg);
    console.log('First img error:', imgError);

    if (firstImg) {
      if (firstImg.thumbnail_link) {
        coverUrl = firstImg.thumbnail_link.replace(/=s\d+/, '=w1200');
      } else if (firstImg.id) {
        coverUrl = `https://drive.google.com/thumbnail?id=${firstImg.id}&sz=w1200`;
      }
    }
  }

  console.log('Final coverUrl:', coverUrl);
}

debugMetadata('1uVn8Fim7VI2ISA7B6tlsRc9msTEaqIYm');
