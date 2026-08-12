import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Album Concept Mẫu | Shin Studio',
  description: 'Bộ sưu tập các mẫu Concept chụp ảnh độc đáo cho Bé, Gia đình, Sơ sinh, Bầu, Beauty, Couple, Profile tại Shin Studio. Khám phá và lựa chọn bối cảnh yêu thích!',
  openGraph: {
    title: 'Album Concept Mẫu | Shin Studio',
    description: 'Khám phá bộ sưu tập mẫu Concept chụp ảnh độc đáo tại Shin Studio. Lựa chọn bối cảnh ưng ý nhất cho bộ ảnh của bạn!',
    type: 'website',
    siteName: 'Shin Studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Album Concept Mẫu | Shin Studio',
    description: 'Khám phá bộ sưu tập mẫu Concept chụp ảnh độc đáo tại Shin Studio.',
  },
};

export default function ConceptsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
