const fs = require('fs');
const jsCode = `
let proalfaData = null;
let currentTabProalfa = 'Docentes_Rede_Municipal_2025';

const TAB_CONFIG = [
  { id: 'Docentes_Rede_Municipal_2025', title: 'Docentes Municipais', type: 'docentes' },
  { id: 'Matrículas_Municipal_2025', title: 'Alunos Municipais', type: 'matriculas' },
  { id: 'Docentes_Rede_Est.2025-EF-AI', title: 'Docentes Estaduais', type: 'docentes' },
  { id: 'Matrículas_Estadual_2025-EF-AI', title: 'Alunos Estaduais', type: 'matriculas' }
];

async function carregarProalfa() {
  try {
    const res = await fetch('proalfa.json');
    const json = await res.json();
    
    proalfaData = {};
    for (let k of Object.keys(json)) {
      const rows = json[k];
      let startIdx = 4;
      if (rows[4] && rows[4].length === 0) startIdx = 5;
      
      const validRows = [];
      for (let i = startIdx; i < rows.length; i++) {
        if (rows[i] && rows[i].length > 5 && rows[i][0]) { 
          validRows.push(rows[i]);
        }
      }
      proalfaData[k] = validRows;
    }

    renderProalfaTabs();
    selecionarTabProalfa(currentTabProalfa);
    
    document.querySelectorAll('#page-proalfa .filter-select, #page-proalfa .search-input').forEach(el => {
      el.addEventListener('input', filtrarProalfa);
    });
  } catch(e) {
    console.error('Error loading proalfa:', e);
  }
}

function renderProalfaTabs() {
  const container = document.getElementById('proalfa-tabs');
  container.innerHTML = '';
  
  TAB_CONFIG.forEach(tab => {
    const rows = proalfaData[tab.id] || [];
    let sum = 0;
    const isDoc = tab.type === 'docentes';
    const sumIdx = isDoc ? 10 : 9; 
    rows.forEach(r => {
      const v = Number(r[sumIdx]);
      if(!isNaN(v)) sum += v;
    });

    const btn = document.createElement('button');
    btn.className = 'tab-btn proalfa-tab-btn';
    btn.dataset.tab = tab.id;
    btn.style.padding = '10px 20px';
    btn.style.border = '1px solid var(--border-color)';
    btn.style.borderRadius = '8px';
    btn.style.background = 'rgba(255,255,255,0.05)';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    btn.style.fontWeight = 'bold';
    btn.innerHTML = \`\${tab.title} <br><span style="font-size:16px; color:#10b981;">\${sum.toLocaleString('pt-BR')}</span>\`;
    
    btn.onclick = () => selecionarTabProalfa(tab.id);
    container.appendChild(btn);
  });
}

function selecionarTabProalfa(tabId) {
  currentTabProalfa = tabId;
  document.querySelectorAll('.proalfa-tab-btn').forEach(b => {
    if(b.dataset.tab === tabId) {
       b.style.background = '#6366f1';
       b.style.borderColor = '#6366f1';
    } else {
       b.style.background = 'rgba(255,255,255,0.05)';
       b.style.borderColor = 'var(--border-color)';
    }
  });
  
  preencherCombosProalfa();
  filtrarProalfa();
}

function preencherCombosProalfa() {
  const isDoc = TAB_CONFIG.find(t => t.id === currentTabProalfa)?.type === "docentes";
  const data = proalfaData[currentTabProalfa] || [];
  
  const superSet = new Set();
  const munSet = new Set();
  const distSet = new Set();
  const depSet = new Set();
  const docSet = new Set();
  
  data.forEach(r => {
    if(r[0]) superSet.add(r[0]);
    if(r[1]) munSet.add(r[1]);
    if(r[2]) distSet.add(r[2]);
    if(r[5]) depSet.add(r[5]);
    if(isDoc && r[8]) docSet.add(r[8]);
  });
  
  const fill = (id, set) => {
    const el = document.getElementById(id);
    if(!el) return;
    const currentVal = el.value;
    el.innerHTML = '<option value="">Todos</option>' + 
      [...set].sort().map(s => \`<option value="\${s}">\${s}</option>\`).join('');
    if([...set].includes(currentVal)) el.value = currentVal;
  };
  
  fill('proalfa-super', superSet);
  fill('proalfa-municipio', munSet);
  fill('proalfa-distrito', distSet);
  fill('proalfa-dep', depSet);
  
  if (isDoc) { 
    fill('proalfa-docentes', new Set([...docSet].sort((a,b)=>Number(a)-Number(b)))); 
    document.getElementById('proalfa-docentes').disabled = false; 
  } else { 
    document.getElementById('proalfa-docentes').innerHTML='<option value="">N/A</option>'; 
    document.getElementById('proalfa-docentes').disabled = true; 
  }
}

function limparFiltrosProalfa() {
  document.querySelectorAll('#page-proalfa .filter-select, #page-proalfa .search-input').forEach(el => {
    el.value = '';
  });
  filtrarProalfa();
}

function filtrarProalfa() {
  const tabConf = TAB_CONFIG.find(t => t.id === currentTabProalfa);
  if(!tabConf) return;
  const isDoc = tabConf.type === 'docentes';
  
  let data = proalfaData[currentTabProalfa] || [];
  
  const busca = document.getElementById('proalfa-busca').value.toLowerCase();
  const filterSuper = document.getElementById('proalfa-super').value;
  const filterMun = document.getElementById('proalfa-municipio').value;
  const filterDist = document.getElementById('proalfa-distrito').value;
  const filterDep = document.getElementById('proalfa-dep').value;
  const filterDoc = document.getElementById('proalfa-docentes').value;
  
  const filtrados = data.filter(r => {
    if(filterSuper && r[0] !== filterSuper) return false;
    if(filterMun && r[1] !== filterMun) return false;
    if(filterDist && r[2] !== filterDist) return false;
    if(filterDep && r[5] !== filterDep) return false;
    if(isDoc && filterDoc && String(r[8]) !== String(filterDoc)) return false;
    
    if(busca) {
      const text = r.join(' ').toLowerCase();
      if(!text.includes(busca)) return false;
    }
    return true;
  });
  
  renderTableProalfa(filtrados, isDoc);
}

function renderTableProalfa(dados, isDoc) {
  const thead = document.getElementById('proalfa-thead-tr');
  const tbody = document.getElementById('proalfa-tbody');
  const tfoot = document.getElementById('proalfa-tfoot');
  
  const countEl = document.getElementById('proalfa-count');
  if(countEl) countEl.innerHTML = \`\${dados.length} escolas listadas\`;
  
  const thStyle = 'border-bottom:1px solid rgba(255,255,255,0.1); padding:10px; background:var(--bg-secondary); color:#9ca3af; font-weight:600; text-transform:uppercase; font-size:11px; letter-spacing:0.5px; text-align:center;';
  const thLeftStyle = thStyle.replace('text-align:center', 'text-align:left');
  
  if (isDoc) {
    thead.innerHTML = \`
      <th style="width:5%; \${thStyle}">Nº</th>
      <th style="width:12%; \${thLeftStyle}">SUPER</th>
      <th style="width:10%; \${thLeftStyle}">MUNICÍPIO</th>
      <th style="width:10%; \${thLeftStyle}">DISTRITO</th>
      <th style="width:8%; \${thLeftStyle}">INEP</th>
      <th style="width:15%; \${thLeftStyle}">ESCOLA</th>
      <th style="width:7%; \${thStyle}">DOCENTES</th>
      <th style="width:7%; \${thStyle}">E.F</th>
      <th style="width:7%; \${thStyle}; color:#10b981;">A.I</th>
      <th style="width:7%; \${thStyle}">1º</th>
      <th style="width:7%; \${thStyle}">2º</th>
      <th style="width:7%; \${thStyle}">3º</th>
      <th style="width:7%; \${thStyle}">4º</th>
      <th style="width:7%; \${thStyle}">5º</th>
    \`;
  } else {
    thead.innerHTML = \`
      <th style="width:5%; \${thStyle}">Nº</th>
      <th style="width:12%; \${thLeftStyle}">SUPER</th>
      <th style="width:10%; \${thLeftStyle}">MUNICÍPIO</th>
      <th style="width:10%; \${thLeftStyle}">DISTRITO</th>
      <th style="width:8%; \${thLeftStyle}">INEP</th>
      <th style="width:15%; \${thLeftStyle}">ESCOLA</th>
      <th style="width:7%; \${thStyle}">E.F</th>
      <th style="width:7%; \${thStyle}; color:#10b981;">A.I</th>
      <th style="width:7%; \${thStyle}">1º</th>
      <th style="width:7%; \${thStyle}">2º</th>
      <th style="width:7%; \${thStyle}">3º</th>
      <th style="width:7%; \${thStyle}">4º</th>
      <th style="width:7%; \${thStyle}">5º</th>
    \`;
  }

  let html = '';
  
  let sumDocentes = 0;
  let sumEF = 0;
  let sumAI = 0;
  let sum1 = 0;
  let sum2 = 0;
  let sum3 = 0;
  let sum4 = 0;
  let sum5 = 0;
  
  const tdStyle = 'padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); color:#e2e8f0; font-size:12px;';
  
  dados.forEach((r, i) => {
    let tr = '<tr>';
    tr += \`<td style="\${tdStyle} text-align:center;">\${i+1}</td>\`;
    tr += \`<td style="\${tdStyle}">\${r[0]||'-'}</td>\`; 
    tr += \`<td style="\${tdStyle}">\${r[1]||'-'}</td>\`; 
    tr += \`<td style="\${tdStyle}">\${r[2]||'-'}</td>\`; 
    tr += \`<td style="\${tdStyle}">\${r[3]||'-'}</td>\`; 
    tr += \`<td style="\${tdStyle}">\${r[4]||'-'}</td>\`; 
    
    if (isDoc) {
      tr += \`<td style="\${tdStyle} text-align:center;">\${r[8]||'0'}</td>\`;
      tr += \`<td style="\${tdStyle} text-align:center;">\${r[9]||'0'}</td>\`;
      tr += \`<td style="\${tdStyle} text-align:center; font-weight:bold; color:#10b981;">\${r[10]||'0'}</td>\`;
      tr += \`<td style="\${tdStyle} text-align:center;">\${r[11]||'0'}</td>\`;
      tr += \`<td style="\${tdStyle} text-align:center;">\${r[12]||'0'}</td>\`;
      tr += \`<td style="\${tdStyle} text-align:center;">\${r[13]||'0'}</td>\`;
      tr += \`<td style="\${tdStyle} text-align:center;">\${r[14]||'0'}</td>\`;
      tr += \`<td style="\${tdStyle} text-align:center;">\${r[15]||'0'}</td>\`;
      
      sumDocentes += Number(r[8]||0);
      sumEF += Number(r[9]||0);
      sumAI += Number(r[10]||0);
      sum1 += Number(r[11]||0);
      sum2 += Number(r[12]||0);
      sum3 += Number(r[13]||0);
      sum4 += Number(r[14]||0);
      sum5 += Number(r[15]||0);
      
    } else {
      tr += \`<td style="\${tdStyle} text-align:center;">\${r[8]||'0'}</td>\`;
      tr += \`<td style="\${tdStyle} text-align:center; font-weight:bold; color:#10b981;">\${r[9]||'0'}</td>\`;
      tr += \`<td style="\${tdStyle} text-align:center;">\${r[10]||'0'}</td>\`;
      tr += \`<td style="\${tdStyle} text-align:center;">\${r[11]||'0'}</td>\`;
      tr += \`<td style="\${tdStyle} text-align:center;">\${r[12]||'0'}</td>\`;
      tr += \`<td style="\${tdStyle} text-align:center;">\${r[13]||'0'}</td>\`;
      tr += \`<td style="\${tdStyle} text-align:center;">\${r[14]||'0'}</td>\`;
      
      sumEF += Number(r[8]||0);
      sumAI += Number(r[9]||0);
      sum1 += Number(r[10]||0);
      sum2 += Number(r[11]||0);
      sum3 += Number(r[12]||0);
      sum4 += Number(r[13]||0);
      sum5 += Number(r[14]||0);
    }
    tr += '</tr>';
    html += tr;
  });
  
  if (dados.length === 0) {
    html = \`<tr><td colspan="\${isDoc?14:13}" style="text-align:center; padding:20px;">Nenhum registro encontrado.</td></tr>\`;
  }
  
  tbody.innerHTML = html;
  
  if(dados.length > 0) {
    const topContainer = document.getElementById('proalfa-totals-top');
    if (topContainer) {
      let topHtml = \`<div style="color:#10b981; font-weight:bold; font-size:12px; display:flex; align-items:center; margin-right:10px;">TOTAIS DA BUSCA:</div>\`;
      
      const statStyle = 'display:flex; flex-direction:column; align-items:center; min-width:60px;';
      const labelStyle = 'font-size:10px; color:var(--text-muted); text-transform:uppercase;';
      const valStyle = 'font-size:14px; font-weight:bold; color:#fff;';
      const valGreen = 'font-size:14px; font-weight:bold; color:#10b981;';
      
      if (isDoc) {
         topHtml += \`<div style="\${statStyle}"><span style="\${labelStyle}">DOCENTES</span><span style="\${valStyle}">\${sumDocentes.toLocaleString('pt-BR')}</span></div>\`;
      }
      
      topHtml += \`
        <div style="\${statStyle}"><span style="\${labelStyle}">E.F</span><span style="\${valStyle}">\${sumEF.toLocaleString('pt-BR')}</span></div>
        <div style="\${statStyle}"><span style="\${labelStyle}">A.I</span><span style="\${valGreen}">\${sumAI.toLocaleString('pt-BR')}</span></div>
        <div style="\${statStyle}"><span style="\${labelStyle}">1º</span><span style="\${valStyle}">\${sum1.toLocaleString('pt-BR')}</span></div>
        <div style="\${statStyle}"><span style="\${labelStyle}">2º</span><span style="\${valStyle}">\${sum2.toLocaleString('pt-BR')}</span></div>
        <div style="\${statStyle}"><span style="\${labelStyle}">3º</span><span style="\${valStyle}">\${sum3.toLocaleString('pt-BR')}</span></div>
        <div style="\${statStyle}"><span style="\${labelStyle}">4º</span><span style="\${valStyle}">\${sum4.toLocaleString('pt-BR')}</span></div>
        <div style="\${statStyle}"><span style="\${labelStyle}">5º</span><span style="\${valStyle}">\${sum5.toLocaleString('pt-BR')}</span></div>
      \`;
      topContainer.innerHTML = topHtml;
      topContainer.style.display = 'flex';
    }
    tfoot.innerHTML = '';
  } else {
    tfoot.innerHTML = '';
    const topContainer = document.getElementById('proalfa-totals-top');
    if (topContainer) topContainer.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const page = btn.getAttribute('data-page');
      if (page === 'proalfa' && !proalfaData) {
        carregarProalfa();
      }
    });
  });
});
`;
fs.writeFileSync('js/proalfa.js', jsCode, 'utf8');
console.log('Restored js/proalfa.js successfully.');
