const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const printBtnHtml = `<button onclick="imprimirContatos()" style="background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.5);color:#60a5fa;padding:9px 16px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:100%;transition:background 0.2s;" onmouseover="this.style.background='rgba(59,130,246,0.3)'" onmouseout="this.style.background='rgba(59,130,246,0.15)'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Governo + CAM
        </button>`;

const contatosSheetLinkRegex = /(<a href="https:\/\/docs\.google\.com\/spreadsheets\/d\/1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08\/edit\?gid=1855271818#gid=1855271818"[\s\S]*?class="action-editor action-adm"[\s\S]*?style="[^"]*?)(display:inline-flex;align-items:center;)([^"]*?")/s;

html = html.replace(contatosSheetLinkRegex, printBtnHtml + '\n        $1$2height:100%;$3');

// Bumping version to v1.0.90
html = html.replace(/v1\.0\.89/g, 'v1.0.90');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed Contatos page');
