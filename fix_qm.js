const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<span style="position:absolute;right:12px;top:50%;transform:translateY\(-50%\);color:var\(--text-muted\);font-size:15px;pointer-events:none;">\?\?<\/span>/g, '<span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:15px;pointer-events:none;">\uD83D\uDD0D</span>');

html = html.replace(/<h3 id="modal-contato-titulo" style="display:flex; align-items:center; gap:8px;"><span>\?\?<\/span>/g, '<h3 id="modal-contato-titulo" style="display:flex; align-items:center; gap:8px;"><span>\u270F\uFE0F</span>');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed ?? characters');
