const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Update mudarGuiaOrcamento
const regexMudar = /window\.mudarGuiaOrcamento = async function\(nomeGuia, gid, el\) \{[\s\S]*?await window\.carregarOrcamentoData\(\);\s*\};/;
const replacementMudar = `window.mudarGuiaOrcamento = async function(nomeGuia, gid, el) {
    if (el) {
      document.querySelectorAll('#page-orcamento .tabs .tab-link').forEach(t => {
        t.classList.remove('active');
        t.style.background = '#1e293b';
        t.style.color = '#cbd5e1';
        t.style.border = '1px solid #334155';
      });
      el.classList.add('active');
      el.style.background = '#3b82f6';
      el.style.color = 'white';
      el.style.border = '1px solid #3b82f6';
    }
    _guiaAtualSheet = nomeGuia;
    _guiaAtualGid = gid;
    
    const viewConsolidado = document.getElementById('orc-view-consolidado');
    const viewDespesas = document.getElementById('orc-view-despesas');
    if (gid === '807660383') {
       if(viewConsolidado) viewConsolidado.style.display = 'none';
       if(viewDespesas) viewDespesas.style.display = 'block';
    } else {
       if(viewConsolidado) viewConsolidado.style.display = 'block';
       if(viewDespesas) viewDespesas.style.display = 'none';
    }

    await window.carregarOrcamentoData();
};`;
content = content.replace(regexMudar, replacementMudar);

// 2. Update carregarOrcamentoData
const regexCarregar = /window\.carregarOrcamentoData = async function\(\) \{[\s\S]*?\/\/ Parse CSV/;
const replacementCarregar = `window.carregarOrcamentoData = async function() {
    try {
      let url = 'https://docs.google.com/spreadsheets/d/1NQuN9icUm8RL08pqkPia3ZrgoC5zEka99mK43sUJm3o/gviz/tq?tqx=out:csv';
      if (_guiaAtualGid) url += '&gid=' + _guiaAtualGid;
      else url += '&sheet=' + encodeURIComponent(_guiaAtualSheet);
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const csv = await res.text();
      const lines = csv.split('\\n');
      
      if (_guiaAtualGid === '807660383') {
        _crmData = lines.slice(1).map(line => {
          const regex = /"([^"]*)"|([^,]+)/g;
          const row = [];
          let m;
          while ((m = regex.exec(line)) !== null) {
            row.push(m[1] !== undefined ? m[1] : (m[2] || ''));
          }
          return {
            data: row[0] || '',
            processo: row[1] || '',
            pa: row[2] || '',
            fonte: row[3] || '',
            despesa: row[4] || '',
            tipo: row[5] || '',
            setor: row[6] || '',
            descricao: row[7] || '',
            valorText: row[8] || '0,00'
          };
        }).filter(r => r.processo || r.descricao);
        window.popularFiltrosDespesas();
        window.renderDespesasRealizadas();
        return;
      }
      
      // Parse CSV for Consolidado`;
content = content.replace(regexCarregar, replacementCarregar);

// Wait, the _crmData parser above: earlier I saw:
// row[0] pa, row[1] fonte, row[2] despesa, row[3] tipo, row[4] processo, row[5] data, row[6] setor, row[7] descricao, row[8] valorText
// BUT in image 3 it showed: DATA, PROCESSO, TIPO, DESCRIÇÃO, VALOR. 
// Which means the order in the spreadsheet might be different!
// Let me look at the old _crmData logic in orcamento.js!

fs.writeFileSync(file, content);
console.log('Patched orcamento part 1');
