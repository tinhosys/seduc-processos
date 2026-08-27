const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.startsWith('index') && f.endsWith('.html'));

const buttonsHTML = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; background: rgba(30,41,59,0.5); padding: 4px; border-radius: 8px;">
          <button onclick="gerarRelatorioOrcamento(1)" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer;" title="Resumo Geral">1. RESUMO</button>
          <button onclick="gerarRelatorioOrcamento(2)" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer;" title="Listagem Detalhada">2. DETALHADO</button>
          <button onclick="gerarRelatorioOrcamento(3)" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer;" title="Agrupado por Programa de Ação">3. POR P.A.</button>
          <button onclick="gerarRelatorioOrcamento(4)" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer;" title="Agrupado por Fonte de Recurso">4. POR FONTE</button>
          <button onclick="gerarRelatorioOrcamento(5)" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer;" title="Agrupado por Natureza da Despesa">5. POR NATUREZA</button>
          <button onclick="gerarRelatorioOrcamento(6)" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer;" title="Saldos Críticos / Alta Execução">6. CRÍTICOS</button>
          <button onclick="if(typeof imprimirOrcamento==='function') imprimirOrcamento(); else window.print();" class="btn action-adm" style="padding:8px 12px; font-size:11px; background:#6366f1; color:white; border:none; border-radius:6px; cursor:pointer;" title="Impressão Visual da Tela">7. TELA</button>
        </div>
`;
const searchRegex = /<button onclick="if\(typeof imprimirOrcamento==='function'\) imprimirOrcamento\(\); else window\.print\(\);"[^>]*>[\s\S]*?<\/button>/;

for (const f of files) {
  const fp = path.join(__dirname, f);
  let content = fs.readFileSync(fp, 'utf8');
  if (searchRegex.test(content)) {
    content = content.replace(searchRegex, buttonsHTML);
    fs.writeFileSync(fp, content);
    console.log(f + ' updated with 7 buttons.');
  }
}
