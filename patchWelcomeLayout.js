const fs = require('fs');

// 1. UPDATE PAGE.TSX
let page = fs.readFileSync('src/app/album/[id]/page.tsx', 'utf8');

const oldWelcomeJsx = `<div className={styles.welcomeContent}>
            {/* Brand Logo */}
            <div className={styles.welcomeBrand}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
              <span>Shin Studio</span>
            </div>

            {/* Tên Album */}
            <h1 className={styles.welcomeTitle}>Album {albumName}</h1>
            
            {albumClient && albumClient !== albumName && (
              <p className={styles.welcomeClient}>{albumClient}</p>
            )}
            
            <p className={styles.welcomeSub}>
              {images.length > 0 ? \`\${images.length} bức ảnh tuyệt đẹp đang chờ bạn chọn\` : 'Đang tải bộ ảnh...'}
            </p>

            {/* Nút Xem Album */}
            <button
              className={styles.welcomeBtn}
              onClick={() => setShowWelcome(false)}
              disabled={images.length === 0}
            >
              {images.length === 0 ? (
                <><span className={styles.spinnerSmall} /> Đang tải...</>
              ) : (
                <>Xem Album</>
              )}
            </button>
          </div>`;

const newWelcomeJsx = `<!-- Top Logo -->
          <div className={styles.welcomeBrandTop}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
            <span>Shin Studio</span>
          </div>

          <!-- Bottom Actions Box -->
          <div className={styles.welcomeBottomBox}>
            <h1 className={styles.welcomeTitle}>Album {albumName}</h1>
            
            {albumClient && albumClient !== albumName && (
              <p className={styles.welcomeClient}>{albumClient}</p>
            )}
            
            <p className={styles.welcomeSub}>
              {images.length > 0 ? \`\${images.length} bức ảnh tuyệt đẹp đang chờ bạn chọn\` : 'Đang tải bộ ảnh...'}
            </p>

            <button
              className={styles.welcomeBtn}
              onClick={() => setShowWelcome(false)}
              disabled={images.length === 0}
            >
              {images.length === 0 ? (
                <><span className={styles.spinnerSmall} /> Đang tải...</>
              ) : (
                <>Xem Album</>
              )}
            </button>
          </div>`;

// Replace comments syntax in JSX
page = page.replace(oldWelcomeJsx, newWelcomeJsx.replace(/<!--/g, '{/*').replace(/-->/g, '*/}'));
fs.writeFileSync('src/app/album/[id]/page.tsx', page);
console.log('page.tsx updated with top/bottom split layout');

// 2. UPDATE PAGE.MODULE.CSS
let css = fs.readFileSync('src/app/album/[id]/page.module.css', 'utf8');

const welcomeOverlayIdx = css.indexOf('/* ====== FULLSCREEN HERO WELCOME PAGE (SHOTPIK STYLE) ====== */');
if (welcomeOverlayIdx !== -1) {
  css = css.substring(0, welcomeOverlayIdx);
}

const splitWelcomeCss = `
/* ====== FULLSCREEN HERO WELCOME PAGE (SPLIT TOP / BOTTOM) ====== */
.welcomeOverlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  background: #0a0a0a;
}

.welcomeBg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.85);
  transform: scale(1.02);
  transition: transform 10s ease;
}

.welcomeOverlay:hover .welcomeBg {
  transform: scale(1.06);
}

/* Gradient tối nhẹ ở đầu và đậm ở chân trang -> khu vực giữa hoàn toàn trong suốt */
.welcomeGradientOverlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.55) 0%,
    rgba(0, 0, 0, 0.1) 22%,
    transparent 40%,
    transparent 60%,
    rgba(0, 0, 0, 0.6) 80%,
    rgba(0, 0, 0, 0.85) 100%
  );
  pointer-events: none;
}

/* Logo SHIN STUDIO đán lên sát TOP */
.welcomeBrandTop {
  position: absolute;
  top: 2.5rem;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.35);
  padding: 8px 18px;
  border-radius: 30px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fade-in-down 0.8s ease-out;
}

/* Khối thông tin và nút bấm đẩy xuống dưới BOTTOM */
.welcomeBottomBox {
  position: absolute;
  bottom: 3rem;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  max-width: 600px;
  width: 100%;
  animation: fade-in-up 0.8s ease-out;
}

.welcomeTitle {
  font-size: 2.4rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.4rem;
  line-height: 1.2;
  text-shadow: 0 3px 15px rgba(0, 0, 0, 0.7);
  letter-spacing: -0.01em;
}

.welcomeClient {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.05rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
}

.welcomeSub {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.92rem;
  margin-bottom: 1.8rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
}

.welcomeBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 13px 38px;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.75);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.welcomeBtn:hover:not(:disabled) {
  background: white;
  color: #111;
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5);
}

.welcomeBtn:disabled {
  opacity: 0.6;
  cursor: wait;
}

/* ====== HERO COVER IN ALBUM ====== */
.heroCover {
  position: relative;
  width: 100%;
  height: 380px;
  overflow: hidden;
}

.heroCoverImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.heroCoverOverlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.75) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.heroCoverTitle {
  font-size: 2.2rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.6);
  margin: 0 0 0.3rem;
}

.heroCoverClient {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.85);
  margin: 0;
}

@media (max-width: 640px) {
  .welcomeBrandTop { top: 1.5rem; font-size: 0.75rem; padding: 6px 14px; }
  .welcomeBottomBox { bottom: 2rem; padding: 1rem; }
  .welcomeTitle { font-size: 1.6rem; }
  .welcomeSub { font-size: 0.85rem; margin-bottom: 1.2rem; }
  .welcomeBtn { padding: 11px 30px; font-size: 0.95rem; }
  .heroCover { height: 240px; }
  .heroCoverTitle { font-size: 1.5rem; }
}
`;

fs.writeFileSync('src/app/album/[id]/page.module.css', css + splitWelcomeCss);
console.log('CSS updated with split top/bottom layout');
