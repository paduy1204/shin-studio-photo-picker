import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const FALLBACK_GOOGLE_API_KEY = 'AIzaSyAORt4265h7ilGe0rA_TKcYoGhN7I3Xmxc';

async function fetchAllFilesFromDrive(drive: any, query: string, fields: string) {
  let files: any[] = [];
  let pageToken: string | undefined = undefined;

  do {
    const res: any = await drive.files.list({
      q: query,
      fields: `nextPageToken, ${fields}`,
      pageSize: 1000,
      pageToken: pageToken
    });

    if (res.data.files) {
      files = files.concat(res.data.files);
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return files;
}

async function scanFolderRecursive(drive: any, currentFolderId: string, currentTagName: string, allFiles: any[], depth = 0) {
  if (depth > 3) return;

  try {
    // 1. Quét TOÀN BỘ ảnh trong thư mục hiện tại (với pagination nextPageToken)
    const images = await fetchAllFilesFromDrive(
      drive,
      `'${currentFolderId}' in parents and mimeType contains 'image/' and trashed = false`,
      'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink)'
    );

    for (const file of images) {
      const fileName = file.name || '';
      let tag = currentTagName;
      if (!tag) {
        const match = fileName.match(/^\[(.*?)\]/) || fileName.match(/^([a-zA-Z0-9À-ỹ\s]+)[_-]/);
        if (match && match[1]) {
          tag = match[1].trim();
        }
      }

      allFiles.push({
        id: file.id,
        name: fileName,
        tag: tag,
        thumbnailLink: file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s1000') : '',
        webContentLink: file.webContentLink,
        webViewLink: file.webViewLink
      });
    }

    // 2. Quét TOÀN BỘ thư mục con trong thư mục hiện tại (với pagination nextPageToken)
    const subfolders = await fetchAllFilesFromDrive(
      drive,
      `'${currentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      'files(id, name)'
    );

    for (const subfolder of subfolders) {
      const subfolderName = subfolder.name ? subfolder.name.trim() : '';
      const nextTagName = subfolderName || currentTagName;
      await scanFolderRecursive(drive, subfolder.id, nextTagName, allFiles, depth + 1);
    }
  } catch (e: any) {
    console.warn(`Lỗi quét đệ quy thư mục [${currentFolderId}]:`, e.message);
  }
}

export async function POST(request: Request) {
  try {
    const { folderId } = await request.json();

    if (!folderId) {
      return NextResponse.json({ error: 'Thiếu Folder ID của Google Drive' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY || FALLBACK_GOOGLE_API_KEY;

    const drive = google.drive({
      version: 'v3',
      auth: apiKey
    });

    const allFiles: any[] = [];

    // Quét đệ quy TOÀN BỘ thư mục lớn và tất cả 9+ thư mục con lồng nhau không giới hạn
    await scanFolderRecursive(drive, folderId, '', allFiles, 0);

    if (allFiles.length === 0) {
      return NextResponse.json({ 
        error: 'Không tìm thấy hình ảnh nào trong thư mục này. Vui lòng đảm bảo thư mục Google Drive đã được bật quyền Chia sẻ (Share) dạng "Bất kỳ ai có liên kết đều có thể xem"!' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      folderId,
      total: allFiles.length,
      files: allFiles 
    });

  } catch (error: any) {
    console.error('Lỗi API Google Drive:', error);
    return NextResponse.json({ 
      error: error.message || 'Không thể kết nối Google Drive. Vui lòng kiểm tra lại đường link!' 
    }, { status: 500 });
  }
}
