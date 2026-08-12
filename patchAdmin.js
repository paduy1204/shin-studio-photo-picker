const fs = require('fs');

// 1. UPDATE ADMIN TSX
let page = fs.readFileSync('src/app/admin/album/[id]/page.tsx', 'utf8');

if (!page.includes("import Masonry from 'react-masonry-css';")) {
  page = page.replace(
    "import { useParams, useRouter } from 'next/navigation';",
    "import { useParams, useRouter } from 'next/navigation';\nimport Masonry from 'react-masonry-css';"
  );
}

// Add handleSetCoverImage function
const handleSetCoverFunc = `
  const handleSetCoverImage = async (img: any) => {
    const coverUrl = img.thumbnailLink || img.webContentLink || img.url;
    const { error } = await supabase.from('albums').update({ cover_image_url: coverUrl }).eq('id', id);
    if (error) {
      alert("Lỗi khi đặt ảnh bìa: " + error.message);
    } else {
      alert("Đã đặt ảnh " + img.name + " làm ảnh bìa Album thành công!");
    }
  };
`;

if (!page.includes("handleSetCoverImage")) {
  page = page.replace("const handleDownloadSingle = async (img: any) => {", handleSetCoverFunc + "\n  const handleDownloadSingle = async (img: any) => {");
}

// Replace Admin Main Grid with Masonry
const oldGrid = `<main className={styles.masonryGrid}>
        {displayImages.length === 0 ? (
          <div style={{textAlign: 'center', gridColumn: '1 / -1', padding: '3rem', color: 'var(--text-muted)'}}>
            Không có ảnh nào.
          </div>
        ) : (
          displayImages.map((img, index) => (
            <div 
              key={img.id} 
              className={\`\${styles.masonryItem} \${img.liked ? styles.selected : ''}\`}
              onClick={() => setLightboxIndex(index)}
            >
              <img src={img.url} alt={img.name} loading="lazy" />
              <div className={styles.imageOverlay}>
                <div className={styles.topActions}>
                  <div 
                    className={\`\${styles.likedBadge} \${img.liked ? styles.active : ''}\`} 
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
      </main>`;

const newGrid = `{displayImages.length === 0 ? (
        <div style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
          Không có ảnh nào.
        </div>
      ) : (
        <Masonry
          breakpointCols={{ default: 4, 1200: 3, 800: 2, 500: 1 }}
          className={styles.myMasonryGrid}
          columnClassName={styles.myMasonryGridColumn}
        >
          {displayImages.map((img, index) => (
            <div 
              key={img.id} 
              className={\`\${styles.masonryItem} \${img.liked ? styles.selected : ''}\`}
              onClick={() => setLightboxIndex(index)}
            >
              <img src={img.url} alt={img.name} loading="lazy" />
              <div className={styles.imageOverlay}>
                <div className={styles.topActions}>
                  <div 
                    className={\`\${styles.likedBadge} \${img.liked ? styles.active : ''}\`} 
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
          ))}
        </Masonry>
      )}`;

page = page.replace(oldGrid, newGrid);

// Add "Đặt làm ảnh bìa" button to Admin Lightbox
const oldLightboxBtn = `<button className={styles.btnDownload} onClick={() => handleDownloadSingle(displayImages[lightboxIndex])} style={{width: '100%', justifyContent: 'center'}}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Tải ảnh này
              </button>`;

const newLightboxBtn = `<button 
                className={styles.btnPrimary} 
                onClick={() => handleSetCoverImage(displayImages[lightboxIndex])} 
                style={{width: '100%', justifyContent: 'center', marginBottom: '0.5rem', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '10px'}}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                Đặt làm ảnh bìa Album
              </button>
              <button className={styles.btnDownload} onClick={() => handleDownloadSingle(displayImages[lightboxIndex])} style={{width: '100%', justifyContent: 'center'}}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Tải ảnh này
              </button>`;

page = page.replace(oldLightboxBtn, newLightboxBtn);

fs.writeFileSync('src/app/admin/album/[id]/page.tsx', page);
console.log('Admin page updated successfully');

// 2. UPDATE ADMIN CSS
let css = fs.readFileSync('src/app/admin/album/[id]/page.module.css', 'utf8');

// Replace corrupted masonry grid CSS in admin module css
const adminCssFix = `
.myMasonryGrid {
  display: flex;
  margin-left: -12px;
  width: auto;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}
.myMasonryGridColumn {
  padding-left: 12px;
  background-clip: padding-box;
}
.masonryItem {
  margin-bottom: 12px;
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  height: auto !important;
  flex-grow: 0 !important;
  animation: fade-in-up 0.5s ease-out;
}
.masonryItem img {
  width: 100% !important;
  min-width: 100% !important;
  height: auto !important;
  display: block;
  transition: transform 0.3s ease;
}
`;

fs.appendFileSync('src/app/admin/album/[id]/page.module.css', adminCssFix);
console.log('Admin CSS updated successfully');
