const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'app.js');
let content = fs.readFileSync(file, 'utf8');

const regex = /if \(isCollapsed\) \{[\s\S]*?\} else \{[\s\S]*?\}/;
const replacement = `if (isCollapsed) {
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polyline></svg>';
    localStorage.setItem('filters_collapsed', '1');
  } else {
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 14 12 22 20 14"></polyline><polyline points="4 4 12 12 20 4"></polyline></svg>';
    localStorage.removeItem('filters_collapsed');
  }`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('app.js toggle patched');
