import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/GOOGLE_API_KEY=(.*)/);
if (match) process.env.GOOGLE_API_KEY = match[1].trim();

async function checkDownload() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const drive = google.drive({ version: 'v3', auth: apiKey });
  
  const folderId = '1uWh8Flm7Vl2lSA7B6tlsRc9msTEaqfFm';
  
  try {
    const listRes = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/'`,
      fields: 'files(id, name, mimeType, webContentLink, webViewLink, thumbnailLink, hasThumbnail)',
      pageSize: 5
    });
    
    console.log(JSON.stringify(listRes.data.files, null, 2));
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

checkDownload();
