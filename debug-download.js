const id = "1ebwQjZT3EyqB9re13nNLKiCdrk-yw6lA"; // A valid file ID
const url = `https://drive.google.com/uc?export=download&id=${id}`;

async function testDownload() {
  console.log("Fetching:", url);
  const res = await fetch(url);
  console.log("Status:", res.status);
  console.log("Headers:", [...res.headers.entries()]);
  const text = await res.text();
  if (text.includes('confirm=')) {
    console.log("Found confirm token in text!");
    const match = text.match(/confirm=([a-zA-Z0-9_-]+)/);
    if (match) {
      console.log("Confirm token:", match[1]);
      const downloadUrl = `${url}&confirm=${match[1]}`;
      const res2 = await fetch(downloadUrl);
      console.log("Second request status:", res2.status);
      console.log("Second request content type:", res2.headers.get('content-type'));
    }
  } else {
    console.log("No confirm token found. Content type:", res.headers.get('content-type'));
  }
}

testDownload();
