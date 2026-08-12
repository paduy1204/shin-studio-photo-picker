const fs = require('fs');

let content = fs.readFileSync('src/app/album/[id]/page.tsx', 'utf8');

// replace 1
content = content.replace(
  `import { useSwipeable } from 'react-swipeable';`,
  `import { useSwipeable } from 'react-swipeable';\nimport Masonry from 'react-masonry-css';`
);

// replace 2
const oldGrid = `<main className={styles.masonryGrid}>
        {displayImages.length === 0 ? (
          <div style={{textAlign: 'center', gridColumn: '1 / -1', padding: '3rem', color: 'var(--text-muted)'}}>
            Chưa có bức ảnh nào được chọn.
          </div>
        ) : (
          displayImages.map((img) => (
            <div key={img.id} className={styles.masonryItem} onClick={() => openLightbox(img)}>
              <img src={img.url} alt={img.name} loading="lazy" />
              
              <div className={styles.imageOverlay}>
              <div className={styles.topActions}>
                <button 
                  className={\`\${styles.heartBtn} \${img.liked ? styles.active : ''}\`}
                  onClick={(e) => handleHeartClick(e, img.id)}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill={img.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
              </div>
              <div className={styles.bottomInfo}>
                <span className={styles.imageName}>{img.name}</span>
                <div className={styles.bottomActions}>
                  <button className={styles.iconBtn} title="Tải xuống" onClick={(e) => { e.stopPropagation(); window.open(img.url, '_blank'); }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </button>
                  <button className={styles.iconBtn} title="Bình luận" onClick={(e) => { e.stopPropagation(); alert('Tính năng bình luận đang phát triển'); }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </main>`;

const newGrid = `{displayImages.length === 0 ? (
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
                  className={\`\${styles.heartBtn} \${img.liked ? styles.active : ''}\`}
                  onClick={(e) => handleHeartClick(e, img.id)}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill={img.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
              </div>
              <div className={styles.bottomInfo}>
                <span className={styles.imageName}>{img.name}</span>
                <div className={styles.bottomActions}>
                  <button className={styles.iconBtn} title="Tải xuống" onClick={(e) => { e.stopPropagation(); window.open(img.url, '_blank'); }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </button>
                  <button className={styles.iconBtn} title="Bình luận" onClick={(e) => { e.stopPropagation(); alert('Tính năng bình luận đang phát triển'); }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          ))}
        </Masonry>
      )}`;
content = content.replace(oldGrid, newGrid);
fs.writeFileSync('src/app/album/[id]/page.tsx', content);

let contentAdmin = fs.readFileSync('src/app/admin/album/[id]/page.tsx', 'utf8');

contentAdmin = contentAdmin.replace(
  `import { FiImage, FiHeart, FiSettings, FiTrash2, FiDownload, FiEdit2 } from 'react-icons/fi';`,
  `import { FiImage, FiHeart, FiSettings, FiTrash2, FiDownload, FiEdit2 } from 'react-icons/fi';\nimport Masonry from 'react-masonry-css';`
);

const oldGridAdmin = `<div className={styles.masonryGrid}>
        {images.map((img) => (
          <div key={img.id} className={styles.masonryItem}>
            <img src={img.url} alt={img.name} loading="lazy" />
            
            <div className={styles.imageOverlay}>
              <div className={styles.topActions}>
                <div className={\`\${styles.likedBadge} \${img.liked ? styles.active : ''}\`}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill={img.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </div>
              </div>
              <div className={styles.bottomInfo}>
                <span className={styles.imageName}>{img.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>`;

const newGridAdmin = `<Masonry
        breakpointCols={{ default: 3, 1024: 2, 640: 3 }}
        className={styles.myMasonryGrid}
        columnClassName={styles.myMasonryGridColumn}
      >
        {images.map((img) => (
          <div key={img.id} className={styles.masonryItem}>
            <img src={img.url} alt={img.name} loading="lazy" />
            
            <div className={styles.imageOverlay}>
              <div className={styles.topActions}>
                <div className={\`\${styles.likedBadge} \${img.liked ? styles.active : ''}\`}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill={img.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </div>
              </div>
              <div className={styles.bottomInfo}>
                <span className={styles.imageName}>{img.name}</span>
              </div>
            </div>
          </div>
        ))}
      </Masonry>`;

contentAdmin = contentAdmin.replace(oldGridAdmin, newGridAdmin);
fs.writeFileSync('src/app/admin/album/[id]/page.tsx', contentAdmin);
console.log('Update successful!');
