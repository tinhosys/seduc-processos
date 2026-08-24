const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove PLANILHA button
// It looks like:
// <button class="action-editor action-adm" onclick="window.open('https://docs.google.com/spreadsheets/d/1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E/edit?gid=0#gid=0', '_blank')" ... PLANILHA\s*<\/button>
const planilhaRegex = /<button class="action-editor action-adm"[^>]*onclick="window\.open\('https:\/\/docs\.google\.com\/spreadsheets\/d\/1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E\/edit\?gid=0#gid=0'[^>]*>[\s\S]*?PLANILHA\s*<\/button>/;
html = html.replace(planilhaRegex, '');

// 2. Remove LIMPAR PARAMETROS button (and its container LINHA 5 if it's empty)
// It looks like:
// <!-- LINHA 5 -->
// <div class="filter-row" style="display:flex; flex-wrap:wrap; gap:10px; width:100%; align-items:center; margin-top: 5px;">
//   <button id="btn-limpar-filtros" ... LIMPAR PARMETROS\s*<\/button>\s*<\/div>
// Since powershell might have messed up the regex for "PARÂMETROS", I'll use a loose regex.
const limparRegex = /<!-- LINHA 5 -->\s*<div class="filter-row"[^>]*>\s*<button id="btn-limpar-filtros"[^>]*>[\s\S]*?<\/button>\s*<\/div>/;
html = html.replace(limparRegex, '');

// 3. Replace the section header in page-processos
const sectionHeaderRegex = /<div class="section-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap: wrap; gap: 12px;">\s*<div style="flex: 1; display: flex; align-items: stretch; gap: 8px; min-width: 250px; flex-wrap: wrap;">[\s\S]*?<\/button>\s*<\/div>\s*<div class="header-buttons"/;

const newSectionHeader = `<div class="section-header" style="display:flex; flex-direction:column; gap:12px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: stretch; gap: 8px; flex-wrap: wrap;">
              <span id="valor-filtrado" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 8px; font-size: 17px; font-weight: 700; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); font-family: monospace; letter-spacing: 0.5px;">Carregando...</span>
              <span id="qtd-registros-filtrados" style="display: inline-flex; align-items: center; padding: 8px 14px; border-radius: 8px; font-size: 14px; font-weight: 700; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); white-space: nowrap; font-family: monospace;">0 registros</span>
            </div>
            <div class="header-buttons"`;

html = html.replace(sectionHeaderRegex, newSectionHeader);

// Now I need to inject the 3 control buttons right below the header-buttons div closing tag.
// So: <div class="header-buttons" ...> ... </div> </div> (closing the row 1)
// Let's find the closing of header-buttons. It ends with:
// <span class="btn-text">EXCEL</span>\s*</button>\s*</div>\s*</div>
const injectControlButtonsRegex = /<span class="btn-text">EXCEL<\/span>\s*<\/button>\s*<\/div>\s*<\/div>/;

const controlButtonsHtml = `<span class="btn-text">EXCEL</span>
            </button>
          </div>
          </div>
          <div style="display:flex; align-items:stretch; gap:8px; flex-wrap:wrap;">
            <button type="button" id="btn-toggle-filtros" onclick="toggleFiltros()" class="btn btn-ghost btn-sm" style="flex:1; max-width:200px; border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.05); color:var(--text-primary); padding:10px 12px; height:40px; border-radius:8px; font-weight:600; font-size:13px; display:inline-flex; align-items:center; justify-content:center; gap:6px; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'" title="Mostrar/Ocultar Filtros">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              <span class="btn-text">Ocultar Filtros</span>
            </button>
            <button class="action-editor action-adm" onclick="window.open('https://docs.google.com/spreadsheets/d/1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E/edit?gid=0#gid=0', '_blank')" style="flex:1; max-width:200px; background:rgba(16, 185, 129, 0.15); border:1px solid rgba(16, 185, 129, 0.5); color:#10b981; padding:10px 12px; border-radius:8px; font-weight:600; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; height:40px; transition:background 0.2s;" onmouseover="this.style.background='rgba(16, 185, 129, 0.3)'" onmouseout="this.style.background='rgba(16, 185, 129, 0.15)'" title="Acessar Planilha">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              PLANILHA
            </button>
            <button id="btn-limpar-filtros" onmouseover="this.style.background='rgba(250, 204, 21, 0.3)'" onmouseout="this.style.background='rgba(250, 204, 21, 0.15)'" style="flex:1; max-width:200px; display:flex; align-items:center; justify-content:center; gap:6px; height:40px; padding:10px 12px; border-radius:8px; background:rgba(250, 204, 21, 0.15); color:#facc15; border:1px solid #facc15; font-weight:600; font-size:13px; cursor:pointer; text-transform:uppercase; transition:background 0.2s;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              LIMPAR PARÂMETROS
            </button>
          </div>
        </div>`;

html = html.replace(injectControlButtonsRegex, controlButtonsHtml);

// Bump version
html = html.replace(/v1\.0\.93/g, 'v1.0.94');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html refactored header buttons');
