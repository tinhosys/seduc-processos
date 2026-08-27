const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

// Replace Relatório button with a dropdown
const oldBtn = /<button onclick="if\(typeof imprimirOrcamento==='function'\) imprimirOrcamento\(\); else window\.print\(\);"[^>]*>[\s\S]*?RELAT.*?<\/button>/;
const newBtn = `
        <div style="position:relative; display:inline-block;" id="orc-print-dropdown">
          <button onclick="document.getElementById('orc-print-menu').style.display = document.getElementById('orc-print-menu').style.display === 'block' ? 'none' : 'block'" style="display:flex; align-items:center; gap:6px; padding:10px 16px; height:40px; background:#6366f1; border:none; border-radius:8px; color:white; font-weight:700; font-size:13px; text-transform:uppercase; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#4f46e5'" onmouseout="this.style.background='#6366f1'">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            IMPRIMIR &#9662;
          </button>
          <div id="orc-print-menu" style="display:none; position:absolute; top:45px; left:0; background:#1e293b; border:1px solid #334155; border-radius:8px; padding:8px; z-index:9999; min-width:200px; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <button onclick="document.getElementById('orc-print-menu').style.display='none'; gerarRelatorioOrcamento(1)" style="display:block; width:100%; text-align:left; padding:8px; background:transparent; border:none; color:white; cursor:pointer; font-size:12px; border-radius:4px;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">1. RESUMO</button>
            <button onclick="document.getElementById('orc-print-menu').style.display='none'; gerarRelatorioOrcamento(2)" style="display:block; width:100%; text-align:left; padding:8px; background:transparent; border:none; color:white; cursor:pointer; font-size:12px; border-radius:4px;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">2. DETALHADO</button>
            <button onclick="document.getElementById('orc-print-menu').style.display='none'; gerarRelatorioOrcamento(3)" style="display:block; width:100%; text-align:left; padding:8px; background:transparent; border:none; color:white; cursor:pointer; font-size:12px; border-radius:4px;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">3. POR P.A.</button>
            <button onclick="document.getElementById('orc-print-menu').style.display='none'; gerarRelatorioOrcamento(4)" style="display:block; width:100%; text-align:left; padding:8px; background:transparent; border:none; color:white; cursor:pointer; font-size:12px; border-radius:4px;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">4. POR FONTE</button>
            <button onclick="document.getElementById('orc-print-menu').style.display='none'; gerarRelatorioOrcamento(5)" style="display:block; width:100%; text-align:left; padding:8px; background:transparent; border:none; color:white; cursor:pointer; font-size:12px; border-radius:4px;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">5. POR NATUREZA</button>
            <button onclick="document.getElementById('orc-print-menu').style.display='none'; gerarRelatorioOrcamento(6)" style="display:block; width:100%; text-align:left; padding:8px; background:transparent; border:none; color:white; cursor:pointer; font-size:12px; border-radius:4px;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">6. CRÍTICOS</button>
            <button onclick="document.getElementById('orc-print-menu').style.display='none'; if(typeof imprimirOrcamento==='function') imprimirOrcamento(); else window.print();" style="display:block; width:100%; text-align:left; padding:8px; background:transparent; border:none; color:#10b981; cursor:pointer; font-size:12px; border-radius:4px; font-weight:bold;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">7. IMPRIMIR TELA</button>
          </div>
        </div>
`;
content = content.replace(oldBtn, newBtn);

// Add tabs for Orcamento
const oldCards = /<!-- Cards -->/;
const newTabs = `
    <!-- Guias Orçamento -->
    <ul class="tabs" style="margin-bottom:16px;">
      <li class="tab-link active" onclick="mudarGuiaOrcamento('26 Execução Orçamentária', '325984433', this)">26 Execução Orçamentária</li>
      <li class="tab-link" onclick="mudarGuiaOrcamento('1 Recurso Federal', '', this)">1 Recurso Federal</li>
      <li class="tab-link" onclick="mudarGuiaOrcamento('Consolidado', '', this)">Consolidado</li>
    </ul>
    
    <!-- Cards -->`;
if (!content.includes('Guias Orçamento')) {
    content = content.replace(oldCards, newTabs);
}

// Ensure click outside closes the dropdown
if (!content.includes('orc-print-dropdown')) {
    content = content.replace('</body>', `<script>
document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('orc-print-dropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    const menu = document.getElementById('orc-print-menu');
    if (menu) menu.style.display = 'none';
  }
});
</script></body>`);
}

fs.writeFileSync(file, content);
console.log('index.html patched with Orcamento dropdown and tabs');
