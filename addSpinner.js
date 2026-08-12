const fs = require('fs');
const css = fs.readFileSync('src/app/album/[id]/page.module.css', 'utf8');
const append = `

/* ====== DOWNLOAD SPINNER ====== */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinnerSmall {
  display: block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.spinnerLarge {
  display: block;
  width: 24px;
  height: 24px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.iconBtn.downloading {
  opacity: 0.8;
  cursor: wait;
}

.lightboxActionBtn.downloading {
  opacity: 0.7;
  cursor: wait;
}
`;
fs.writeFileSync('src/app/album/[id]/page.module.css', css + append);
console.log('CSS updated');
