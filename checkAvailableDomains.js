async function testAvailable() {
  const candidates = [
    'shinphoto',
    'shin-photo',
    'shin-picker',
    'shin-studio',
    'shining-photo',
    'shin-album',
    'shinalbum',
    'shin-gallery',
    'shin-pik-studio',
    'shinpick',
    'shin-pick',
    'shin-select',
    'shin-photo-studio'
  ];

  console.log('Testing available vercel.app domains...');
  for (const name of candidates) {
    const url = `https://${name}.vercel.app`;
    try {
      const res = await fetch(url);
      console.log(`${name}.vercel.app => Status: ${res.status}`);
    } catch (e) {
      console.log(`${name}.vercel.app => Error: ${e.message}`);
    }
  }
}

testAvailable();
