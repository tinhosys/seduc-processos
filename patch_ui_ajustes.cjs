const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Delete the "RELATÓRIO" button
const regexRelatorio = /<button onclick="if\(typeof imprimirOrcamento==='function'\) imprimirOrcamento\(\); else window\.print\(\);"[\s\S]*?<\/button>\s*<button onclick="exportarOrcamentoExcel\(\)"/;
content = content.replace(regexRelatorio, '<button onclick="exportarOrcamentoExcel()"');

// 2. Replace the filters bar inside orc-view-despesas
const regexFilters = /<!-- Filtros Despesas -->[\s\S]*?<div class="table-wrap"/;
const newFilters = `<!-- Filtros Despesas -->
  <div class="orc-filters-bar" style="margin-bottom: 20px; display: flex; flex-wrap: nowrap; gap: 8px; overflow-x: auto; padding: 12px;">
    <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:100px;">
      <label style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700;">PA</label>
      <select id="orc-desp-filtro-pa" style="padding:7px 10px; font-size:12px;"><option value="">Todos</option></select>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:100px;">
      <label style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700;">Setor</label>
      <select id="orc-desp-filtro-setor" style="padding:7px 10px; font-size:12px;"><option value="">Todos</option></select>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:100px;">
      <label style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700;">Tipo</label>
      <select id="orc-desp-filtro-tipo" style="padding:7px 10px; font-size:12px;"><option value="">Todos</option></select>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:120px;">
      <label style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700;">Natureza</label>
      <select id="orc-desp-filtro-natureza" style="padding:7px 10px; font-size:12px;"><option value="">Todas</option></select>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;flex:2;min-width:140px;">
      <label style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700;">Busca</label>
      <input type="text" id="orc-desp-filtro-busca" placeholder="Proc. ou Desc..." style="padding:7px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.12); background:#0f172a; color:#e2e8f0; font-size:12px; font-weight:600; outline:none;" onkeyup="if(typeof renderDespesasRealizadas === 'function') renderDespesasRealizadas()">
    </div>
    <button onclick="if(typeof renderDespesasRealizadas === 'function') { document.getElementById('orc-desp-filtro-pa').value=''; document.getElementById('orc-desp-filtro-setor').value=''; document.getElementById('orc-desp-filtro-tipo').value=''; document.getElementById('orc-desp-filtro-natureza').value=''; document.getElementById('orc-desp-filtro-busca').value=''; renderDespesasRealizadas(); }" style="height:34px; align-self:flex-end; padding:0 12px; border-radius:8px; background:rgba(250,204,21,0.15); color:#facc15; border:1px solid #facc15; font-weight:700; font-size:11px; cursor:pointer; display:flex; align-items:center; gap:6px; text-transform:uppercase; transition:background 0.2s; white-space:nowrap;" onmouseover="this.style.background='rgba(250,204,21,0.3)'" onmouseout="this.style.background='rgba(250,204,21,0.15)'">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      LIMPAR
    </button>
  </div>

  <div class="table-wrap"`;
content = content.replace(regexFilters, newFilters);

fs.writeFileSync(file, content);
console.log('Patched index.html');
