'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import styles from './page.module.css';

const CATEGORIES = ['Tất cả', 'Cho Bé', 'Gia đình', 'Sơ sinh', 'Bầu', 'Beauty', 'Couple', 'Profile'];

export default function ConceptsPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConceptAlbums();
  }, []);

  const fetchConceptAlbums = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('albums')
        .select('*, images(id)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted = data.map((album) => {
          let cover = album.cover_image_url;
          if (!cover || cover.includes('drive-storage') || cover.includes('lh3.googleusercontent.com')) {
            if (album.images && album.images.length > 0) {
              cover = `https://drive.google.com/thumbnail?id=${album.images[0].id}&sz=w800`;
            } else {
              cover = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80';
            }
          }

          // Xác định category tag từ album.tags hoặc tên/khách hàng
          let categoryTag = album.tags?.trim() || 'Cho Bé';
          if (!categoryTag || categoryTag === '') {
            const nameLower = (album.name + ' ' + (album.client || '')).toLowerCase();
            if (nameLower.includes('bé') || nameLower.includes('baby') || nameLower.includes('sinh nhật')) categoryTag = 'Cho Bé';
            else if (nameLower.includes('gia đình') || nameLower.includes('family')) categoryTag = 'Gia đình';
            else if (nameLower.includes('sơ sinh') || nameLower.includes('newborn')) categoryTag = 'Sơ sinh';
            else if (nameLower.includes('bầu') || nameLower.includes('mới sinh')) categoryTag = 'Bầu';
            else if (nameLower.includes('beauty') || nameLower.includes('cá nhân')) categoryTag = 'Beauty';
            else if (nameLower.includes('couple') || nameLower.includes('cặp đôi')) categoryTag = 'Couple';
            else if (nameLower.includes('profile') || nameLower.includes('doanh nhân')) categoryTag = 'Profile';
          }

          return {
            ...album,
            cover,
            categoryTag,
            photoCount: album.images?.length || 0,
          };
        });
        setAlbums(formatted);
      } else {
        setAlbums([]);
      }
    } catch (err) {
      console.error('Error fetching concept albums:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lọc album theo Tab được chọn
  const filteredAlbums = albums.filter((album) => {
    if (activeCategory === 'Tất cả') return true;
    return (
      album.categoryTag?.toLowerCase().includes(activeCategory.toLowerCase()) ||
      album.tags?.toLowerCase().includes(activeCategory.toLowerCase()) ||
      album.name?.toLowerCase().includes(activeCategory.toLowerCase())
    );
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.brandBadge}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
          <span>Shin Studio</span>
        </div>
        <h1 className={styles.title}>ALBUM CONCEPT MẪU</h1>
        <p className={styles.subtitle}>
          Khám phá bộ sưu tập mẫu Concept chụp ảnh độc đáo tại Shin Studio.<br/>
          Lựa chọn bối cảnh & phong cách chụp ưng ý nhất cho bộ ảnh của bạn!
        </p>
      </header>

      {/* Category Tabs */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsList}>
          {CATEGORIES.map((cat) => {
            const count = cat === 'Tất cả' 
              ? albums.length 
              : albums.filter(a => 
                  a.categoryTag?.toLowerCase().includes(cat.toLowerCase()) ||
                  a.tags?.toLowerCase().includes(cat.toLowerCase()) ||
                  a.name?.toLowerCase().includes(cat.toLowerCase())
                ).length;

            return (
              <button
                key={cat}
                className={`${styles.tabItem} ${activeCategory === cat ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span>{cat}</span>
                <span className={styles.tabCount}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Album Grid */}
      {loading ? (
        <div className={styles.emptyState}>Đang tải danh sách Concept...</div>
      ) : filteredAlbums.length === 0 ? (
        <div className={styles.emptyState}>
          Chưa có album nào thuộc phân loại <strong>"{activeCategory}"</strong>.<br/>
          Admin có thể chọn tag <strong>{activeCategory}</strong> khi tạo Album trong trang Quản trị!
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredAlbums.map((album) => (
            <Link href={`/album/${album.id}`} key={album.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img src={album.cover} alt={album.name} className={styles.coverImage} loading="lazy" />
                <div className={styles.cardOverlay} />
                <span className={styles.categoryTag}>{album.categoryTag}</span>
                <span className={styles.photoCountBadge}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  {album.photoCount} ảnh
                </span>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.albumTitle}>{album.name}</h3>
                {album.client && <p className={styles.clientMeta}>Concept: {album.client}</p>}
                <div className={styles.viewBtn}>
                  <span>Xem mẫu cảnh này</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
