'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
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
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [images, setImages] = useState<any[]>([]);
  const [albumName, setAlbumName] = useState('Chi tiết Album');
  const [mounted, setMounted] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // New states for actions & modals
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // States for Edit Album
  const [editFormData, setEditFormData] = useState({
    driveLink: '',
    name: '',
    client: '',
    slug: '',
    tags: '',
    password: '',
    selectionLimit: '',
  });
  const [editToggles, setEditToggles] = useState({
    allowComments: true,
    watermark: false,
    showNameCard: true,
    passwordProtect: false,
    allowDownload: true,
    limitSelection: false,
  });

  // States for Filter
  const [modalFilterMode, setModalFilterMode] = useState('manual');
  const [filterText, setFilterText] = useState('');
  const [filterFormat, setFilterFormat] = useState('All');
  const [sourceDir, setSourceDir] = useState<any>(null);
  const [destDir, setDestDir] = useState<any>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.dropdownContainer}`)) {
        setIsActionMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);

    const loadAlbumData = async () => {
      const { data: album, error } = await supabase.from('albums').select('*').eq('id', id).single();
      if (album) {
        setAlbumName(album.name);
        setEditFormData({
          driveLink: '',
          name: album.name || '',
          client: album.client || '',
          slug: album.slug || '',
          tags: album.tags || '',
          password: album.password || '',
          selectionLimit: album.selection_limit || '',
        });
        setEditToggles({
          allowComments: album.allow_comments ?? true,
          watermark: album.watermark ?? false,
          showNameCard: album.show_name_card ?? true,
          passwordProtect: album.password_protect ?? false,
          allowDownload: album.allow_download ?? true,
          limitSelection: album.limit_selection ?? false,
        });
      }
    };

    const loadImages = async () => {
      const { data: files, error } = await supabase.from('images').select('*').eq('album_id', id).order('name', { ascending: true });
      if (files && files.length > 0) {
        const formatted = files.map(f => ({
          id: f.id,
          url: `/api/proxy-image?id=${f.id}`,
          name: f.name,
          liked: f.liked || false,
          comment: f.comment || '',
          thumbnailLink: f.thumbnail_link,
          webContentLink: f.web_content_link
        }));
        setImages(formatted);
      } else {
        // Fallback or empty state
        setImages(MOCK_IMAGES);
      }
    };

    loadAlbumData();
    loadImages();
  }, [id]);

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

  const handleToggleLike = async (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Không mở lightbox khi bấm thả tim
    const updatedImages = [...images];
    // Nếu đang ở mode selected thì index truyền vào là index của mảng displayImages, cần tìm index thực sự
    const actualIndex = images.findIndex(img => img.id === displayImages[index].id);
    if (actualIndex > -1) {
      const newLikedState = !updatedImages[actualIndex].liked;
      updatedImages[actualIndex].liked = newLikedState;
      setImages(updatedImages);
      // Save to Supabase
      await supabase.from('images').update({ liked: newLikedState }).eq('id', updatedImages[actualIndex].id);
    }
  };

  const handleUpdateComment = async (imgId: string, text: string) => {
    const updatedImages = [...images];
    const actualIndex = images.findIndex(img => img.id === imgId);
    if (actualIndex > -1) {
      updatedImages[actualIndex].comment = text;
      setImages(updatedImages);
      // Save to Supabase
      await supabase.from('images').update({ comment: text }).eq('id', imgId);
    }
  };

  const handleSyncData = async () => {
    setIsProcessing(true);
    setProgress({ current: 0, total: 100, status: 'Đang đồng bộ dữ liệu từ Google Drive...' });
    try {
      const response = await fetch('/api/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: id }),
      });
      const data = await response.json();
      if (data.success && data.files) {
        const imageInserts = data.files.map((file: any) => {
          const oldFile = images.find((old: any) => old.id === file.id);
          return {
            id: file.id,
            album_id: id,
            name: file.name,
            url: file.webContentLink || '',
            thumbnail_link: file.thumbnailLink,
            web_content_link: file.webContentLink,
            liked: oldFile ? oldFile.liked : false,
            comment: oldFile ? oldFile.comment : ''
          };
        });
        
        // Chunk inserts
        const chunkSize = 500;
        for (let i = 0; i < imageInserts.length; i += chunkSize) {
          const chunk = imageInserts.slice(i, i + chunkSize);
          const { error } = await supabase.from('images').upsert(chunk);
          if (error) console.error(error);
        }

        const formatted = data.files.map((f: any) => {
          const oldFile = images.find((old: any) => old.id === f.id);
          return {
            id: f.id,
            url: `/api/proxy-image?id=${f.id}`,
            name: f.name,
            liked: oldFile ? oldFile.liked : false,
            comment: oldFile ? oldFile.comment : '',
            thumbnailLink: f.thumbnailLink,
            webContentLink: f.webContentLink
          };
        });
        setImages(formatted);
        alert("Đồng bộ dữ liệu thành công! Đã cập nhật ảnh mới nhất.");
      } else {
        throw new Error(data.error || 'Lỗi không xác định');
      }
    } catch (err: any) {
      alert("Đồng bộ thất bại: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    const imagesToDownload = images; // Hoặc `displayImages` nếu muốn tải chỉ những hình đang hiển thị
    if (imagesToDownload.length === 0) return alert("Không có ảnh để tải!");

    setIsProcessing(true);
    setProgress({ current: 0, total: imagesToDownload.length, status: 'Đang chuẩn bị tạo file ZIP...' });

    try {
      const zip = new JSZip();
      let successCount = 0;

      for (let i = 0; i < imagesToDownload.length; i++) {
        const img = imagesToDownload[i];
        setProgress({ current: i + 1, total: imagesToDownload.length, status: `Đang tải: ${img.name}` });

        try {
          const downloadUrl = `/api/proxy-image?id=${img.id}`;
          const response = await fetch(downloadUrl);
          if (!response.ok) throw new Error('Network response was not ok');
          const blob = await response.blob();
          zip.file(img.name, blob);
          successCount++;
        } catch (err) {
          console.error(`Lỗi khi tải ${img.name}:`, err);
        }
      }

      setProgress({ current: successCount, total: imagesToDownload.length, status: 'Đang nén file ZIP, vui lòng đợi...' });
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${albumName || 'Album'}.zip`);
      
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi khi tạo file ZIP.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = async (img: any) => {
    try {
      const downloadUrl = `/api/proxy-image?id=${img.id}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      saveAs(blob, img.name);
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tải hình ảnh. Vui lòng thử lại.");
    }
  };

  const startFiltering = async () => {
    let filesToFilter: string[] = [];
    
    if (modalFilterMode === 'manual') {
      if (!filterText.trim()) {
        alert("Vui lòng nhập danh sách file cần lọc!");
        return;
      }
      filesToFilter = filterText.split(',').map(f => f.trim().split('.')[0]);
    } else if (modalFilterMode === 'liked') {
      const likedImages = images.filter(img => img.liked);
      if (likedImages.length === 0) {
        alert("Không có ảnh yêu thích nào!");
        return;
      }
      filesToFilter = likedImages.map(img => img.name.split('.')[0]);
    } else if (modalFilterMode === 'commented') {
      const commentedImages = images.filter(img => img.comment && img.comment.trim() !== '');
      if (commentedImages.length === 0) {
        alert("Không có ảnh nào có bình luận!");
        return;
      }
      filesToFilter = commentedImages.map(img => img.name.split('.')[0]);
    }

    try {
      if (!sourceDir || !destDir) {
        alert("Vui lòng chọn cả thư mục GỐC và thư mục ĐÍCH trước khi lọc!");
        return;
      }

      setIsProcessing(true);
      setProgress({ current: 0, total: filesToFilter.length, status: 'Đang copy các file...' });

      let successCount = 0;
      let notFoundCount = 0;
      
      // Lấy danh sách tất cả file từ thư mục nguồn
      const allSourceFiles = [];
      for await (const entry of sourceDir.values()) {
        if (entry.kind === 'file') {
          allSourceFiles.push(entry);
        }
      }

      for (let i = 0; i < filesToFilter.length; i++) {
        const fileName = filesToFilter[i];
        if (!fileName) continue;
        
        setProgress({ current: i + 1, total: filesToFilter.length, status: `Đang xử lý: ${fileName}` });
        
        // Tìm file khớp tên trong thư mục nguồn
        const matchingFiles = allSourceFiles.filter((entry: any) => {
          const nameWithoutExt = entry.name.split('.')[0];
          const ext = entry.name.split('.').pop().toLowerCase();
          
          if (nameWithoutExt !== fileName) return false;
          
          if (filterFormat === 'All') return true;
          if (filterFormat === 'JPEG' && ['jpg', 'jpeg'].includes(ext)) return true;
          if (filterFormat === 'PNG' && ext === 'png') return true;
          if (filterFormat === 'RAW' && ['cr2', 'cr3', 'nef', 'arw', 'dng', 'raw'].includes(ext)) return true;
          
          return false;
        });

        if (matchingFiles.length > 0) {
          for (const matchingFile of matchingFiles) {
            try {
              const file = await matchingFile.getFile();
              const newFileHandle = await destDir.getFileHandle(matchingFile.name, { create: true });
              const writable = await newFileHandle.createWritable();
              await writable.write(file);
              await writable.close();
              successCount++;
            } catch (err) {
              console.error(`Không thể copy file: ${matchingFile.name}`, err);
            }
          }
        } else {
          notFoundCount++;
        }
      }

      alert(`Đã hoàn tất!\n- Copy thành công: ${successCount} file ảnh\n- Không tìm thấy: ${notFoundCount} file ảnh`);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        alert("Lỗi truy cập hệ thống file. Vui lòng thử lại trên trình duyệt Chrome/Edge mới nhất.");
        console.error(error);
      }
    } finally {
      setIsProcessing(false);
      setIsFilterModalOpen(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let newFolderId = id;

    if (editFormData.driveLink.trim()) {
      const match = editFormData.driveLink.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        newFolderId = match[1];
      } else {
        alert('Link Google Drive không đúng định dạng. Cần link thư mục (chứa /folders/)');
        return;
      }

      if (newFolderId !== id) {
        setIsProcessing(true);
        setProgress({ current: 0, total: 100, status: 'Đang cập nhật ảnh từ thư mục Drive mới...' });
        try {
          const response = await fetch('/api/drive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderId: newFolderId }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);

          const imageInserts = data.files.map((file: any) => ({
            id: file.id,
            album_id: newFolderId,
            name: file.name,
            url: file.webContentLink || '', // fallback
            thumbnail_link: file.thumbnailLink,
            web_content_link: file.webContentLink
          }));
          
          const chunkSize = 500;
          for (let i = 0; i < imageInserts.length; i += chunkSize) {
            const chunk = imageInserts.slice(i, i + chunkSize);
            await supabase.from('images').upsert(chunk);
          }
        } catch (err: any) {
          alert("Lỗi khi tải Drive mới: " + err.message);
          setIsProcessing(false);
          return;
        } finally {
          setIsProcessing(false);
        }
      }
    }

    const { error } = await supabase.from('albums').upsert({
      id: newFolderId,
      name: editFormData.name,
      client: editFormData.client,
      slug: editFormData.slug,
      tags: editFormData.tags,
      password: editFormData.password,
      selection_limit: editFormData.selectionLimit,
      allow_comments: editToggles.allowComments,
      watermark: editToggles.watermark,
      show_name_card: editToggles.showNameCard,
      password_protect: editToggles.passwordProtect,
      allow_download: editToggles.allowDownload,
      limit_selection: editToggles.limitSelection
    });

    if (error) {
      alert('Lỗi lưu album: ' + error.message);
      return;
    }

    if (newFolderId !== id) {
       await supabase.from('albums').delete().eq('id', id);
    }

    setAlbumName(editFormData.name);
    alert('Đã lưu thay đổi album thành công!');
    setIsEditModalOpen(false);

    if (newFolderId !== id) {
      router.push(`/admin/album/${newFolderId}`);
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
          <span className={styles.albumTitle}>{mounted ? albumName : 'Đang tải...'}</span>
        </div>
        
        <div className={styles.navRight}>
          <button className={styles.navIconBtn} onClick={handleSyncData} title="Đồng bộ dữ liệu">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          </button>

          <div className={styles.dropdownContainer}>
            <button className={styles.dropdownBtn} onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              Tác vụ
            </button>

            {isActionMenuOpen && (
              <div className={styles.dropdownMenu}>
                <button className={styles.dropdownItem} onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/album/' + id);
                  alert('Đã copy link chia sẻ Album!');
                  setIsActionMenuOpen(false);
                }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  Chia sẻ album
                </button>
                <button className={styles.dropdownItem} onClick={() => {
                  setIsFilterModalOpen(true);
                  setIsActionMenuOpen(false);
                }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                  Lọc file trên máy tính
                </button>
                <button className={`${styles.dropdownItem} ${styles.disabled}`} onClick={() => setIsActionMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM12 7v3m0 0v3m0-3h3m-3 0H9"></path></svg>
                  Nhận diện khuôn mặt
                </button>
                <button className={`${styles.dropdownItem} ${styles.disabled}`} onClick={() => setIsActionMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4-10z"></path></svg>
                  Tạo website
                </button>
                <button className={styles.dropdownItem} onClick={() => {
                  setIsExportModalOpen(true);
                  setIsActionMenuOpen(false);
                }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  Xem danh sách
                </button>
                <button className={styles.dropdownItem} onClick={() => {
                  handleDownloadAll();
                  setIsActionMenuOpen(false);
                }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Tải xuống
                </button>
                <div style={{borderTop: '1px solid var(--border)', margin: '4px 0'}}></div>
                <button className={styles.dropdownItem} style={{color: '#ef4444'}} onClick={async () => {
                  if (confirm("Bạn có chắc chắn muốn xóa album này?")) {
                    const saved = localStorage.getItem('shinstudio_albums');
                    if (saved) {
                      const albums = JSON.parse(saved);
                      const updated = albums.filter((a: any) => a.id !== id);
                      localStorage.setItem('shinstudio_albums', JSON.stringify(updated));
                    }
                    await supabase.from('albums').delete().eq('id', id);
                    window.location.href = '/admin';
                  }
                }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  Xóa album
                </button>
              </div>
            )}
          </div>

          <button className={styles.btnEdit} onClick={() => {
            const loadCurrentEditData = async () => {
              const { data: album } = await supabase.from('albums').select('*').eq('id', id).single();
              if (album) {
                setEditFormData({
                  driveLink: '',
                  name: album.name || '',
                  client: album.client || '',
                  slug: album.slug || '',
                  tags: album.tags || '',
                  password: album.password || '',
                  selectionLimit: album.selection_limit || '',
                });
                setEditToggles({
                  allowComments: album.allow_comments ?? true,
                  watermark: album.watermark ?? false,
                  showNameCard: album.show_name_card ?? true,
                  passwordProtect: album.password_protect ?? false,
                  allowDownload: album.allow_download ?? true,
                  limitSelection: album.limit_selection ?? false,
                });
                setIsEditModalOpen(true);
              }
            }
            setIsEditModalOpen(true);
          }}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            Tùy chỉnh
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
          displayImages.map((img, index) => (
            <div 
              key={img.id} 
              className={`${styles.masonryItem} ${img.liked ? styles.selected : ''}`}
              onClick={() => setLightboxIndex(index)}
            >
              <img src={img.url} alt={img.name} loading="lazy" />
              <div className={styles.imageOverlay}>
                <div className={styles.topActions}>
                  <div 
                    className={`${styles.likedBadge} ${img.liked ? styles.active : ''}`} 
                    onClick={(e) => handleToggleLike(e, index)}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </div>
                </div>
                <div className={styles.bottomInfo}>
                  <span>{img.name}</span>
                  {img.comment && <div style={{fontSize: '0.8rem', opacity: 0.8, marginTop: '2px'}}>Có ghi chú</div>}
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
            <h3 style={{marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--foreground)'}}>Đang xử lý...</h3>
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

      {/* Lightbox */}
      {lightboxIndex !== null && displayImages[lightboxIndex] && (
        <div className={styles.lightboxOverlay}>
          <button className={styles.closeBtn} style={{position: 'absolute', top: '20px', left: '20px', color: 'white', zIndex: 2001}} onClick={() => setLightboxIndex(null)}>✕ Trở về</button>
          
          <div className={styles.lightboxContent} onClick={() => setLightboxIndex(null)}>
            <img 
              src={`/api/proxy-image?id=${displayImages[lightboxIndex].id}`} 
              alt={displayImages[lightboxIndex].name} 
              className={styles.lightboxImage} 
              onClick={(e) => e.stopPropagation()}
            />

            {/* Điều hướng Trái Phải */}
            {lightboxIndex > 0 && (
              <button style={{position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}>❮</button>
            )}
            {lightboxIndex < displayImages.length - 1 && (
              <button style={{position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}>❯</button>
            )}
          </div>

          <div className={styles.lightboxSidebar}>
            <div className={styles.lightboxSidebarHeader}>
              <h3>{displayImages[lightboxIndex].name}</h3>
              <div 
                className={`${styles.likedBadge} ${displayImages[lightboxIndex].liked ? styles.active : ''}`} 
                onClick={(e) => handleToggleLike(e, lightboxIndex)}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
            </div>
            
            <div className={styles.lightboxComments}>
              <div style={{marginBottom: '1rem', fontWeight: 600}}>Ghi chú của khách / admin:</div>
              {displayImages[lightboxIndex].comment ? (
                <div style={{padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', marginBottom: '1rem'}}>
                  {displayImages[lightboxIndex].comment}
                </div>
              ) : (
                <div style={{color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem'}}>Chưa có ghi chú nào.</div>
              )}
            </div>

            <div className={styles.commentInputGroup}>
              <textarea 
                placeholder="Nhập ghi chú cho ảnh này (Yêu cầu chỉnh sửa, retouch...)" 
                rows={3}
                defaultValue={displayImages[lightboxIndex].comment}
                onBlur={(e) => handleUpdateComment(displayImages[lightboxIndex].id, e.target.value)}
              />
              <button className={styles.btnDownload} onClick={() => handleDownloadSingle(displayImages[lightboxIndex])} style={{width: '100%', justifyContent: 'center'}}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Tải ảnh này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Album */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Chỉnh sửa album</h2>
              <button className={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Link thư mục Google Drive mới (Để trống nếu không đổi)</label>
                <input type="text" name="driveLink" placeholder="https://drive.google.com/drive/folders/..." value={editFormData.driveLink} onChange={(e) => setEditFormData({...editFormData, driveLink: e.target.value})} />
              </div>

              <div className={styles.formGroup}>
                <label>Tên album <span style={{color: 'red'}}>*</span></label>
                <input type="text" name="name" placeholder="Tên album" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} required />
              </div>

              <div className={styles.formGroup}>
                <label>Tên khách hàng <span style={{color: 'red'}}>*</span></label>
                <input type="text" name="client" placeholder="Tên khách hàng" value={editFormData.client} onChange={(e) => setEditFormData({...editFormData, client: e.target.value})} required />
              </div>

              <div className={styles.formGroup}>
                <label>Tên miền album</label>
                <div className={styles.domainInput}>
                  <span className={styles.domainPrefix}>shinstudio.vn/</span>
                  <input type="text" name="slug" placeholder="Nhập tên miền album (tùy chọn)" value={editFormData.slug} onChange={(e) => setEditFormData({...editFormData, slug: e.target.value})} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Tags</label>
                <div className={styles.inputWithIcon}>
                  <input type="text" name="tags" placeholder="Nhập tag" value={editFormData.tags} onChange={(e) => setEditFormData({...editFormData, tags: e.target.value})} />
                  <div className={styles.iconBtn}>+</div>
                </div>
              </div>

              <div className={styles.toggleList}>
                <div className={styles.toggleItem}>
                  <span>Cho phép bình luận</span>
                  <div className={`${styles.switch} ${editToggles.allowComments ? styles.switchOn : ''}`} onClick={() => setEditToggles(p => ({...p, allowComments: !p.allowComments}))}>
                    <div className={styles.switchHandle}></div>
                  </div>
                </div>
                
                <div className={styles.toggleItem}>
                  <span>Bật watermark</span>
                  <div className={`${styles.switch} ${editToggles.watermark ? styles.switchOn : ''}`} onClick={() => setEditToggles(p => ({...p, watermark: !p.watermark}))}>
                    <div className={styles.switchHandle}></div>
                  </div>
                </div>

                <div className={styles.toggleItem}>
                  <span>Hiện Name Card</span>
                  <div className={`${styles.switch} ${editToggles.showNameCard ? styles.switchOn : ''}`} onClick={() => setEditToggles(p => ({...p, showNameCard: !p.showNameCard}))}>
                    <div className={styles.switchHandle}></div>
                  </div>
                </div>

                <div className={styles.toggleItemWrapper}>
                  <div className={styles.toggleItem}>
                    <span>Bảo vệ album bằng mật khẩu</span>
                    <div className={`${styles.switch} ${editToggles.passwordProtect ? styles.switchOn : ''}`} onClick={() => setEditToggles(p => ({...p, passwordProtect: !p.passwordProtect}))}>
                      <div className={styles.switchHandle}></div>
                    </div>
                  </div>
                  {editToggles.passwordProtect && (
                    <div className={styles.subInputGroup}>
                      <input type="text" name="password" placeholder="Nhập mật khẩu truy cập album" value={editFormData.password} onChange={(e) => setEditFormData({...editFormData, password: e.target.value})} required />
                    </div>
                  )}
                </div>

                <div className={styles.toggleItem}>
                  <span>Cho phép tải xuống</span>
                  <div className={`${styles.switch} ${editToggles.allowDownload ? styles.switchOn : ''}`} onClick={() => setEditToggles(p => ({...p, allowDownload: !p.allowDownload}))}>
                    <div className={styles.switchHandle}></div>
                  </div>
                </div>

                <div className={styles.toggleItemWrapper}>
                  <div className={styles.toggleItem}>
                    <span>Giới hạn số lượng ảnh được chọn</span>
                    <div className={`${styles.switch} ${editToggles.limitSelection ? styles.switchOn : ''}`} onClick={() => setEditToggles(p => ({...p, limitSelection: !p.limitSelection}))}>
                      <div className={styles.switchHandle}></div>
                    </div>
                  </div>
                  {editToggles.limitSelection && (
                    <div className={styles.subInputGroup}>
                      <input type="number" name="selectionLimit" placeholder="Nhập số lượng ảnh tối đa" value={editFormData.selectionLimit} onChange={(e) => setEditFormData({...editFormData, selectionLimit: e.target.value})} min="1" required />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsEditModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className={styles.btnSubmit}>Chỉnh sửa</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Filter Album */}
      {isFilterModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !isProcessing && setIsFilterModalOpen(false)}>
          <div className={styles.modalContainer} style={{ width: '550px' }} onClick={e => e.stopPropagation()}>
            {isProcessing ? (
              <div className={styles.processingContent}>
                <div className={styles.spinner}></div>
                <h3 style={{marginTop: '1.5rem', color: 'var(--foreground)'}}>{progress.status}</h3>
                <p style={{marginTop: '0.5rem', color: 'var(--text-muted)'}}>
                  Đang copy file: <strong>{progress.current}</strong> / {progress.total}
                </p>
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <h2>Lọc ảnh trên máy tính</h2>
                  <button className={styles.closeBtn} onClick={() => setIsFilterModalOpen(false)}>✕</button>
                </div>
                
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>Vui lòng chọn mục bạn muốn lọc:</label>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem', marginBottom: '1rem'}}>
                      <label className={styles.radioLabel}>
                        <input type="radio" name="modalFilterMode" value="manual" checked={modalFilterMode === 'manual'} onChange={(e) => setModalFilterMode(e.target.value)} />
                        Tự nhập...
                      </label>
                      <label className={styles.radioLabel}>
                        <input type="radio" name="modalFilterMode" value="liked" checked={modalFilterMode === 'liked'} onChange={(e) => setModalFilterMode(e.target.value)} />
                        Ảnh yêu thích
                      </label>
                      <label className={styles.radioLabel}>
                        <input type="radio" name="modalFilterMode" value="commented" checked={modalFilterMode === 'commented'} onChange={(e) => setModalFilterMode(e.target.value)} />
                        Ảnh có bình luận
                      </label>
                    </div>
                  </div>

                  {modalFilterMode === 'manual' && (
                    <div className={styles.formGroup}>
                      <textarea 
                        className={styles.textArea} 
                        rows={4} 
                        placeholder="Nhập tên file ảnh cần lọc (cách nhau bởi dấu phẩy)"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                      ></textarea>
                    </div>
                  )}

                  <div className={styles.formGroup} style={{marginTop: '1.5rem', marginBottom: '1rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                      <label style={{marginBottom: 0}}>Định dạng file muốn lọc</label>
                      <select 
                        style={{padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', minWidth: '150px'}}
                        value={filterFormat}
                        onChange={(e) => setFilterFormat(e.target.value)}
                      >
                        <option value="All">All</option>
                        <option value="JPEG">JPEG (.jpg, .jpeg)</option>
                        <option value="PNG">PNG (.png)</option>
                        <option value="RAW">RAW (.cr2, .nef, .arw...)</option>
                      </select>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                      <label style={{marginBottom: 0}}>Chọn thư mục chứa ảnh cần lọc</label>
                      <button 
                        type="button"
                        onClick={async () => {
                          if (!('showDirectoryPicker' in window)) return alert("Trình duyệt không hỗ trợ");
                          try {
                            const handle = await (window as any).showDirectoryPicker();
                            setSourceDir(handle);
                          } catch (e) { console.log(e); }
                        }}
                        style={{padding: '8px 16px', borderRadius: '4px', background: sourceDir ? '#10b981' : '#ef4444', color: 'white', border: 'none', cursor: 'pointer'}}
                      >
                        {sourceDir ? 'Đã chọn thư mục' : 'Chọn thư mục'}
                      </button>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <label style={{marginBottom: 0}}>Chọn thư mục chứa ảnh sau khi lọc</label>
                      <button 
                        type="button"
                        onClick={async () => {
                          if (!('showDirectoryPicker' in window)) return alert("Trình duyệt không hỗ trợ");
                          try {
                            const handle = await (window as any).showDirectoryPicker();
                            setDestDir(handle);
                          } catch (e) { console.log(e); }
                        }}
                        style={{padding: '8px 16px', borderRadius: '4px', background: destDir ? '#10b981' : '#ef4444', color: 'white', border: 'none', cursor: 'pointer'}}
                      >
                        {destDir ? 'Đã chọn thư mục' : 'Chọn thư mục'}
                      </button>
                    </div>
                  </div>

                  <div style={{display: 'flex', justifyContent: 'center', marginTop: '2rem'}}>
                    <button 
                      onClick={startFiltering}
                      style={{padding: '10px 24px', borderRadius: '4px', background: 'var(--border)', color: 'var(--foreground)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600}}
                    >
                      Bắt đầu lọc
                    </button>
                  </div>

                  <div className={styles.formGroup} style={{marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                    <p>Tính năng này chỉ hoạt động tốt nhất trên trình duyệt Chrome hoặc Edge.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
