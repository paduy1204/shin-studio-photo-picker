const fs = require('fs');

// 1. Update TSX
let page = fs.readFileSync('src/app/album/[id]/page.tsx', 'utf8');

// Remove swipeable
page = page.replace("import { useSwipeable } from 'react-swipeable';\n", "");
const handlersRegex = /const handlers = useSwipeable\(\{\s*onSwipedLeft: \(\) => handleNext\(\),\s*onSwipedRight: \(\) => handlePrev\(\),\s*trackMouse: true\s*\}\);\s*/g;
page = page.replace(handlersRegex, "");
page = page.replace("<div className={styles.lightboxContent} onClick={closeLightbox} {...handlers}>", "<div className={styles.lightboxContent} onClick={closeLightbox}>");

// Replace actions
const oldActions = `<div className={styles.lightboxActions} onClick={(e) => e.stopPropagation()}>
              <button 
                className={\`\${styles.lightboxHeart} \${images.find(img => img.id === lightboxImg.id)?.liked ? styles.active : ''}\`}
                onClick={(e) => {
                  handleHeartClick(e, lightboxImg.id);
                  // Cập nhật lại lightboxImg state cục bộ nếu cần, 
                  // nhưng vì ta lấy state trực tiếp từ mảng images thông qua id nên nút sẽ tự update.
                }}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill={images.find(img => img.id === lightboxImg.id)?.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                {images.find(img => img.id === lightboxImg.id)?.liked ? "Đã chọn" : "Chọn ảnh này"}
              </button>
              
              <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 0.5rem' }}></div>
              
              <button onClick={() => window.open(lightboxImg.url, '_blank')}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Tải xuống
              </button>
              
              <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 0.5rem' }}></div>
              
              <button>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                Viết bình luận
              </button>
            </div>`;

const newActions = `<div className={styles.lightboxActions} onClick={(e) => e.stopPropagation()}>
              <button 
                className={\`\${styles.iconActionBtn} \${images.find(img => img.id === lightboxImg.id)?.liked ? styles.activeHeart : ''}\`}
                onClick={(e) => handleHeartClick(e, lightboxImg.id)}
                title="Chọn ảnh này"
              >
                <svg viewBox="0 0 24 24" width="28" height="28" fill={images.find(img => img.id === lightboxImg.id)?.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
              
              <button className={styles.iconActionBtn} onClick={() => window.open(lightboxImg.url, '_blank')} title="Tải xuống">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </button>
              
              <button className={styles.iconActionBtn} onClick={() => alert('Tính năng bình luận đang phát triển')} title="Viết bình luận">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </button>
            </div>`;

page = page.replace(oldActions, newActions);
fs.writeFileSync('src/app/album/[id]/page.tsx', page);
console.log('page.tsx updated');

// 2. Update CSS
let css = fs.readFileSync('src/app/album/[id]/page.module.css', 'utf8');
css = css.replace(`@media (max-width: 640px) {
  .lightboxNav {
    display: none; /* Hide arrows on mobile since we have swipe */
  }
}`, '');

// Make .lightboxActions horizontal on mobile again (undo the vertical stacking from before)
css = css.replace(`  .lightboxActions {
    flex-direction: column;
    gap: 0.8rem;
    border-radius: 15px;
    padding: 1rem;
    width: 90%;
  }`, `  .lightboxActions {
    flex-direction: row;
    justify-content: center;
    gap: 1.5rem;
    padding: 1rem;
    border-radius: 30px;
    width: auto;
  }`);

const cssAppends = `
.iconActionBtn {
  background: transparent;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}
.iconActionBtn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}
.iconActionBtn.activeHeart {
  color: var(--heart);
}
`;

fs.writeFileSync('src/app/album/[id]/page.module.css', css + cssAppends);
console.log('page.module.css updated');
