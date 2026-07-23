// ============================================================
// SEDUC — Módulo de Escolas (ADM ONLY) - v3.0
// ============================================================

var _escolasCache = [];
var _escolasFiltradas = [];
var _escolasPaginaAtual = 1;
var _escolasItensPorPagina = 50;

// ---- INICIALIZAR PÁGINA ----
function iniciarPaginaEscolas() {
  if (_escolasCache.length > 0) {
    _escolasAtualizarUI();
    return;
  }
  carregarEscolasAPI(true);
}

function recarregarEscolas() {
  _escolasCache = [];
  _escolasFiltradas = [];
  carregarEscolasAPI(false);
}

// ---- CARREGAR DA API ----
async function carregarEscolasAPI(silencioso) {
  const emptyEl   = document.getElementById('escolas-empty');
  const tableWrap = document.getElementById('escolas-table-wrap');
  const badgeEl   = document.getElementById('escolas-badge');

  if (badgeEl) badgeEl.textContent = '🏫 Carregando...';
  if (emptyEl) emptyEl.style.display = 'none';
  if (tableWrap) tableWrap.style.display = 'none';

  try {
    const token = (typeof getSessionToken === 'function') ? getSessionToken() : sessionStorage.getItem('sap_session_token');
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    const base = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://seduc-backend.onrender.com';

    const res = await fetch(base + '/api/escolas', { headers });
    if (!res.ok) throw new Error('Erro HTTP ' + res.status);
    const data = await res.json();
    _escolasCache = data.rows || [];

    if (!silencioso) toast('Dados de escolas carregados: ' + _escolasCache.length, 'success');

    _escolasPopularFiltros();
    _escolasFiltradas = [..._escolasCache];
    _escolasPaginaAtual = 1;
    _escolasAtualizarUI();

  } catch (err) {
    console.error('[Escolas]', err);
    if (badgeEl) badgeEl.textContent = '🏫 Escolas';
    if (emptyEl) { emptyEl.style.display = 'block'; }
    const emptyMsg = document.getElementById('escolas-empty-msg');
    if (emptyMsg) emptyMsg.textContent = 'Erro ao carregar dados: ' + err.message;
    toast('Erro ao buscar escolas: ' + err.message, 'error');
  }
}

// ---- FILTROS ----
function _escolasPopularFiltros() {
  const selMun = document.getElementById('escolas-filtro-municipio');
  const selLoc = document.getElementById('escolas-filtro-localizacao');
  if (!selMun || !selLoc) return;
  const municipios   = [...new Set(_escolasCache.map(e => e.municipio).filter(Boolean))].sort();
  const localizacoes = [...new Set(_escolasCache.map(e => e.localizacao).filter(Boolean))].sort();
  selMun.innerHTML = '<option value="">Todos os Municípios</option>' + municipios.map(m => '<option value="' + m + '">' + m + '</option>').join('');
  selLoc.innerHTML = '<option value="">Localização</option>' + localizacoes.map(l => '<option value="' + l + '">' + l + '</option>').join('');
}

function filtrarEscolas() {
  const buscaEl = document.getElementById('escolas-busca');
  const munEl   = document.getElementById('escolas-filtro-municipio');
  const locEl   = document.getElementById('escolas-filtro-localizacao');
  const busca = (buscaEl ? buscaEl.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'') : '');
  const mun   = munEl ? munEl.value : '';
  const loc   = locEl ? locEl.value : '';

  _escolasFiltradas = _escolasCache.filter(e => {
    if (mun && e.municipio !== mun) return false;
    if (loc && e.localizacao !== loc) return false;
    if (busca) {
      const texto = [e.nome, e.municipio, e.codigoInep, e.bairro, e.super].join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if (!texto.includes(busca)) return false;
    }
    return true;
  });
  _escolasPaginaAtual = 1;
  _escolasRenderTabela();
  _escolasRenderPaginacao();
}

function limparFiltrosEscolas() {
  ['escolas-busca','escolas-filtro-municipio','escolas-filtro-localizacao'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  _escolasFiltradas = [..._escolasCache];
  _escolasPaginaAtual = 1;
  _escolasRenderTabela();
  _escolasRenderPaginacao();
}

// ---- ATUALIZAR UI ----
function _escolasAtualizarUI() {
  const temDados   = _escolasCache.length > 0;
  const filtrosEl  = document.getElementById('escolas-filtros');
  const tableWrap  = document.getElementById('escolas-table-wrap');
  const pagination = document.getElementById('escolas-pagination');
  const badgeEl    = document.getElementById('escolas-badge');
  const emptyEl    = document.getElementById('escolas-empty');

  if (filtrosEl) filtrosEl.style.display  = temDados ? 'flex' : 'none';
  if (tableWrap) tableWrap.style.display  = temDados ? '' : 'none';
  if (pagination) pagination.style.display = temDados ? '' : 'none';
  if (emptyEl) emptyEl.style.display      = temDados ? 'none' : 'block';

  if (temDados) {
    if (badgeEl) badgeEl.textContent = '🏫 ' + _escolasCache.length.toLocaleString('pt-BR') + ' Escolas';
    _escolasRenderTabela();
    _escolasRenderPaginacao();
  } else {
    if (badgeEl) badgeEl.textContent = '🏫 Escolas';
  }
}

// ---- RENDERIZAR TABELA ----
function _escolasRenderTabela() {
  const tbody    = document.getElementById('table-escolas');
  const emptyEl  = document.getElementById('escolas-empty');
  const tableWrap = document.getElementById('escolas-table-wrap');
  if (!tbody) return;

  if (_escolasFiltradas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="14" style="text-align:center;padding:40px;color:var(--text-muted);">Nenhuma escola encontrada com os filtros selecionados.</td></tr>';
    if (emptyEl) emptyEl.style.display = 'none';
    if (tableWrap) tableWrap.style.display = '';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  if (tableWrap) tableWrap.style.display = '';

  const start = (_escolasPaginaAtual - 1) * _escolasItensPorPagina;
  const slice = _escolasFiltradas.slice(start, start + _escolasItensPorPagina);

  tbody.innerHTML = slice.map((e, i) => {
    const gi = start + i;
    const locColor = {
      'Urbana': { bg: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: 'rgba(6,182,212,0.3)' },
      'Rural':  { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
      'Indígena': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
      'Quilombola': { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)' }
    };
    const lc = locColor[e.localizacao] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: 'rgba(255,255,255,0.1)' };
    const locBadge = e.localizacao
      ? '<span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;background:' + lc.bg + ';color:' + lc.color + ';border:1px solid ' + lc.border + '">' + e.localizacao + '</span>'
      : '<span style="color:var(--text-muted)">—</span>';

    const tel  = e.telefone  || '—';
    const cep  = e.cep       || '—';
    const bairro = e.bairro  || '—';
    const comp = e.complemento || '—';
    const end  = [e.endereco].filter(Boolean).join(', ') || '—';
    const mat  = e.totalMatricula > 0 ? Number(e.totalMatricula).toLocaleString('pt-BR') : '—';
    const sal  = e.salas > 0 ? e.salas : '—';

    return '<tr style="cursor:pointer;" onclick="abrirModalEscola(' + gi + ')"' +
      ' onmouseover="this.style.background=\'rgba(139,92,246,0.07)\'"' +
      ' onmouseout="this.style.background=\'\'">' +
      '<td style="font-family:monospace;font-size:12px;color:#a78bfa;font-weight:600">' + (e.codigoSuper || '—') + '</td>' +
      '<td style="font-size:12px;color:var(--text-secondary)">' + (e.super || '—') + '</td>' +
      '<td style="font-weight:600;color:var(--text-primary)">' + (e.municipio || '—') + '</td>' +
      '<td style="font-family:monospace;font-size:12px;color:#60a5fa">' + (e.codigoInep || '—') + '</td>' +
      '<td style="font-weight:600;color:#f0f4ff;white-space:normal;line-height:1.4;max-width:220px">' + (e.nome || '—') + '</td>' +
      '<td>' + locBadge + '</td>' +
      '<td style="font-size:12px">' + end + '</td>' +
      '<td style="font-size:12px;color:var(--text-secondary)">' + comp + '</td>' +
      '<td style="font-size:12px">' + bairro + '</td>' +
      '<td style="font-size:12px;font-family:monospace">' + cep + '</td>' +
      '<td style="font-size:12px">' + tel + '</td>' +
      '<td style="text-align:right;font-weight:700;color:#34d399">' + mat + '</td>' +
      '<td style="text-align:right;font-weight:700;color:#60a5fa">' + sal + '</td>' +
      '<td style="text-align:center;" onclick="event.stopPropagation()">' +
        '<div style="display:flex;gap:4px;justify-content:center;">' +
          '<button onclick="abrirModalEditarEscola(' + gi + ')" title="Editar" style="background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);border-radius:6px;color:#a78bfa;padding:4px 8px;cursor:pointer;font-size:13px;">✏️</button>' +
          '<button onclick="excluirEscola(\'' + e.id + '\')" title="Excluir" style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:6px;color:#f87171;padding:4px 8px;cursor:pointer;font-size:13px;">🗑️</button>' +
        '</div>' +
      '</td>' +
      '</tr>';
  }).join('');
}

// ---- PAGINAÇÃO ----
function _escolasRenderPaginacao() {
  const infoEl = document.getElementById('escolas-pg-info');
  const ctrlEl = document.getElementById('escolas-pg-controls');
  const pagEl  = document.getElementById('escolas-pagination');
  if (!infoEl || !ctrlEl) return;

  const total  = _escolasFiltradas.length;
  const totPag = Math.max(1, Math.ceil(total / _escolasItensPorPagina));
  const start  = (_escolasPaginaAtual - 1) * _escolasItensPorPagina + 1;
  const end    = Math.min(_escolasPaginaAtual * _escolasItensPorPagina, total);

  if (pagEl) pagEl.style.display = total > 0 ? '' : 'none';
  infoEl.textContent = total > 0
    ? 'Mostrando ' + start + '–' + end + ' de ' + total.toLocaleString('pt-BR') + ' escolas'
    : 'Nenhuma escola';

  const range = [];
  if (totPag <= 7) {
    for (let p = 1; p <= totPag; p++) range.push(p);
  } else if (_escolasPaginaAtual <= 4) {
    for (let p = 1; p <= 5; p++) range.push(p);
    range.push('...'); range.push(totPag);
  } else if (_escolasPaginaAtual >= totPag - 3) {
    range.push(1); range.push('...');
    for (let p = totPag - 4; p <= totPag; p++) range.push(p);
  } else {
    range.push(1); range.push('...');
    for (let p = _escolasPaginaAtual - 1; p <= _escolasPaginaAtual + 1; p++) range.push(p);
    range.push('...'); range.push(totPag);
  }

  let btns = '<button class="page-btn" ' + (_escolasPaginaAtual === 1 ? 'disabled' : '') + ' onclick="navegarEscolas(' + (_escolasPaginaAtual - 1) + ')">‹</button>';
  range.forEach(p => {
    if (p === '...') btns += '<span style="padding:0 6px;color:var(--text-muted)">…</span>';
    else btns += '<button class="page-btn ' + (p === _escolasPaginaAtual ? 'active' : '') + '" onclick="navegarEscolas(' + p + ')">' + p + '</button>';
  });
  btns += '<button class="page-btn" ' + (_escolasPaginaAtual === totPag ? 'disabled' : '') + ' onclick="navegarEscolas(' + (_escolasPaginaAtual + 1) + ')">›</button>';
  ctrlEl.innerHTML = btns;
}

function navegarEscolas(pag) {
  const total = Math.max(1, Math.ceil(_escolasFiltradas.length / _escolasItensPorPagina));
  if (pag < 1 || pag > total) return;
  _escolasPaginaAtual = pag;
  _escolasRenderTabela();
  _escolasRenderPaginacao();
  const tw = document.getElementById('escolas-table-wrap');
  if (tw) tw.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- MODAL DETALHES ----
function abrirModalEscola(idx) {
  const escola = _escolasFiltradas[idx];
  if (!escola) return;
  const overlay = document.getElementById('modal-escola-overlay');
  const content = document.getElementById('modal-escola-content');
  if (!content || !overlay) return;

  const field = (label, valor, cor) => {
    return '<div style="display:flex;flex-direction:column;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06)">' +
      '<span style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:3px">' + label + '</span>' +
      '<span style="font-size:14px;font-weight:600;color:' + (cor || 'var(--text-primary)') + '">' + (valor || '—') + '</span>' +
      '</div>';
  };

  content.innerHTML =
    '<div style="padding:24px">' +
      '<div style="background:linear-gradient(135deg,rgba(139,92,246,.18),rgba(99,102,241,.1));border:1px solid rgba(139,92,246,.35);border-radius:12px;padding:20px;margin-bottom:20px">' +
        '<div style="font-size:11px;font-weight:700;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Nome da Escola</div>' +
        '<div style="font-size:20px;font-weight:800;color:#f0f4ff;line-height:1.3;margin-bottom:10px">' + (escola.nome || '—') + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
          '<span style="font-size:13px;color:#94a3b8">📍 ' + (escola.municipio || '—') + '</span>' +
          (escola.codigoInep ? '<span style="font-family:monospace;font-size:12px;padding:2px 8px;background:rgba(255,255,255,.06);border-radius:4px;color:#60a5fa">INEP: ' + escola.codigoInep + '</span>' : '') +
          (escola.localizacao ? '<span style="padding:2px 10px;border-radius:5px;font-size:12px;font-weight:700;background:rgba(6,182,212,.15);color:#22d3ee;border:1px solid rgba(6,182,212,.3)">' + escola.localizacao + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 28px">' +
        '<div>' +
          field('Código Super', escola.codigoSuper, '#a78bfa') +
          field('Super', escola.super) +
          field('Município', escola.municipio, '#f0f4ff') +
          field('Código INEP', escola.codigoInep, '#60a5fa') +
          field('Localização', escola.localizacao, '#22d3ee') +
          field('Telefone', escola.telefone, '#60a5fa') +
        '</div>' +
        '<div>' +
          field('Endereço / Nº', escola.endereco) +
          field('Complemento', escola.complemento) +
          field('Bairro', escola.bairro) +
          field('CEP', escola.cep) +
          field('Total de Matrículas', escola.totalMatricula > 0 ? Number(escola.totalMatricula).toLocaleString('pt-BR') : '—', '#34d399') +
          field('Salas de Aula Utilizadas', escola.salas > 0 ? escola.salas : '—', '#60a5fa') +
        '</div>' +
      '</div>' +
      '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">' +
        '<button onclick="fecharModalEscola();abrirModalEditarEscolaById(\'' + (escola.id || '') + '\')" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);border:none;color:#fff;padding:8px 18px;border-radius:8px;font-weight:700;cursor:pointer;">✏️ Editar</button>' +
        '<button onclick="fecharModalEscola()" style="background:rgba(255,255,255,.06);border:1px solid var(--border);color:var(--text-secondary);padding:8px 18px;border-radius:8px;cursor:pointer;">Fechar</button>' +
      '</div>' +
    '</div>';

  overlay.style.display = 'flex';
}

function fecharModalEscola() {
  const overlay = document.getElementById('modal-escola-overlay');
  if (overlay) overlay.style.display = 'none';
}

// ---- FORMULÁRIO DE CADASTRO/EDIÇÃO ----
function abrirModalFormEscola() {
  const overlay = document.getElementById('modal-form-escola');
  if (!overlay) return;
  const form = document.getElementById('form-escola-data');
  if (form) form.reset();
  const idEl = document.getElementById('form-escola-id');
  if (idEl) idEl.value = '';
  const titulo = document.getElementById('form-escola-titulo');
  if (titulo) titulo.innerHTML = '🏫 Nova Escola';
  const btn = document.getElementById('btn-salvar-escola');
  if (btn) btn.textContent = '💾 Salvar Escola';
  overlay.style.display = 'flex';
}

function abrirModalEditarEscola(idx) {
  const escola = _escolasFiltradas[idx];
  if (!escola) return;
  _preencherFormEscola(escola);
}

function abrirModalEditarEscolaById(id) {
  const escola = _escolasCache.find(e => e.id === id);
  if (!escola) return;
  _preencherFormEscola(escola);
}

function _preencherFormEscola(escola) {
  const overlay = document.getElementById('modal-form-escola');
  if (!overlay) return;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('form-escola-id', escola.id);
  set('form-escola-nome', escola.nome);
  set('form-escola-municipio', escola.municipio);
  set('form-escola-localizacao', escola.localizacao);
  set('form-escola-inep', escola.codigoInep);
  set('form-escola-codigoSuper', escola.codigoSuper);
  set('form-escola-super', escola.super);
  set('form-escola-endereco', escola.endereco);
  set('form-escola-complemento', escola.complemento);
  set('form-escola-bairro', escola.bairro);
  set('form-escola-cep', escola.cep);
  set('form-escola-telefone', escola.telefone);
  set('form-escola-matriculas', escola.totalMatricula > 0 ? escola.totalMatricula : '');
  set('form-escola-salas', escola.salas > 0 ? escola.salas : '');

  const titulo = document.getElementById('form-escola-titulo');
  if (titulo) titulo.innerHTML = '✏️ Editar Escola';
  const btn = document.getElementById('btn-salvar-escola');
  if (btn) btn.textContent = '💾 Salvar Alterações';

  overlay.style.display = 'flex';
}

function fecharModalFormEscola() {
  const overlay = document.getElementById('modal-form-escola');
  if (overlay) overlay.style.display = 'none';
}

// ---- SALVAR / EXCLUIR (via API) ----
async function salvarEscola(evt) {
  evt.preventDefault();
  const id = (document.getElementById('form-escola-id') || {}).value || '';
  const method = id ? 'PUT' : 'POST';
  const base = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://seduc-backend.onrender.com';
  const url = base + (id ? '/api/escolas/' + id : '/api/escolas');

  const g = (sel) => { const el = document.getElementById(sel); return el ? el.value.trim() : ''; };
  const data = {
    nome:           g('form-escola-nome'),
    municipio:      g('form-escola-municipio'),
    localizacao:    g('form-escola-localizacao'),
    codigoInep:     g('form-escola-inep'),
    codigoSuper:    g('form-escola-codigoSuper'),
    super:          g('form-escola-super'),
    endereco:       g('form-escola-endereco'),
    complemento:    g('form-escola-complemento'),
    bairro:         g('form-escola-bairro'),
    cep:            g('form-escola-cep'),
    telefone:       g('form-escola-telefone'),
    totalMatricula: g('form-escola-matriculas'),
    salas:          g('form-escola-salas')
  };

  const btn = document.getElementById('btn-salvar-escola');
  if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

  const token = (typeof getSessionToken === 'function') ? getSessionToken() : sessionStorage.getItem('sap_session_token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) };

  try {
    const res = await fetch(url, { method, headers, body: JSON.stringify(data) });
    if (!res.ok) { const e = await res.json(); throw new Error(e.erro || 'Erro ao salvar'); }
    toast('Escola salva com sucesso!', 'success');
    fecharModalFormEscola();
    _escolasCache = [];
    carregarEscolasAPI(true);
  } catch (err) {
    console.error(err);
    toast(err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '💾 Salvar Escola'; }
  }
}

async function excluirEscola(id) {
  if (!confirm('Tem certeza que deseja excluir esta escola? Esta ação não pode ser desfeita.')) return;
  const base = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://seduc-backend.onrender.com';
  const token = (typeof getSessionToken === 'function') ? getSessionToken() : sessionStorage.getItem('sap_session_token');
  const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
  try {
    const res = await fetch(base + '/api/escolas/' + id, { method: 'DELETE', headers });
    if (!res.ok) { const e = await res.json(); throw new Error(e.erro || 'Erro ao excluir'); }
    toast('Escola excluída com sucesso!', 'success');
    _escolasCache = [];
    carregarEscolasAPI(true);
  } catch (err) {
    console.error(err);
    toast(err.message, 'error');
  }
}

// ---- EXPOR GLOBALMENTE ----
window.iniciarPaginaEscolas      = iniciarPaginaEscolas;
window.recarregarEscolas         = recarregarEscolas;
window.filtrarEscolas            = filtrarEscolas;
window.limparFiltrosEscolas      = limparFiltrosEscolas;
window.navegarEscolas            = navegarEscolas;
window.abrirModalEscola          = abrirModalEscola;
window.fecharModalEscola         = fecharModalEscola;
window.abrirModalFormEscola      = abrirModalFormEscola;
window.abrirModalEditarEscola    = abrirModalEditarEscola;
window.abrirModalEditarEscolaById = abrirModalEditarEscolaById;
window.fecharModalFormEscola     = fecharModalFormEscola;
window.salvarEscola              = salvarEscola;
window.excluirEscola             = excluirEscola;
