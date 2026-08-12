async function check() {
  const urls = [
    'https://shinpic-anhduyposter-2190s-projects.vercel.app',
    'https://shinpic.vercel.app',
    'https://shinpic-git-main-anhduyposter-2190s-projects.vercel.app',
    'https://shinpic-seven.vercel.app'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(url, '=> Status:', res.status);
    } catch (e) {
      console.log(url, '=> Error:', e.message);
    }
  }
}

check();
