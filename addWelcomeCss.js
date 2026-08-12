const fs = require('fs');
const css = fs.readFileSync('src/app/album/[id]/page.module.css', 'utf8');
const append = `

/* ====== WELCOME SPLASH PAGE ====== */
.welcomeOverlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #0a0a0a;
}

.welcomeBg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(20px) brightness(0.35);
  transform: scale(1.1);
}

.welcomeContent {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
  max-width: 420px;
  width: 100%;
  animation: fade-in-up 0.6s ease-out;
}

.welcomeBrand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255,255,255,0.7);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.welcomeImageWrapper {
  width: 100%;
  max-width: 360px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.7);
  margin-bottom: 1.5rem;
  aspect-ratio: 4/3;
}

.welcomeImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.welcomeTitle {
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.4rem;
  line-height: 1.2;
  text-shadow: 0 2px 10px rgba(0,0,0,0.4);
}

.welcomeClient {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: rgba(255,255,255,0.75);
  font-size: 1rem;
  margin-bottom: 0.4rem;
}

.welcomeSub {
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.welcomeBtn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--primary, #e85d75);
  color: white;
  font-size: 1.05rem;
  font-weight: 700;
  padding: 14px 32px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(232,93,117,0.4);
  letter-spacing: 0.01em;
}

.welcomeBtn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(232,93,117,0.55);
}

.welcomeBtn:disabled {
  opacity: 0.6;
  cursor: wait;
}

/* ====== HERO COVER IN ALBUM ====== */
.heroCover {
  position: relative;
  width: 100%;
  height: 280px;
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
  background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem;
}

.heroCoverTitle {
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  margin: 0 0 0.2rem;
}

.heroCoverClient {
  font-size: 1rem;
  color: rgba(255,255,255,0.8);
  margin: 0;
}

@media (max-width: 640px) {
  .welcomeTitle { font-size: 1.4rem; }
  .welcomeImageWrapper { border-radius: 12px; }
  .heroCover { height: 200px; }
  .heroCoverTitle { font-size: 1.4rem; }
}
`;
fs.writeFileSync('src/app/album/[id]/page.module.css', css + append);
console.log('CSS updated with welcome + hero styles');
