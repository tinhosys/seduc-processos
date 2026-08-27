const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// Replace the hardcoded ORCAMENTO_DATA and fetch dynamically
const fetchLogic = `
let _guiaAtualGid = '325984433';
let _guiaAtualSheet = '26 Execução Orçamentária';

window.mudarGuiaOrcamento = async function(nomeGuia, gid, el) {
  if (el) {
    document.querySelectorAll('#page-orcamento .tabs .tab-link').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  }
  _guiaAtualSheet = nomeGuia;
  _guiaAtualGid = gid;
  await window.carregarOrcamentoData();
};

window.carregarOrcamentoData = async function() {
  try {
    let url = 'https://docs.google.com/spreadsheets/d/1NQuN9icUm8RL08pqkPia3ZrgoC5zEka99mK43sUJm3o/gviz/tq?tqx=out:csv';
    if (_guiaAtualGid) url += '&gid=' + _guiaAtualGid;
    else url += '&sheet=' + encodeURIComponent(_guiaAtualSheet);
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const csv = await res.text();
    
    // Parse CSV
    const lines = csv.split('\\n');
    ORCAMENTO_DATA.length = 0; // Clear array
    for (let i = 1; i < lines.length; i++) {
      let l = lines[i];
      if (!l || l.trim() === '') continue;
      // Basic CSV split
      const cols = l.split('","').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length < 13) continue;
      
      const parseMon = (v) => parseFloat((v||'').replace(/\\./g,'').replace(',','.')) || 0;
      
      ORCAMENTO_DATA.push({
        pa: cols[0],
        fonte: cols[1],
        despesa: cols[2],
        detalhamento: cols[4],
        inicial: parseMon(cols[5]),
        empenhado: parseMon(cols[7]),
        executado: parseMon(cols[9]),
        saldoLiquido: parseMon(cols[12])
      });
    }
    
    filtrarOrcamento();
  } catch (e) {
    console.error('Erro ao carregar orcamento do GSheets:', e);
    // fallback if fail? it will just show empty or previous data
  }
};
`;

if (!content.includes('window.carregarOrcamentoData')) {
  // Replace the const ORCAMENTO_DATA definition with let ORCAMENTO_DATA = []
  content = content.replace(/const ORCAMENTO_DATA = \[[^]*?\];/, 'const ORCAMENTO_DATA = [];\n' + fetchLogic);
}

// Modify imprimirOrcamento
const oldImprimir = /window\.imprimirOrcamento = function\(\) \{[\s\S]*?\};/;
const newImprimir = `window.imprimirOrcamento = function() {
  document.body.classList.add('print-mode-orcamento');
  
  // Create print header if not exists
  let printHeader = document.getElementById('orc-print-header');
  if (!printHeader) {
    printHeader = document.createElement('div');
    printHeader.id = 'orc-print-header';
    printHeader.style.display = 'none';
    document.getElementById('page-orcamento').prepend(printHeader);
  }
  
  const selPA = document.getElementById('orc-filtro-pa');
  const selND = document.getElementById('orc-filtro-despesa');
  const nomePA = selPA && selPA.value ? PA_DESCRICAO[selPA.value] || selPA.value : 'Todos os Programas';
  const nomeND = selND && selND.value ? _naturezaNome(selND.value) : 'Todas as Naturezas';
  
  printHeader.innerHTML = \`<h1 style="font-size:24px; margin-bottom:5px; text-align:center;">Execução de Dotação Orçamentária</h1>
                           <h3 style="font-size:16px; margin-bottom:20px; text-align:center; color:#475569;">PA: \${nomePA} | ND: \${nomeND}</h3>\`;
  
  // Hide buttons container
  const headerDivs = document.querySelectorAll('#page-orcamento > div.section-header');
  if (headerDivs.length > 0) headerDivs[0].classList.add('orc-buttons');
  
  setTimeout(() => {
    window.print();
    document.body.classList.remove('print-mode-orcamento');
  }, 100);
};`;

content = content.replace(oldImprimir, newImprimir);

fs.writeFileSync(file, content);
console.log('orcamento.js patched');
