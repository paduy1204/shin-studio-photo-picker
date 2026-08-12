async function test() {
  const res = await fetch('https://shin-studio-photo-picker.vercel.app/album/1uVn8Fim7VI2ISA7B6tlsRc9msTEaqIYm');
  const html = await res.text();
  console.log('--- HTML HEAD ---');
  const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
  if (headMatch) {
    console.log(headMatch[1]);
  } else {
    console.log('No head match');
  }
}
test();
