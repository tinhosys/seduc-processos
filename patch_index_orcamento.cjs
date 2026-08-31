const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Fix Spelling
content = content.replace(/Controle Orcamentario/g, 'Controle Orçamentário');
content = content.replace(/Execucao de Dotacao Orcamentaria/g, 'Execução de Dotação Orçamentária');

// 2. Modify tabs
const regexTabs = /<ul class="tabs" style="list-style:none; padding:0; margin:0; display:flex; flex-wrap:wrap; gap:8px;">[\s\S]*?<\/ul>/;
const newTabs = `<ul class="tabs" style="list-style:none; padding:0; margin:0; display:flex; flex-wrap:wrap; gap:8px;">
            <li class="tab-link active" onclick="mudarGuiaOrcamento('Consolidado', '325984433', this)" style="padding:10px 15px; background:#3b82f6; border-radius:8px; cursor:pointer; color:white; font-size:13px; font-weight:bold; border:1px solid #3b82f6;">Consolidado</li>
            <li class="tab-link" onclick="mudarGuiaOrcamento('Despesas Realizadas', '807660383', this)" style="padding:10px 15px; background:#1e293b; border-radius:8px; cursor:pointer; color:#cbd5e1; font-size:13px; font-weight:bold; border:1px solid #334155;">Despesas Realizadas</li>
          </ul>`;
content = content.replace(regexTabs, newTabs);

// 3. Wrap Consolidado view and create Despesas view
const regexViewStart = /<!-- Cards -->/;
// We will replace "<!-- Cards -->" with the wrapper start
const viewStartReplacement = `
<!-- ================== VIEW CONSOLIDADO ================== -->
<div id="orc-view-consolidado">
<!-- Cards -->`;

// And we need to find the end of the consolidado view. The end of the tables and charts.
// Let's find "<!-- /orc-charts-row -->" or similar... Actually, let's just insert the closing div before the end of the section
const regexSectionEnd = /<\/section>\s*<!-- ============= PAGE: CONFIG/;
const viewEndReplacement = `</div>

<!-- ================== VIEW DESPESAS REALIZADAS ================== -->
<div id="orc-view-despesas" style="display: none;">
  <!-- Filtros Despesas -->
  <div class="orc-filters-bar" style="margin-bottom: 20px;">
    <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:150px;">
      <label style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700;">PA</label>
      <select id="orc-desp-filtro-pa"><option value="">Todos</option></select>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:150px;">
      <label style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700;">Setor</label>
      <select id="orc-desp-filtro-setor"><option value="">Todos</option></select>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:150px;">
      <label style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700;">Tipo</label>
      <select id="orc-desp-filtro-tipo"><option value="">Todos</option></select>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;flex:2;min-width:200px;">
      <label style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;font-weight:700;">Busca (Processo / Descrição)</label>
      <input type="text" id="orc-desp-filtro-busca" placeholder="Digite para buscar..." style="padding:9px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.12); background:#0f172a; color:#e2e8f0; font-size:13px; font-weight:600; outline:none;" onkeyup="if(typeof renderDespesasRealizadas === 'function') renderDespesasRealizadas()">
    </div>
    <button onclick="if(typeof renderDespesasRealizadas === 'function') { document.getElementById('orc-desp-filtro-pa').value=''; document.getElementById('orc-desp-filtro-setor').value=''; document.getElementById('orc-desp-filtro-tipo').value=''; document.getElementById('orc-desp-filtro-busca').value=''; renderDespesasRealizadas(); }" style="height:40px;padding:0 16px;border-radius:8px;background:rgba(250,204,21,0.15);color:#facc15;border:1px solid #facc15;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;text-transform:uppercase;transition:background 0.2s;" onmouseover="this.style.background='rgba(250,204,21,0.3)'" onmouseout="this.style.background='rgba(250,204,21,0.15)'">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      LIMPAR
    </button>
  </div>

  <div class="table-wrap" style="overflow-x:auto; overflow-y:auto; max-height:calc(100vh - 250px); border-radius:12px; border:1px solid rgba(255,255,255,0.07);">
    <table style="width:100%; border-collapse:collapse; text-align:left; font-size:13px;">
      <thead>
        <tr>
          <th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba(255,255,255,0.05); position:sticky; top:0; z-index:10; white-space:nowrap;">Data</th>
          <th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba(255,255,255,0.05); position:sticky; top:0; z-index:10; white-space:nowrap;">Processo SEI</th>
          <th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba(255,255,255,0.05); position:sticky; top:0; z-index:10; white-space:nowrap;">PA</th>
          <th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba(255,255,255,0.05); position:sticky; top:0; z-index:10; white-space:nowrap;">Setor</th>
          <th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba(255,255,255,0.05); position:sticky; top:0; z-index:10; white-space:nowrap;">Natureza</th>
          <th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba(255,255,255,0.05); position:sticky; top:0; z-index:10; white-space:nowrap;">Tipo</th>
          <th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba(255,255,255,0.05); position:sticky; top:0; z-index:10;">Descrição</th>
          <th style="padding:14px 16px; font-size:11px; text-transform:uppercase; color:#64748b; background:#1e293b; border-bottom:2px solid rgba(255,255,255,0.05); position:sticky; top:0; z-index:10; text-align:right; white-space:nowrap;">Valor (R$)</th>
        </tr>
      </thead>
      <tbody id="orc-desp-table-body">
      </tbody>
    </table>
  </div>
</div>
</section>
<!-- ============= PAGE: CONFIG`;

content = content.replace(regexViewStart, viewStartReplacement);
content = content.replace(regexSectionEnd, viewEndReplacement);

fs.writeFileSync(file, content);
console.log('Patched index.html');
