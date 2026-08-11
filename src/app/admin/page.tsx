'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function AdminDashboard() {
  const albums = [
    { id: '1', name: 'Chị Thanh Uyển 11/8', date: '11-08-2026', hearts: 19, comments: 0, cover: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80' },
    { id: '2', name: 'Chị Hoàng Oanh 10/8', date: '10-08-2026', hearts: 32, comments: 0, cover: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80' },
    { id: '3', name: 'Chị Thảo 10/8', date: '10-08-2026', hearts: 120, comments: 4, cover: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80' },
    { id: '4', name: 'Chị Yến Vy 9/8', date: '09-08-2026', hearts: 19, comments: 0, cover: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80' },
    { id: '5', name: 'Chị Kim Hồng 9/8', date: '09-08-2026', hearts: 45, comments: 1, cover: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=800&q=80' },
    { id: '6', name: 'Chị Yến 9/8', date: '09-08-2026', hearts: 27, comments: 8, cover: 'https://images.unsplash.com/photo-1536640712-4d4c36ef0e52?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className={styles.adminContainer}>
      {/* Top Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className={styles.navLogo} />
          </Link>
          <div className={styles.navStats}>
            <span>Tổng số album đã tạo: <strong>207</strong></span>
            <span>Số album tạo mới trong tháng này: <strong>23/50</strong></span>
          </div>
        </div>
        <div className={styles.navRight}>
          <div className={styles.searchBar}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Tìm kiếm album..." />
          </div>
          <div className={styles.userInfo}>
            <span>Shin Studio - Ảnh viện Gia đình & Bé</span>
            <div className={styles.avatar}>S</div>
          </div>
        </div>
      </nav>

      {/* Grid Content */}
      <main className={styles.mainContent}>
        <div className={styles.albumGrid}>
          
          {/* Create New Album Card */}
          <Link href="/admin/create" className={styles.createCard}>
            <div className={styles.createContent}>
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Tạo album</span>
            </div>
          </Link>

          {/* Album Cards */}
          {albums.map(album => (
            <Link href={`/admin/album/${album.id}`} key={album.id} className={styles.albumCard}>
              <div className={styles.cardImage}>
                <img src={album.cover} alt={album.name} loading="lazy" />
                <div className={styles.cardOverlay}></div>
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.albumName}>{album.name}</h3>
                <p className={styles.albumDate}>Ngày tạo: {album.date}</p>
                <div className={styles.albumStats}>
                  <div className={styles.statIcon}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    <span>{album.hearts}</span>
                  </div>
                  <div className={styles.statIcon}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    <span>{album.comments}</span>
                  </div>
                  <div className={styles.moreIcon}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle><circle cx="5" cy="12" r="2"></circle></svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
        </div>
      </main>
    </div>
  );
}
