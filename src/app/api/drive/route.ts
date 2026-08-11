import { NextResponse } from 'next/server';
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

    // Truy vấn tất cả file trong thư mục đó
    // Lưu ý: Thư mục phải ở chế độ Public (Anyone with the link can view)
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink)',
      pageSize: 1000,
      orderBy: 'name',
    });

    const files = response.data.files;

    if (!files || files.length === 0) {
      return NextResponse.json({ 
        error: 'Không tìm thấy hình ảnh nào trong thư mục này. Vui lòng kiểm tra lại Link hoặc quyền Chia sẻ (Share) của thư mục.' 
      }, { status: 404 });
    }

    // Xử lý link ảnh để lấy ảnh chất lượng cao làm thumbnail (thumbnailLink mặc định khá mờ)
    // Hoặc dùng webContentLink để làm ảnh gốc.
    const formattedFiles = files.map(file => {
      // thumbnailLink thường có dạng =s220, đổi thành =s1000 để nét hơn
      const highResThumbnail = file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s1000') : '';
      
      return {
        id: file.id,
        name: file.name,
        thumbnailLink: highResThumbnail,
        webContentLink: file.webContentLink,
        webViewLink: file.webViewLink
      };
    });

    return NextResponse.json({ 
      success: true, 
      folderId,
      total: formattedFiles.length,
      files: formattedFiles 
    });

  } catch (error: any) {
    console.error('Lỗi API Google Drive:', error);
    return NextResponse.json({ 
      error: error.message || 'Lỗi không xác định khi kết nối Google Drive' 
    }, { status: 500 });
  }
}
