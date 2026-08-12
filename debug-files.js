const fs = require('fs');
const {google} = require('googleapis');

const apiKey = fs.readFileSync('.env.local', 'utf8').match(/GOOGLE_API_KEY=(.*)/)[1].trim();
const drive = google.drive({version: 'v3', auth: apiKey});

drive.files.list({
  q: "'1uVn8Fim7VI2lSA7B6tIsRc9msTEaqlYm' in parents",
  fields: 'files(id, name, size)'
}).then(res => {
  const files = res.data.files.map(f => ({name: f.name, size: parseInt(f.size)}));
  files.sort((a,b) => b.size - a.size);
  console.log("Top 5 largest files:", files.slice(0, 5));
}).catch(console.error);
