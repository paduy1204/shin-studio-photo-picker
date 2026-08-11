'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import styles from './page.module.css';

export default function AdminDashboard() {
  const demoAlbums = [
    { id: '1', name: 'Chị Thanh Uyển 11/8', date: '11-08-2026', hearts: 19, comments: 0, cover: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80' },
    { id: '2', name: 'Chị Hoàng Oanh 10/8', date: '10-08-2026', hearts: 32, comments: 0, cover: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80' },
    { id: '3', name: 'Chị Thảo 10/8', date: '10-08-2026', hearts: 120, comments: 4, cover: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80' },
    { id: '4', name: 'Chị Yến Vy 9/8', date: '09-08-2026', hearts: 19, comments: 0, cover: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80' },
  ];

  const [albums, setAlbums] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    const { data, error } = await supabase
      .from('albums')
      .select('*, images(id, liked, comment, thumbnail_link, web_content_link)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching albums:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      // Migrate from localStorage if it exists and Supabase is empty
      const saved = localStorage.getItem('shinstudio_albums');
      if (saved) {
        setAlbums(JSON.parse(saved));
      } else {
        setAlbums(demoAlbums);
      }
      return;
    }
    
    const formattedAlbums = data.map(album => {
      const hearts = album.images?.filter((img: any) => img.liked).length || 0;
      const comments = album.images?.filter((img: any) => img.comment && img.comment.trim() !== '').length || 0;
      let cover = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80';
      if (album.images && album.images.length > 0) {
        const firstImage = album.images[0];
        cover = firstImage.thumbnail_link || firstImage.web_content_link || `/api/proxy-image?id=${firstImage.id}`;
      }
      
      return {
        ...album,
        date: new Date(album.created_at).toLocaleDateString('vi-VN'),
        hearts,
        comments,
        cover
      };
    });
    
    setAlbums(formattedAlbums);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    driveLink: '',
    name: '',
    client: '',
    slug: '',
    tags: '',
    password: '',
    selectionLimit: '',
  });

  const [toggles, setToggles] = useState({
    allowComments: true,
    watermark: false,
    showNameCard: true,
    passwordProtect: false,
    allowDownload: true,
    limitSelection: false,
  });

  const [isScanning, setIsScanning] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAlbum = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault(); // Prevent navigating to the album
    e.stopPropagation();
    
    if (confirm(`Bạn có chắc chắn muốn xóa album "${name}" không?`)) {
      // Optimistic update
      const updatedAlbums = albums.filter(a => a.id !== id);
      setAlbums(updatedAlbums);
      localStorage.setItem('shinstudio_albums', JSON.stringify(updatedAlbums));
      localStorage.removeItem(`drive_files_${id}`);

      // Delete from Supabase
      const { error } = await supabase.from('albums').delete().eq('id', id);
      if (error) {
        alert("Lỗi khi xoá trên Supabase: " + error.message);
        fetchAlbums(); // Revert
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.driveLink || !formData.name || !formData.client) {
      alert("Vui lòng điền các thông tin bắt buộc!");
      return;
    }

    const match = formData.driveLink.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    const folderId = match ? match[1] : null;

    if (!folderId) {
      alert('Link Google Drive không đúng định dạng. Cần link thư mục (chứa /folders/)');
      return;
    }

    setIsScanning(true);
    try {
      const response = await fetch('/api/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      // Cập nhật State để hiển thị ngay Album mới
      const newAlbumId = data.folderId || Date.now().toString();

      // Insert vào Supabase
      const { error: albumError } = await supabase.from('albums').upsert({
        id: newAlbumId,
        name: formData.name,
        client: formData.client,
        slug: formData.slug,
        tags: formData.tags,
        password: formData.password,
        selection_limit: formData.selectionLimit,
        allow_comments: toggles.allowComments,
        watermark: toggles.watermark,
        show_name_card: toggles.showNameCard,
        password_protect: toggles.passwordProtect,
        allow_download: toggles.allowDownload,
        limit_selection: toggles.limitSelection
      });

      if (albumError) {
        console.error(albumError);
        // Ignore unique constraint error if it already exists
      }

      if (data.files && data.files.length > 0) {
        const imageInserts = data.files.map((file: any) => ({
          id: file.id,
          album_id: newAlbumId,
          name: file.name,
          url: file.webContentLink || '', // fallback
          thumbnail_link: file.thumbnailLink,
          web_content_link: file.webContentLink
        }));
        
        // Chunk inserts to avoid payload too large if there are thousands of files
        const chunkSize = 500;
        for (let i = 0; i < imageInserts.length; i += chunkSize) {
          const chunk = imageInserts.slice(i, i + chunkSize);
          const { error: imagesError } = await supabase.from('images').upsert(chunk);
          if (imagesError) console.error(imagesError);
        }
      }

      // Lưu fallback vào LocalStorage
      localStorage.setItem(`drive_files_${newAlbumId}`, JSON.stringify(data.files));

      alert(`Đã tạo Album thành công với ${data.files.length} ảnh! Album đã hiển thị trên màn hình.`);
      setIsModalOpen(false);
      
      // Load lại list album từ DB
      fetchAlbums();
      
      // Reset form
      setFormData({
        driveLink: '',
        name: '',
        client: '',
        slug: '',
        tags: '',
        password: '',
        selectionLimit: '',
      });
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className={styles.navLogo} />
          </Link>
          <div className={styles.navStats}>
            <span>Tổng số album đã tạo: <strong>{mounted ? albums.length : 0}</strong></span>
          </div>
        </div>
        <div className={styles.navRight}>
          <div className={styles.searchBar}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Tìm kiếm album..." />
          </div>
          <div className={styles.userInfo}>
            <span>Shin Studio</span>
            <div className={styles.avatar}>S</div>
          </div>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.albumGrid}>
          {/* Create Button */}
          <div className={styles.createCard} onClick={() => setIsModalOpen(true)}>
            <div className={styles.createContent}>
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Tạo album</span>
            </div>
          </div>

          {albums.map((album, index) => (
            <Link href={`/admin/album/${album.id}`} key={`${album.id}-${index}`} className={styles.albumCard}>
              <button 
                className={styles.deleteBtn} 
                onClick={(e) => handleDeleteAlbum(e, album.id, album.name)}
                title="Xóa album"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
              <div className={styles.cardImage}>
                <img src={album.cover} alt={album.name} loading="lazy" />
                <div className={styles.cardOverlay}></div>
              </div>
              <div className={styles.cardInfo}>
                <h3 className={styles.albumName}>{album.name}</h3>
                <p className={styles.albumDate}>Ngày tạo: {album.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Modal Tạo Album */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Tạo album</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Link ảnh Google Drive <span style={{color: 'red'}}>*</span></label>
                <div className={styles.inputWithIcon}>
                  <input type="text" name="driveLink" placeholder="Link Google Drive thư mục chứa ảnh vào đây" value={formData.driveLink} onChange={handleInputChange} required />
                  <div className={styles.iconBtn}>+</div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Tên album <span style={{color: 'red'}}>*</span></label>
                <input type="text" name="name" placeholder="Tên album" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className={styles.formGroup}>
                <label>Tên khách hàng <span style={{color: 'red'}}>*</span></label>
                <input type="text" name="client" placeholder="Tên khách hàng" value={formData.client} onChange={handleInputChange} required />
              </div>

              <div className={styles.formGroup}>
                <label>Tên miền album</label>
                <div className={styles.domainInput}>
                  <span className={styles.domainPrefix}>shinstudio.vn/</span>
                  <input type="text" name="slug" placeholder="Nhập tên miền album (tùy chọn)" value={formData.slug} onChange={handleInputChange} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Tags</label>
                <div className={styles.inputWithIcon}>
                  <input type="text" name="tags" placeholder="Nhập tag" value={formData.tags} onChange={handleInputChange} />
                  <div className={styles.iconBtn}>+</div>
                </div>
              </div>

              <div className={styles.noteBox}>
                <strong>Lưu ý:</strong> Ảnh bìa album sẽ được thiết lập tự động sau khi tải ảnh từ Drive, hoặc bạn có thể vào cài đặt để đổi ảnh bìa.
              </div>

              <div className={styles.toggleList}>
                <div className={styles.toggleItem}>
                  <span>Cho phép bình luận</span>
                  <div className={`${styles.switch} ${toggles.allowComments ? styles.switchOn : ''}`} onClick={() => handleToggle('allowComments')}>
                    <div className={styles.switchHandle}></div>
                  </div>
                </div>
                
                <div className={styles.toggleItem}>
                  <span>Bật watermark</span>
                  <div className={`${styles.switch} ${toggles.watermark ? styles.switchOn : ''}`} onClick={() => handleToggle('watermark')}>
                    <div className={styles.switchHandle}></div>
                  </div>
                </div>

                <div className={styles.toggleItem}>
                  <span>Hiện Name Card</span>
                  <div className={`${styles.switch} ${toggles.showNameCard ? styles.switchOn : ''}`} onClick={() => handleToggle('showNameCard')}>
                    <div className={styles.switchHandle}></div>
                  </div>
                </div>

                <div className={styles.toggleItemWrapper}>
                  <div className={styles.toggleItem}>
                    <span>Bảo vệ album bằng mật khẩu</span>
                    <div className={`${styles.switch} ${toggles.passwordProtect ? styles.switchOn : ''}`} onClick={() => handleToggle('passwordProtect')}>
                      <div className={styles.switchHandle}></div>
                    </div>
                  </div>
                  {toggles.passwordProtect && (
                    <div className={styles.subInputGroup}>
                      <input type="text" name="password" placeholder="Nhập mật khẩu truy cập album" value={formData.password} onChange={handleInputChange} required />
                    </div>
                  )}
                </div>

                <div className={styles.toggleItem}>
                  <span>Cho phép tải xuống</span>
                  <div className={`${styles.switch} ${toggles.allowDownload ? styles.switchOn : ''}`} onClick={() => handleToggle('allowDownload')}>
                    <div className={styles.switchHandle}></div>
                  </div>
                </div>

                <div className={styles.toggleItemWrapper}>
                  <div className={styles.toggleItem}>
                    <span>Giới hạn số lượng ảnh được chọn</span>
                    <div className={`${styles.switch} ${toggles.limitSelection ? styles.switchOn : ''}`} onClick={() => handleToggle('limitSelection')}>
                      <div className={styles.switchHandle}></div>
                    </div>
                  </div>
                  {toggles.limitSelection && (
                    <div className={styles.subInputGroup}>
                      <input type="number" name="selectionLimit" placeholder="Nhập số lượng ảnh tối đa" value={formData.selectionLimit} onChange={handleInputChange} min="1" required />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className={styles.btnSubmit} disabled={isScanning}>
                  {isScanning ? 'Đang tải...' : 'Tạo ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
