const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

const mudarOld = `window.mudarGuiaOrcamento = async function(nomeGuia, gid, el) {
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
  await window.carregarOrcamentoData();
};`;

const mudarNew = `window.mudarGuiaOrcamento = async function(nomeGuia, gid, el) {
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

// Because of Windows CRLF issues, we can just split by function name and insert
let parts = content.split('window.mudarGuiaOrcamento = async function(nomeGuia, gid, el) {');
if (parts.length === 2) {
  let innerParts = parts[1].split('await window.carregarOrcamentoData();\n  };');
  if (innerParts.length === 2) {
    content = parts[0] + mudarNew.replace('window.mudarGuiaOrcamento = async function(nomeGuia, gid, el) {', 'window.mudarGuiaOrcamento = async function(nomeGuia, gid, el) {\n') + innerParts[1];
    console.log('mudarGuiaOrcamento patched');
  } else {
    // maybe \r\n
    innerParts = parts[1].split('await window.carregarOrcamentoData();\r\n  };');
    if (innerParts.length === 2) {
      content = parts[0] + mudarNew.replace('window.mudarGuiaOrcamento = async function(nomeGuia, gid, el) {', 'window.mudarGuiaOrcamento = async function(nomeGuia, gid, el) {\n') + innerParts[1];
      console.log('mudarGuiaOrcamento patched (CRLF)');
    } else {
      console.log('mudarGuiaOrcamento split 2 failed');
    }
  }
} else {
  console.log('mudarGuiaOrcamento split 1 failed');
}

const carregarOld = `window.carregarOrcamentoData = async function() {
  try {
    let url = 'https://docs.google.com/spreadsheets/d/1NQuN9icUm8RL08pqkPia3ZrgoC5zEka99mK43sUJm3o/gviz/tq?tqx=out:csv';
    if (_guiaAtualGid) url += '&gid=' + _guiaAtualGid;
    else url += '&sheet=' + encodeURIComponent(_guiaAtualSheet);
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const csv = await res.text();
    
    // Parse CSV
    const lines = csv.split('\\n');
    ORCAMENTO_DATA.length = 0; // Clear array`;

let carregarParts = content.split('// Parse CSV');
if (carregarParts.length >= 2) {
  const insertCode = `
    if (_guiaAtualGid === '807660383') {
      _crmData = csv.split('\\n').slice(1).map(line => {
        const regex = /"([^"]*)"|([^,]+)/g;
        const row = [];
        let m;
        while ((m = regex.exec(line)) !== null) {
          row.push(m[1] !== undefined ? m[1] : (m[2] || ''));
        }
        return {
          pa: row[0] || '',
          fonte: row[1] || '',
          despesa: row[2] || '',
          tipo: row[3] || '',
          processo: row[4] || '',
          data: row[5] || '',
          setor: row[6] || '',
          descricao: row[7] || '',
          valorText: row[8] || '0,00'
        };
      }).filter(r => r.processo || r.descricao);
      window.popularFiltrosDespesas();
      window.renderDespesasRealizadas();
      return;
    }
  `;
  // We insert after the split of csv.split('\n'); ORCAMENTO_DATA.length = 0;
  // Actually let's just replace ORCAMENTO_DATA.length = 0;
  let oParts = content.split('ORCAMENTO_DATA.length = 0; // Clear array');
  if (oParts.length >= 2) {
    content = oParts[0] + insertCode + '\n    ORCAMENTO_DATA.length = 0; // Clear array' + oParts.slice(1).join('ORCAMENTO_DATA.length = 0; // Clear array');
    console.log('carregarOrcamentoData patched');
  } else {
    console.log('ORCAMENTO_DATA.length = 0; not found');
  }
} else {
  console.log('Parse CSV not found');
}

fs.writeFileSync(file, content);
console.log('Done');
