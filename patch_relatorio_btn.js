const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const relatorioBtn = `
        <button onclick="if(typeof imprimirOrcamento==='function') imprimirOrcamento(); else window.print();" style="display:flex; align-items:center; gap:6px; padding:10px 16px; height:40px; background:#6366f1; border:none; border-radius:8px; color:white; font-weight:700; font-size:13px; text-transform:uppercase; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#4f46e5'" onmouseout="this.style.background='#6366f1'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          RELATÓRIO
        </button>
`;

html = html.replace(/<button onclick="exportarOrcamentoExcel\(\)"/g, relatorioBtn + '\n        <button onclick="exportarOrcamentoExcel()"');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Relatorio button added to index.html');
