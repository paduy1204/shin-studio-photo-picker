import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const FALLBACK_GOOGLE_API_KEY = 'AIzaSyAORt4265h7ilGe0rA_TKcYoGhN7I3Xmxc';

async function scanFolderRecursive(drive: any, currentFolderId: string, currentTagName: string, allFiles: any[], depth = 0) {
  if (depth > 3) return;

  try {
    // 1. Quét ảnh trong thư mục hiện tại
    const imagesRes = await drive.files.list({
      q: `'${currentFolderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink)',
      pageSize: 1000,
      orderBy: 'name',
    });

    if (imagesRes.data.files) {
      for (const file of imagesRes.data.files) {
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
    }

    // 2. Quét đệ quy tất cả các thư mục con bên trong (Subfolders / Nested folders)
    const subfoldersRes = await drive.files.list({
      q: `'${currentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 100,
    });

    if (subfoldersRes.data.files && subfoldersRes.data.files.length > 0) {
      for (const subfolder of subfoldersRes.data.files) {
        const subfolderName = subfolder.name ? subfolder.name.trim() : '';
        const nextTagName = currentTagName ? currentTagName : subfolderName;
        await scanFolderRecursive(drive, subfolder.id, nextTagName, allFiles, depth + 1);
      }
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

    // Quét đệ quy toàn bộ thư mục lớn và các thư mục con lồng nhau
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
