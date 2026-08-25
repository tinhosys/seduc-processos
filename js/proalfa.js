
let proalfaData = null;
let currentTabProalfa = 'Docentes_Rede_Municipal_2025';

const TAB_CONFIG = [
  { id: 'Docentes_Rede_Municipal_2025',    title: 'Docentes Municipais',  type: 'docentes'   },
  { id: 'Matrículas_Municipal_2025',       title: 'Alunos Municipais',    type: 'matriculas' },
  { id: 'Docentes_Rede_Est.2025-EF-AI',   title: 'Docentes Estaduais',   type: 'docentes'   },
  { id: 'Matrículas_Estadual_2025-EF-AI', title: 'Alunos Estaduais',     type: 'matriculas' }
];

// ─── ESTRUTURA DAS COLUNAS (proalfa.json) ─────────────────────────────────────
// r[0] SUPER   r[1] Município  r[2] Distrito  r[3] INEP (numérico)  r[4] Escola
// r[5] Dependência (Competência)   r[6] Localização   r[7] Loc.Diferenciada
//
// DOCENTES:   r[8]=Total Docentes  r[9]=EF Total  r[10]=AI Total
//             r[11]=1º  r[12]=2º  r[13]=3º  r[14]=4º  r[15]=5º
//
// MATRÍCULAS: r[8]=TOTAL planilha (não usar — calcular)
//             r[9]=1º  r[10]=2º  r[11]=3º  r[12]=4º  r[13]=5º
//
// ATENÇÃO: a planilha inclui uma linha "Total" ao final com r[0]="Total" e
//          r[3]=null. O filtro abaixo exige INEP numérico > 0 para excluí-la.
// ─────────────────────────────────────────────────────────────────────────────

/** Valida linha de dados: deve ter INEP numérico e nome de escola */
function _isValidDataRow(r) {
  if (!r || r.length <= 5 || !r[0]) return false;
  const inep = Number(r[3]);
  if (!inep || isNaN(inep) || inep <= 0) return false; // exclui linhas Total/subtotal
  if (!r[4] || r[4] === '-') return false;
  return true;
}

/** Soma dos 5 anos individuais de matrículas (não usa r[8] que pode estar vazio) */
function _somaMatriculas(r) {
  return (Number(r[9])||0) + (Number(r[10])||0) + (Number(r[11])||0) +
         (Number(r[12])||0) + (Number(r[13])||0);
}

// ─── CARREGAR DADOS ──────────────────────────────────────────────────────────
async function carregarProalfa() {
  try {
    const res  = await fetch('proalfa.json');
    const json = await res.json();

    proalfaData = {};
    for (const k of Object.keys(json)) {
      const rows    = json[k];
      let startIdx  = 4;
      if (rows[4] && rows[4].length === 0) startIdx = 5;

      proalfaData[k] = rows
        .slice(startIdx)
        .filter(_isValidDataRow);
    }

    renderProalfaTabs();
    selecionarTabProalfa(currentTabProalfa);

    document.querySelectorAll('#page-proalfa .filter-select, #page-proalfa .search-input')
      .forEach(el => el.addEventListener('input', filtrarProalfa));

  } catch (e) {
    console.error('Erro ao carregar proalfa:', e);
  }
}

// ─── ABAS (tab buttons) ──────────────────────────────────────────────────────
function renderProalfaTabs() {
  const container = document.getElementById('proalfa-tabs');
  container.innerHTML = '';
  container.style.flexDirection = 'column';

  const row1 = document.createElement('div');
  row1.style.cssText = 'display:flex; gap:10px; flex:1;';
  const row2 = document.createElement('div');
  row2.style.cssText = 'display:flex; gap:10px; flex:1;';

  TAB_CONFIG.forEach((tab, idx) => {
    const rows  = proalfaData[tab.id] || [];
    const isDoc = tab.type === 'docentes';
    let sum = 0;

    rows.forEach(r => {
      if (isDoc) {
        // r[10] = AI Total (Anos Iniciais)
        sum += Number(r[10]) || 0;
      } else {
        // soma dos 5 anos individuais (exclui linha Total da planilha via _isValidDataRow)
        sum += _somaMatriculas(r);
      }
    });

    const btn = document.createElement('button');
    btn.className     = 'tab-btn proalfa-tab-btn';
    btn.dataset.tab   = tab.id;
    btn.style.cssText = 'padding:8px 10px; border:1px solid var(--border-color); border-radius:8px; background:rgba(255,255,255,0.05); color:#fff; cursor:pointer; font-weight:bold; flex:1;';
    btn.innerHTML     = `${tab.title} <br><span style="font-size:16px; color:#10b981;">${sum.toLocaleString('pt-BR')}</span>`;
    btn.onclick       = () => selecionarTabProalfa(tab.id);

    (idx < 2 ? row1 : row2).appendChild(btn);
  });

  container.appendChild(row1);
  container.appendChild(row2);
}

// ─── SELECIONAR ABA ──────────────────────────────────────────────────────────
function selecionarTabProalfa(tabId) {
  currentTabProalfa = tabId;
  document.querySelectorAll('.proalfa-tab-btn').forEach(b => {
    const span = b.querySelector('span');
    const ativo = b.dataset.tab === tabId;
    b.style.background  = ativo ? '#6366f1' : 'rgba(255,255,255,0.05)';
    b.style.borderColor = ativo ? '#6366f1' : 'var(--border-color)';
    if (span) span.style.color = ativo ? '#ffffff' : '#10b981';
  });

  preencherCombosProalfa();
  filtrarProalfa();
}

// ─── PREENCHER COMBOS ─────────────────────────────────────────────────────────
function preencherCombosProalfa() {
  const data = proalfaData[currentTabProalfa] || [];

  const superSet = new Set();
  const munSet   = new Set();
  const distSet  = new Set();
  const locSet   = new Set();   // r[6] Localização

  data.forEach(r => {
    if (r[0]) superSet.add(r[0]);
    if (r[1]) munSet.add(r[1]);
    if (r[2]) distSet.add(r[2]);
    if (r[6]) locSet.add(r[6]);
  });

  const fill = (id, set) => {
    const el = document.getElementById(id);
    if (!el) return;
    const cur = el.value;
    el.innerHTML = '<option value="">Todos</option>' +
      [...set].sort().map(s => `<option value="${s}">${s}</option>`).join('');
    if ([...set].includes(cur)) el.value = cur;
  };

  fill('proalfa-super',       superSet);
  fill('proalfa-municipio',   munSet);
  fill('proalfa-distrito',    distSet);
  fill('proalfa-localizacao', locSet);
  // COMPETÊNCIA removida: cada aba já é específica por rede (Municipal/Estadual)
}

// ─── LIMPAR FILTROS ──────────────────────────────────────────────────────────
function limparFiltrosProalfa() {
  document.querySelectorAll('#page-proalfa .filter-select, #page-proalfa .search-input')
    .forEach(el => { el.value = ''; });
  filtrarProalfa();
}

// ─── FILTRAR ─────────────────────────────────────────────────────────────────
function filtrarProalfa() {
  const tabConf = TAB_CONFIG.find(t => t.id === currentTabProalfa);
  if (!tabConf) return;
  const isDoc = tabConf.type === 'docentes';

  const busca       = (document.getElementById('proalfa-busca')?.value || '').toLowerCase();
  const filterSuper = document.getElementById('proalfa-super')?.value || '';
  const filterMun   = document.getElementById('proalfa-municipio')?.value || '';
  const filterDist  = document.getElementById('proalfa-distrito')?.value || '';
  const filterLoc   = document.getElementById('proalfa-localizacao')?.value || '';

  const filtrados = (proalfaData[currentTabProalfa] || []).filter(r => {
    if (filterSuper && r[0] !== filterSuper) return false;
    if (filterMun   && r[1] !== filterMun)   return false;
    if (filterDist  && r[2] !== filterDist)  return false;
    if (filterLoc   && r[6] !== filterLoc)   return false;
    if (busca && !r.join(' ').toLowerCase().includes(busca)) return false;
    return true;
  });

  renderTableProalfa(filtrados, isDoc);
}

// ─── RENDERIZAR TABELA ───────────────────────────────────────────────────────
function renderTableProalfa(dados, isDoc) {
  const thead   = document.getElementById('proalfa-thead-tr');
  const tbody   = document.getElementById('proalfa-tbody');
  const tfoot   = document.getElementById('proalfa-tfoot');
  const countEl = document.getElementById('proalfa-count');

  if (countEl) countEl.innerHTML = `${dados.length} escolas listadas`;

  const thC = 'border-bottom:1px solid rgba(255,255,255,0.1); padding:10px; background:var(--bg-secondary); color:#9ca3af; font-weight:600; text-transform:uppercase; font-size:11px; letter-spacing:0.5px; text-align:center;';
  const thL = thC.replace('text-align:center', 'text-align:left');

  // ── CABEÇALHOS ─────────────────────────────────────────────────────────────
  if (isDoc) {
    thead.innerHTML = `
      <th style="width:4%;  ${thC}">Nº</th>
      <th style="width:11%; ${thL}">SUPER</th>
      <th style="width:9%;  ${thL}">MUNICÍPIO</th>
      <th style="width:9%;  ${thL}">DISTRITO</th>
      <th style="width:7%;  ${thL}">INEP</th>
      <th style="width:14%; ${thL}">ESCOLA</th>
      <th style="width:7%;  ${thL}">LOCALIZAÇÃO</th>
      <th style="width:6%;  ${thC}">DOCENTES</th>
      <th style="width:5%;  ${thC}">E.F</th>
      <th style="width:5%;  ${thC}; color:#10b981;">A.I</th>
      <th style="width:5%;  ${thC}">1º</th>
      <th style="width:5%;  ${thC}">2º</th>
      <th style="width:5%;  ${thC}">3º</th>
      <th style="width:5%;  ${thC}">4º</th>
      <th style="width:5%;  ${thC}">5º</th>`;
  } else {
    thead.innerHTML = `
      <th style="width:4%;  ${thC}">Nº</th>
      <th style="width:12%; ${thL}">SUPER</th>
      <th style="width:9%;  ${thL}">MUNICÍPIO</th>
      <th style="width:9%;  ${thL}">DISTRITO</th>
      <th style="width:7%;  ${thL}">INEP</th>
      <th style="width:14%; ${thL}">ESCOLA</th>
      <th style="width:7%;  ${thL}">LOCALIZAÇÃO</th>
      <th style="width:7%;  ${thC}; color:#10b981;">TOTAL</th>
      <th style="width:6%;  ${thC}">1º</th>
      <th style="width:6%;  ${thC}">2º</th>
      <th style="width:6%;  ${thC}">3º</th>
      <th style="width:6%;  ${thC}">4º</th>
      <th style="width:6%;  ${thC}">5º</th>`;
  }

  // ── BADGE DE LOCALIZAÇÃO ───────────────────────────────────────────────────
  const locPalette = {
    'Urbana':     { bg:'rgba(6,182,212,0.18)',  color:'#22d3ee', border:'rgba(6,182,212,0.35)'  },
    'Rural':      { bg:'rgba(16,185,129,0.18)', color:'#34d399', border:'rgba(16,185,129,0.35)' },
    'Indígena':   { bg:'rgba(245,158,11,0.18)', color:'#fbbf24', border:'rgba(245,158,11,0.35)' },
    'Quilombola': { bg:'rgba(139,92,246,0.18)', color:'#a78bfa', border:'rgba(139,92,246,0.35)' }
  };
  const locBadge = val => {
    const lc = locPalette[val];
    if (!val) return '<span style="color:var(--text-muted)">-</span>';
    if (!lc)  return `<span style="color:var(--text-secondary)">${val}</span>`;
    return `<span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;` +
           `background:${lc.bg};color:${lc.color};border:1px solid ${lc.border}">${val}</span>`;
  };

  // ── ACUMULADORES ───────────────────────────────────────────────────────────
  let sumDoc = 0, sumEF = 0, sumAI = 0;
  let sum1 = 0, sum2 = 0, sum3 = 0, sum4 = 0, sum5 = 0, sumTot = 0;

  const td  = 'padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); color:#e2e8f0; font-size:12px;';
  const tdc = td + ' text-align:center;';

  // ── LINHAS ─────────────────────────────────────────────────────────────────
  let html = '';
  dados.forEach((r, i) => {
    let tr = '<tr>';
    tr += `<td style="${tdc}">${i + 1}</td>`;
    tr += `<td style="${td}">${r[0] || '-'}</td>`;
    tr += `<td style="${td}">${r[1] || '-'}</td>`;
    tr += `<td style="${td}">${r[2] || '-'}</td>`;
    tr += `<td style="${td}">${r[3] || '-'}</td>`;
    tr += `<td style="${td}">${r[4] || '-'}</td>`;
    tr += `<td style="${td}">${locBadge(r[6])}</td>`;

    if (isDoc) {
      const doc = Number(r[8])  || 0;
      const ef  = Number(r[9])  || 0;
      const ai  = Number(r[10]) || 0;
      const a1  = Number(r[11]) || 0;
      const a2  = Number(r[12]) || 0;
      const a3  = Number(r[13]) || 0;
      const a4  = Number(r[14]) || 0;
      const a5  = Number(r[15]) || 0;
      tr += `<td style="${tdc}">${doc}</td>`;
      tr += `<td style="${tdc}">${ef}</td>`;
      tr += `<td style="${tdc}font-weight:bold;color:#10b981;">${ai}</td>`;
      tr += `<td style="${tdc}">${a1}</td>`;
      tr += `<td style="${tdc}">${a2}</td>`;
      tr += `<td style="${tdc}">${a3}</td>`;
      tr += `<td style="${tdc}">${a4}</td>`;
      tr += `<td style="${tdc}">${a5}</td>`;
      sumDoc += doc; sumEF += ef; sumAI += ai;
      sum1 += a1; sum2 += a2; sum3 += a3; sum4 += a4; sum5 += a5;
    } else {
      // 1º=r[9]  2º=r[10]  3º=r[11]  4º=r[12]  5º=r[13]
      const a1  = Number(r[9])  || 0;
      const a2  = Number(r[10]) || 0;
      const a3  = Number(r[11]) || 0;
      const a4  = Number(r[12]) || 0;
      const a5  = Number(r[13]) || 0;
      const tot = a1 + a2 + a3 + a4 + a5;
      tr += `<td style="${tdc}font-weight:bold;color:#10b981;">${tot || '-'}</td>`;
      tr += `<td style="${tdc}">${a1 || '-'}</td>`;
      tr += `<td style="${tdc}">${a2 || '-'}</td>`;
      tr += `<td style="${tdc}">${a3 || '-'}</td>`;
      tr += `<td style="${tdc}">${a4 || '-'}</td>`;
      tr += `<td style="${tdc}">${a5 || '-'}</td>`;
      sum1 += a1; sum2 += a2; sum3 += a3; sum4 += a4; sum5 += a5;
      sumTot += tot;
    }

    tr += '</tr>';
    html += tr;
  });

  if (!dados.length) {
    const cols = isDoc ? 15 : 13;
    html = `<tr><td colspan="${cols}" style="text-align:center;padding:20px;">Nenhum registro encontrado.</td></tr>`;
  }
  tbody.innerHTML = html;

  // ── TFOOT — linha de totais alinhada à direita ─────────────────────────────
  if (dados.length > 0) {
    const tfStyle = 'padding:10px; background:rgba(255,255,255,0.04); color:#e2e8f0; font-weight:700; font-size:12px; border-top:2px solid rgba(255,255,255,0.15);';
    const tfC     = tfStyle + ' text-align:center; color:#10b981;';

    // Colunas fixas: Nº, SUPER, MUNICÍPIO, DISTRITO, INEP, ESCOLA, LOCALIZAÇÃO
    // "Total" fica right-aligned cobrindo até a coluna ESCOLA
    let tfRow = '<tr>';
    tfRow += `<td style="${tfStyle} text-align:right; color:#9ca3af;" colspan="7">Total</td>`;

    if (isDoc) {
      tfRow += `<td style="${tfC}">${sumDoc.toLocaleString('pt-BR')}</td>`;
      tfRow += `<td style="${tfC}">${sumEF.toLocaleString('pt-BR')}</td>`;
      tfRow += `<td style="${tfC}">${sumAI.toLocaleString('pt-BR')}</td>`;
    } else {
      tfRow += `<td style="${tfC}">${sumTot.toLocaleString('pt-BR')}</td>`;
    }

    tfRow += `<td style="${tfC}">${sum1.toLocaleString('pt-BR')}</td>`;
    tfRow += `<td style="${tfC}">${sum2.toLocaleString('pt-BR')}</td>`;
    tfRow += `<td style="${tfC}">${sum3.toLocaleString('pt-BR')}</td>`;
    tfRow += `<td style="${tfC}">${sum4.toLocaleString('pt-BR')}</td>`;
    tfRow += `<td style="${tfC}">${sum5.toLocaleString('pt-BR')}</td>`;
    tfRow += '</tr>';
    tfoot.innerHTML = tfRow;
  } else {
    tfoot.innerHTML = '';
  }

  // ── TOTAIS NO TOPO ────────────────────────────────────────────────────────
  const topContainer = document.getElementById('proalfa-totals-top');
  if (!topContainer) return;

  if (dados.length > 0) {
    const sS = 'display:flex; flex-direction:column; align-items:center; min-width:60px;';
    const lS = 'font-size:10px; color:var(--text-muted); text-transform:uppercase;';
    const vS = 'font-size:14px; font-weight:bold; color:#fff;';
    const vG = 'font-size:14px; font-weight:bold; color:#10b981;';

    let topHtml = `<div style="color:#10b981;font-weight:bold;font-size:12px;display:flex;align-items:center;margin-right:10px;">TOTAIS DA BUSCA:</div>`;

    if (isDoc) {
      topHtml += `<div style="${sS}"><span style="${lS}">DOCENTES</span><span style="${vS}">${sumDoc.toLocaleString('pt-BR')}</span></div>`;
      topHtml += `<div style="${sS}"><span style="${lS}">E.F</span><span style="${vS}">${sumEF.toLocaleString('pt-BR')}</span></div>`;
      topHtml += `<div style="${sS}"><span style="${lS}">A.I</span><span style="${vG}">${sumAI.toLocaleString('pt-BR')}</span></div>`;
    } else {
      topHtml += `<div style="${sS}"><span style="${lS}">TOTAL</span><span style="${vG}">${sumTot.toLocaleString('pt-BR')}</span></div>`;
    }

    topHtml += `
      <div style="${sS}"><span style="${lS}">1º</span><span style="${vS}">${sum1.toLocaleString('pt-BR')}</span></div>
      <div style="${sS}"><span style="${lS}">2º</span><span style="${vS}">${sum2.toLocaleString('pt-BR')}</span></div>
      <div style="${sS}"><span style="${lS}">3º</span><span style="${vS}">${sum3.toLocaleString('pt-BR')}</span></div>
      <div style="${sS}"><span style="${lS}">4º</span><span style="${vS}">${sum4.toLocaleString('pt-BR')}</span></div>
      <div style="${sS}"><span style="${lS}">5º</span><span style="${vS}">${sum5.toLocaleString('pt-BR')}</span></div>`;

    topContainer.innerHTML = topHtml;
    topContainer.style.display = 'flex';
  } else {
    topContainer.style.display = 'none';
  }
}

// ─── INICIALIZAR AO NAVEGAR ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('data-page') === 'proalfa' && !proalfaData) {
        carregarProalfa();
      }
    });
  });
});
