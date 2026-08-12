import fs from 'fs';
const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/GOOGLE_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : '';
console.log(`curl -I "https://www.googleapis.com/drive/v3/files/13u3oVnE8FMgz-JgB17v08V3Jb9K4x3K6?alt=media&key=${apiKey}"`);
