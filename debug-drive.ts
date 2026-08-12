import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/GOOGLE_API_KEY=(.*)/);
if (match) process.env.GOOGLE_API_KEY = match[1].trim();

async function checkDrive() {
  const apiKey = process.env.GOOGLE_API_KEY;
  console.log("API Key found:", !!apiKey);
  
  const drive = google.drive({ version: 'v3', auth: apiKey });
  const folderId = '1uWh8Flm7Vl2lSA7B6tlsRc9msTEaqfFm';
  
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, size)',
      pageSize: 5,
      orderBy: 'name',
    });
    
    console.log("First 5 files:");
    console.log(JSON.stringify(response.data.files, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

checkDrive();
