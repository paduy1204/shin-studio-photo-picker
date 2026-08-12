'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Masonry from 'react-masonry-css';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from './page.module.css';

const MOCK_IMAGES = [
  { id: '1', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80', name: 'IMG_001.jpg', liked: false, driveFileId: null },
  { id: '2', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80', name: 'IMG_002.jpg', liked: true, driveFileId: null },
  { id: '3', url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80', name: 'IMG_003.jpg', liked: false, driveFileId: null },
  { id: '4', url: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80', name: 'IMG_004.jpg', liked: false, driveFileId: null },
  { id: '5', url: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=800&q=80', name: 'IMG_005.jpg', liked: true, driveFileId: null },
  { id: '6', url: 'https://images.unsplash.com/photo-1536640712-4d4c36ef0e52?auto=format&fit=crop&w=800&q=80', name: 'IMG_006.jpg', liked: false, driveFileId: null },
];

// Tạo link download trực tiếp từ Google Drive (không qua proxy)
function getDriveDownloadUrl(driveFileId: string | null, webContentLink: string | null) {
  if (webContentLink) return webContentLink;
  if (driveFileId) return `https://drive.google.com/uc?export=download&id=${driveFileId}`;
  return null;
}

export default function AlbumClientView() {
  const params = useParams();
  const id = params?.id as string;
  const [images, setImages] = useState<any[]>([]);
  const [albumName, setAlbumName] = useState('Đang tải...');
  const [albumMeta, setAlbumMeta] = useState('');
  const [lightboxImg, setLightboxImg] = useState<any>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'selected'>('all');
  const [showAppBrowserWarning, setShowAppBrowserWarning] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (userAgent.indexOf('Zalo') > -1 || userAgent.indexOf('FBAN') > -1 || userAgent.indexOf('FBAV') > -1 || userAgent.indexOf('Messenger') > -1) {
      setShowAppBrowserWarning(true);
    }
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
          driveFileId: f.drive_file_id || null,
          webContentLink: f.web_content_link || null,
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
      updatedImages[index] = { ...updatedImages[index], liked: newLikedState };
      setImages(updatedImages);
      await supabase.from('images').update({ liked: newLikedState }).eq('id', imgId);
    }
  };

  const handleDownload = (img: any) => {
    const downloadUrl = getDriveDownloadUrl(img.driveFileId, img.webContentLink);
    if (downloadUrl) {
      // Mở trực tiếp link Google Drive -> iOS/Android sẽ hiện menu lưu ảnh
      window.open(downloadUrl, '_blank');
    } else {
      // Fallback: tạo link download qua proxy với tên file gốc
      const a = document.createElement('a');
      a.href = img.url;
      a.download = img.name;
      a.click();
    }
  };

  const openLightbox = (img: any) => setLightboxImg(img);
  const closeLightbox = () => setLightboxImg(null);

  const selectedCount = images.filter(img => img.liked).length;
  const displayImages = filterMode === 'all' ? images : images.filter(img => img.liked);

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

  const currentLightboxLiked = lightboxImg ? images.find(img => img.id === lightboxImg.id)?.liked : false;

  return (
    <div>
      {showAppBrowserWarning && (
        <div className={styles.zaloWarning}>
          <h2>Cảnh báo trình duyệt!</h2>
          <p>
            Trình duyệt của Zalo/Facebook có thể gây lỗi hiển thị hoặc lỗi tải ảnh.<br/>
            Vui lòng bấm vào dấu 3 chấm <b>(...)</b> ở góc trên bên phải màn hình và chọn <b>"Mở bằng trình duyệt"</b> (Chrome/Safari) để có trải nghiệm tốt nhất!
          </p>
          <button onClick={() => setShowAppBrowserWarning(false)} style={{padding: '10px 20px', background: 'var(--primary)', color: 'white', borderRadius: '8px'}}>Tôi đã hiểu</button>
        </div>
      )}

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

      {/* Lưới Ảnh - dùng react-masonry-css để sắp xếp từ trái qua phải */}
      {displayImages.length === 0 ? (
        <div style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
          Chưa có bức ảnh nào được chọn.
        </div>
      ) : (
        <Masonry
          breakpointCols={{ default: 3, 1024: 2, 640: 3 }}
          className={styles.myMasonryGrid}
          columnClassName={styles.myMasonryGridColumn}
        >
          {displayImages.map((img) => (
            <div key={img.id} className={styles.masonryItem} onClick={() => openLightbox(img)}>
              <img src={img.url} alt={img.name} loading="lazy" />
              <div className={styles.imageOverlay}>
                <div className={styles.topActions}>
                  <button 
                    className={`${styles.heartBtn} ${img.liked ? styles.active : ''}`}
                    onClick={(e) => handleHeartClick(e, img.id)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill={img.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </button>
                </div>
                <div className={styles.bottomActions}>
                  <button className={styles.iconBtn} title="Tải xuống" onClick={(e) => { e.stopPropagation(); handleDownload(img); }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div className={styles.lightbox}>
          <div className={styles.lightboxHeader}>
            <span className={styles.lightboxFileName}>{lightboxImg.name}</span>
            <button className={styles.closeBtn} onClick={closeLightbox}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className={styles.lightboxContent} onClick={closeLightbox}>
            {/* Nút mũi tên trái */}
            {currentIdx > 0 && (
              <button className={`${styles.lightboxNav} ${styles.navLeft}`} onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
            )}

            <div className={styles.lightboxImageWrapper} onClick={(e) => e.stopPropagation()}>
              <img src={lightboxImg.url} alt={lightboxImg.name} className={styles.lightboxImage} />
            </div>

            {/* Nút mũi tên phải */}
            {currentIdx < displayImages.length - 1 && (
              <button className={`${styles.lightboxNav} ${styles.navRight}`} onClick={(e) => { e.stopPropagation(); handleNext(); }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            )}
          </div>

          {/* Thanh icon hành động phía dưới */}
          <div className={styles.lightboxActions}>
            {/* Tim / Chọn ảnh */}
            <button
              className={`${styles.lightboxActionBtn} ${currentLightboxLiked ? styles.heartActive : ''}`}
              onClick={(e) => handleHeartClick(e, lightboxImg.id)}
              title={currentLightboxLiked ? 'Bỏ chọn' : 'Chọn ảnh này'}
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill={currentLightboxLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span className={styles.lightboxActionLabel}>{currentLightboxLiked ? 'Đã chọn' : 'Chọn'}</span>
            </button>

            {/* Tải xuống */}
            <button
              className={styles.lightboxActionBtn}
              onClick={() => handleDownload(lightboxImg)}
              title="Tải xuống"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span className={styles.lightboxActionLabel}>Tải về</span>
            </button>

            {/* Bình luận */}
            <button
              className={styles.lightboxActionBtn}
              onClick={() => alert('Tính năng bình luận đang phát triển')}
              title="Viết bình luận"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              <span className={styles.lightboxActionLabel}>Bình luận</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
