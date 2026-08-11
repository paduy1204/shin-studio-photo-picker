'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

// Mock data (giống Client View)
const MOCK_IMAGES = [
  { id: '1', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80', name: 'IMG_001.jpg', liked: true },
  { id: '2', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80', name: 'IMG_002.jpg', liked: true },
  { id: '3', url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80', name: 'IMG_003.jpg', liked: false },
  { id: '4', url: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80', name: 'IMG_004.jpg', liked: true },
  { id: '5', url: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=800&q=80', name: 'IMG_005.jpg', liked: false },
  { id: '6', url: 'https://images.unsplash.com/photo-1536640712-4d4c36ef0e52?auto=format&fit=crop&w=800&q=80', name: 'IMG_006.jpg', liked: false },
];

export default function AdminAlbumDetail() {
  const [images, setImages] = useState(MOCK_IMAGES);
  const [filterMode, setFilterMode] = useState<'all' | 'selected'>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });

  // Format separator cho chuỗi export
  const [separator, setSeparator] = useState(', ');

  const selectedImages = images.filter(img => img.liked);
  const displayImages = filterMode === 'all' ? images : selectedImages;
  const fileNamesString = selectedImages.map(img => img.name).join(separator);

  const handleCopy = () => {
    navigator.clipboard.writeText(fileNamesString).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleAutoFilter = async () => {
    if (selectedImages.length === 0) {
      alert("Chưa có ảnh nào được chọn!");
      return;
    }

    try {
      // 1. Chọn thư mục nguồn
      alert("Bước 1: Chọn thư mục GỐC chứa toàn bộ ảnh (để phần mềm tìm ảnh).");
      const sourceDirHandle = await (window as any).showDirectoryPicker({ mode: 'read' });
      
      // 2. Chọn thư mục đích
      alert("Bước 2: Chọn thư mục ĐÍCH để chép các ảnh được chọn vào (hoặc tạo thư mục mới).");
      const destDirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });

      setIsProcessing(true);
      setProgress({ current: 0, total: selectedImages.length, status: 'Đang bắt đầu...' });

      let successCount = 0;
      let notFoundCount = 0;

      for (let i = 0; i < selectedImages.length; i++) {
        const fileName = selectedImages[i].name;
        setProgress({ current: i + 1, total: selectedImages.length, status: `Đang xử lý: ${fileName}` });
        
        try {
          // Lấy file từ thư mục nguồn
          const fileHandle = await sourceDirHandle.getFileHandle(fileName);
          const file = await fileHandle.getFile();

          // Tạo file mới ở thư mục đích
          const newFileHandle = await destDirHandle.getFileHandle(fileName, { create: true });
          const writable = await newFileHandle.createWritable();
          
          // Ghi dữ liệu
          await writable.write(file);
          await writable.close();
          successCount++;
        } catch (err) {
          console.error(`Không tìm thấy hoặc lỗi khi copy file: ${fileName}`, err);
          notFoundCount++;
        }
      }

      setIsProcessing(false);
      alert(`Đã hoàn tất!\n- Copy thành công: ${successCount} ảnh\n- Không tìm thấy: ${notFoundCount} ảnh`);
      
    } catch (error: any) {
      setIsProcessing(false);
      if (error.name !== 'AbortError') {
        alert("Lỗi truy cập hệ thống file. Vui lòng thử lại trên trình duyệt Chrome/Edge mới nhất.");
        console.error(error);
      }
    }
  };

  return (
    <div className={styles.adminContainer}>
      {/* Top Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/admin" className={styles.backBtn}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Quản trị Album
          </Link>
          <span className={styles.albumTitle}>Bé Su Tròn 1 Tuổi</span>
        </div>
        
        <div className={styles.navRight}>
          <button className={styles.btnAutoFilter} onClick={handleAutoFilter}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Tự động Lọc File
          </button>
          
          <button className={styles.btnExport} onClick={() => setIsExportModalOpen(true)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Xuất Danh sách File
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabItem} ${filterMode === 'all' ? styles.activeTab : ''}`}
          onClick={() => setFilterMode('all')}
        >
          Tất cả ({images.length})
        </button>
        <button 
          className={`${styles.tabItem} ${filterMode === 'selected' ? styles.activeTab : ''}`}
          onClick={() => setFilterMode('selected')}
        >
          Khách đã chọn ({selectedImages.length})
        </button>
      </div>

      {/* Grid */}
      <main className={styles.masonryGrid}>
        {displayImages.length === 0 ? (
          <div style={{textAlign: 'center', gridColumn: '1 / -1', padding: '3rem', color: 'var(--text-muted)'}}>
            Không có ảnh nào.
          </div>
        ) : (
          displayImages.map(img => (
            <div key={img.id} className={styles.masonryItem}>
              <img src={img.url} alt={img.name} loading="lazy" />
              <div className={styles.imageOverlay}>
                <div className={styles.topActions}>
                  {img.liked && (
                    <div className={styles.likedBadge}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </div>
                  )}
                </div>
                <div className={styles.bottomInfo}>
                  <span>{img.name}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Export Modal (Chức năng cốt lõi) */}
      {isExportModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsExportModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Danh sách ảnh khách đã chọn</h2>
              <button className={styles.closeBtn} onClick={() => setIsExportModalOpen(false)}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formatOptions}>
                <span style={{fontWeight: 600, color: 'var(--text-muted)'}}>Định dạng ngăn cách:</span>
                <label className={styles.radioLabel}>
                  <input type="radio" name="format" checked={separator === ', '} onChange={() => setSeparator(', ')} />
                  Dấu phẩy (IMG_1, IMG_2)
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" name="format" checked={separator === ' '} onChange={() => setSeparator(' ')} />
                  Khoảng cách (IMG_1 IMG_2)
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" name="format" checked={separator === '\n'} onChange={() => setSeparator('\n')} />
                  Xuống dòng
                </label>
              </div>

              <textarea 
                className={styles.textArea} 
                value={fileNamesString} 
                readOnly
                rows={6}
              />
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setIsExportModalOpen(false)}>Đóng</button>
              <button className={`${styles.btnPrimary} ${copySuccess ? styles.btnSuccess : ''}`} onClick={handleCopy}>
                {copySuccess ? 'Đã sao chép!' : 'Sao chép danh sách'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      {isProcessing && (
        <div className={styles.modalOverlay}>
          <div className={styles.processingContent}>
            <div className={styles.spinner}></div>
            <h3 style={{marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--foreground)'}}>Đang lọc và Copy ảnh...</h3>
            <p style={{color: 'var(--text-muted)'}}>{progress.status}</p>
            
            <div style={{width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', marginTop: '1rem', overflow: 'hidden'}}>
              <div style={{height: '100%', backgroundColor: 'var(--primary)', width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`, transition: 'width 0.2s ease'}}></div>
            </div>
            
            <p style={{marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 600}}>
              {progress.current} / {progress.total}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
