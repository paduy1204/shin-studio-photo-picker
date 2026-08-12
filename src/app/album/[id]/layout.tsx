import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';

// Hàm này chạy trên server -> generate OG tags động cho từng album
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { data: album } = await supabase
      .from('albums')
      .select('name, client, created_at, cover_image_url')
      .eq('id', params.id)
      .single();

    // Lấy ảnh đầu tiên trong album làm cover nếu chưa có cover riêng
    let coverUrl = album?.cover_image_url;
    if (!coverUrl) {
      const { data: firstImg } = await supabase
        .from('images')
        .select('thumbnail_link, drive_file_id')
        .eq('album_id', params.id)
        .order('name', { ascending: true })
        .limit(1)
        .single();

      if (firstImg?.thumbnail_link) {
        coverUrl = firstImg.thumbnail_link;
      } else if (firstImg?.drive_file_id) {
        // Dùng Google Drive thumbnail
        coverUrl = `https://drive.google.com/thumbnail?id=${firstImg.drive_file_id}&sz=w1200`;
      }
    }

    const title = album?.name || 'Album ảnh Shin Studio';
    const description = album?.client
      ? `Bộ ảnh của ${album.client} tại Shin Studio. Xem và chọn ảnh yêu thích của bạn.`
      : 'Xem và chọn ảnh yêu thích của bạn tại Shin Studio.';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        images: coverUrl
          ? [{ url: coverUrl, width: 1200, height: 630, alt: title }]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: coverUrl ? [coverUrl] : [],
      },
    };
  } catch {
    return {
      title: 'Shin Studio | Photo Picker',
      description: 'Hệ thống chọn ảnh chất lượng cao dành cho khách hàng của Shin Studio.',
    };
  }
}

export default function AlbumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
