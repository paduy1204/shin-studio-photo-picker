async function test() {
  const url = 'https://shin-studio-photo-picker.vercel.app/album/1uVn8Fim7VI2lSA7B6tIsRc9msTEaqlYm';
  const res = await fetch(url);
  const html = await res.text();
  console.log('--- TEST FETCH ALBUM OG TAGS ---');
  const title = html.match(/<title>(.*?)<\/title>/);
  const ogTitle = html.match(/<meta property="og:title" content="(.*?)"/);
  const ogImage = html.match(/<meta property="og:image" content="(.*?)"/);
  console.log('Title:', title ? title[1] : 'None');
  console.log('og:title:', ogTitle ? ogTitle[1] : 'None');
  console.log('og:image:', ogImage ? ogImage[1] : 'None');
}
test();
