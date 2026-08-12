'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import styles from './page.module.css';

export default function ConceptManagementPage() {
  const router = useRouter();
  const [images, setImages] = useState<any[]>([]);
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [hiddenTags, setHiddenTags] = useState<string[]>([]);
  const [driveLinkInput, setDriveLinkInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🛡️ AUTH GUARD: Kiểm tra xem đã đăng nhập chưa
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    loadConceptData();
  }, [router]);

  const loadConceptData = async () => {
    try {
      setLoading(true);
      const conceptAlbumId = 'master-concept';

      // 1. Tải danh sách nhãn bị ẩn
      const { data: album } = await supabase
        .from('albums')
        .select('*')
        .eq('id', conceptAlbumId)
        .maybeSingle();

      if (album && album.tags) {
        try {
          const parsed = JSON.parse(album.tags);
          if (Array.isArray(parsed)) {
            setHiddenTags(parsed);
          }
        } catch {
          // Ignore if tags is string
        }
      }

      // 2. Tải danh sách ảnh concept
      const { data: files } = await supabase
        .from('images')
        .select('*')
        .eq('album_id', conceptAlbumId)
        .order('name', { ascending: true })
        .range(0, 10000);

      if (files && files.length > 0) {
        const formatted = files.map((f: any) => {
          const match = f.name.match(/^\[(.*?)\]/);
          const tag = match ? match[1] : '';
          return { ...f, tag };
        });
        setImages(formatted);
        const tags = Array.from(new Set(formatted.map((f: any) => f.tag).filter((t: any) => t && t.trim() !== '')));
        setTagsList(tags as string[]);
      } else {
        setImages([]);
        setTagsList([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Concept:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTagVisibility = async (tag: string) => {
    let newHidden = [...hiddenTags];
    if (newHidden.includes(tag)) {
      newHidden = newHidden.filter(t => t !== tag);
    } else {
      newHidden.push(tag);
    }
    setHiddenTags(newHidden);

    const conceptAlbumId = 'master-concept';
    await supabase.from('albums').upsert({
      id: conceptAlbumId,
      name: 'MẪU CONCEPT SHIN STUDIO',
      client: 'Shin Studio Concept Showcase',
      slug: 'concepts',
      tags: JSON.stringify(newHidden)
    });
  };

  const handleCopyMasterLink = () => {
    const url = 'https://shin-studio-photo-picker.vercel.app/concepts';
    navigator.clipboard.writeText(url);
    alert('📋 Đã sao chép Master Link thành công!\n\nLink: ' + url + '\n\nBạn có thể dán (Paste) để gửi ngay cho khách hàng xem.');
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
        tags: JSON.stringify(hiddenTags),
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

      alert(`Đồng bộ thành công ${data.files.length} ảnh Concept Mẫu cho Shin Studio!`);
      setIsModalOpen(false);
      setDriveLinkInput('');
      loadConceptData();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className={styles.navLogo} />
          </Link>
          <div className={styles.navTitle}>
            <span>QUẢN LÝ ALBUM CONCEPT MẪU</span>
          </div>
        </div>
        <div className={styles.navRight}>
          <button onClick={handleCopyMasterLink} className={styles.btnMasterLink} style={{ background: 'var(--primary)', color: 'white', cursor: 'pointer' }}>
            📋 Sao Chép Master Link Gửi Khách
          </button>
          <Link href="/concepts" target="_blank" className={styles.btnMasterLink}>
            👁️ Xem Trước Trang Khách (/concepts)
          </Link>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.dashboardCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Album Concept Mẫu Độc Quyền (Shin Studio)</h2>
              <p className={styles.cardSub}>
                Bấm vào biểu tượng mắt 👁️/🙈 bên dưới từng danh mục để **Ẩn/Hiện thủ công** mục concept không muốn cho khách thấy.
              </p>
            </div>
            <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
              ⚙️ Cập Nhật / Đổi Link Drive Concept
            </button>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>{loading ? '...' : images.length}</span>
              <span className={styles.statLabel}>Tổng số ảnh mẫu</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>{loading ? '...' : tagsList.filter(t => !hiddenTags.includes(t)).length}</span>
              <span className={styles.statLabel}>Số danh mục Đang Hiện</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber} style={{ fontSize: '1rem', color: '#10b981' }}>Đang Hoạt Động</span>
              <span className={styles.statLabel}>Trạng thái Master Link</span>
            </div>
          </div>

          {tagsList.length > 0 && (
            <div className={styles.tagsContainer}>
              <span className={styles.tagsTitle}>Quản lý Ẩn/Hiện Danh Mục Concept (Bấm để đổi trạng thái):</span>
              <div className={styles.tagPills}>
                {tagsList.map(tag => {
                  const isHidden = hiddenTags.includes(tag);
                  const count = images.filter(img => img.tag === tag).length;
                  return (
                    <button
                      key={tag}
                      onClick={() => handleToggleTagVisibility(tag)}
                      className={styles.tagBadge}
                      style={{
                        background: isHidden ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        borderColor: isHidden ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                        color: isHidden ? '#ef4444' : '#10b981',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <span>{isHidden ? '🙈' : '👁️'}</span>
                      <span style={{ textDecoration: isHidden ? 'line-through' : 'none' }}>
                        📁 {tag} ({count} ảnh)
                      </span>
                      <small style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                        ({isHidden ? 'Đã Ẩn' : 'Đang Hiện'})
                      </small>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={styles.guideCard}>
          <h3>💡 Cách Thêm / Xóa / Chỉnh sửa Mục Concept Mẫu:</h3>
          <ol className={styles.guideList}>
            <li>Mở thư mục Google Drive của Studio chứa các ảnh mẫu.</li>
            <li><strong>Thêm mục mới (ví dụ: NOEL VÀ TẾT):</strong> Tạo thư mục con tên <code>NOEL VÀ TẾT</code> và thả ảnh vào.</li>
            <li><strong>Ẩn mục không muốn cho khách xem:</strong> Bấm vào nút 👁️ của danh mục đó ở trên để đổi sang 🙈 <strong>Đã Ẩn</strong>!</li>
            <li>Sau khi chỉnh sửa trên Drive, bấm nút <strong>"⚙️ Cập Nhật / Đổi Link Drive Concept"</strong> ở trên để đồng bộ lại web!</li>
          </ol>
        </div>
      </main>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Cập Nhật Link Drive Concept Mẫu</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSyncSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Link Google Drive Thư Mục Concept Mẫu <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  placeholder="Dán Link Google Drive thư mục chứa các thư mục con BEAUTY, BẦU, COUPLE..."
                  value={driveLinkInput}
                  onChange={e => setDriveLinkInput(e.target.value)}
                  required
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className={styles.btnSubmit} disabled={isSyncing}>
                  {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
