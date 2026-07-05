const fs = require('fs');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  const headerRegex = /<div class="section-header">\s*<div>\s*<h2>Lista de Processos<\/h2>[\s\S]*?<\/div>\s*<\/div>/;

  const newHeader = `<div class="section-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div style="flex: 1;">
            <h2>Lista de Processos</h2>
            <p id="valor-filtrado" style="color:var(--text-muted);font-size:13px;margin-top:2px">Carregando...</p>
          </div>
          <div style="display:flex;align-items:center;gap:12px; flex: 2;">
            <button class="btn action-editor" onclick="imprimirAnalise()" style="flex:1; padding:10px 12px; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; border:none; border-radius:6px; background:#9333ea; color:white; cursor:pointer; font-weight:600;" title="Análise Gerencial">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> Análise
            </button>
            <button class="btn action-editor" onclick="imprimirDetalhado()" style="flex:1; padding:10px 12px; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; border:none; border-radius:6px; background:#2563eb; color:white; cursor:pointer; font-weight:600;" title="Relatório Detalhado">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Detalhado
            </button>
            <button class="btn action-editor" onclick="imprimirPadrao()" style="flex:1; padding:10px 12px; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; border:none; border-radius:6px; background:#475569; color:white; cursor:pointer; font-weight:600;" title="Imprimir Lista Atual">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> Imprimir Padrão
            </button>
            <button class="btn action-editor" onclick="exportarExcel()" style="flex:1; padding:10px 12px; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; border:none; border-radius:6px; background:#16a34a; color:white; cursor:pointer; font-weight:600;" title="Exportar para Excel">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 3v5h5M8 13l4 4M12 17l4-4M12 11v6"/></svg> EXCEL
            </button>
          </div>
        </div>`;

  if (headerRegex.test(content)) {
    content = content.replace(headerRegex, newHeader);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Fixed', filepath);
  } else {
    console.log('Not found in', filepath);
  }
}

fixFile('c:/Users/Elton/SEDUC/planilha-google-form/public/index.html');
fixFile('c:/Users/Elton/SEDUC/index.html');
