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
  const user = Auth.getCurrentUser();
  if (!user) {
    document.getElementById('app-wrapper').style.display = 'none';
    document.getElementById('login-layout').style.display = 'flex';
    return;
  }
  
  document.getElementById('app-wrapper').style.display = 'block';
  document.getElementById('login-layout').style.display = 'none';

  const elUserName = document.getElementById('user-name');
  if (elUserName) elUserName.textContent = user.nome;
  const elUserRole = document.getElementById('user-role');
  if (elUserRole) elUserRole.textContent = PERFIS[user.perfil];

  const isAdmin = Auth.isAdmin();
  const canEdit = Auth.canEdit();
  
  document.querySelectorAll('.action-admin').forEach(el => el.style.display = isAdmin ? '' : 'none');
  document.querySelectorAll('.action-editor').forEach(el => el.style.display = canEdit ? '' : 'none');

  if ((pagina === 'usuarios' || pagina === 'logs') && !isAdmin) pagina = 'dashboard';
  if ((pagina === 'novo' || pagina === 'importar') && !canEdit) pagina = 'dashboard';

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
    usuarios: 'Gerenciar Usuários',
    logs: 'Auditoria de Ações'
  };
  document.getElementById('topbar-title').textContent = titles[pagina] || pagina;

  if (pagina === 'dashboard') renderDashboard();
  if (pagina === 'processos') renderProcessos();
  if (pagina === 'novo') renderFormulario();
  if (pagina === 'usuarios') renderUsuarios();
  if (pagina === 'logs') renderLogs();
}

function fazerLogout() {
  Logger.log('LOGOUT');
  Auth.logout();
  navegar('dashboard');
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

  const colorsStatus = [
    '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
    '#06b6d4','#f97316','#6366f1','#ec4899','#14b8a6'
  ];

  const ctxStatus = document.getElementById('chart-status').getContext('2d');
  if (typeof Chart === 'undefined') return;
  
  if (chartStatus) chartStatus.destroy();
  chartStatus = new Chart(ctxStatus, {
    type: 'pie',
    data: {
      labels: statusLabels,
      datasets: [{ data: statusValues, backgroundColor: colorsStatus, borderWidth: 2, borderColor: '#0a0f1e' }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#94a3b8',
            font:  { size: 11 },
            padding: 12,
            boxWidth: 12,
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.raw} processo${ctx.raw !== 1 ? 's' : ''}`,
          }
        }
      }
    }
  });


  // Gráfico: TODOS os Municípios por valor — barra vertical, ordem decrescente
  const munValor = {};
  processos.forEach(p => {
    if (p.municipio) munValor[p.municipio] = (munValor[p.municipio] || 0) + (p.valorOf || 0);
  });
  // Todos, ordem decrescente
  const allMun = Object.entries(munValor).sort((a,b) => b[1] - a[1]);

  const munCanvas  = document.getElementById('chart-municipio');
  const barMinH    = 32; 
  const canvasH    = Math.max(350, allMun.length * barMinH);

  munCanvas.style.height = canvasH + 'px';
  munCanvas.style.width  = '100%';
  munCanvas.height       = canvasH;

  const gradient = allMun.map((_, i) => {
    const hue = Math.round(220 - (i / Math.max(allMun.length - 1, 1)) * 140);
    return `hsla(${hue}, 70%, 55%, 0.85)`;
  });

  const ctxMun = munCanvas.getContext('2d');
  if (typeof Chart === 'undefined') return;

  if (chartMunicipio) chartMunicipio.destroy();
  chartMunicipio = new Chart(ctxMun, {
    type: 'bar',
    data: {
      labels: allMun.map(([m]) => m.length > 25 ? m.slice(0,25)+'…' : m),
      datasets: [{
        label: 'Valor Oficial (R$)',
        data:  allMun.map(([,v]) => v),
        backgroundColor: gradient,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + formatCurrency(ctx.raw),
            title: ctx => allMun[ctx[0].dataIndex][0],
          }
        }
      },
      scales: {
        y: {
          ticks: { color: '#94a3b8', font: { size: 11 } },
          grid:  { display: false }
        },
        x: {
          ticks: { color: '#64748b', font: { size: 10 }, callback: v => 'R$ ' + (v/1e6).toFixed(1)+'M' },
          grid:  { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });

  // Tabela recentes
  const recentes = [...processos].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  const tbody = document.getElementById('table-recentes');
  tbody.innerHTML = recentes.map(p => `
    <tr onclick="abrirDetalhe('${p.id}')">
      <td class="col-municipio">${p.municipio || '—'}</td>
      <td class="col-numero">${p.numero || '—'}</td>
      <td class="col-interessado">${p.interessado || '—'}</td>
      <td><span class="badge ${getStatusBadgeClass(p.status)}">${p.status || '—'}</span></td>
      <td class="col-valor">${formatCurrency(p.valorOf)}</td>
    </tr>
  `).join('') || `<tr><td colspan="5" class="empty-state"><div class="empty-icon">📋</div><p>Nenhum processo cadastrado</p></td></tr>`;

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
      normalizar(p.prefixo).includes(q)
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
  preencherSelectFiltro('filtro-municipio', [...new Set(carregarProcessos().map(p => p.municipio).filter(Boolean))].sort());
  preencherSelectFiltro('filtro-objeto',    [...new Set(carregarProcessos().map(p => p.objeto).filter(Boolean))].sort());

  // Preencher datalist do filtro de prefixo
  const dlFiltroPfx = document.getElementById('list-filtro-prefixos');
  if (dlFiltroPfx) {
    const pfxs = [...new Set(carregarProcessos().map(p => p.prefixo).filter(Boolean))].sort();
    dlFiltroPfx.innerHTML = pfxs.map(v => `<option value="${v}">`).join('');
  }

  // Preencher datalist de prefixos no formulário
  const dlPrefixo = document.getElementById('list-prefixos');
  if (dlPrefixo) {
    const prefixos = [...new Set(carregarProcessos().map(p => p.prefixo).filter(Boolean))].sort();
    dlPrefixo.innerHTML = prefixos.map(p => `<option value="${p}">`).join('');
  }

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
        <button class="btn btn-ghost btn-sm" onclick="confirmarExcluir('${p.id}')" style="margin-left:4px">🗑️</button>
      </td>
    </tr>
  `).join('') || `
    <tr><td colspan="9">
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

  // Botão exportar Excel
  document.getElementById('btn-exportar').onclick = () => exportarExcel(filtrados);

  // Botão exportar PDF
  const btnPDF = document.getElementById('btn-pdf');
  if (btnPDF) btnPDF.onclick = () => exportarPDF(filtrados);
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
  sel.innerHTML = `<option value="">Todos</option>` + opcoes.map(o => `<option value="${o}" ${o === atual ? 'selected' : ''}>${o}</option>`).join('');
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

// ---- FORMULÁRIO ----
function renderFormulario() {
  const processo = state.editandoId ? buscarProcessoPorId(state.editandoId) : null;
  const p = processo || {};

function formatarMoedaInput(e) {
  let v = e.target.value.replace(/\D/g, '');
  if (v === '') { e.target.value = ''; return; }
  v = (Number(v) / 100).toFixed(2);
  v = v.replace('.', ',');
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  e.target.value = v;
}

function desformatarMoeda(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  return Number(val.replace(/\./g, '').replace(',', '.')) || 0;
}

function formatarMoedaValor(val) {
  if (!val) return '';
  let v = Number(val).toFixed(2);
  v = v.replace('.', ',');
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  return v;
}

function renderFormularioProcessos(numerosStr) {
  const container = document.getElementById('lista-processos');
  if(!container) return;
  container.innerHTML = '';
  
  let numeros = (numerosStr || '').split(',').map(s => s.trim()).filter(Boolean);
  if (numeros.length === 0) numeros = [''];

  numeros.forEach((num, idx) => {
    addProcessoInputToDOM(num, idx === 0);
  });
}

function addProcessoInputToDOM(valor = '', isFirst = false) {
  const container = document.getElementById('lista-processos');
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input-processo-multi';
  input.placeholder = 'Ex: 0029.059244/2025-47';
  input.value = valor;
  input.style.flex = '1';
  input.style.padding = '10px 14px';
  input.style.background = 'rgba(255,255,255,0.05)';
  input.style.border = '1px solid var(--border)';
  input.style.borderRadius = 'var(--radius-sm)';
  input.style.color = 'var(--text-primary)';
  input.style.outline = 'none';
  
  const btn = document.createElement('button');
  btn.type = 'button';
  
  if (isFirst) {
    btn.className = 'btn btn-primary btn-sm';
    btn.textContent = '+';
    btn.title = 'Adicionar outro processo';
    btn.style.padding = '0 12px';
    btn.onclick = () => addProcessoInputToDOM('');
  } else {
    btn.className = 'btn btn-danger btn-sm';
    btn.textContent = '✕';
    btn.title = 'Remover processo';
    btn.style.padding = '0 12px';
    btn.onclick = () => div.remove();
  }
  
  div.appendChild(input);
  div.appendChild(btn);
  container.appendChild(div);
}

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
    renderFormularioProcessos(p.numero);
    document.getElementById('form-interessado').value = p.interessado || '';
    document.getElementById('form-objeto').value      = p.objeto      || '';
    document.getElementById('form-valorOf').value     = formatarMoedaValor(p.valorOf);
    document.getElementById('form-valorPlan').value   = formatarMoedaValor(p.valorPlan);
    document.getElementById('form-data').value        = p.data        || '';
    document.getElementById('form-obs').value         = p.obs         || '';
    document.getElementById('form-anotacao').value    = p.anotacao    || '';
  } else {
    document.getElementById('form-processo').reset();
    renderFormularioProcessos('');
  }

  document.getElementById('form-title').textContent = processo ? 'Editar Processo' : 'Novo Processo';
}

function salvarFormulario(e) {
  e.preventDefault();
  const inputsProcesso = document.querySelectorAll('.input-processo-multi');
  let numerosExtraidos = Array.from(inputsProcesso).map(el => el.value.trim()).filter(Boolean);
  numerosExtraidos.sort();
  const numeroFinal = numerosExtraidos.join(', ');

  const valorOficial = desformatarMoeda(document.getElementById('form-valorOf').value);
  const valorPlanilha = desformatarMoeda(document.getElementById('form-valorPlan').value);

  const dados = {
    prefixo:     document.getElementById('form-prefixo').value.trim().toUpperCase(),
    municipio:   document.getElementById('form-municipio').value.trim(),
    numero:      numeroFinal,
    interessado: document.getElementById('form-interessado').value.trim(),
    objeto:      document.getElementById('form-objeto').value.trim(),
    valorOf:     valorOficial,
    valorPlan:   valorPlanilha,
    diferenca:   valorOficial - valorPlanilha,
    status:      document.getElementById('form-status').value,
    localizacao: document.getElementById('form-localizacao').value,
    data:        document.getElementById('form-data').value,
    obs:         document.getElementById('form-obs').value.trim(),
    anotacao:    document.getElementById('form-anotacao').value.trim(),
  };

  if (!dados.interessado && !dados.numero) {
    toast('Informe ao menos o Nº do Processo ou o Interessado.', 'error');
    return;
  }

  if (state.editandoId) {
    atualizarProcesso(state.editandoId, dados);
    Logger.log('EDITOU_PROCESSO', dados.numero || dados.interessado);
    toast('Processo atualizado com sucesso!', 'success');
    state.editandoId = null;
  } else {
    adicionarProcesso(dados);
    Logger.log('CRIOU_PROCESSO', dados.numero || dados.interessado);
    toast('Processo cadastrado com sucesso!', 'success');
    document.getElementById('form-processo').reset();
  }

  navegar('processos');
}

// ---- DETALHE / MODAL ----
function abrirDetalhe(id) {
  const p = buscarProcessoPorId(id);
  if (!p) return;

  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('modal-content').innerHTML = `
    <div class="detail-header">
      <div>
        ${p.prefixo ? `<div style="margin-bottom:6px"><span class="badge-prefixo">${p.prefixo}</span></div>` : ''}
        <div class="detail-numero" style="display:flex;align-items:center;gap:8px;">
          <span id="txt-num-modal">${p.numero || 'Sem número'}</span>
          ${p.numero ? `<button class="btn btn-ghost" style="padding:2px 8px;font-size:10px;height:22px" onclick="copiarTexto('${p.numero}')" title="Copiar número">📋 Copiar</button>` : ''}
        </div>
        <div class="detail-nome">${p.interessado || '—'}</div>
        <div style="margin-top:8px">
          <span class="badge ${getStatusBadgeClass(p.status)}">${p.status || '—'}</span>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" onclick="editarProcesso('${p.id}');fecharModal()">✏️ Editar</button>
        <button class="btn btn-danger btn-sm" onclick="confirmarExcluir('${p.id}');fecharModal()">🗑️ Excluir</button>
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
    ${p.anotacao ? `<div class="card"><h4 style="font-size:12px;text-transform:uppercase;color:var(--text-muted);letter-spacing:.5px;margin-bottom:8px">🗒️ Anotação</h4><p style="color:var(--text-secondary);font-size:14px">${p.anotacao}</p></div>` : ''}
  `;
}

function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function copiarTexto(texto) {
  navigator.clipboard.writeText(texto).then(() => {
    toast('Número copiado!', 'success');
  }).catch(() => {
    toast('Erro ao copiar.', 'error');
  });
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
    Logger.log('EXCLUIU_PROCESSO', p.numero || p.interessado);
    excluirProcesso(id);
    toast('Processo excluído.', 'info');
    navegar('processos');
  }
}

// ---- IMPORTAÇÃO ----
function setupImportacao() {
  const zone = document.getElementById('import-zone');
  const input = document.getElementById('import-input');

  if (zone && input) {
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
}
// End of setupImportacao

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

// ---- ADMIN: USUÁRIOS E LOGS ----
function renderUsuarios() {
  const tbody = document.getElementById('table-usuarios');
  if(!tbody) return;
  const users = Auth.getUsers();
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.nome}</td>
      <td>${u.email}</td>
      <td>${u.whatsapp || '—'}</td>
      <td><span class="badge ${u.perfil == 1 ? 'badge-AUTORIZADO' : 'badge-PENDENTE'}">${PERFIS[u.perfil]}</span></td>
      <td><span class="badge ${u.bloqueado ? 'badge-CANCELADO' : 'badge-AUTORIZADO'}">${u.bloqueado ? 'Bloqueado' : 'Ativo'}</span></td>
      <td>
        ${u.email !== 'admin@seduc.ro' ? `<button class="btn btn-ghost btn-sm" onclick="toggleBlockUser('${u.id}')">${u.bloqueado ? '🔓 Desbloquear' : '🔒 Bloquear'}</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function toggleBlockUser(id) {
  const users = Auth.getUsers();
  const u = users.find(x => x.id === id);
  if (u) {
    Auth.updateUser(id, { bloqueado: !u.bloqueado });
    Logger.log(u.bloqueado ? 'DESBLOQUEOU_USUARIO' : 'BLOQUEOU_USUARIO', u.email);
    renderUsuarios();
  }
}

function abrirModalUsuario() {
  const nome = prompt('Nome do usuário:');
  if (!nome) return;
  const email = prompt('E-mail:');
  if (!email) return;
  const senha = prompt('Senha de acesso:');
  if (!senha) return;
  const perfilStr = prompt('Perfil (1=Admin, 2=Editor, 3=Consultor):', '3');
  
  Auth.addUser({
    nome, email, senha, whatsapp: '',
    perfil: parseInt(perfilStr) || 3,
    bloqueado: false
  });
  Logger.log('CRIOU_USUARIO', email);
  renderUsuarios();
}

function renderLogs() {
  const tbody = document.getElementById('table-logs');
  if(!tbody) return;
  const logs = Logger.getLogs();
  tbody.innerHTML = logs.map(l => `
    <tr>
      <td>${formatDate(l.timestamp)} ${new Date(l.timestamp).toLocaleTimeString('pt-BR')}</td>
      <td>${l.userName}</td>
      <td><strong>${l.acao}</strong></td>
      <td>${l.detalhe}</td>
    </tr>
  `).join('');
}

// ---- INICIALIZAÇÃO ----
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('form-login').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    try {
      Auth.login(email, senha);
      Logger.log('LOGIN');
      document.getElementById('login-email').value = '';
      document.getElementById('login-senha').value = '';
      navegar('dashboard');
    } catch(err) {
      toast(err.message, 'error');
    }
  });

  // Navegação
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      if (el.dataset.page === 'novo') novoProcesso();
      else navegar(el.dataset.page);
    });
  });

  // Formulário
  const formProc = document.getElementById('form-processo');
  if (formProc) formProc.addEventListener('submit', salvarFormulario);
  
  const btnCanc = document.getElementById('btn-cancelar-form');
  if (btnCanc) btnCanc.addEventListener('click', () => navegar('processos'));

  document.querySelectorAll('.input-moeda').forEach(inp => {
    inp.addEventListener('input', formatarMoedaInput);
  });

  // Fechar modal
  const modOverlay = document.getElementById('modal-overlay');
  if (modOverlay) {
    modOverlay.addEventListener('click', e => {
      if (e.target === modOverlay) fecharModal();
    });
  }

  // Filtros
  const aplicarFiltro = (campo, valor) => {
    state.filtros[campo] = valor;
    state.paginaAtual = 1;
    renderProcessos();
  };

  const addSafeEvent = (id, event, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  };

  addSafeEvent('filtro-busca', 'input', e => aplicarFiltro('busca', e.target.value));
  addSafeEvent('filtro-status', 'change', e => aplicarFiltro('status', e.target.value));
  addSafeEvent('filtro-localizacao', 'change', e => aplicarFiltro('localizacao', e.target.value));
  addSafeEvent('filtro-municipio', 'change', e => aplicarFiltro('municipio', e.target.value));
  addSafeEvent('filtro-objeto', 'change', e => aplicarFiltro('objeto', e.target.value));

  addSafeEvent('btn-limpar-filtros', 'click', () => {
    state.filtros = { busca: '', status: '', localizacao: '', municipio: '', objeto: '', prefixo: '' };
    state.paginaAtual = 1;
    const ids = ['filtro-busca', 'filtro-status', 'filtro-localizacao', 'filtro-municipio', 'filtro-objeto', 'filtro-prefixo'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    renderProcessos();
  });

  // Filtro prefixo — input em tempo real
  const elFiltroPrefixo = document.getElementById('filtro-prefixo');
  if (elFiltroPrefixo) {
    elFiltroPrefixo.addEventListener('input', e => aplicarFiltro('prefixo', e.target.value.trim()));
  }

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

  // Página inicial
  try {
    navegar('dashboard');
  } catch (err) {
    console.error('Erro ao iniciar:', err);
  }
});
