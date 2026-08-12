import { NextResponse } from 'next';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { folderId } = await request.json();

    if (!folderId) {
      return NextResponse.json({ error: 'Thiếu folderId' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Chưa cấu hình GOOGLE_API_KEY. Vui lòng thêm biến môi trường này vào file .env.local' 
      }, { status: 500 });
    }

    const drive = google.drive({
      version: 'v3',
      auth: apiKey
    });

    const allFiles: any[] = [];

    // 1. Quét các ảnh nằm trực tiếp trong thư mục gốc
    const directImagesRes = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink)',
      pageSize: 1000,
      orderBy: 'name',
    });

    if (directImagesRes.data.files) {
      for (const file of directImagesRes.data.files) {
        // Thử trích xuất tag từ tên file nếu có dạng [BEAUTY] 01.jpg hoặc BEAUTY_01.jpg
        let tag = '';
        const match = file.name.match(/^\[(.*?)\]/) || file.name.match(/^([a-zA-Z0-9À-ỹ\s]+)[_-]/);
        if (match && match[1]) {
          tag = match[1].trim();
        }

        allFiles.push({
          id: file.id,
          name: file.name,
          tag: tag,
          thumbnailLink: file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s1000') : '',
          webContentLink: file.webContentLink,
          webViewLink: file.webViewLink
        });
      }
    }

    // 2. Quét tất cả thư mục con (Subfolders như BEAUTY, BẦU, COUPLE, PROFILE, CHO BÉ...)
    const subfoldersRes = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 100,
    });

    if (subfoldersRes.data.files && subfoldersRes.data.files.length > 0) {
      for (const subfolder of subfoldersRes.data.files) {
        const subfolderName = subfolder.name.trim();

        const subfolderImagesRes = await drive.files.list({
          q: `'${subfolder.id}' in parents and mimeType contains 'image/' and trashed = false`,
          fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink)',
          pageSize: 1000,
          orderBy: 'name',
        });

        if (subfolderImagesRes.data.files) {
          for (const file of subfolderImagesRes.data.files) {
            allFiles.push({
              id: file.id,
              name: file.name,
              tag: subfolderName, // Gán tag bằng tên thư mục con (ví dụ: BEAUTY, BẦU, COUPLE...)
              thumbnailLink: file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s1000') : '',
              webContentLink: file.webContentLink,
              webViewLink: file.webViewLink
            });
          }
        }
      }
    }

    if (allFiles.length === 0) {
      return NextResponse.json({ 
        error: 'Không tìm thấy hình ảnh nào trong thư mục này (kể cả thư mục con). Vui lòng kiểm tra lại Link hoặc quyền Chia sẻ (Share) của thư mục.' 
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
      error: error.message || 'Lỗi không xác định khi kết nối Google Drive' 
    }, { status: 500 });
  }
}
