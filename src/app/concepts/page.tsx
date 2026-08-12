'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Masonry from 'react-masonry-css';
import { supabase } from '@/lib/supabaseClient';
import styles from './page.module.css';

export default function ConceptsPage() {
  const [images, setImages] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>(['Tất cả']);
  const [activeCategoryTag, setActiveCategoryTag] = useState<string>('Tất cả');
  const [lightboxImg, setLightboxImg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [albumTitle, setAlbumTitle] = useState('MẪU CONCEPT SHIN STUDIO');

  useEffect(() => {
    fetchMasterConceptPhotos();
  }, []);

  const fetchMasterConceptPhotos = async () => {
    try {
      setLoading(true);

      // Tìm album có gán Tag hoặc tên chứa "Concept"
      const { data: albums } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (!albums || albums.length === 0) {
        setLoading(false);
        return;
      }

      // Ưu tiên album có tags hoặc tên chứa "Concept" / "Mẫu"
      const conceptAlbum = albums.find(a => 
        (a.tags && a.tags.trim() !== '') || 
        a.name?.toLowerCase().includes('concept') || 
        a.name?.toLowerCase().includes('mẫu')
      ) || albums[0];

      if (conceptAlbum) {
        setAlbumTitle(conceptAlbum.name);
        const { data: files } = await supabase
          .from('images')
          .select('*')
          .eq('album_id', conceptAlbum.id)
          .order('name', { ascending: true });

        if (files && files.length > 0) {
          const formatted = files.map(f => ({
            id: f.id,
            url: `/api/proxy-image?id=${f.id}`,
            driveFileId: f.drive_file_id || null,
            webContentLink: f.web_content_link || null,
            name: f.name,
            tag: f.tag || '',
          }));
          setImages(formatted);

          // Trích xuất các tag/thư mục con độc nhất (như BEAUTY, BẦU, COUPLE, PROFILE, CHO BÉ...)
          const extractedTags = Array.from(
            new Set(formatted.map(img => img.tag).filter(t => t && t.trim() !== ''))
          );

          if (extractedTags.length > 0) {
            setAvailableTags(['Tất cả', ...extractedTags]);
          } else {
            // Mặc định các danh mục phổ biến nếu chưa phân loại trong Drive
            setAvailableTags(['Tất cả', 'Cho Bé', 'Gia đình', 'Sơ sinh', 'Bầu', 'Beauty', 'Couple', 'Profile']);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching concept photos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lọc ảnh trực tiếp hiển thị ra lưới theo Tab được bấm
  const displayImages = images.filter((img) => {
    if (activeCategoryTag === 'Tất cả') return true;
    const tagLower = activeCategoryTag.toLowerCase();
    return (
      (img.tag && img.tag.toLowerCase().includes(tagLower)) ||
      (img.name && img.name.toLowerCase().includes(tagLower))
    );
  });

  const openLightbox = (img: any) => setLightboxImg(img);
  const closeLightbox = () => setLightboxImg(null);

  const currentIdx = lightboxImg ? displayImages.findIndex(img => img.id === lightboxImg.id) : -1;

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentIdx > -1 && currentIdx < displayImages.length - 1) {
      setLightboxImg(displayImages[currentIdx + 1]);
    }
  }, [currentIdx, displayImages]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentIdx > 0) {
      setLightboxImg(displayImages[currentIdx - 1]);
    }
  }, [currentIdx, displayImages]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.brandBadge}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
          <span>Shin Studio</span>
        </div>
        <h1 className={styles.title}>{albumTitle}</h1>
        <p className={styles.subtitle}>
          Khám phá & lựa chọn mẫu Concept chụp ảnh yêu thích của bạn
        </p>
      </header>

      {/* Category Tabs Bar (Shotpik Style) */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsList}>
          {availableTags.map((tag) => (
            <button
              key={tag}
              className={`${styles.tabItem} ${activeCategoryTag === tag ? styles.active : ''}`}
              onClick={() => setActiveCategoryTag(tag)}
            >
              <span>{tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Full Photo Grid (Masonry) - Hiển thị trực tiếp full ảnh giống Shotpik */}
      {loading ? (
        <div className={styles.emptyState}>Đang tải hình ảnh Concept...</div>
      ) : displayImages.length === 0 ? (
        <div className={styles.emptyState}>
          Chưa có hình ảnh mẫu nào thuộc mục <strong>"{activeCategoryTag}"</strong>.<br/>
          Admin chỉ cần tạo Folder trên Google Drive chứa các thư mục con <em>({availableTags.filter(t => t !== 'Tất cả').join(', ')})</em> để tự động cập nhật ảnh vào đây!
        </div>
      ) : (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Masonry
            breakpointCols={{ default: 4, 1100: 3, 768: 2, 500: 2 }}
            className={styles.myMasonryGrid}
            columnClassName={styles.myMasonryGridColumn}
          >
            {displayImages.map((img) => (
              <div key={img.id} className={styles.masonryItem} onClick={() => openLightbox(img)}>
                <img src={img.url} alt={img.name} loading="lazy" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} />
                <div className={styles.imageOverlay} />
              </div>
            ))}
          </Masonry>
        </div>
      )}

      {/* Lightbox Zoom Viewer */}
      {lightboxImg && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <button className={styles.closeBtn} onClick={closeLightbox}>✕</button>
          {currentIdx > 0 && (
            <button className={styles.navBtnLeft} onClick={handlePrev}>❮</button>
          )}
          {currentIdx < displayImages.length - 1 && (
            <button className={styles.navBtnRight} onClick={handleNext}>❯</button>
          )}
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <img src={lightboxImg.url} alt={lightboxImg.name} />
          </div>
        </div>
      )}
    </div>
  );
}
