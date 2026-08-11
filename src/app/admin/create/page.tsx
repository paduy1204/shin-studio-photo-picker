'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function CreateAlbum() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    driveLink: '',
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setScanResult(null);
    
    if (!formData.name || !formData.client || !formData.driveLink) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Extract Folder ID từ link Drive
    // Link format: https://drive.google.com/drive/folders/1aBcD_...
    const match = formData.driveLink.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    const folderId = match ? match[1] : null;

    if (!folderId) {
      setError('Link Google Drive không đúng định dạng. Cần link dạng thư mục (có /folders/...)');
      return;
    }

    setIsScanning(true);
    
    try {
      // Call backend API
      const response = await fetch('/api/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi quét thư mục Drive');
      }

      setScanResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = () => {
    // Lưu vào Supabase sau này
    alert('Sẽ lưu thông tin vào CSDL Supabase ở bước sau. Hiện tại quét thành công!');
    router.push('/admin');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.backBtn}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Quay lại
        </Link>
        <h1 className={styles.title}>Tạo Album Mới</h1>
        <p className={styles.subtitle}>Tạo album từ thư mục Google Drive</p>
      </header>

      <main className={styles.mainContent}>
        <form onSubmit={handleScan} className={styles.formCard}>
          <div className={styles.formGroup}>
            <label>Tên Album</label>
            <input 
              type="text" 
              name="name" 
              placeholder="VD: Bé Su Tròn 1 Tuổi" 
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tên Khách hàng</label>
            <input 
              type="text" 
              name="client" 
              placeholder="VD: Chị Thảo" 
              value={formData.client}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Link Google Drive (Bắt buộc bật "Ai cũng có thể xem")</label>
            <input 
              type="text" 
              name="driveLink" 
              placeholder="https://drive.google.com/drive/folders/..." 
              value={formData.driveLink}
              onChange={handleChange}
            />
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <button 
            type="submit" 
            className={styles.btnScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <div className={styles.spinner}></div>
                Đang quét thư mục...
              </>
            ) : (
              'Quét Thư Mục Google Drive'
            )}
          </button>
        </form>

        {scanResult && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <div className={styles.successIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                <h3 style={{color: 'var(--foreground)'}}>Quét thành công!</h3>
                <p style={{color: 'var(--text-muted)'}}>Đã tìm thấy <strong>{scanResult.files.length}</strong> hình ảnh.</p>
              </div>
            </div>
            
            <div className={styles.imagePreview}>
              {scanResult.files.slice(0, 4).map((file: any) => (
                <div key={file.id} className={styles.previewItem}>
                  <img src={file.thumbnailLink} alt={file.name} />
                </div>
              ))}
              {scanResult.files.length > 4 && (
                <div className={styles.previewMore}>
                  +{scanResult.files.length - 4} ảnh
                </div>
              )}
            </div>

            <button className={styles.btnSave} onClick={handleSave}>
              Hoàn tất & Lưu Album
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
