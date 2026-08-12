'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Masonry from 'react-masonry-css';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser, UserAccount } from '@/lib/auth';
import styles from './page.module.css';

export default function ConceptsPage() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>(['Tất cả']);
  const [activeCategoryTag, setActiveCategoryTag] = useState<string>('Tất cả');
  const [lightboxImg, setLightboxImg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [albumTitle, setAlbumTitle] = useState('MẪU CONCEPT SHIN STUDIO');

  // Modal quản lý drive dành cho Staff/Admin khi đăng nhập
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [driveLinkInput, setDriveLinkInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    fetchMasterConceptPhotos();
  }, []);

  const fetchMasterConceptPhotos = async () => {
    try {
      setLoading(true);
      const conceptAlbumId = 'master-concept';

      // CHỈ TRUY VẤN DUY NHẤT ALBUM 'master-concept' (Tuyệt đối không lấy album cá nhân của khách)
      const { data: conceptAlbum } = await supabase
        .from('albums')
        .select('*')
        .eq('id', conceptAlbumId)
        .maybeSingle();

      if (conceptAlbum) {
        setAlbumTitle(conceptAlbum.name);
        const { data: files } = await supabase
          .from('images')
          .select('*')
          .eq('album_id', conceptAlbumId)
          .order('name', { ascending: true });

        if (files && files.length > 0) {
          const formatted = files.map(f => {
            const match = f.name.match(/^\[(.*?)\]/);
            const tag = match ? match[1] : '';
            const cleanName = f.name.replace(/^\[.*?\]\s*/, '');
            return {
              id: f.id,
              url: `/api/proxy-image?id=${f.id}`,
              driveFileId: f.drive_file_id || null,
              webContentLink: f.web_content_link || null,
              name: cleanName,
              tag: tag,
            };
          });
          setImages(formatted);

          const extractedTags = Array.from(
            new Set(formatted.map(img => img.tag).filter(t => t && t.trim() !== ''))
          );
          setAvailableTags(['Tất cả', ...extractedTags]);
        }
      } else {
        setAlbumTitle('MẪU CONCEPT SHIN STUDIO');
        setImages([]);
        setAvailableTags(['Tất cả']);
      }
    } catch (err) {
      console.error('Error fetching concept photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveLinkInput) {
      alert('Vui lòng nhập Link Google Drive chứa các thư mục Concept!');
      return;
    }

    const match = driveLinkInput.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    const folderId = match ? match[1] : null;

    if (!folderId) {
      alert('Link Google Drive không đúng định dạng. Cần link thư mục (chứa /folders/)');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('/api/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      const conceptAlbumId = 'master-concept';

      const { error: albumError } = await supabase.from('albums').upsert({
        id: conceptAlbumId,
        name: 'MẪU CONCEPT SHIN STUDIO',
        client: 'Shin Studio Concept Showcase',
        slug: 'concepts',
        tags: 'Concept Mẫu Studio',
        allow_comments: true,
        watermark: false,
        show_name_card: true,
        password_protect: false,
        allow_download: false,
        limit_selection: false
      });

      if (albumError) console.error('Album Upsert Error:', albumError);

      if (data.files && data.files.length > 0) {
        await supabase.from('images').delete().eq('album_id', conceptAlbumId);

        const imageInserts = data.files.map((file: any) => {
          const tag = file.tag || '';
          const nameWithTag = tag ? `[${tag}] ${file.name}` : file.name;
          return {
            id: file.id,
            album_id: conceptAlbumId,
            name: nameWithTag,
            url: file.webContentLink || '',
            thumbnail_link: file.thumbnailLink,
            web_content_link: file.webContentLink
          };
        });

        const chunkSize = 500;
        for (let i = 0; i < imageInserts.length; i += chunkSize) {
          const chunk = imageInserts.slice(i, i + chunkSize);
          const { error: insertErr } = await supabase.from('images').upsert(chunk);
          if (insertErr) console.error('Error inserting chunk:', insertErr);
        }
      }

      alert(`Đồng bộ thành công ${data.files.length} ảnh Concept Mẫu! Khách sẽ thấy ngay hình ảnh mới.`);
      setIsModalOpen(false);
      setDriveLinkInput('');
      fetchMasterConceptPhotos();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className={styles.brandBadge}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
            <span>Shin Studio</span>
          </div>

          {/* CHỈ HIỂN THỊ NÚT QUẢN LÝ CHO NHÂN VIÊN/ADMIN ĐÃ ĐĂNG NHẬP */}
          {currentUser && (
            <button 
              onClick={() => setIsModalOpen(true)}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(232, 93, 117, 0.4)'
              }}
            >
              ⚙️ Cập Nhật Link Drive Concept ({currentUser.name})
            </button>
          )}
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

      {/* Full Photo Grid (Masonry) */}
      {loading ? (
        <div className={styles.emptyState}>Đang tải hình ảnh Concept...</div>
      ) : displayImages.length === 0 ? (
        <div className={styles.emptyState}>
          Chưa có hình ảnh mẫu nào thuộc mục <strong>"{activeCategoryTag}"</strong>.
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

      {/* Modal Cập Nhật Link Drive trực tiếp trên trang Concept (Chỉ dành cho Admin/Sales) */}
      {isModalOpen && (
        <div className={styles.lightbox} onClick={() => setIsModalOpen(false)}>
          <div style={{ background: '#1e1e24', padding: '2rem', borderRadius: '16px', maxWidth: '500px', width: '100%', color: 'white' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Cập Nhật Link Drive Concept Mẫu</h2>
            <form onSubmit={handleSyncSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem' }}>Link Google Drive chứa ảnh Concept:</label>
                <input 
                  type="text" 
                  placeholder="Dán Link Google Drive chứa các thư mục con"
                  value={driveLinkInput}
                  onChange={e => setDriveLinkInput(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.4)', color: 'white' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" disabled={isSyncing} style={{ padding: '8px 20px', borderRadius: '8px', background: 'var(--primary)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                  {isSyncing ? 'Đang cập nhật...' : 'Cập nhật ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
