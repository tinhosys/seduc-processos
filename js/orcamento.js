// ============================================================
// CONTROLE ORÇAMENTÁRIO – CAM SEDUC-RO
// ============================================================

// ---- Dicionário de Natureza da Despesa ----
const NATUREZA_DESCRICAO = {
  '335031': { nome: 'Auxílios – Contribuições',            categoria: 'Transferências', icon: '🏆', cor: '#a78bfa' },
  '335041': { nome: 'Auxílios – Fomento',                  categoria: 'Transferências', icon: '🌱', cor: '#34d399' },
  '339014': { nome: 'Diárias – Pessoal Civil',             categoria: 'Pessoal',        icon: '🏨', cor: '#60a5fa' },
  '339030': { nome: 'Material de Consumo',                 categoria: 'Material',       icon: '📦', cor: '#fbbf24' },
  '339032': { nome: 'Material de Distribuição Gratuita',   categoria: 'Material',       icon: '🎁', cor: '#f472b6' },
  '339033': { nome: 'Passagens e Locomoção',               categoria: 'Serviços',       icon: '✈️', cor: '#38bdf8' },
  '339036': { nome: 'Outros Serv. Terceiros – Pessoa Física', categoria: 'Serviços',   icon: '👤', cor: '#fb923c' },
  '339039': { nome: 'Outros Serv. Terceiros – Pessoa Jurídica', categoria: 'Serviços', icon: '🏢', cor: '#818cf8' },
  '339048': { nome: 'Auxílio Financeiro a Pessoa Física',  categoria: 'Transferências', icon: '💳', cor: '#4ade80' },
  '449052': { nome: 'Material Permanente',                 categoria: 'Capital',        icon: '🖥️', cor: '#e879f9' },
};

// ---- Dicionário de Programas de Ação ----
const PA_DESCRICAO = {
  '4096': 'Formação Continuada e em Serviço',
  '4097': 'Bolsas para Articuladores e Formadores',
  '4099': 'Tutoria Pedagógica',
  '4100': 'Avaliação da Aprendizagem',
  '4101': 'Material de Suporte Pedagógico',
  '4185': 'Premiação e Fomento a Escolas',
};

// ---- Dicionário de Fontes de Recurso ----
const FONTE_DESCRICAO = {
  '1500001001': 'Recursos Próprios – Tesouro Estadual',
  '1500101001': 'Tesouro Estadual – Vinculado',
  '1569000001': 'Transferência Federal – Específica',
  '2569000001': 'Transferência Federal – Livre',
};

// ---- Dados da Planilha (CSV importado) ----
const ORCAMENTO_DATA = [];

let _guiaAtualGid = '325984433';
let _guiaAtualSheet = '26 Execução Orçamentária';

window.mudarGuiaOrcamento = async function(nomeGuia, gid, el) {
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
    const lines = csv.split('\n');
    ORCAMENTO_DATA.length = 0; // Clear array
    for (let i = 1; i < lines.length; i++) {
      let l = lines[i];
      if (!l || l.trim() === '') continue;
      // Basic CSV split
      const cols = l.split('","').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length < 13) continue;
      
      const parseMon = (v) => parseFloat((v||'').replace(/\./g,'').replace(',','.')) || 0;
      
      ORCAMENTO_DATA.push({
        pa: cols[0],
        fonte: cols[1],
        despesa: cols[2],
        detalhamento: cols[4],
        inicial: parseMon(cols[5]),
        empenhado: parseMon(cols[7]),
        anulacao: parseMon(cols[8]),
        executado: parseMon(cols[9]),
        saldoExistente: parseMon(cols[10]),
        reserva: parseMon(cols[11]),
        saldoLiquido: parseMon(cols[12])
      });
    }
    
    filtrarOrcamento();
  } catch (e) {
    console.error('Erro ao carregar orcamento do GSheets:', e);
    // fallback if fail? it will just show empty or previous data
  }
};


// ---- State ----
let _orcFiltrado = [...ORCAMENTO_DATA];
let _orcChartBar = null;
let _orcChartDonut = null;

// ---- Helpers ----
function _fmtBRL(v) {
  if (v === null || v === undefined) return 'R$ 0,00';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function _pctExec(inicial, executado) {
  if (!inicial || inicial <= 0) return executado > 0 ? 100 : 0;
  return Math.min(Math.round((executado / inicial) * 100), 100);
}

function _pctColor(pct) {
  if (pct >= 80) return '#10b981'; // verde
  if (pct >= 40) return '#f59e0b'; // amarelo
  return '#ef4444'; // vermelho
}

function _naturezaNome(code) {
  return NATUREZA_DESCRICAO[code]?.nome || code;
}

// ---- Filtros ----
function _getFilterValues() {
  return {
    pa:      document.getElementById('orc-filtro-pa')?.value      || '',
    fonte:   document.getElementById('orc-filtro-fonte')?.value   || '',
    despesa: document.getElementById('orc-filtro-despesa')?.value || '',
  };
}

function filtrarOrcamento() {
  const { pa, fonte, despesa } = _getFilterValues();
  _orcFiltrado = ORCAMENTO_DATA.filter(row =>
    (!pa      || row.pa      === pa)      &&
    (!fonte   || row.fonte   === fonte)   &&
    (!despesa || row.despesa === despesa)
  );
  renderOrcamentoCards();
  renderOrcamentoTable();
  renderOrcamentoCharts();
}

function limparFiltrosOrcamento() {
  document.getElementById('orc-filtro-pa').value      = '';
  document.getElementById('orc-filtro-fonte').value   = '';
  document.getElementById('orc-filtro-despesa').value = '';
  filtrarOrcamento();
}

// ---- Cards ----
function renderOrcamentoCards() {
  const totalInicial   = _orcFiltrado.reduce((s, r) => s + r.inicial,    0);
  const totalEmpenhado = _orcFiltrado.reduce((s, r) => s + r.empenhado,  0);
  const totalExecutado = _orcFiltrado.reduce((s, r) => s + r.executado,  0);
  const totalSaldo     = _orcFiltrado.reduce((s, r) => s + r.saldoLiquido, 0);
  const totalAnulado   = _orcFiltrado.reduce((s, r) => s + r.anulacao,   0);
  const pct = totalInicial > 0 ? Math.min(Math.round((totalExecutado / totalInicial) * 100), 100) : 0;

  const el = document.getElementById('orc-cards');
  if (!el) return;
  el.innerHTML = `
    <div class="orc-card" style="border-left:4px solid #60a5fa;">
      <div class="orc-card-icon">💰</div>
      <div class="orc-card-body">
        <div class="orc-card-label">Dotação Inicial (LOA)</div>
        <div class="orc-card-value" style="color:#60a5fa;">${_fmtBRL(totalInicial)}</div>
        <div class="orc-card-sub">Base orçamentária aprovada</div>
      </div>
    </div>
    <div class="orc-card" style="border-left:4px solid #f59e0b;">
      <div class="orc-card-icon">📋</div>
      <div class="orc-card-body">
        <div class="orc-card-label">Total Empenhado</div>
        <div class="orc-card-value" style="color:#f59e0b;">${_fmtBRL(totalEmpenhado)}</div>
        <div class="orc-card-sub">Compromisso formal emitido</div>
      </div>
    </div>
    <div class="orc-card" style="border-left:4px solid #10b981;">
      <div class="orc-card-icon">✅</div>
      <div class="orc-card-body">
        <div class="orc-card-label">Total Executado</div>
        <div class="orc-card-value" style="color:#10b981;">${_fmtBRL(totalExecutado)}</div>
        <div class="orc-card-sub">Liquidado / efetivamente pago</div>
      </div>
    </div>
    <div class="orc-card" style="border-left:4px solid ${totalSaldo < 0 ? '#ef4444' : '#a78bfa'};">
      <div class="orc-card-icon">${totalSaldo < 0 ? '⚠️' : '💚'}</div>
      <div class="orc-card-body">
        <div class="orc-card-label">Saldo Líquido</div>
        <div class="orc-card-value" style="color:${totalSaldo < 0 ? '#ef4444' : '#a78bfa'};">${_fmtBRL(totalSaldo)}</div>
        <div class="orc-card-sub">Disponível para empenho</div>
      </div>
    </div>
    <div class="orc-card orc-card-wide" style="border-left:4px solid #34d399;">
      <div class="orc-card-icon">📉</div>
      <div class="orc-card-body">
        <div class="orc-card-label">Total Anulado / Estornado</div>
        <div class="orc-card-value" style="color:#f87171;">${_fmtBRL(totalAnulado)}</div>
        <div class="orc-card-sub">Cancelamentos e devoluções de empenho</div>
      </div>
    </div>
    <div class="orc-card orc-card-wide orc-exec-bar-card" style="border-left:4px solid ${_pctColor(pct)}; flex-direction:column; align-items:flex-start; justify-content:center; gap:10px;">
      <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
        <div>
          <div class="orc-card-label">Taxa de Execução Orçamentária</div>
          <div style="font-size:28px; font-weight:900; color:${_pctColor(pct)}; font-family:monospace;">${pct}%</div>
        </div>
        <div style="font-size:36px;">${pct >= 80 ? '🚀' : pct >= 40 ? '⏳' : '🐢'}</div>
      </div>
      <div style="width:100%; background:rgba(255,255,255,0.08); border-radius:99px; height:12px; overflow:hidden;">
        <div style="height:100%; width:${pct}%; background:${_pctColor(pct)}; border-radius:99px; transition:width 0.6s ease;"></div>
      </div>
      <div style="font-size:11px; color:#94a3b8;">Executado ${_fmtBRL(totalExecutado)} de ${_fmtBRL(totalInicial)}</div>
    </div>
  `;
}

// ---- Tabela ----
function renderOrcamentoTable() {
  const tbody = document.getElementById('orc-tbody');
  if (!tbody) return;

  if (_orcFiltrado.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:30px;color:#64748b;">Nenhum registro encontrado com os filtros aplicados.</td></tr>`;
    return;
  }

  tbody.innerHTML = _orcFiltrado.map(row => {
    const nat = NATUREZA_DESCRICAO[row.despesa];
    const pct = _pctExec(row.inicial, row.executado);
    const pctCor = _pctColor(pct);
    const saldoNeg = row.saldoLiquido < 0;
    const paDesc = PA_DESCRICAO[row.pa] || row.pa;
    const fonteDesc = FONTE_DESCRICAO[row.fonte] || row.fonte;

    return `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.06); transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='transparent'">
        <td style="padding:10px 12px; font-size:12px; font-weight:700; color:#60a5fa; width:140px; min-width:140px; max-width:140px; overflow:hidden;">
          <div>${row.pa}</div>
          <div style="font-weight:400; font-size:10px; color:#64748b; margin-top:2px; white-space:normal; word-break:break-word; line-height:1.3;">${paDesc}</div>
        </td>
        <td style="padding:10px 12px; font-size:11px; color:#94a3b8; width:130px; min-width:130px; max-width:130px; overflow:hidden;">
          <div style="font-family:monospace; letter-spacing:0;">${row.fonte}</div>
          <div style="font-size:10px; color:#64748b; white-space:normal; word-break:break-word; line-height:1.3;">${fonteDesc.split('–')[0].trim()}</div>
        </td>
        <td style="padding:10px 12px; width:90px; min-width:90px; white-space:nowrap;">
          <span style="display:inline-flex; align-items:center; gap:5px; padding:3px 8px; border-radius:99px; background:${nat?.cor || '#475569'}22; border:1px solid ${nat?.cor || '#475569'}55; font-size:11px; font-weight:700; color:${nat?.cor || '#94a3b8'};">
            <span>${nat?.icon || '📌'}</span>
            <span style="white-space:nowrap;">${row.despesa}</span>
          </span>
        </td>
        <td style="padding:10px 12px; font-size:12px; color:#e2e8f0; width:220px; min-width:180px; max-width:220px; overflow:hidden;">
          <div style="font-weight:600; white-space:normal; word-break:break-word; line-height:1.3;">${nat?.nome || row.despesa}</div>
          <div style="font-size:10px; color:#64748b; margin-top:2px; white-space:normal; word-break:break-word; line-height:1.3;">${row.detalhamento.length > 55 ? row.detalhamento.slice(0,55)+'…' : row.detalhamento}</div>
        </td>
        <td style="padding:10px 12px; text-align:right; font-size:12px; color:#60a5fa; font-family:monospace; white-space:nowrap;">${_fmtBRL(row.inicial)}</td>
        <td style="padding:10px 12px; text-align:right; font-size:12px; color:#f59e0b; font-family:monospace; white-space:nowrap;">${_fmtBRL(row.empenhado)}</td>
        <td style="padding:10px 12px; text-align:right; font-size:12px; color:#34d399; font-family:monospace; white-space:nowrap;">${_fmtBRL(row.anulacao)}</td>
        <td style="padding:10px 12px; text-align:right; font-size:12px; color:#10b981; font-family:monospace; white-space:nowrap;">${_fmtBRL(row.executado)}</td>
        <td style="padding:10px 12px; text-align:right; font-size:12px; color:${saldoNeg ? '#ef4444' : '#a78bfa'}; font-family:monospace; font-weight:700; white-space:nowrap;">${_fmtBRL(row.saldoLiquido)}</td>
        <td style="padding:10px 16px; min-width:100px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <div style="flex:1; background:rgba(255,255,255,0.08); border-radius:99px; height:6px; overflow:hidden;">
              <div style="height:100%; width:${pct}%; background:${pctCor}; border-radius:99px;"></div>
            </div>
            <span style="font-size:11px; font-weight:700; color:${pctCor}; min-width:32px; text-align:right;">${pct}%</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ---- Gráficos ----
function renderOrcamentoCharts() {
  // ---- Agrupar por Natureza da Despesa ----
  const byNatureza = {};
  _orcFiltrado.forEach(r => {
    const nome = NATUREZA_DESCRICAO[r.despesa]?.nome || r.despesa;
    if (!byNatureza[nome]) byNatureza[nome] = { inicial: 0, executado: 0, saldo: 0, cor: NATUREZA_DESCRICAO[r.despesa]?.cor || '#60a5fa' };
    byNatureza[nome].inicial   += r.inicial;
    byNatureza[nome].executado += r.executado;
    byNatureza[nome].saldo     += r.saldoLiquido;
  });

  const naturezaKeys = Object.keys(byNatureza).filter(k => byNatureza[k].inicial > 0 || byNatureza[k].executado > 0);

  // ---- Bar Chart ----
  const ctxBar = document.getElementById('orc-chart-bar');
  if (ctxBar) {
    if (_orcChartBar) _orcChartBar.destroy();
    _orcChartBar = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: naturezaKeys.map(k => k.length > 25 ? k.slice(0, 25) + '…' : k),
        datasets: [
          {
            label: 'Dotação Inicial',
            data: naturezaKeys.map(k => byNatureza[k].inicial),
            backgroundColor: 'rgba(96,165,250,0.25)',
            borderColor: '#60a5fa',
            borderWidth: 2,
            borderRadius: 4,
          },
          {
            label: 'Executado',
            data: naturezaKeys.map(k => byNatureza[k].executado),
            backgroundColor: naturezaKeys.map(k => byNatureza[k].cor + '99'),
            borderColor: naturezaKeys.map(k => byNatureza[k].cor),
            borderWidth: 2,
            borderRadius: 4,
          },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.raw.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
            }
          }
        },
        scales: {
          x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#64748b', callback: v => 'R$ ' + (v / 1e6).toFixed(1) + 'M' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  // ---- Donut Chart por PA ----
  const byPA = {};
  _orcFiltrado.forEach(r => {
    const nome = `PA ${r.pa} – ${(PA_DESCRICAO[r.pa] || r.pa).split(' ').slice(0, 3).join(' ')}`;
    if (!byPA[nome]) byPA[nome] = 0;
    byPA[nome] += r.inicial;
  });

  const paKeys = Object.keys(byPA).filter(k => byPA[k] > 0);
  const palette = ['#60a5fa','#f59e0b','#10b981','#a78bfa','#f472b6','#38bdf8','#fb923c','#4ade80'];

  const ctxDonut = document.getElementById('orc-chart-donut');
  if (ctxDonut) {
    if (_orcChartDonut) _orcChartDonut.destroy();
    _orcChartDonut = new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: paKeys,
        datasets: [{
          data: paKeys.map(k => byPA[k]),
          backgroundColor: palette.map(c => c + 'cc'),
          borderColor: palette,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12, padding: 10 } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
            }
          }
        },
        cutout: '65%',
      }
    });
  }
}

// ---- Inicializar filtros ----
function inicializarFiltrosOrcamento() {
  const selPA = document.getElementById('orc-filtro-pa');
  const selFonte = document.getElementById('orc-filtro-fonte');
  const selDespesa = document.getElementById('orc-filtro-despesa');

  if (!selPA) return;

  // PA
  const pas = [...new Set(ORCAMENTO_DATA.map(r => r.pa))].sort();
  selPA.innerHTML = '<option value="">Todos os Programas</option>' +
    pas.map(p => `<option value="${p}">PA ${p} – ${(PA_DESCRICAO[p] || p).split(' ').slice(0,4).join(' ')}</option>`).join('');

  // Fonte
  const fontes = [...new Set(ORCAMENTO_DATA.map(r => r.fonte))].sort();
  selFonte.innerHTML = '<option value="">Todas as Fontes</option>' +
    fontes.map(f => `<option value="${f}">${f} – ${(FONTE_DESCRICAO[f] || f).split('–')[0].trim()}</option>`).join('');

  // Despesa
  const despesas = [...new Set(ORCAMENTO_DATA.map(r => r.despesa))].sort();
  selDespesa.innerHTML = '<option value="">Todas as Naturezas</option>' +
    despesas.map(d => `<option value="${d}">${d} – ${NATUREZA_DESCRICAO[d]?.nome || d}</option>`).join('');

  selPA.addEventListener('change', filtrarOrcamento);
  selFonte.addEventListener('change', filtrarOrcamento);
  selDespesa.addEventListener('change', filtrarOrcamento);
}

// ---- Exportar Excel simples ----
function exportarOrcamentoExcel() {
  const rows = [
    ['PA', 'Descrição PA', 'Fonte', 'Código Despesa', 'Natureza da Despesa', 'Categoria', 'Detalhamento', 'Dotação Inicial', 'Empenhado', 'Anulação', 'Executado', 'Saldo Líquido', '% Exec'],
    ..._orcFiltrado.map(r => {
      const nat = NATUREZA_DESCRICAO[r.despesa];
      const pct = _pctExec(r.inicial, r.executado);
      return [r.pa, PA_DESCRICAO[r.pa] || r.pa, r.fonte, r.despesa, nat?.nome || r.despesa, nat?.categoria || '-', r.detalhamento, r.inicial, r.empenhado, r.anulacao, r.executado, r.saldoLiquido, pct + '%'];
    })
  ];
  const csvContent = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'orcamento_cam_seduc.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ---- Entry point ----
function carregarOrcamento() {
  inicializarFiltrosOrcamento();
  filtrarOrcamento();
  carregarCRM();
}


// ---- Filtro rápido por Natureza (badges legend) ----
let _orcActiveBadge = null;

function filtrarOrcamentoPorNatureza(code) {
  const sel = document.getElementById('orc-filtro-despesa');
  if (!sel) return;

  if (_orcActiveBadge === code) {
    sel.value = '';
    _orcActiveBadge = null;
  } else {
    sel.value = code;
    _orcActiveBadge = code;
  }

  document.querySelectorAll('.orc-badge-filter').forEach(el => {
    const isActive = el.dataset.code === _orcActiveBadge;
    el.style.opacity = isActive ? '1' : '0.5';
    el.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
    el.style.boxShadow = isActive ? '0 0 10px ' + (el.dataset.cor || '#60a5fa') + '66' : 'none';
  });

  filtrarOrcamento();
}
window.filtrarOrcamentoPorNatureza = filtrarOrcamentoPorNatureza;

window.filtrarOrcamento       = filtrarOrcamento;
window.limparFiltrosOrcamento = limparFiltrosOrcamento;
window.carregarOrcamento      = carregarOrcamento;
window.exportarOrcamentoExcel = exportarOrcamentoExcel;


// ============================================================
// ACOMPANHAMENTO CRM - PROCESSOS SEI
// ============================================================
let _crmData = [];

window.toggleCRM = function(grupo) {
  const body = document.getElementById('body-crm-' + grupo);
  const icon = document.getElementById('icon-crm-' + grupo);
  if (!body || !icon) return;
  
  if (body.style.display === 'none') {
    body.style.display = 'block';
    icon.style.transform = 'rotate(180deg)';
  } else {
    body.style.display = 'none';
    icon.style.transform = 'rotate(0deg)';
  }
};

async function carregarCRM() {
  try {
    const el = document.getElementById('orc-crm-container');
    if (!el) return;
    el.innerHTML = '<div style="padding: 20px; text-align: center; color: #94a3b8;">Carregando acompanhamento CRM...</div>';

    const GVIZ_URL = 'https://docs.google.com/spreadsheets/d/1NQuN9icUm8RL08pqkPia3ZrgoC5zEka99mK43sUJm3o/gviz/tq?tqx=out:csv&gid=807660383';
    
    const response = await fetch(GVIZ_URL);
    if (!response.ok) throw new Error('Falha HTTP: ' + response.status);
    const text = await response.text();
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    _crmData = lines.slice(1).map(line => {
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
    });
    
    renderCRM();
  } catch (err) {
    console.error('Erro CRM:', err);
    document.getElementById('orc-crm-container').innerHTML = '<div style="padding: 20px; color: #ef4444;">Erro ao carregar dados do CRM.</div>';
  }
}

function classificarProcesso(p) {
  const t = (p.pa + ' ' + p.descricao).toUpperCase();
  if (t.includes('PROALFA') || t.includes('ALFABETIZA\u00C7\u00C3O') || p.pa === '4097') return 'PROALFA';
  if (t.includes('SAERO') || t.includes('AVALIA\u00C7\u00C3O') || p.pa === '4100') return 'GMAC';
  if (t.includes('PREMIA') || t.includes('FOMENTO') || p.pa === '4185') return 'GDSM';
  return 'CAM';
}

function renderCRM() {
  const container = document.getElementById('orc-crm-container');
  if (!container) return;

  const grouped = { CAM: [], GDSM: [], GMAC: [], PROALFA: [] };
  
  _crmData.forEach(p => {
    const grupo = classificarProcesso(p);
    if (grouped[grupo]) grouped[grupo].push(p);
  });

  let html = '';
  
  ['PROALFA', 'GMAC', 'GDSM', 'CAM'].forEach(grupo => {
    const procs = grouped[grupo];
    const totalValor = procs.reduce((acc, p) => {
      const v = parseFloat(p.valorText.replace(/\./g, '').replace(',', '.')) || 0;
      if (p.tipo === 'Anula\u00E7\u00E3o') return acc - v;
      return acc + v;
    }, 0);
    
    const count = procs.length;
    
    html += `
      <div style="margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: #1e293b; overflow: hidden;">
        
        <div onclick="window.toggleCRM('${grupo}')" style="display:flex; justify-content:space-between; align-items:center; padding: 14px 20px; background: rgba(0,0,0,0.2); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.background='rgba(0,0,0,0.2)'">
          <div style="display:flex; align-items:center; gap: 12px;">
            <div style="font-size: 16px; font-weight: 800; color: #e2e8f0;">${grupo}</div>
            <div style="font-size: 11px; padding: 2px 8px; background: rgba(255,255,255,0.1); border-radius: 99px; color: #94a3b8;">${count} registros</div>
          </div>
          <div style="display:flex; align-items:center; gap: 16px;">
            <div style="font-size: 14px; font-weight: 700; color: #34d399; font-family: monospace;">${_fmtBRL(totalValor)}</div>
            <svg id="icon-crm-${grupo}" style="transition: transform 0.3s;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
        
        <div id="body-crm-${grupo}" style="display: none; padding: 0;">
          ${procs.length === 0 ? '<div style="padding:20px; color:#64748b; font-size:12px;">Nenhum processo classificado.</div>' : ''}
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background: rgba(255,255,255,0.02);">
                  <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-transform: uppercase;">Data</th>
                  <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-transform: uppercase;">Processo SEI</th>
                  <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-transform: uppercase;">Tipo</th>
                  <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-transform: uppercase;">Ações</th>
                  <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-transform: uppercase;">Descrição</th>
                  <th style="padding: 10px 16px; color: #64748b; font-size: 10px; text-transform: uppercase; text-align: right;">Valor</th>
                </tr>
              </thead>
              <tbody>
                ${procs.map(p => {
                  let badgeCor = '#64748b';
                  if(p.tipo === 'Empenhado') badgeCor = '#f59e0b';
                  if(p.tipo === 'Reserva') badgeCor = '#60a5fa';
                  if(p.tipo === 'Anula\u00E7\u00E3o') badgeCor = '#f87171';
                  
                  return `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                      <td style="padding: 10px 16px; color: #cbd5e1; white-space: nowrap;">${p.data}</td>
                      <td style="padding: 10px 16px; font-family: monospace; font-size: 13px; font-weight: 700; color: #e2e8f0; white-space: nowrap;">${p.processo}</td>
                      <td style="padding: 10px 16px;">
                        <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:${badgeCor}; background:${badgeCor}22; padding:2px 6px; border-radius:4px; border:1px solid ${badgeCor}44;">${p.tipo}</span>
                      </td>
                      <td style="padding: 10px 16px; white-space: nowrap;">
                        <div style="display:flex; gap: 6px;">
                          <button onclick="navigator.clipboard.writeText('${p.processo}'); typeof showToast === 'function' ? showToast('Processo SEI copiado!', 'success') : alert('Copiado');" style="background:#334155; border:none; color:#e2e8f0; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:11px; display:flex; align-items:center; gap:4px; transition:0.2s;" onmouseover="this.style.background='#475569'" onmouseout="this.style.background='#334155'" title="Copiar Nº SEI">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar
                          </button>
                          <button onclick="window.open('https://sei.ro.gov.br/sei/modulos/pesquisa/md_pesq_processo_pesquisar.php?acao_externa=protocolo_pesquisar&acao_origem_externa=protocolo_pesquisar&id_orgao_acesso_externo=0', '_blank')" style="background:#2563eb; border:none; color:white; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:11px; display:flex; align-items:center; gap:4px; transition:0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'" title="Pesquisar SEI">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Abrir SEI
                          </button>
                        </div>
                      </td>
                      <td style="padding: 10px 16px; color: #94a3b8; line-height: 1.4; min-width: 200px;">
                        <div style="font-weight: 600; color: #cbd5e1;">${p.descricao}</div>
                        <div style="font-size: 10px; color: #475569; margin-top: 2px;">PA: ${p.pa} | Fonte: ${p.fonte} | Nat: ${p.despesa}</div>
                      </td>
                      <td style="padding: 10px 16px; text-align: right; font-family: monospace; font-weight: 700; color: ${p.tipo === 'Anula\u00E7\u00E3o' ? '#f87171' : '#10b981'}; white-space: nowrap;">
                        ${p.tipo === 'Anula\u00E7\u00E3o' ? '-' : ''} R$ ${p.valorText}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    `;
  });

  container.innerHTML = html;
}


window.imprimirOrcamento = function() {
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
  
  printHeader.innerHTML = `<h1 style="font-size:24px; margin-bottom:5px; text-align:center;">Execução de Dotação Orçamentária</h1>
                           <h3 style="font-size:16px; margin-bottom:20px; text-align:center; color:#475569;">PA: ${nomePA} | ND: ${nomeND}</h3>`;
  
  // Hide buttons container
  const headerDivs = document.querySelectorAll('#page-orcamento > div.section-header');
  if (headerDivs.length > 0) headerDivs[0].classList.add('orc-buttons');
  
  setTimeout(() => {
    window.print();
    document.body.classList.remove('print-mode-orcamento');
  }, 100);
};


window.gerarRelatorioOrcamento = function(modelo) {
  if (!window.jspdf) {
    alert("Biblioteca jsPDF não carregada.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  doc.setFontSize(14);
  doc.text("RELATÓRIO DE EXECUÇÃO ORÇAMENTÁRIA - SEDUC/RO", 14, 15);
  doc.setFontSize(10);
  doc.text("Gerado em: " + new Date().toLocaleString('pt-BR'), 14, 21);
  
  const tInicial = _orcFiltrado.reduce((acc, r) => acc + (r.inicial || 0), 0);
  const tEmpenhado = _orcFiltrado.reduce((acc, r) => acc + (r.empenhado || 0), 0);
  const tExecutado = _orcFiltrado.reduce((acc, r) => acc + (r.executado || 0), 0);
  const tLiquido = _orcFiltrado.reduce((acc, r) => acc + (r.saldoLiquido || 0), 0);
  
  doc.text(`Dotação Inicial: ${_fmtBRL(tInicial)}`, 14, 27);
  doc.text(`Empenhado: ${_fmtBRL(tEmpenhado)}`, 70, 27);
  doc.text(`Executado: ${_fmtBRL(tExecutado)}`, 130, 27);
  doc.text(`Saldo Líquido)}`, 190, 27);

  let title = "Relatório";
  let head = [];
  let body = [];
  
  const baseHead = [['PA', 'Fonte', 'Natureza', 'Inicial', 'Empenhado', 'Executado', 'Saldo Líq.']];
  const formatRow = (r) => [
    r.pa, r.fonte, _naturezaNome(r.despesa), _fmtBRL(r.inicial), _fmtBRL(r.empenhado), _fmtBRL(r.executado), _fmtBRL(r.saldoLiquido)
  ];

  if (modelo === 7) {
    if (typeof window.imprimirOrcamento === 'function') {
      window.imprimirOrcamento();
    } else {
      window.print();
    }
    return;
  }
  
  if (modelo === 8) {
    title = "Relatório com Status e Gráficos";
    const selPA = document.getElementById('orc-filtro-pa');
    const selND = document.getElementById('orc-filtro-despesa');
    const nomePA = selPA && selPA.value ? PA_DESCRICAO[selPA.value] || selPA.value : 'Todos os Programas';
    const nomeND = selND && selND.value ? _naturezaNome(selND.value) : 'Todas as Naturezas';
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 150);
    doc.text("Parâmetros: PA = " + nomePA + " | ND = " + nomeND, 14, 35);
    doc.setTextColor(0, 0, 0);
    
    // Status text
    const perc = _pctExec(tInicial, tExecutado);
    let statusText = "STATUS GERAL: ";
    if (perc > 80) statusText += "CRÍTICO (Alta Execução)";
    else if (perc > 50) statusText += "ATENÇÃO (Execução Mediana)";
    else statusText += "NORMAL (Baixa Execução)";
    
    doc.setFontSize(11);
    doc.text(statusText, 14, 42);
    
    // Add Canvas 1
    try {
      const c1 = document.getElementById('orc-chart-bar');
      if (c1) {
        const img1 = c1.toDataURL("image/png", 1.0);
        doc.addImage(img1, 'PNG', 14, 50, 90, 60);
      }
      const c2 = document.getElementById('orc-chart-donut');
      if (c2) {
        const img2 = c2.toDataURL("image/png", 1.0);
        doc.addImage(img2, 'PNG', 110, 50, 80, 60);
      }
    } catch(e) {}
    
    // Summary table below charts
    head = [['Resumo', 'Valor (R$)']];
    body = [
      ['Dotação Inicial', _fmtBRL(tInicial)],
      ['Total Empenhado', _fmtBRL(tEmpenhado)],
      ['Total Executado', _fmtBRL(tExecutado)],
      ['Saldo Líquido)],
      ['Taxa de Execução', perc + '%']
    ];
    
    doc.autoTable({
      startY: 120,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });
    
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
    return;
  }
  
  if (modelo === 1) {
    title = "Resumo Geral por Programa";
    head = [['Programa', 'Inicial', 'Executado', 'Saldo Líquido', '%']];
    const grouped = {};
    _orcFiltrado.forEach(r => {
      if(!grouped[r.pa]) grouped[r.pa] = { inicial: 0, executado: 0, saldo: 0 };
      grouped[r.pa].inicial += r.inicial;
      grouped[r.pa].executado += r.executado;
      grouped[r.pa].saldo += r.saldoLiquido;
    });
    for(const [pa, vals] of Object.entries(grouped)) {
      body.push([pa, _fmtBRL(vals.inicial), _fmtBRL(vals.executado), _fmtBRL(vals.saldo), _pctExec(vals.inicial, vals.executado) + '%']);
    }
  } else if (modelo === 2) {
    title = "Listagem Detalhada";
    head = [['PA', 'Fonte', 'Natureza', 'Detalhe', 'Inicial', 'Empenhado', 'Executado', 'Saldo Líq.']];
    body = _orcFiltrado.map(r => [
      r.pa, r.fonte, _naturezaNome(r.despesa), r.detalhamento ? r.detalhamento.substring(0, 25) : '',
      _fmtBRL(r.inicial), _fmtBRL(r.empenhado), _fmtBRL(r.executado), _fmtBRL(r.saldoLiquido)
    ]);
  } else if (modelo === 3) {
    title = "Agrupado por Programa de Ação";
    head = baseHead;
    const sorted = [..._orcFiltrado].sort((a,b) => a.pa.localeCompare(b.pa));
    body = sorted.map(formatRow);
  } else if (modelo === 4) {
    title = "Agrupado por Fonte de Recurso";
    head = baseHead;
    const sorted = [..._orcFiltrado].sort((a,b) => a.fonte.localeCompare(b.fonte));
    body = sorted.map(formatRow);
  } else if (modelo === 5) {
    title = "Agrupado por Natureza da Despesa";
    head = baseHead;
    const sorted = [..._orcFiltrado].sort((a,b) => a.despesa.localeCompare(b.despesa));
    body = sorted.map(formatRow);
  } else if (modelo === 6) {
    title = "Relatório de Saldos Críticos (Baixo Saldo ou Alta Execução)";
    head = baseHead;
    const crit = _orcFiltrado.filter(r => _pctExec(r.inicial, r.executado) >= 80 || r.saldoLiquido <= 10000);
    body = crit.map(formatRow);
  }

  doc.text(title, 14, 35);
  doc.autoTable({ startY: 40, head: head, body: body, styles: { fontSize: 8 }, headStyles: { fillColor: [79, 70, 229] } });
  doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
};
setTimeout(() => window.carregarOrcamentoData(), 500);
