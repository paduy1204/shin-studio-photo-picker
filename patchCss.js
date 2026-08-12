const fs = require('fs');

const cssChanges = \`
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
  height: auto; /* natural height */
  display: block;
  transition: transform 0.3s ease;
}

.masonryItem:hover img {
  transform: scale(1.05);
}

@media (max-width: 1024px) {
  .myMasonryGrid {
    margin-left: -1rem;
    padding: 1rem;
  }
  .myMasonryGridColumn {
    padding-left: 1rem;
  }
  .masonryItem {
    margin-bottom: 1rem;
  }
}

@media (max-width: 640px) {
  .myMasonryGrid {
    margin-left: -4px;
    padding: 4px;
  }
  .myMasonryGridColumn {
    padding-left: 4px;
  }
  .masonryItem {
    margin-bottom: 4px;
    border-radius: 4px;
  }
}
\`;

function patchCSS(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove old CSS grid rules
  const toRemove = [
    /\\.masonryGrid \\{[^}]*\\}/g,
    /\\.masonryItem \\{[^}]*\\}/g,
    /\\.masonryItem img \\{[^}]*\\}/g,
    /\\.masonryItem:hover img \\{[^}]*\\}/g,
    /@media \\(max-width: 1024px\\) \\{\\s*\\.masonryGrid[^}]*\\}/g,
    /@media \\(max-width: 640px\\) \\{\\s*\\.masonryGrid[^}]*\\}/g,
    /@media \\(max-width: 1024px\\) \\{\\s*\\.masonryItem[^}]*\\}/g,
    /@media \\(max-width: 640px\\) \\{\\s*\\.masonryItem[^}]*\\}/g,
  ];

  toRemove.forEach(regex => {
    content = content.replace(regex, '');
  });
  
  content += "\\n" + cssChanges;
  fs.writeFileSync(file, content);
}

patchCSS('src/app/album/[id]/page.module.css');
patchCSS('src/app/admin/album/[id]/page.module.css');
console.log('CSS updated successfully!');
