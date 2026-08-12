async function check() {
  const prefixes = [
    'shinpic',
    'shinpic-one',
    'shinpic-alpha',
    'shinpic-studio',
    'shinpik',
    'shin-pik',
    'shin-pic',
    'shinphoto',
    'shin-photo-picker'
  ];

  for (const name of prefixes) {
    const url = `https://${name}.vercel.app`;
    try {
      const res = await fetch(url);
      console.log(url, '=> Status:', res.status);
    } catch (e) {
      console.log(url, '=> Error:', e.message);
    }
  }
}

check();
