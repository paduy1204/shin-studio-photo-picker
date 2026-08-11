'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from './page.module.css';

// Dữ liệu mẫu (Mock data) để hiển thị giao diện
const MOCK_IMAGES = [
  { id: '1', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80', name: 'IMG_001.jpg', liked: false },
  { id: '2', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80', name: 'IMG_002.jpg', liked: true },
  { id: '3', url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80', name: 'IMG_003.jpg', liked: false },
  { id: '4', url: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80', name: 'IMG_004.jpg', liked: false },
  { id: '5', url: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=800&q=80', name: 'IMG_005.jpg', liked: true },
  { id: '6', url: 'https://images.unsplash.com/photo-1536640712-4d4c36ef0e52?auto=format&fit=crop&w=800&q=80', name: 'IMG_006.jpg', liked: false },
];

export default function AlbumClientView() {
  const params = useParams();
  const id = params?.id as string;
  const [images, setImages] = useState<any[]>([]);
  const [albumName, setAlbumName] = useState('Đang tải...');
  const [albumMeta, setAlbumMeta] = useState('');
  const [lightboxImg, setLightboxImg] = useState<any>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'selected'>('all');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const { data: album } = await supabase.from('albums').select('*').eq('id', id).single();
      if (album) {
        setAlbumName(album.name);
        setAlbumMeta(`Khách hàng: ${album.client} - ${new Date(album.created_at).toLocaleDateString('vi-VN')}`);
      }

      const { data: files } = await supabase.from('images').select('*').eq('album_id', id).order('name', { ascending: true });
      if (files && files.length > 0) {
        const formatted = files.map(f => ({
          id: f.id,
          url: `/api/proxy-image?id=${f.id}`,
          name: f.name,
          liked: f.liked || false,
          comment: f.comment || '',
        }));
        setImages(formatted);
      } else {
        setImages(MOCK_IMAGES);
      }
    };
    loadData();
  }, [id]);

  const handleHeartClick = async (e: React.MouseEvent, imgId: string) => {
    e.stopPropagation();
    const index = images.findIndex(img => img.id === imgId);
    if (index > -1) {
      const newLikedState = !images[index].liked;
      const updatedImages = [...images];
      updatedImages[index].liked = newLikedState;
      setImages(updatedImages);
      await supabase.from('images').update({ liked: newLikedState }).eq('id', imgId);
    }
  };

  const openLightbox = (img: any) => {
    setLightboxImg(img);
  };

  const closeLightbox = () => {
    setLightboxImg(null);
  };

  const selectedCount = images.filter(img => img.liked).length;
  const displayImages = filterMode === 'all' ? images : images.filter(img => img.liked);

  return (
    <div>
      {/* Header Album */}
      <header className={styles.albumHeader}>
        <h1 className={styles.albumTitle}>{albumName}</h1>
        <p className={styles.albumMeta}>{albumMeta}</p>
        
        <div className={styles.statsBar}>
          <button 
            className={`${styles.statItem} ${filterMode === 'all' ? styles.activeTab : ''}`}
            onClick={() => setFilterMode('all')}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span>Tất cả ({images.length})</span>
          </button>
          
          <button 
            className={`${styles.statItem} ${filterMode === 'selected' ? styles.activeTab : ''}`}
            onClick={() => setFilterMode('selected')}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span>Đã chọn ({selectedCount})</span>
          </button>
        </div>

        <div className={styles.headerActions}>
          <button 
            className={styles.downloadAllBtn} 
            onClick={() => alert("Chức năng tải toàn bộ album đang được giả lập. Ở bản thật sẽ nén file từ Google Drive và tải xuống.")}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Tải toàn bộ Album
          </button>
        </div>
      </header>

      {/* Lưới Ảnh Masonry */}
      <main className={styles.masonryGrid}>
        {displayImages.length === 0 ? (
          <div style={{textAlign: 'center', gridColumn: '1 / -1', padding: '3rem', color: 'var(--text-muted)'}}>
            Chưa có bức ảnh nào được chọn.
          </div>
        ) : (
          displayImages.map((img) => (
            <div key={img.id} className={styles.masonryItem} onClick={() => openLightbox(img)}>
              <img src={img.url} alt={img.name} loading="lazy" />
              
              <div className={styles.imageOverlay}>
              <div className={styles.topActions}>
                <button 
                  className={`${styles.heartBtn} ${img.liked ? styles.active : ''}`}
                  onClick={(e) => handleHeartClick(e, img.id)}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill={img.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
              </div>
              <div className={styles.bottomInfo}>
                <span className={styles.imageName}>{img.name}</span>
                <div className={styles.bottomActions}>
                  <button className={styles.iconBtn} title="Tải xuống" onClick={(e) => { e.stopPropagation(); window.open(img.url, '_blank'); }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </button>
                  <button className={styles.iconBtn} title="Bình luận" onClick={(e) => { e.stopPropagation(); alert('Tính năng bình luận đang phát triển'); }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
        )}
      </main>

      {/* Lightbox */}
      {lightboxImg && (
        <div className={styles.lightbox}>
          <div className={styles.lightboxHeader}>
            <div>
              <span style={{fontWeight: 600, fontSize: '1.2rem'}}>{lightboxImg.name}</span>
            </div>
            <button className={styles.closeBtn} onClick={closeLightbox}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className={styles.lightboxContent} onClick={closeLightbox}>
            <div className={styles.lightboxImageWrapper} onClick={(e) => e.stopPropagation()}>
              <img src={lightboxImg.url} alt={lightboxImg.name} className={styles.lightboxImage} />
            </div>
            <div className={styles.lightboxActions} onClick={(e) => e.stopPropagation()}>
              <button 
                className={`${styles.lightboxHeart} ${images.find(img => img.id === lightboxImg.id)?.liked ? styles.active : ''}`}
                onClick={(e) => {
                  handleHeartClick(e, lightboxImg.id);
                  // Cập nhật lại lightboxImg state cục bộ nếu cần, 
                  // nhưng vì ta lấy state trực tiếp từ mảng images thông qua id nên nút sẽ tự update.
                }}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill={images.find(img => img.id === lightboxImg.id)?.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                {images.find(img => img.id === lightboxImg.id)?.liked ? "Đã chọn" : "Chọn ảnh này"}
              </button>
              
              <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 0.5rem' }}></div>
              
              <button onClick={() => window.open(lightboxImg.url, '_blank')}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Tải xuống
              </button>
              
              <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 0.5rem' }}></div>
              
              <button>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                Viết bình luận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
