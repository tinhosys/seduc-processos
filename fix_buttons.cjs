const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexFile, 'utf8');

// Regex to find all my inserted blocks and the wrapping divs
// The previous block I inserted had background: rgba(30,41,59,0.5); padding: 4px;
const oldBlockRegex = /<div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; background: rgba\(30,41,59,0\.5\); padding: 4px; border-radius: 8px;">[\s\S]*?<\/div>/g;

const newButtonsHTML = `
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <style>
            .btn-relatorio-orc {
              display:flex; align-items:center; gap:6px; padding:10px 16px; height:40px; 
              background:#6366f1; border:none; border-radius:8px; color:white; font-weight:700; 
              font-size:12px; text-transform:uppercase; cursor:pointer; transition:background 0.2s;
            }
            .btn-relatorio-orc:hover { background:#4f46e5; }
            .btn-relatorio-orc svg { width: 14px; height: 14px; }
          </style>
          
          <button onclick="gerarRelatorioOrcamento(1)" class="btn action-adm btn-relatorio-orc" title="Resumo Geral">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            IMPRIMIR RESUMO
          </button>
          
          <button onclick="gerarRelatorioOrcamento(2)" class="btn action-adm btn-relatorio-orc" title="Listagem Detalhada">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            IMPRIMIR DETALHADO
          </button>
          
          <button onclick="gerarRelatorioOrcamento(3)" class="btn action-adm btn-relatorio-orc" title="Agrupado por Programa de Ação">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            IMPRIMIR POR P.A.
          </button>
          
          <button onclick="gerarRelatorioOrcamento(4)" class="btn action-adm btn-relatorio-orc" title="Agrupado por Fonte de Recurso">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            IMPRIMIR POR FONTE
          </button>
          
          <button onclick="gerarRelatorioOrcamento(5)" class="btn action-adm btn-relatorio-orc" title="Agrupado por Natureza da Despesa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            IMPRIMIR POR NATUREZA
          </button>
          
          <button onclick="gerarRelatorioOrcamento(6)" class="btn action-adm btn-relatorio-orc" title="Saldos Críticos / Alta Execução">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            IMPRIMIR CRÍTICOS
          </button>
          
          <button onclick="if(typeof imprimirOrcamento==='function') imprimirOrcamento(); else window.print();" class="btn action-adm btn-relatorio-orc" title="Impressão Visual da Tela">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            IMPRIMIR TELA
          </button>
        </div>`;

// Replace all occurrences of oldBlockRegex, in case there are duplicates
let matches = indexContent.match(oldBlockRegex);
if (matches) {
  // To avoid duplicating, just replace the first match with the new HTML and remove all other matches
  indexContent = indexContent.replace(oldBlockRegex, (match, offset) => {
    if (offset === indexContent.indexOf(matches[0])) {
      return newButtonsHTML; // Replace the first match
    }
    return ''; // Remove subsequent ones
  });
  
  // also clean up any empty remaining div if it wrapped the others
  indexContent = indexContent.replace(/<div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; background: rgba\(30,41,59,0\.5\); padding: 4px; border-radius: 8px;">\s*<\/div>/g, '');
}

fs.writeFileSync(indexFile, indexContent);
console.log('Fixed buttons in index.html');
