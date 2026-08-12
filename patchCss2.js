const fs = require('fs');
const cssChanges = `
.myMasonryGrid {
  display: flex;
  margin-left: -1.5rem; /* gutter size offset */
  width: auto;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}
.myMasonryGridColumn {
  padding-left: 1.5rem; /* gutter size */
  background-clip: padding-box;
}
.masonryItem {
  margin-bottom: 1.5rem;
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  animation: fade-in-up 0.5s ease-out;
}
.masonryItem img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}
@media (max-width: 1024px) {
  .myMasonryGrid { margin-left: -1rem; padding: 1rem; }
  .myMasonryGridColumn { padding-left: 1rem; }
  .masonryItem { margin-bottom: 1rem; }
}
@media (max-width: 640px) {
  .myMasonryGrid { margin-left: -4px; padding: 4px; }
  .myMasonryGridColumn { padding-left: 4px; }
  .masonryItem { margin-bottom: 4px; border-radius: 4px; }
}
`;

fs.appendFileSync('src/app/album/[id]/page.module.css', cssChanges);
fs.appendFileSync('src/app/admin/album/[id]/page.module.css', cssChanges);
console.log('Appended CSS correctly.');
