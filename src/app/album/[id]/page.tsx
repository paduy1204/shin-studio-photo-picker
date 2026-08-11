'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  const [images, setImages] = useState(MOCK_IMAGES);
  const [lightboxImg, setLightboxImg] = useState<any>(null);

  const handleHeartClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Ngăn không cho mở lightbox khi bấm tim
    setImages(images.map(img => img.id === id ? { ...img, liked: !img.liked } : img));
  };

  const openLightbox = (img: any) => {
    setLightboxImg(img);
  };

  const closeLightbox = () => {
    setLightboxImg(null);
  };

  const selectedCount = images.filter(img => img.liked).length;

  return (
    <div>
      {/* Header Album */}
      <header className={styles.albumHeader}>
        <h1 className={styles.albumTitle}>Bé Su Tròn 1 Tuổi</h1>
        <p className={styles.albumMeta}>Khách hàng: Chị Thảo - 10/08/2026</p>
        
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span>{images.length} Ảnh</span>
          </div>
          <div className={styles.statItem}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span>{selectedCount} Đã chọn</span>
          </div>
        </div>
      </header>

      {/* Lưới Ảnh Masonry */}
      <main className={styles.masonryGrid}>
        {images.map((img) => (
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
                <span>{img.name}</span>
                <button className={styles.commentBtn}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  Bình luận
                </button>
              </div>
            </div>
          </div>
        ))}
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
            <img src={lightboxImg.url} alt={lightboxImg.name} className={styles.lightboxImage} onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}
