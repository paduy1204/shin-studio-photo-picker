import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';

export async function generateMetadata({ params }: { params: { id: string } | Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const albumId = resolvedParams?.id;

  if (!albumId) {
    return {
      title: 'Shin Studio | Photo Picker',
      description: 'Hệ thống chọn ảnh chất lượng cao dành cho khách hàng của Shin Studio.',
    };
  }

  try {
    const { data: album } = await supabase
      .from('albums')
      .select('name, client, cover_image_url')
      .eq('id', albumId)
      .maybeSingle();

    const albumName = album?.name || 'Album ảnh';
    const clientName = album?.client || '';
    const title = albumName;
    const description = clientName && clientName !== albumName
      ? `${clientName} | Bộ ảnh chất lượng cao tại Shin Studio`
      : `${albumName} | Bộ ảnh chất lượng cao tại Shin Studio`;

    let coverUrl: string | null = album?.cover_image_url || null;

    // Loại bỏ link drive-storage riêng tư nếu có
    if (coverUrl && (coverUrl.includes('drive-storage') || coverUrl.includes('lh3.googleusercontent.com'))) {
      coverUrl = null;
    }

    if (!coverUrl) {
      const { data: firstImg } = await supabase
        .from('images')
        .select('id')
        .eq('album_id', albumId)
        .order('name', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstImg?.id) {
        coverUrl = `https://drive.google.com/thumbnail?id=${firstImg.id}&sz=w1200`;
      }
    }

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
    console.error('generateMetadata exception:', err);
    return {
      title: 'Shin Studio | Photo Picker',
      description: 'Hệ thống chọn ảnh chất lượng cao dành cho khách hàng của Shin Studio.',
    };
  }
}

export default function AlbumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
