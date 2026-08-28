const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the dropdown from the header
const dropdownRegex = /<div style="position:relative; display:inline-block;" id="orc-print-dropdown">[\s\S]*?<\/div>\s*<\/div>/;
content = content.replace(dropdownRegex, '');

// Also need to remove the event listener for the dropdown that I added at the end of body
const listenerRegex = /<script>\s*document\.addEventListener\('click', function\(e\) \{[\s\S]*?\}\);\s*<\/script>/;
content = content.replace(listenerRegex, '');

// 2. Modify the tabs area to include the 8 buttons
const tabsRegex = /<!-- Guias Orçamento -->\s*<ul class="tabs" style="margin-bottom:16px;">[\s\S]*?<\/ul>/;

const newTabs = `<!-- Guias Orçamento -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
      <ul class="tabs" style="margin:0;">
        <li class="tab-link active" onclick="mudarGuiaOrcamento('26 Execução Orçamentária', '325984433', this)">26 Execução Orçamentária</li>
        <li class="tab-link" onclick="mudarGuiaOrcamento('1 Recurso Federal', '', this)">1 Recurso Federal</li>
        <li class="tab-link" onclick="mudarGuiaOrcamento('Consolidado', '', this)">Consolidado</li>
      </ul>
      <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; background: rgba(30,41,59,0.5); padding: 4px; border-radius: 8px;">
        <style>
          .btn-relatorio-orc {
            display:flex; align-items:center; justify-content:center; padding:6px 10px; height:32px; 
            background:#6366f1; border:none; border-radius:6px; color:white; font-weight:700; 
            font-size:11px; text-transform:uppercase; cursor:pointer; transition:background 0.2s;
          }
          .btn-relatorio-orc:hover { background:#4f46e5; }
        </style>
        <button onclick="gerarRelatorioOrcamento(1)" class="btn action-adm btn-relatorio-orc" title="1. Resumo Geral">R1</button>
        <button onclick="gerarRelatorioOrcamento(2)" class="btn action-adm btn-relatorio-orc" title="2. Listagem Detalhada">R2</button>
        <button onclick="gerarRelatorioOrcamento(3)" class="btn action-adm btn-relatorio-orc" title="3. Agrupado por Programa de Ação">R3</button>
        <button onclick="gerarRelatorioOrcamento(4)" class="btn action-adm btn-relatorio-orc" title="4. Agrupado por Fonte de Recurso">R4</button>
        <button onclick="gerarRelatorioOrcamento(5)" class="btn action-adm btn-relatorio-orc" title="5. Agrupado por Natureza da Despesa">R5</button>
        <button onclick="gerarRelatorioOrcamento(6)" class="btn action-adm btn-relatorio-orc" title="6. Saldos Críticos / Alta Execução">R6</button>
        <button onclick="gerarRelatorioOrcamento(7)" class="btn action-adm btn-relatorio-orc" title="7. Impressão da Tela Visual">R7</button>
        <button onclick="gerarRelatorioOrcamento(8)" class="btn action-adm btn-relatorio-orc" style="background:#10b981;" title="8. Relatório Status e Gráficos">R8</button>
      </div>
    </div>`;

content = content.replace(tabsRegex, newTabs);

fs.writeFileSync(file, content);
console.log('Tabs and 8 buttons injected.');
