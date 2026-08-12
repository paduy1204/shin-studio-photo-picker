import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const albumId = params?.id;
  if (!albumId) {
    return {
      title: 'Shin Studio | Photo Picker',
      description: 'Hệ thống chọn ảnh chất lượng cao dành cho khách hàng của Shin Studio.',
    };
  }

  try {
    // 1. Lấy thông tin Album
    const { data: album } = await supabase
      .from('albums')
      .select('name, client, cover_image_url')
      .eq('id', albumId)
      .maybeSingle();

    const title = album?.name ? album.name : 'Album ảnh Shin Studio';
    const clientName = album?.client || '';
    const description = clientName
      ? `${clientName} | Bộ ảnh chất lượng cao tại Shin Studio`
      : 'Bộ ảnh chất lượng cao tại Shin Studio. Xem và chọn ảnh yêu thích.';

    // 2. Xác định Cover URL
    let coverUrl: string | null = album?.cover_image_url || null;

    if (!coverUrl) {
      const { data: firstImg } = await supabase
        .from('images')
        .select('id, thumbnail_link')
        .eq('album_id', albumId)
        .order('name', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstImg) {
        if (firstImg.thumbnail_link) {
          coverUrl = firstImg.thumbnail_link.replace(/=s\d+/, '=w1200');
        } else if (firstImg.id) {
          coverUrl = `https://drive.google.com/thumbnail?id=${firstImg.id}&sz=w1200`;
        }
      }
    }

    // Biến đổi coverUrl thành absolute URL chuẩn cho OpenGraph
    if (coverUrl && coverUrl.startsWith('/')) {
      coverUrl = `https://shin-studio-photo-picker.vercel.app${coverUrl}`;
    }

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: 'Shin Studio',
        images: coverUrl
          ? [
              {
                url: coverUrl,
                width: 1200,
                height: 630,
                alt: title,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: coverUrl ? [coverUrl] : [],
      },
    };
  } catch (err) {
    console.error('generateMetadata error:', err);
    return {
      title: 'Shin Studio | Photo Picker',
      description: 'Hệ thống chọn ảnh chất lượng cao dành cho khách hàng của Shin Studio.',
    };
  }
}

export default function AlbumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
