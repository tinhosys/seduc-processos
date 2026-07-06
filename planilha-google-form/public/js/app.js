// ============================================================
// SEDUC — App Principal (Router + UI)
// ============================================================

// ---- Estado global ----
let state = {
  page: 'dashboard',
  filtros: {
    busca: '',
    status: '',
    localizacao: '',
    municipio: '',
    objeto: '',
    prefixo: '',
  },
  paginaAtual: 1,
  itensPorPagina: 20,
  editandoId: null,
  sortCol: '',
  sortDir: 'asc',
};

// ---- NAVEGAÇÃO ----
function navegar(pagina) {
  state.page = pagina;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pagina);
  });
  document.querySelectorAll('.page').forEach(el => {
    el.classList.toggle('active', el.id === 'page-' + pagina);
  });

  const titles = {
    dashboard: 'Dashboard',
    processos: 'Processos',
    novo: state.editandoId ? 'Editar Processo' : 'Novo Processo',
    importar: 'Importar Planilha',
    acessos: 'Gerenciamento de Acessos',
  };
  document.getElementById('topbar-title').textContent = titles[pagina] || pagina;

  // Atualizar conteúdo
  if (pagina === 'dashboard') renderDashboard();
  if (pagina === 'processos') renderProcessos();
  if (pagina === 'novo') renderFormulario();
  if (pagina === 'acessos') carregarAcessos();
}

// ---- TOAST ----
function toast(msg, tipo = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const div = document.createElement('div');
  div.className = `toast ${tipo}`;
  div.innerHTML = `<span>${icons[tipo]}</span> ${msg}`;
  document.getElementById('toast-container').appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

// ---- DASHBOARD ----
let chartStatus = null;
let chartObj = null;
let chartMunicipio = null;

function renderDashboard() {
  const processos = carregarProcessos();
  const total = processos.length;

  // Stats
  const countStatus = (s) => processos.filter(p => normalizar(p.status) === normalizar(s)).length;
  const valorTotal  = processos.reduce((a,p) => a + (p.valorOf || 0), 0);
  const autorizados = processos.filter(p => normalizar(p.status) === 'autorizado').length;
  const pagos       = processos.filter(p => normalizar(p.status) === 'pago').length;
  const pendentes   = processos.filter(p => ['pendente','notificar','notificado','p/ autorizo','p/autorizo','para autorizo'].includes(normalizar(p.status))).length;
  const prioridade  = processos.filter(p => normalizar(p.status) === 'prioridade').length;

  document.getElementById('stat-total').textContent      = total.toLocaleString('pt-BR');
  document.getElementById('stat-valor').textContent      = formatCurrency(valorTotal);
  document.getElementById('stat-autorizado').textContent = autorizados.toLocaleString('pt-BR');
  document.getElementById('stat-pago').textContent       = pagos.toLocaleString('pt-BR');
  document.getElementById('stat-pendente').textContent   = pendentes.toLocaleString('pt-BR');
  document.getElementById('stat-prioridade').textContent = prioridade.toLocaleString('pt-BR');

  // Gráfico: Status
  const statusCounts = {};
  processos.forEach(p => {
    const s = p.status || 'Sem status';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const statusLabels = Object.keys(statusCounts).sort((a,b) => statusCounts[b] - statusCounts[a]).slice(0, 10);
  const statusValues = statusLabels.map(k => statusCounts[k]);
  const totalStatus = statusValues.reduce((sum, v) => sum + v, 0) || 1;

  const colorsStatus = [
    '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
    '#06b6d4','#f97316','#6366f1','#ec4899','#14b8a6'
  ];

  const ctxStatus = document.getElementById('chart-status').getContext('2d');
  if (chartStatus) chartStatus.destroy();
  chartStatus = new Chart(ctxStatus, {
    type: 'doughnut',
    data: {
      labels: statusLabels,
      datasets: [{ data: statusValues, backgroundColor: colorsStatus, borderWidth: 2, borderColor: '#0a0f1e' }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom', 
          onClick: function(e, legendItem, legend) {
            const index = legendItem.index;
            const ci = legend.chart;
            ci.toggleDataVisibility(index);
            ci.update();
          },
          labels: { 
            color: '#f8fafc', 
            font: { size: 10 }, 
            padding: 10,
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);
                  const value = data.datasets[0].data[i];
                  const percent = ((value / totalStatus) * 100).toFixed(1) + '%';
                  const isHidden = !chart.getDataVisibility(i);
                  return {
                    text: `${label.toUpperCase()} (${percent})`,
                    fillStyle: isHidden ? 'rgba(255,255,255,0.05)' : style.backgroundColor,
                    strokeStyle: isHidden ? 'rgba(255,255,255,0.1)' : style.borderColor,
                    lineWidth: style.borderWidth,
                    fontColor: isHidden ? '#475569' : '#f7f7f7',
                    textDecoration: 'none',
                    hidden: false, // We handle the visual 'hidden' state manually now
                    index: i
                  };
                });
              }
              return [];
            }
          } 
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.parsed;
              const pct = ((val / totalStatus) * 100).toFixed(1) + '%';
              return ` ${context.label.toUpperCase()}: ${val} (${pct})`;
            }
          }
        }
      }
    }
  });

  // Gráfico: Todos Municípios por valor
  const munValor = {};
  processos.forEach(p => {
    if (p.municipio) munValor[p.municipio] = (munValor[p.municipio] || 0) + (p.valorOf || 0);
  });
  const allMun = Object.entries(munValor).sort((a,b) => b[1]-a[1]);

  const munWrapper = document.getElementById('chart-municipio-wrapper');
  if (munWrapper) {
    const requiredHeight = Math.max(260, allMun.length * 32);
    munWrapper.style.height = requiredHeight + 'px';
  }

  const ctxMun = document.getElementById('chart-municipio').getContext('2d');
  if (chartMunicipio) chartMunicipio.destroy();
  chartMunicipio = new Chart(ctxMun, {
    type: 'bar',
    data: {
      labels: allMun.map(([m]) => m.length > 18 ? m.slice(0,18)+'…' : m),
      datasets: [{
        label: 'Valor (R$)',
        data: allMun.map(([,v]) => v),
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#64748b', callback: v => 'R$ ' + (v/1e6).toFixed(1)+'M' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { display: false } }
      }
    }
  });

  // Gráfico: Prefixo (LT, Cgoi, IeCH, ClJs...)
    const prefixoCounts = {};
    processos.forEach(p => {
      const pr = (p.prefixo || 'OUTROS').trim().toUpperCase();
      prefixoCounts[pr] = (prefixoCounts[pr] || 0) + 1;
    });
    
    const prefixoLabels = Object.keys(prefixoCounts).sort((a,b) => prefixoCounts[b] - prefixoCounts[a]).slice(0, 10);
    const prefixoValues = prefixoLabels.map(k => prefixoCounts[k]);
    
    const colorsPrefixo = [
      '#6366f1','#ec4899','#14b8a6','#8b5cf6','#f97316',
      '#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4'
    ];
    
    const ctxPrefixo = document.getElementById('chart-prefixo');
    if (ctxPrefixo) {
      if (window.chartPrefixoInstance) window.chartPrefixoInstance.destroy();
      window.chartPrefixoInstance = new Chart(ctxPrefixo.getContext('2d'), {
        type: 'bar',
        data: {
          labels: prefixoLabels,
          datasets: [{ 
            label: 'Processos',
            data: prefixoValues, 
            backgroundColor: colorsPrefixo, 
            borderWidth: 0,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#1f2937' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
          }
        }
      });
    }

    // Localização
  const locCount = {};
  processos.forEach(p => {
    if (p.localizacao && p.localizacao !== '.') locCount[p.localizacao] = (locCount[p.localizacao] || 0) + 1;
  });
  const topLoc = Object.entries(locCount).sort((a,b) => b[1]-a[1]).slice(0, 6);
  const locDiv = document.getElementById('loc-list');
  locDiv.innerHTML = topLoc.map(([loc, cnt]) => {
    const pct = Math.round((cnt / total) * 100);
    return `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
          <span style="color:var(--text-primary);font-weight:500">${loc}</span>
          <span style="color:var(--text-muted)">${cnt} (${pct}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('') || '<p style="color:var(--text-muted);font-size:13px">Sem dados</p>';
}

// ---- LISTA DE PROCESSOS ----
function getFiltrados() {
  let lista = carregarProcessos();
  const { busca, status, localizacao, municipio, objeto } = state.filtros;

  if (busca) {
    const q = normalizar(busca);
    lista = lista.filter(p =>
      normalizar(p.numero).includes(q) ||
      normalizar(p.interessado).includes(q) ||
      normalizar(p.municipio).includes(q) ||
      normalizar(p.objeto).includes(q) ||
      normalizar(p.obs).includes(q) ||
      normalizar(p.anotacao).includes(q) ||
      normalizar(p.prefixo).includes(q) ||
      normalizar(p.status).includes(q) ||
      normalizar(p.localizacao).includes(q)
    );
  }
  if (status)      lista = lista.filter(p => normalizar(p.status)      === normalizar(status));
  if (localizacao) lista = lista.filter(p => normalizar(p.localizacao) === normalizar(localizacao));
  if (municipio)   lista = lista.filter(p => normalizar(p.municipio)   === normalizar(municipio));
  if (objeto)      lista = lista.filter(p => normalizar(p.objeto)      === normalizar(objeto));
  if (state.filtros.prefixo) lista = lista.filter(p => normalizar(p.prefixo).includes(normalizar(state.filtros.prefixo)));

  // Ordenação
  if (state.sortCol) {
    lista.sort((a, b) => {
      let va = a[state.sortCol] || '';
      let vb = b[state.sortCol] || '';
      if (typeof va === 'number') return state.sortDir === 'asc' ? va - vb : vb - va;
      return state.sortDir === 'asc'
        ? String(va).localeCompare(String(vb), 'pt-BR')
        : String(vb).localeCompare(String(va), 'pt-BR');
    });
  }

  return lista;
}

function renderProcessos() {
  const filtrados = getFiltrados();
  const total = filtrados.length;
  const totalPags = Math.ceil(total / state.itensPorPagina);
  if (state.paginaAtual > totalPags) state.paginaAtual = Math.max(1, totalPags);

  const inicio = (state.paginaAtual - 1) * state.itensPorPagina;
  const pagina = filtrados.slice(inicio, inicio + state.itensPorPagina);

  // Preencher filtros dinâmicos
  preencherSelectFiltro('filtro-status',      [...new Set(carregarProcessos().map(p => p.status).filter(s => s && s !== '.'))].sort());
  preencherSelectFiltro('filtro-localizacao', [...new Set(carregarProcessos().map(p => p.localizacao).filter(l => l && l !== '.'))].sort());
  preencherSelectFiltro('filtro-municipio',   [...new Set(carregarProcessos().map(p => p.municipio).filter(Boolean))].sort());
  preencherSelectFiltro('filtro-objeto',      [...new Set(carregarProcessos().map(p => p.objeto).filter(Boolean))].sort());

  // Preencher datalist do filtro de prefixo
  const dlFiltroPfx = document.getElementById('list-filtro-prefixos');
  if (dlFiltroPfx) {
    const pfxs = [...new Set(carregarProcessos().map(p => p.prefixo).filter(Boolean))].sort();
    dlFiltroPfx.innerHTML = pfxs.map(v => `<option value="${v}">`).join('');
  }

  // Preencher datalists do formulário
  const preencherDatalist = (id, prop) => {
    const dl = document.getElementById(id);
    if (dl) {
      const itens = [...new Set(carregarProcessos().map(p => p[prop]).filter(Boolean))].sort();
      dl.innerHTML = itens.map(i => `<option value="${i}">`).join('');
    }
  };
  preencherDatalist('list-prefixos', 'prefixo');
  preencherDatalist('list-interessados', 'interessado');
  preencherDatalist('list-objetos', 'objeto');

  // Tabela
  const tbody = document.getElementById('table-processos');
  const busca = state.filtros.busca;

  tbody.innerHTML = pagina.map(p => `
    <tr onclick="abrirDetalhe('${p.id}')">
      <td>${p.prefixo ? `<span class="badge-prefixo">${p.prefixo}</span>` : '<span style="color:var(--text-muted);font-size:11px">—</span>'}</td>
      <td class="col-municipio">${hl(p.municipio, busca)}</td>
      <td class="col-numero">${hl(p.numero, busca) || '—'}</td>
      <td class="col-interessado" title="${p.interessado}">${hl(p.interessado, busca) || '—'}</td>
      <td class="col-objeto" title="${p.objeto}">${p.objeto || '—'}</td>
      <td><span class="badge ${getStatusBadgeClass(p.status)}">${p.status || '—'}</span></td>
      <td>${p.localizacao || '—'}</td>
      <td class="col-valor">${formatCurrency(p.valorOf)}</td>
      <td>${formatDate(p.data)}</td>
      <td onclick="event.stopPropagation()" style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" onclick="editarProcesso('${p.id}')">✏️</button>
      </td>
    </tr>
  `).join('') || `
    <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td colspan="9">
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Nenhum resultado encontrado</h3>
        <p>Tente ajustar os filtros</p>
      </div>
    </td></tr>`;

  // Info paginação
  document.getElementById('pg-info').textContent = total === 0
    ? 'Nenhum resultado'
    : `Exibindo ${inicio + 1}–${Math.min(inicio + state.itensPorPagina, total)} de ${total} processos`;

  // Controles paginação
  renderPaginacao(totalPags);

  // Total valor filtrado
  const valorTotal = filtrados.reduce((a, p) => a + (p.valorOf || 0), 0);
  const el = document.getElementById('valor-filtrado');
  if (el) el.textContent = `Total: ${formatCurrency(valorTotal)}`;

  // Botão exportar
  const btnExportar = document.getElementById('btn-exportar');
  if (btnExportar) {
    btnExportar.onclick = () => exportarExcel(filtrados);
  }
}

function hl(txt, busca) {
  if (!busca || !txt) return txt || '';
  const re = new RegExp(`(${busca.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return String(txt).replace(re, '<mark>$1</mark>');
}

function preencherSelectFiltro(id, opcoes) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const atual = sel.value;
  let placeholder = 'Todos';
  if (id === 'filtro-status') placeholder = 'Status';
  else if (id === 'filtro-localizacao') placeholder = 'Localização';
  else if (id === 'filtro-municipio') placeholder = 'Município';
  else if (id === 'filtro-objeto') placeholder = 'Objeto';

  sel.innerHTML = `<option value="">${placeholder}</option>` + opcoes.map(o => `<option value="${o}" ${o === atual ? 'selected' : ''}>${o}</option>`).join('');
}

function renderPaginacao(totalPags) {
  const container = document.getElementById('pg-controls');
  container.innerHTML = '';

  const addBtn = (txt, pg, disabled = false, active = false) => {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (active ? ' active' : '');
    btn.textContent = txt;
    btn.disabled = disabled;
    btn.onclick = () => { state.paginaAtual = pg; renderProcessos(); };
    container.appendChild(btn);
  };

  addBtn('‹', state.paginaAtual - 1, state.paginaAtual === 1);

  let start = Math.max(1, state.paginaAtual - 2);
  let end   = Math.min(totalPags, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);

  for (let i = start; i <= end; i++) addBtn(i, i, false, i === state.paginaAtual);

  addBtn('›', state.paginaAtual + 1, state.paginaAtual === totalPags || totalPags === 0);
}

// ---- FORMULÁRIO / MÁSCARAS ----
function maskProcesso(v) {
  v = v.replace(/\D/g, "");
  if (v.length > 16) v = v.substring(0, 16);
  v = v.replace(/^(\d{4})(\d)/, "$1.$2");
  v = v.replace(/^(\d{4})\.(\d{6})(\d)/, "$1.$2/$3");
  v = v.replace(/^(\d{4})\.(\d{6})\/(\d{4})(\d)/, "$1.$2/$3-$4");
  return v;
}

function maskCurrency(v) {
  v = v.replace(/\D/g, "");
  if (!v) return "";
  v = (parseInt(v, 10) / 100).toFixed(2) + "";
  v = v.replace(".", ",");
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  return v;
}

function parseCurrency(str) {
  if (!str) return 0;
  return Number(str.replace(/\./g, '').replace(',', '.')) || 0;
}

document.addEventListener('input', e => {
  if (e.target.classList.contains('input-currency')) {
    e.target.value = maskCurrency(e.target.value);
  } else if (e.target.classList.contains('form-numero-item')) {
    e.target.value = maskProcesso(e.target.value);
  }
});

function adicionarCampoNumero(val = '') {
  const container = document.getElementById('container-numeros');
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" name="numero[]" class="form-numero-item" placeholder="Ex: 0029.059244/2025-47" style="flex:1;" value="${val}">
    <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()" style="padding:0 8px;height:40px;" title="Remover">-</button>
  `;
  container.appendChild(div);
}

// ---- FORMULÁRIO ----
function renderFormulario() {
  const processo = state.editandoId ? buscarProcessoPorId(state.editandoId) : null;
  const p = processo || {};

  // Preencher selects do formulário
  const fillSelect = (id, lista, val) => {
    const s = document.getElementById(id);
    if (!s) return;
    s.innerHTML = lista.map(o => `<option value="${o}" ${o === val ? 'selected' : ''}>${o}</option>`).join('');
  };

  fillSelect('form-status',      STATUS_LIST,      p.status      || '');
  fillSelect('form-localizacao', LOCALIZACAO_LIST, p.localizacao || '');

  if (processo) {
    document.getElementById('form-prefixo').value    = p.prefixo      || '';
    document.getElementById('form-municipio').value   = p.municipio   || '';
    
    // Processar array de números
    const containerNum = document.getElementById('container-numeros');
    containerNum.innerHTML = '';
    const numeros = p.numero ? p.numero.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (numeros.length === 0) numeros.push(''); // add at least one empty
    
    numeros.forEach((num, i) => {
      if (i === 0) {
        containerNum.innerHTML = `
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="text" name="numero[]" class="form-numero-item" placeholder="Ex: 0029.059244/2025-47" style="flex:1;" value="${num}">
            <button type="button" class="btn btn-ghost" onclick="adicionarCampoNumero()" style="padding:0 8px;height:40px;border:1px solid var(--border);" title="Adicionar número">+</button>
          </div>
        `;
      } else {
        adicionarCampoNumero(num);
      }
    });

    document.getElementById('form-interessado').value = p.interessado || '';
    document.getElementById('form-objeto').value      = p.objeto      || '';
    document.getElementById('form-valorOf').value     = p.valorOf ? maskCurrency((p.valorOf * 100).toFixed(0)) : '';
    document.getElementById('form-valorPlan').value   = p.valorPlan ? maskCurrency((p.valorPlan * 100).toFixed(0)) : '';
    document.getElementById('form-data').value        = p.data        || '';
    document.getElementById('form-obs').value         = p.obs         || '';
    document.getElementById('form-anotacao').value    = p.anotacao    || '';
    contatosTemporarios = p.contatos ? JSON.parse(JSON.stringify(p.contatos)) : [];
    renderizarContatosForm();
  } else {
    document.getElementById('form-processo').reset();
    document.getElementById('container-numeros').innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="text" name="numero[]" class="form-numero-item" placeholder="Ex: 0029.059244/2025-47" style="flex:1;">
        <button type="button" class="btn btn-ghost" onclick="adicionarCampoNumero()" style="padding:0 8px;height:40px;border:1px solid var(--border);" title="Adicionar número">+</button>
      </div>
    `;
    contatosTemporarios = [];
    renderizarContatosForm();
  }

  document.getElementById('form-title').textContent = processo ? 'Editar Processo' : 'Novo Processo';
}

function salvarFormulario(e) {
  e.preventDefault();
  
  // Obter todos os números preenchidos
  const inputsNum = Array.from(document.querySelectorAll('input[name="numero[]"]'));
  const numerosJoined = inputsNum.map(i => i.value.trim()).filter(Boolean).join(', ');

  // Capturar contato digitado mas não adicionado (sem clicar no '+')
  const zapEl = document.getElementById('form-contato-whatsapp');
  const detEl = document.getElementById('form-contato-detalhes');
  if (zapEl && detEl) {
    const zap = zapEl.value.trim();
    const det = detEl.value.trim();
    if (zap || det) {
      contatosTemporarios.push({ whatsapp: zap, detalhes: det });
      zapEl.value = '';
      detEl.value = '';
      renderizarContatosForm();
    }
  }

  const valOf = parseCurrency(document.getElementById('form-valorOf').value);
  const valPlan = parseCurrency(document.getElementById('form-valorPlan').value);

  const dados = {
    prefixo:     document.getElementById('form-prefixo').value.trim().toUpperCase(),
    municipio:   document.getElementById('form-municipio').value.trim(),
    numero:      numerosJoined,
    interessado: document.getElementById('form-interessado').value.trim(),
    objeto:      document.getElementById('form-objeto').value.trim(),
    valorOf:     valOf,
    valorPlan:   valPlan,
    diferenca:   valOf - valPlan,
    status:      document.getElementById('form-status').value,
    localizacao: document.getElementById('form-localizacao').value,
    data:        document.getElementById('form-data').value,
    obs:         document.getElementById('form-obs').value.trim(),
    anotacao:    document.getElementById('form-anotacao').value.trim(),
    contatos:    JSON.parse(JSON.stringify(contatosTemporarios))
  };

  if (!dados.interessado && !dados.numero) {
    toast('Informe ao menos o Nº do Processo ou o Interessado.', 'error');
    return;
  }

  if (state.editandoId) {

    atualizarProcesso(state.editandoId, dados);
    toast('Processo atualizado com sucesso!', 'success');
    state.editandoId = null;
  } else {
    adicionarProcesso(dados);
    toast('Processo cadastrado com sucesso!', 'success');
    document.getElementById('form-processo').reset();
  }

  navegar('processos');
}

// ---- DETALHE / MODAL ----
function abrirDetalhe(id) {
  const p = buscarProcessoPorId(id);
  if (!p) return;

  let contatosHtml = '';
  if (p.contatos && p.contatos.length > 0) {
    contatosHtml = `
      <div class="card" style="margin-bottom:16px">
        <h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:12px">📞 Contatos</h4>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${p.contatos.map(c => {
            const numeroLimpo = c.whatsapp.replace(/\D/g, '');
            return `
            <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.02);padding:8px 12px;border-radius:6px;border:1px solid var(--border)">
              <div style="display:flex;flex-direction:column;gap:2px">
                <span style="font-weight:600;font-size:14px;color:var(--text-primary)">${c.whatsapp}</span>
                ${c.detalhes ? `<span style="font-size:12px;color:var(--text-secondary)">${c.detalhes}</span>` : ''}
              </div>
              <a href="https://wa.me/55${numeroLimpo}" target="_blank" class="btn btn-success" style="padding:6px 12px;display:flex;align-items:center;gap:6px;border-radius:6px;font-size:13px;text-decoration:none;border:none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> Mensagem
              </a>
            </div>
          `}).join('')}
        </div>
      </div>`;
  }

  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('modal-content').innerHTML = `
    <div class="detail-header" style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; gap:12px; width:100%;">
        ${p.numero ? `
        <button style="flex:1; padding:12px; font-size:16px; display:flex; align-items:center; justify-content:center; gap:8px; border:none; border-radius:6px; background:#3b82f6; color:#ffffff; cursor:pointer;" onclick="copiarProcessoSelecionado()" title="Copiar Número">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar
        </button>
        <a href="https://sei.sistemas.ro.gov.br/sip/login.php?sigla_orgao_sistema=RO&sigla_sistema=SEI" target="_blank" class="btn btn-ghost" style="flex:1; padding:12px; display:flex; align-items:center; justify-content:center; background:white; border:1px solid var(--border); border-radius:6px;" title="Acessar SEI">
          <img src="img/logo-sei.png" style="height:24px; object-fit:contain" alt="SEI">
        </a>
        ` : ''}
        <button style="flex:1; padding:12px; font-size:16px; display:flex; align-items:center; justify-content:center; gap:8px; border:none; border-radius:6px; background:#10b981; color:#ffffff; cursor:pointer;" onclick="editarProcesso('${p.id}');fecharModal()" class="action-editor">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Editar
        </button>
      </div>
      <div>
        ${p.prefixo ? `<div style="margin-bottom:8px"><span class="badge-prefixo">${p.prefixo}</span></div>` : ''}
        <div class="detail-numero" style="margin-bottom:12px">
          ${(() => {
            const numerosLista = p.numero ? p.numero.split(',').map(n => n.trim()).filter(Boolean) : [];
            if (numerosLista.length > 0) {
              return `<div style="display:flex; flex-direction:column; gap:8px;">
                ${numerosLista.map((num, idx) => `
                  <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px; font-weight:600;">
                    <input type="radio" name="modal_processo_radio" value="${num}" ${idx === 0 ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;">
                    ${num}
                  </label>
                `).join('')}
              </div>`;
            }
            return '<span style="font-size:14px;font-weight:600">Sem número</span>';
          })()}
        </div>
        <div class="detail-nome" style="font-size:18px; margin-bottom:8px;">${p.interessado || '—'}</div>
        <div>
          <span class="badge ${getStatusBadgeClass(p.status)}">${p.status || '—'}</span>
        </div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-item"><label>Município</label><p>${p.municipio || '—'}</p></div>
      <div class="info-item"><label>Objeto</label><p>${p.objeto || '—'}</p></div>
      <div class="info-item"><label>Localização</label><p>${p.localizacao || '—'}</p></div>
      <div class="info-item"><label>Data</label><p>${formatDate(p.data)}</p></div>
    </div>


    <div class="card" style="margin-bottom:16px">
      <h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:12px">💰 Execução Financeira</h4>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        <div>
          <div style="font-size:11px;color:var(--text-muted)">Valor Oficial</div>
          <div style="font-size:18px;font-weight:700;color:var(--blue)">${formatCurrency(p.valorOf)}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-muted)">Valor Planilha</div>
          <div style="font-size:18px;font-weight:700;color:var(--green)">${formatCurrency(p.valorPlan)}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-muted)">Diferença</div>
          <div style="font-size:18px;font-weight:700;color:${(p.diferenca||0) < 0 ? 'var(--red)' : 'var(--yellow)'}">${formatCurrency(p.diferenca)}</div>
        </div>
      </div>
    </div>

    ${p.obs ? `<div class="card" style="margin-bottom:16px"><h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:8px">📝 Observações</h4><p style="color:var(--text-secondary);font-size:14px">${p.obs}</p></div>` : ''}
    ${p.anotacao ? `<div class="card" style="margin-bottom:16px"><h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:8px">🗒️ Anotação</h4><p style="color:var(--text-secondary);font-size:14px">${p.anotacao}</p></div>` : ''}

    ${contatosHtml}
  `;
}


function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function editarProcesso(id) {
  state.editandoId = id;
  navegar('novo');
}

function novoProcesso() {
  state.editandoId = null;
  navegar('novo');
}

function confirmarExcluir(id) {
  const p = buscarProcessoPorId(id);
  if (!p) return;
  if (confirm(`Excluir o processo "${p.numero || p.interessado}"?\nEssa ação não pode ser desfeita.`)) {
    excluirProcesso(id);
    toast('Processo excluído.', 'info');
    navegar('processos');
  }
}

// ---- IMPORTAÇÃO ----
function setupImportacao() {
  const zone = document.getElementById('import-zone');
  const input = document.getElementById('import-input');
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) processarArquivo(e.dataTransfer.files[0]);
  });

  input.addEventListener('change', () => {
    if (input.files[0]) processarArquivo(input.files[0]);
  });
}

async function processarArquivo(file) {
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    toast('Selecione um arquivo Excel (.xlsx ou .xls)', 'error');
    return;
  }

  document.getElementById('import-status').innerHTML = `
    <div class="loader"><div class="spinner"></div></div>
    <p style="text-align:center;color:var(--text-muted);margin-top:8px">Processando ${file.name}...</p>`;

  try {
    const result = await importarExcel(file);
    document.getElementById('import-status').innerHTML = `
      <div class="card" style="border-color:rgba(16,185,129,0.3);background:rgba(16,185,129,0.05)">
        <h3 style="color:var(--green);margin-bottom:12px">✅ Importação concluída!</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;font-size:14px">
          <div><span style="color:var(--text-muted)">Total na planilha:</span><br><strong>${result.total}</strong></div>
          <div><span style="color:var(--text-muted)">Novos importados:</span><br><strong style="color:var(--green)">${result.novos}</strong></div>
          <div><span style="color:var(--text-muted)">Duplicados ignorados:</span><br><strong style="color:var(--yellow)">${result.duplicados}</strong></div>
        </div>
        <button class="btn btn-primary" style="margin-top:16px" onclick="navegar('processos')">Ver Processos →</button>
      </div>`;
    toast(`${result.novos} processos importados!`, 'success');
  } catch (err) {
    document.getElementById('import-status').innerHTML = `
      <div class="card" style="border-color:rgba(239,68,68,0.3)">
        <h3 style="color:var(--red)">❌ Erro na importação</h3>
        <p style="color:var(--text-muted);margin-top:8px">${err.message}</p>
      </div>`;
    toast('Erro ao importar arquivo.', 'error');
  }
}

async function processarLinkGoogleSheets() {
  const url = document.getElementById('import-gsheets-url').value.trim();
  if (!url) {
    toast('Informe o link da planilha do Google.', 'error');
    return;
  }

  document.getElementById('import-status').innerHTML = `
    <div class="loader"><div class="spinner"></div></div>
    <p style="text-align:center;color:var(--text-muted);margin-top:8px">Baixando dados do Google Sheets...</p>`;

  try {
    const result = await importarGoogleSheets(url);
    document.getElementById('import-status').innerHTML = `
      <div class="card" style="border-color:rgba(16,185,129,0.3);background:rgba(16,185,129,0.05)">
        <h3 style="color:var(--green);margin-bottom:12px">✅ Importação do GSheets concluída!</h3>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;font-size:14px">
          <div><span style="color:var(--text-muted)">Total lidos:</span><br><strong>${result.total}</strong></div>
          <div><span style="color:var(--text-muted)">Novos importados:</span><br><strong style="color:var(--green)">${result.novos}</strong></div>
          <div><span style="color:var(--text-muted)">Duplicados ignorados:</span><br><strong style="color:var(--yellow)">${result.duplicados}</strong></div>
        </div>
        <button class="btn btn-primary" style="margin-top:16px" onclick="navegar('processos')">Ver Processos →</button>
      </div>`;
    toast(`${result.novos} processos importados do GSheets!`, 'success');
  } catch (err) {
    document.getElementById('import-status').innerHTML = `
      <div class="card" style="border-color:rgba(239,68,68,0.3)">
        <h3 style="color:var(--red)">❌ Erro no Google Sheets</h3>
        <p style="color:var(--text-muted);margin-top:8px">${err.message}</p>
      </div>`;
    toast('Erro ao importar Google Sheets.', 'error');
  }
}

// ---- INICIALIZAÇÃO ----
document.addEventListener('DOMContentLoaded', () => {
  // Navegação
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      if (el.dataset.page === 'novo') novoProcesso();
      else navegar(el.dataset.page);
    });
  });

  // Formulário
  document.getElementById('form-processo').addEventListener('submit', salvarFormulario);
  document.getElementById('btn-cancelar-form').addEventListener('click', () => navegar('processos'));

  // Fechar modal
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) fecharModal();
  });

  // Filtros
  const aplicarFiltro = (campo, valor) => {
    state.filtros[campo] = valor;
    state.paginaAtual = 1;
    renderProcessos();
  };

  document.getElementById('filtro-busca').addEventListener('input', e => aplicarFiltro('busca', e.target.value));
  document.getElementById('filtro-status').addEventListener('change', e => aplicarFiltro('status', e.target.value));
  document.getElementById('filtro-localizacao').addEventListener('change', e => aplicarFiltro('localizacao', e.target.value));
  document.getElementById('filtro-municipio').addEventListener('change', e => aplicarFiltro('municipio', e.target.value));
  document.getElementById('filtro-objeto').addEventListener('change', e => aplicarFiltro('objeto', e.target.value));

  document.getElementById('btn-limpar-filtros').addEventListener('click', () => {
    state.filtros = { busca: '', status: '', localizacao: '', municipio: '', objeto: '', prefixo: '' };
    state.paginaAtual = 1;
    document.getElementById('filtro-busca').value = '';
    document.getElementById('filtro-status').value = '';
    document.getElementById('filtro-localizacao').value = '';
    document.getElementById('filtro-municipio').value = '';
    document.getElementById('filtro-objeto').value = '';
    document.getElementById('filtro-prefixo').value = '';
    renderProcessos();
  });

  // Filtro prefixo — input em tempo real
  document.getElementById('filtro-prefixo').addEventListener('input', e => aplicarFiltro('prefixo', e.target.value.trim()));

  // Ordenação por coluna
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (state.sortCol === col) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortCol = col;
        state.sortDir = 'asc';
      }
      document.querySelectorAll('th[data-sort]').forEach(t => t.textContent = t.textContent.replace(/ [▲▼]$/,''));
      th.textContent += state.sortDir === 'asc' ? ' ▲' : ' ▼';
      renderProcessos();
    });
  });

  // Importação
  setupImportacao();

  // Preencher selects de filtro com status e localização
  const fillSelectFiltro = (id, lista) => {
    const s = document.getElementById(id);
    if (!s) return;
    s.innerHTML = `<option value="">Todos</option>` + lista.map(o => `<option value="${o}">${o}</option>`).join('');
  };
  fillSelectFiltro('filtro-status',      STATUS_LIST.filter(s => s !== '.'));
  fillSelectFiltro('filtro-localizacao', LOCALIZACAO_LIST.filter(s => s !== '.'));

  // Máscara de Celular (WhatsApp)
  const shareNum = document.getElementById("share-whatsapp-number");
  if (shareNum) {
    shareNum.addEventListener("input", (e) => {
      e.target.value = maskCelular(e.target.value);
    });
  }

  // Toggle de Status no modal de acessos
  const statusToggle = document.getElementById("acesso-status-toggle");
  const statusLabel = document.getElementById("acesso-status-label");
  if (statusToggle && statusLabel) {
    statusToggle.addEventListener("change", (e) => {
      statusLabel.textContent = e.target.checked ? "Liberado" : "Bloqueado";
    });
  }

  // Fechar modal de acesso ao clicar fora
  const modalAcessoOverlay = document.getElementById('modal-acesso-overlay');
  if (modalAcessoOverlay) {
    modalAcessoOverlay.addEventListener('click', e => {
      if (e.target === modalAcessoOverlay) fecharModalAcesso();
    });
  }

  // Página inicial
  navegar('dashboard');
});

// ---- EXPORTAÇÃO ----
function exportarExcel() {
  const filtrados = getFiltrados();
  if (filtrados.length === 0) {
    toast('Nenhum processo para exportar.', 'error');
    return;
  }

  const data = filtrados.map(p => ({
    "Prefixo": p.prefixo || '',
    "Município": p.municipio || '',
    "Nº Processo": p.numero || '',
    "Interessado": p.interessado || '',
    "Objeto": p.objeto || '',
    "Status": p.status || '',
    "Localização": p.localizacao || '',
    "Valor Oficial": p.valorOf || 0,
    "Valor Planilha": p.valorPlan || 0,
    "Data": p.data ? formatDate(p.data) : ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Processos");
  XLSX.writeFile(workbook, "Relatorio_Processos_SEDUC.xlsx");
}

function exportarPDF() {
  const filtrados = getFiltrados();
  if (filtrados.length === 0) {
    toast('Nenhum processo para exportar.', 'error');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape', 'mm', 'a4');

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const userElement = document.getElementById('user-name');
  const userName = userElement ? userElement.textContent : 'Admin';
  const dateTimeStr = "Impresso em: " + dateStr + " às " + timeStr + " | Usuário: " + userName;

  const tableColumn = ["Prefixo", "Município", "Nº Processo", "Interessado", "Objeto", "Status", "Localização", "Valor Oficial", "Data"];
  
  const tableRows = filtrados.map(p => {
    const num = p.numero ? p.numero.replace(/, /g, '\n') : '';
    return [
      p.prefixo || '',
      p.municipio || '',
      num,
      p.interessado || '',
      p.objeto || '',
      p.status || '',
      p.localizacao || '',
      p.valorOf ? maskCurrency((p.valorOf * 100).toFixed(0)) : 'R$ 0,00',
      p.data ? formatDate(p.data) : ''
    ];
  });

  const totalPagesExp = "{total_pages_count_string}";

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage: function (data) {
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text("CAM - COORDENAÇÃO DE ARTICULAÇÃO COM OS MUNICÍPIOS | SEDUC - RO", 14, 20);
      
      const str = "Página " + data.pageNumber + " de " + totalPagesExp;
      doc.setFontSize(8);
      doc.setTextColor(100);
      
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      
      doc.text(str, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(dateTimeStr, pageWidth - 14, pageHeight - 10, { align: 'right' });
    }
  });

  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesExp);
  }

  doc.autoPrint();
  const blob = doc.output("blob");
  window.open(URL.createObjectURL(blob), '_blank');
}




window.addEventListener('beforeprint', () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const el = document.getElementById('print-date-time');
  if (el) {
    el.innerHTML = "Emitido em: " + dateStr + ", às " + timeStr;
  }
});


let contatosTemporarios = [];

function maskTelefone(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
  if (v.length > 10) v = v.slice(0, 10) + '-' + v.slice(10);
  input.value = v;
}

function adicionarContato() {
  const zapEl = document.getElementById('form-contato-whatsapp');
  const detEl = document.getElementById('form-contato-detalhes');
  const zap = zapEl.value.trim();
  const det = detEl.value.trim();
  
  if (!zap) {
    toast('Preencha o número do WhatsApp', 'error');
    return;
  }
  
  contatosTemporarios.push({ whatsapp: zap, detalhes: det });
  zapEl.value = '';
  detEl.value = '';
  renderizarContatosForm();
}

function removerContato(index) {
  contatosTemporarios.splice(index, 1);
  renderizarContatosForm();
}

function renderizarContatosForm() {
  const container = document.getElementById('lista-contatos');
  if (!container) return;
  container.innerHTML = '';
  
  contatosTemporarios.forEach((c, idx) => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:8px 12px; border-radius:6px; border:1px solid var(--border);';
    
    div.innerHTML = "<div style=\"display:flex; flex-direction:column; gap:2px;\">" +
      "<span style=\"font-weight:600; color:var(--text-primary); font-size:13px;\">📞 " + c.whatsapp + "</span>" +
      (c.detalhes ? "<span style=\"color:var(--text-secondary); font-size:12px;\">" + c.detalhes + "</span>" : "") +
      "</div>" +
      "<button type=\"button\" class=\"btn btn-ghost btn-sm\" onclick=\"removerContato(" + idx + ")\" style=\"color:var(--red); padding: 2px;\">❌</button>";
      
    container.appendChild(div);
  });
}




// ---- FUN��O PARA COPIAR PROCESSO SELECIONADO ----
window.copiarProcessoSelecionado = function() {
  const radio = document.querySelector('input[name="modal_processo_radio"]:checked');
  if (radio) {
    navigator.clipboard.writeText(radio.value);
    toast('N�mero copiado!', 'success');
  } else {
    toast('Nenhum n�mero selecionado', 'error');
  }
};



// ==================== IMPRESSÕES ====================


function getFormattedDateForTitle() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${d}${m}${y}_${h}${min}${s}`;
}

function getCommonHeader(subtitle) {
  return `
    <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid #000; padding-bottom:5px; margin-bottom:15px; width:100%; font-family: Arial, sans-serif;">
      <div style="text-align:left;">
        <h2 style="margin:0; font-size:11px; color:#000; font-weight:bold;">CAM - COORDENAÇÃO DE ARTICULAÇÃO COM OS MUNICÍPIOS | SEDUC - RO</h2>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px; color:#000; font-weight:bold;">${subtitle.toUpperCase()}</div>
      </div>
    </div>
  `;
}


function injectFixedHeader(subtitle) {
  let header = document.getElementById('fixed-print-header');
  if (!header) {
    header = document.createElement('div');
    header.id = 'fixed-print-header';
    header.className = 'print-only fixed-header';
    document.body.appendChild(header);
  }
  header.innerHTML = getCommonHeader(subtitle);
}
function getCommonFooter() {
  return `
    <div style="border-top:1px solid #ccc; padding-top:4px; margin-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:9px; font-weight:normal; color:#333; font-family: Arial, sans-serif; width:100%;">
      <div style="flex:1; text-align:left; font-weight:bold; color:#000;">GBZ</div>
      <div style="flex:1; text-align:right;" class="print-date-time-rodape"></div>
    </div>
  `;
}

function updatePrintDateTime() {
  const agora = new Date();
  const d = agora.toLocaleDateString('pt-BR');
  const t = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  document.querySelectorAll('.print-date-time-rodape').forEach(el => {
    el.innerHTML = `${d} / ${t}`;
  });
}

function injectFixedFooter() { /* Removed - using browser native footer */ }


window.formatNumberOnly = function(valor) {
  if (typeof valor !== 'number') return '0,00';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


function injectPrintHeader(subtitle) { /* disabled */ }

window.imprimirPadrao = function() {
      updatePrintDateTime();
      updatePrintDateTime();
      const filtrados = getFiltrados();
      
      let rowsHtml = filtrados.map((p, index) => `
        <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
          <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px; width:3%;">${index + 1}</td>
            <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:8%;">${p.prefixo || '-'}</td>
            <td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word; width:12%;">${(p.numero || '-').replace(/\s+/g, '<br>')}</td>
            <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:18%;">${p.interessado || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word; width:28%;">${p.objeto || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px; width:9%;">${p.status || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:7%;">${p.localizacao || '-'}</td>
            <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px; width:7%;">${formatDate(p.data)}</td>
            <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px; width:8%;">${formatNumberOnly(p.valorOf)}</td></tr>`).join('');
      const totalValorPadrao = filtrados.reduce((acc, p) => acc + (p.valorOf || 0), 0);
      const totalRowPadrao = `
        <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; font-weight:bold; background:#f9fafb;">
          <td colspan="8" style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">TOTAL GERAL (${filtrados.length} processos):</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">${formatNumberOnly(totalValorPadrao)}</td></tr>`;
      rowsHtml += totalRowPadrao;

      const html = `
        <table style="width:100%; font-family: Arial, sans-serif; border-collapse:collapse;">
          <thead><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonHeader('Lista de Processos')}</td></tr></thead>
          <tbody><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>
            <table class="print-table-detalhado" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word; margin-bottom:20px;">
              <colgroup>
                <col style="width: 3%;">
                <col style="width: 8%;">
                <col style="width: 12%;">
                <col style="width: 18%;">
                <col style="width: 28%;">
                <col style="width: 9%;">
                <col style="width: 7%;">
                <col style="width: 7%;">
                <col style="width: 8%;">
              </colgroup>
              <thead>
                <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:center; width:3%; font-size:12px; font-weight:bold;">Nº</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:8%; font-size:12px; font-weight:bold;">PREFIXO</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:12%; font-size:12px; font-weight:bold;">PROCESSO SEI</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:18%; font-size:12px; font-weight:bold;">INTERESSADO</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:28%; font-size:12px; font-weight:bold;">OBJETO / FINALIDADE</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:9%; font-size:12px; font-weight:bold;">STATUS</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:7%; font-size:12px; font-weight:bold;">LOCAL</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:center; width:7%; font-size:12px; font-weight:bold;">DATA</th>
                  <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:right; width:8%; font-size:12px; font-weight:bold;">VALOR R$</th>
                </tr>
              </thead>
              ${rowsHtml || '<tbody><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td colspan="9" style="text-align:center; padding: 10px; font-size:10px;">Nenhum processo encontrado.</td></tr></tbody>'}
            </table>
          </td></tr></tbody>
          <tfoot><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonFooter()}</td></tr></tfoot>
        </table>
      `;
      
      let container = document.getElementById('print-layout-padrao');
      if (!container) {
        container = document.createElement('div');
        container.id = 'print-layout-padrao';
        container.className = 'print-only-layout';
        document.body.appendChild(container);
      }
      container.innerHTML = html;
      
      document.getElementById('print-layout-detalhado').style.display = 'none';
      document.getElementById('print-layout-analise').style.display = 'none';
      container.style.display = 'block';
      
      document.body.classList.add('print-mode-padrao');
      document.body.classList.remove('print-mode-detalhado', 'print-mode-analise');

      const origTitle = document.title;
      document.title = 'CAM_PADRAO_' + getFormattedDateForTitle();

      const style = document.createElement('style');
      style.innerHTML = '@media print { @page { size: A4 landscape !important; } }';
      document.head.appendChild(style);

      window.print();

      setTimeout(() => {
        document.title = origTitle;
        if (document.head.contains(style)) document.head.removeChild(style);
        document.body.classList.remove('print-mode-padrao');
        container.style.display = 'none';
      }, 1000);
    };

window.imprimirDetalhado = function() {
  updatePrintDateTime();
  const filtrados = getFiltrados();
  
  let total = 0, qtdAutorizados = 0, valAutorizados = 0;
  let qtdReabertos = 0, valReabertos = 0;
  let qtdOutros = 0, valOutros = 0;
  const statusSummary = {};

  filtrados.forEach(p => {
    total += p.valorOf;
    const st = normalizar(p.status);
    
    if (!statusSummary[p.status]) statusSummary[p.status] = { qtde: 0, valor: 0 };
    statusSummary[p.status].qtde++;
    statusSummary[p.status].valor += p.valorOf;

    if (st.includes('autorizado')) {
      qtdAutorizados++;
      valAutorizados += p.valorOf;
    } else if (st.includes('reaberto')) {
      qtdReabertos++;
      valReabertos += p.valorOf;
    } else {
      qtdOutros++;
      valOutros += p.valorOf;
    }
  });

  const cardsHtml = `
    <div class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; display:flex; gap:10px; margin-bottom: 20px;">
      <div style="flex:1; border:2px solid #000; background:#f8fafc; padding:6px; text-align:center; min-width:0;">
        <div style="font-size:7px; font-weight:bold; color:#000;">VALOR TOTAL CONSOLIDADO</div>
        <div style="font-size:14px; font-weight:bold; color:#000; margin:5px 0;">${formatCurrency(total)}</div>
        <div style="font-size:7px; color:#000;">${filtrados.length} processos únicos</div>
      </div>
      <div style="flex:1; border:2px solid #000; background:#f0fdf4; padding:6px; text-align:center; min-width:0;">
        <div style="font-size:7px; font-weight:bold; color:#000;">PROCESSOS AUTORIZADOS</div>
        <div style="font-size:14px; font-weight:bold; color:#000; margin:5px 0;">${formatCurrency(valAutorizados)}</div>
        <div style="font-size:7px; color:#000;">${qtdAutorizados} processos</div>
      </div>
      <div style="flex:1; border:2px solid #000; background:#fef2f2; padding:6px; text-align:center; min-width:0;">
        <div style="font-size:7px; font-weight:bold; color:#000;">REABERTOS E PENDENTES</div>
        <div style="font-size:14px; font-weight:bold; color:#000; margin:5px 0;">${formatCurrency(valReabertos + valOutros)}</div>
        <div style="font-size:7px; color:#000;">${qtdReabertos + qtdOutros} processos</div>
      </div>
    </div>
  `;

  let tableRows = '';
  filtrados.forEach((p, i) => {
    tableRows += `
      <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
        <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px; width:3%;">${i + 1}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:8%;">${p.prefixo || '-'}</td>
          <td class="col-numero" style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word; width:12%;">${(p.numero || '-').replace(/\s+/g, '<br>')}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:18%;">${p.interessado || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; white-space:normal; word-wrap:break-word; width:28%;">${p.objeto || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-transform: uppercase; font-size:10px; width:9%;">${p.status || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; font-size:10px; width:7%;">${p.localizacao || '-'}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:center; font-size:10px; width:7%;">${formatDate(p.data)}</td>
          <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px; width:8%;">${formatNumberOnly(p.valorOf)}</td></tr>`;
  });
  const totalValorDetalhado = filtrados.reduce((acc, p) => acc + (p.valorOf || 0), 0);
  tableRows += `
    <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; font-weight:bold; background:#f9fafb;">
      <td colspan="8" style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">TOTAL GERAL (${filtrados.length} processos):</td>
      <td style="border: 1px solid #ccc; padding: 2px; text-align:right; font-size:10px;">${formatNumberOnly(totalValorDetalhado)}</td></tr>`;

  const tableHtml = `
    <h3 style="color:#000; border-bottom:1px solid #000; padding-bottom:5px; margin-top:20px; font-size:14px;">1. Detalhamento dos processos</h3>
    <table class="print-table-detalhado" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word; margin-bottom:20px;" style="width:100%; table-layout:fixed; border-collapse:collapse; font-family:Arial; word-wrap:break-word; margin-bottom:20px;">

            <colgroup>
              <col style="width: 3%;">
              <col style="width: 8%;">
              <col style="width: 12%;">
              <col style="width: 18%;">
              <col style="width: 28%;">
              <col style="width: 9%;">
              <col style="width: 7%;">
              <col style="width: 7%;">
              <col style="width: 8%;">
            </colgroup>
  
            <thead>
            <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:center; width:3%; font-size:12px; font-weight:bold;">Nº</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:8%; font-size:12px; font-weight:bold;">PREFIXO</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:12%; font-size:12px; font-weight:bold;">PROCESSO SEI</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:18%; font-size:12px; font-weight:bold;">INTERESSADO</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:28%; font-size:12px; font-weight:bold;">OBJETO / FINALIDADE</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:9%; font-size:12px; font-weight:bold;">STATUS</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:left; width:7%; font-size:12px; font-weight:bold;">LOCAL</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:center; width:7%; font-size:12px; font-weight:bold;">DATA</th>
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:right; width:8%; font-size:12px; font-weight:bold;">VALOR R$</th>
            </tr></thead>
      ${tableRows}
    </table>
  `;

  let sumRows = '';
  Object.keys(statusSummary).forEach(st => {
    const part = total > 0 ? (statusSummary[st].valor / total * 100).toFixed(1) + '%' : '0%';
    sumRows += `
      <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
        <td style="padding: 2px; border:1px solid #000;">${st}</td>
        <td style="padding: 2px; border:1px solid #000; text-align:center;">${statusSummary[st].qtde}</td>
        <td style="padding: 2px; border:1px solid #000; text-align:right;">${formatCurrency(statusSummary[st].valor)}</td>
        <td style="padding: 2px; border:1px solid #000; text-align:center;">${part}</td>
      </tr>
    `;
  });
  sumRows += `
    <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; background:#e2e8f0; font-weight:bold;">
      <td style="padding: 2px; border:1px solid #000;">TOTAL GERAL</td>
      <td style="padding: 2px; border:1px solid #000; text-align:center;">${filtrados.length}</td>
      <td style="padding: 2px; border:1px solid #000; text-align:right;">${formatCurrency(total)}</td>
      <td style="padding: 2px; border:1px solid #000; text-align:center;">100,0%</td>
    </tr>
  `;

  const execSummaryHtml = `
    <h3 style="color:#000; border-bottom:1px solid #000; padding-bottom:5px; font-size:14px;">2. Resumo por status</h3>
    <div style="display:flex; gap:20px;">
      <div style="flex:1;">
        <table style="width:100%; border-collapse:collapse; font-size:7px;">
          <thead>
            <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; background:#f1f5f9; color:#000; ">
              <th style="padding: 2px; border:1px solid #000;">Status</th>
              <th style="padding: 2px; border:1px solid #000;">Qtde.</th>
              <th style="padding: 2px; border:1px solid #000;">Valor total</th>
              <th style="padding: 2px; border:1px solid #000;">Part.</th>
            </tr>
          </thead>
          ${sumRows}
        </table>
      </div>
      <div style="flex:1; font-size:11px; line-height:1.5;">
        <strong>Leitura executiva:</strong><br>
        • ${(valAutorizados / (total||1) * 100).toFixed(1)}% do valor consolidado já consta como AUTORIZADO.<br>
        • ${qtdReabertos > 0 ? 'Reabertos: ' + formatCurrency(valReabertos) + '.' : 'Não há processos reabertos nesta seleção.'}<br>
        • ${qtdOutros > 0 ? 'Existem ' + qtdOutros + ' processos em outras situações.' : 'Todos os processos estão resolvidos.'}
      </div>
    </div>
  `;

  const html = `
    <table style="width:100%; font-family: Arial, sans-serif; border-collapse:collapse;">
      <thead><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonHeader('RELATÓRIO DETALHADO DE PROCESSOS')}</td></tr></thead>
      <tbody><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>
        <div style="margin-top: 5mm;">
          ${cardsHtml}
          ${tableHtml}
          ${execSummaryHtml}
        </div>
      </td></tr></tbody>
      <tfoot><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonFooter()}</td></tr></tfoot>
    </table>
  `;
  document.getElementById('print-layout-detalhado').innerHTML = html;
  
  document.getElementById('print-layout-detalhado').style.display = 'block';
  document.getElementById('print-layout-analise').style.display = 'none';
  document.body.classList.add('print-mode-detalhado');
  document.body.classList.remove('print-mode-analise');
    const orig = document.title;
    document.title = 'CAM_DETALHADO_' + getFormattedDateForTitle();
    window.print();
    setTimeout(() => document.title = orig, 1000);
  
  setTimeout(() => {
    document.body.classList.remove('print-mode-detalhado');
    document.getElementById('print-layout-detalhado').style.display = 'none';
  }, 1000);
};

window.imprimirAnalise = function() {
  updatePrintDateTime();
  const filtrados = getFiltrados();
  let total = 0;
  
  // Extract active filters
  const fGeral = document.getElementById('filtro-geral') ? document.getElementById('filtro-geral').value : '';
  const fStatus = document.getElementById('filtro-status') ? document.getElementById('filtro-status').value : 'Todos';
  const fLocalizacao = document.getElementById('filtro-localizacao') ? document.getElementById('filtro-localizacao').value : 'Todos';
  const fPrefixo = document.getElementById('filtro-prefixo') ? document.getElementById('filtro-prefixo').value : 'Todos';
  const fMunicipio = document.getElementById('filtro-municipio') ? document.getElementById('filtro-municipio').value : 'Todos';
  
  let filtrosAplicados = [];
  if (fGeral) filtrosAplicados.push("Busca: '" + fGeral + "'");
  if (fStatus && fStatus !== 'Todos') filtrosAplicados.push("Status: " + fStatus);
  if (fLocalizacao && fLocalizacao !== 'Todos') filtrosAplicados.push("Localização: " + fLocalizacao);
  if (fPrefixo && fPrefixo !== 'Todos') filtrosAplicados.push("Prefixo: " + fPrefixo);
  if (fMunicipio && fMunicipio !== 'Todos') filtrosAplicados.push("Município: " + fMunicipio);
  
  const filtrosTexto = filtrosAplicados.length > 0 
    ? "Filtros aplicados (" + filtrosAplicados.join(', ') + ")" 
    : "Todos os processos (sem filtros aplicados)";

  
  const analise = {};
  
  filtrados.forEach(p => {
    total += p.valorOf;
    const st = p.status || 'SEM STATUS';
    const loc = p.localizacao || 'Sem Local';
    
    if(!analise[st]) analise[st] = { qtde: 0, valor: 0, locais: {} };
    analise[st].qtde++;
    analise[st].valor += p.valorOf;
    
    if(!analise[st].locais[loc]) analise[st].locais[loc] = 0;
    analise[st].locais[loc]++;
  });

  const arrStatus = Object.keys(analise).sort((a,b) => analise[b].valor - analise[a].valor);

  let conteudoStatus = '';
  arrStatus.forEach((st, idx) => {
    const bgColor = (idx % 2 === 0) ? '#f2f2f2' : '#ffffff'; // Cinza 15% (f2f2f2) and white zebrado
    const obj = analise[st];
    const pct = ((obj.valor / (total||1)) * 100).toFixed(1);
    
    const arrLocais = Object.entries(obj.locais).sort((a,b) => b[1]-a[1]);
    const topLocaisStr = arrLocais.slice(0,3).map(l => `${l[0]} (${l[1]})`).join(', ');

    conteudoStatus += `
      <div class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; border-left:${(idx % 2 === 0) ? '4px solid transparent' : '4px solid #000'}; margin-bottom:0; background:${bgColor}; padding:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-size:14px; color:#000;">${st}</h4>
          <strong style="font-size:14px;">${formatCurrency(obj.valor)} (${pct}%)</strong>
        </div>
        <div style="font-size:11px; margin-top:5px; color:#333;">
          <strong>Quantidade:</strong> ${obj.qtde} processos.<br>
          <strong>Locais:</strong> ${topLocaisStr}.
        </div>
      </div>
    `;
  });

  const html = `
    <table style="width:100%; font-family: Arial, sans-serif; border-collapse:collapse;">
      <thead><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonHeader('ANÁLISE GERENCIAL')}</td></tr></thead>
      <tbody><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>
        
        <div class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; margin-bottom:20px; font-size:12px; text-align:justify; line-height:1.6; padding:10px; border:1px solid #ccc;">
          <strong>SÍNTESE ANALÍTICA:</strong> Parâmetros buscados: <em>${filtrosTexto}</em>.<br>O presente cenário totaliza <strong>${formatCurrency(total)}</strong> distribuídos em <strong>${filtrados.length}</strong> processos. 
          Abaixo detalhamos a concentração de recursos por status, cruzando com a localização, 
          permitindo identificar os principais setores responsáveis pela retenção de processos.
        </div>

        ${conteudoStatus}

        <div style="margin-top:30px; border-top:2px solid #ea580c; padding-top:10px; text-align:right;">
          <div style="font-size:14px; font-weight:bold; color:#ea580c; display:inline-block;">TOTAL GERAL: ${formatCurrency(total)}</div>
        </div>
        
      </td></tr></tbody>
      <tfoot><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>${getCommonFooter()}</td></tr></tfoot>
    </table>
  `;
  
  document.getElementById('print-layout-analise').innerHTML = html;
  
  document.getElementById('print-layout-analise').style.display = 'block';
  document.getElementById('print-layout-detalhado').style.display = 'none';
  document.body.classList.add('print-mode-analise');
  document.body.classList.remove('print-mode-detalhado');
    const orig = document.title;
    document.title = 'CAM_ANALITICO_' + getFormattedDateForTitle();
    window.print();
    setTimeout(() => document.title = orig, 1000);
  
  setTimeout(() => {
    document.body.classList.remove('print-mode-analise');
    document.getElementById('print-layout-analise').style.display = 'none';
  }, 1000);
};

// ---- GERENCIAMENTO DE ACESSOS (CRUD) ----

let listaAcessos = [];

function abrirModalAcesso(index = null) {
  const modal = document.getElementById('modal-acesso-overlay');
  const title = document.getElementById('modal-acesso-title');
  const form = document.getElementById('form-acesso');
  const rowInput = document.getElementById('acesso-row');
  const nomeInput = document.getElementById('acesso-nome');
  const whatsappInput = document.getElementById('acesso-whatsapp');
  const nivelInput = document.getElementById('acesso-nivel');
  const senhaInput = document.getElementById('acesso-senha');
  const statusToggle = document.getElementById('acesso-status-toggle');
  const statusLabel = document.getElementById('acesso-status-label');

  form.reset();
  rowInput.value = '';
  statusToggle.checked = true;
  statusLabel.textContent = 'Liberado';

  if (index !== null) {
    const user = listaAcessos[index];
    title.textContent = 'Editar Usuário';
    rowInput.value = user._rowNumber;
    nomeInput.value = user.nome;
    whatsappInput.value = user.whatsapp || '';
    whatsappInput.disabled = true;
    nivelInput.value = user.nivel;
    senhaInput.value = user.senha || '';
    statusToggle.checked = user.status === 'liberado';
    statusLabel.textContent = user.status === 'liberado' ? 'Liberado' : 'Bloqueado';
  } else {
    title.textContent = 'Novo Usuário';
    whatsappInput.disabled = false;
  }

  modal.style.display = 'flex';
}

function fecharModalAcesso() {
  document.getElementById('modal-acesso-overlay').style.display = 'none';
}

async function carregarAcessos() {
  const tbody = document.getElementById('table-acessos');
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">Carregando acessos...</td></tr>`;

  try {
    const token = sessionStorage.getItem('sap_session_token');
    const res = await fetch(API_BASE + '/api/acessos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || 'Erro ao carregar lista de acessos.');
    }

    listaAcessos = await res.json();
    
    if (listaAcessos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">Nenhum usuário cadastrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = listaAcessos.map((user, index) => {
      const statusBadge = user.status === 'liberado' 
        ? `<span class="badge badge-AUTORIZADO" style="background:#d1fae5; color:#065f46;">Liberado</span>`
        : `<span class="badge badge-PENDENTE" style="background:#fee2e2; color:#991b1b;">Bloqueado</span>`;

      const nivelDisplay = {
        leitor: '👁️ Leitor',
        editor: '✏️ Editor',
        adm: '🛡️ Administrador'
      }[user.nivel] || user.nivel;

      const whatsappDisplay = user.whatsapp || '—';
      const senhaDisplay = user.senha || '—';
      const contagemDisplay = user.contagem || '0';
      const dataDisplay = user.data || '—';

      return `
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 16px; font-size:14px; font-weight:500; color:#1e293b;">${user.nome}</td>
          <td style="padding:12px 16px; font-size:14px; color:#64748b;">${whatsappDisplay}</td>
          <td style="padding:12px 16px; font-size:14px; color:#334155;">${nivelDisplay}</td>
          <td style="padding:12px 16px; font-size:14px;">${statusBadge}</td>
          <td style="padding:12px 16px; font-size:14px; font-family:monospace; font-weight:600; color:#475569;">${senhaDisplay}</td>
          <td style="padding:12px 16px; font-size:14px; color:#64748b; font-weight:500;">${contagemDisplay}</td>
          <td style="padding:12px 16px; font-size:13px; color:#64748b;">${dataDisplay}</td>
          <td style="padding:12px 16px; font-size:14px; text-align:right;">
            <button class="btn btn-ghost btn-sm" onclick="abrirModalAcesso(${index})" style="padding:4px 8px; font-size:12px; border:1px solid #cbd5e1; border-radius:4px; background:#fff; cursor:pointer;">✏️ Editar</button>
            <button class="btn btn-danger btn-sm" onclick="deletarAcesso(${user._rowNumber}, '${user.whatsapp}')" style="padding:4px 8px; font-size:12px; margin-left:6px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer;">🗑️ Excluir</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error(error);
    toast(error.message, 'error');
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:#ef4444;">${error.message}</td></tr>`;
  }
}

async function salvarAcessoForm(event) {
  event.preventDefault();
  const row = document.getElementById('acesso-row').value;
  const nome = document.getElementById('acesso-nome').value;
  const whatsapp = document.getElementById('acesso-whatsapp').value;
  const nivel = document.getElementById('acesso-nivel').value;
  const senha = document.getElementById('acesso-senha').value;
  const status = document.getElementById('acesso-status-toggle').checked ? 'liberado' : 'bloqueado';

  const payload = { nome, whatsapp, nivel, status, senha };
  const token = sessionStorage.getItem('sap_session_token');

  try {
    let url = API_BASE + '/api/acessos';
    let method = 'POST';

    if (row) {
      url += '/' + row;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || 'Erro ao salvar acesso.');
    }

    toast(row ? 'Usuário atualizado!' : 'Usuário cadastrado!', 'success');
    fecharModalAcesso();
    carregarAcessos();
  } catch (error) {
    console.error(error);
    toast(error.message, 'error');
  }
}

async function deletarAcesso(rowNumber, whatsapp) {
  if (!confirm(`Deseja realmente excluir o acesso do usuário ${whatsapp}?`)) {
    return;
  }

  const token = sessionStorage.getItem('sap_session_token');
  try {
    const res = await fetch(API_BASE + `/api/acessos/${rowNumber}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.erro || 'Erro ao deletar acesso.');
    }

    toast('Usuário removido com sucesso!', 'info');
    carregarAcessos();
  } catch (error) {
    console.error(error);
    toast(error.message, 'error');
  }
}

// ---- MÁSCARA E ENVIAR WHATSAPP ----

function maskCelular(v) {
  v = v.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  
  if (v.length > 10) {
    return `(${v.substring(0, 2)}) ${v.substring(2, 3)} ${v.substring(3, 7)}-${v.substring(7)}`;
  } else if (v.length > 6) {
    return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
  } else if (v.length > 2) {
    return `(${v.substring(0, 2)}) ${v.substring(2)}`;
  } else if (v.length > 0) {
    return `(${v}`;
  }
  return v;
}

function enviarLinkWhatsApp() {
  const inputVal = document.getElementById('share-whatsapp-number').value;
  const digits = inputVal.replace(/\D/g, "");

  if (digits.length < 10) {
    toast('Por favor, informe um número de celular válido com DDD.', 'error');
    return;
  }

  const phoneFormatted = digits.startsWith('55') ? digits : '55' + digits;
  const textMsg = encodeURIComponent("Olá! Segue o link de acesso ao sistema de Acompanhamento de Processos da SEDUC-RO:\n\nhttps://tinhosys.github.io/seduc-processos/");

  const url = `https://api.whatsapp.com/send?phone=${phoneFormatted}&text=${textMsg}`;
  window.open(url, '_blank');
}

window.abrirModalAcesso = abrirModalAcesso;
window.fecharModalAcesso = fecharModalAcesso;
window.salvarAcessoForm = salvarAcessoForm;
window.deletarAcesso = deletarAcesso;
window.enviarLinkWhatsApp = enviarLinkWhatsApp;
window.maskCelular = maskCelular;

setTimeout(() => {
  document.body.classList.remove('print-mode-analise');
  document.getElementById('print-layout-analise').style.display = 'none';
}, 1000);
