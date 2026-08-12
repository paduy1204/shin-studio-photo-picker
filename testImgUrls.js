async function testUrls() {
  const fileId = '1VDmX2cPDHK10ACNQj_WzzdwxJRZWOl7D'; // IMG_3519.JPG from DB
  const urls = [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`,
    `https://lh3.googleusercontent.com/u/0/d/${fileId}`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://shin-studio-photo-picker.vercel.app/api/proxy-image?id=${fileId}`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(url, '=> Status:', res.status, 'Type:', res.headers.get('content-type'));
    } catch (e) {
      console.log(url, '=> Error:', e.message);
    }
  }
}

testUrls();
