const fs = require('fs');

// 1. UPDATE PAGE.MODULE.CSS FOR FULLSCREEN HERO COVER WELCOME
let css = fs.readFileSync('src/app/album/[id]/page.module.css', 'utf8');

const welcomeOverlayIndex = css.indexOf('.welcomeOverlay {');
if (welcomeOverlayIndex !== -1) {
  css = css.substring(0, welcomeOverlayIndex);
}

const newWelcomeCss = `
/* ====== FULLSCREEN HERO WELCOME PAGE (SHOTPIK STYLE) ====== */
.welcomeOverlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  filter: brightness(0.7);
  transform: scale(1.02);
  transition: transform 10s ease;
}

.welcomeOverlay:hover .welcomeBg {
  transform: scale(1.06);
}

.welcomeGradientOverlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 40%,
    rgba(0, 0, 0, 0.75) 100%
  );
}

.welcomeContent {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
  max-width: 650px;
  width: 100%;
  animation: fade-in-up 0.8s ease-out;
}

.welcomeBrand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 2rem;
  background: rgba(0, 0, 0, 0.35);
  padding: 8px 18px;
  border-radius: 30px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.welcomeTitle {
  font-size: 2.8rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.8rem;
  line-height: 1.15;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  letter-spacing: -0.01em;
}

.welcomeClient {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
}

.welcomeSub {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  margin-bottom: 2.5rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.welcomeBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 14px 36px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.welcomeBtn:hover:not(:disabled) {
  background: white;
  color: #111;
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
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
  .welcomeTitle { font-size: 1.8rem; }
  .welcomeBrand { font-size: 0.8rem; margin-bottom: 1.5rem; }
  .heroCover { height: 240px; }
  .heroCoverTitle { font-size: 1.5rem; }
}
`;

fs.writeFileSync('src/app/album/[id]/page.module.css', css + newWelcomeCss);
console.log('CSS updated for fullscreen Shotpik-style welcome screen');
