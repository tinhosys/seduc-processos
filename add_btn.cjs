const fs = require('fs');
let index = fs.readFileSync('index.html', 'utf8');

const newButtons = \
            <button class="btn btn-ghost btn-sm action-editor" onclick="exportarExcel()"
              style="border:1px solid var(--border);color:var(--text-primary)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                <path d="M14 3v5h5M8 13l4 4M12 17l4-4M12 11v6" />
              </svg> EXCEL
            </button>
            <button class="btn btn-ghost btn-sm action-editor" onclick="abrirModalPdf()"
              style="border:1px solid var(--border);color:var(--text-primary)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg> PDF
            </button>
\;

index = index.replace(/<button class="btn btn-ghost btn-sm" onclick="exportarExcel\(\)"[\s\S]*?<\/button>/, newButtons);
index = index.replace(/<button class="btn btn-ghost btn-sm" onclick="window\.print\(\)"/g, '<button class="btn btn-ghost btn-sm action-editor" onclick="window.print()"');
index = index.replace('js/pdf.js?v=1', 'js/pdf.js?v=2'); // bust cache

fs.writeFileSync('index.html', index, 'utf8');
console.log('Button injected!');
