
// ============================================================
// SEDUC - Formulário Individualizado de Escola (Página & Modal)
// ============================================================

var _escolaEditandoId = null;

function abrirFormEscola(idx) {
  const escola = _escolasFiltradas[idx];
  if (!escola) return;
  _preencherFormEscolaPage(escola);
}

function abrirFormEscolaById(id) {
  let escola = _escolasCache.find(e => e.id === id);
  if (!escola && typeof _mapaCacheEscolas !== 'undefined' && Array.isArray(_mapaCacheEscolas)) {
    escola = _mapaCacheEscolas.find(e => e.id === id);
  }
  if (!escola) {
    if (typeof toast === 'function') toast('Escola não encontrada para edição', 'error');
    return;
  }
  _preencherFormEscolaPage(escola);
}

function novaEscolaForm() {
  _escolaEditandoId = null;
  const form = document.getElementById('form-escola-page-data');
  if (form) form.reset();
  const idEl = document.getElementById('page-escola-id');
  if (idEl) idEl.value = '';

  const titulo = document.getElementById('form-escola-page-titulo');
  if (titulo) titulo.innerHTML = '🏫 Nova Escola';
  const sub = document.getElementById('form-escola-page-subtitulo');
  if (sub) sub.textContent = 'Preencha os dados da nova unidade escolar a ser cadastrada';
  const btn = document.getElementById('btn-salvar-escola-page');
  if (btn) btn.textContent = '💾 Salvar Nova Escola';

  if (typeof navegar === 'function') navegar('form-escola');
}

function _preencherFormEscolaPage(escola) {
  _escolaEditandoId = escola.id || null;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

  set('page-escola-id', escola.id);
  set('page-escola-nome', escola.nome);
  set('page-escola-municipio', escola.municipio);
  set('page-escola-localizacao', escola.localizacao);
  set('page-escola-inep', escola.codigoInep);
  set('page-escola-codigoSuper', escola.codigoSuper);
  set('page-escola-super', escola.super);
  set('page-escola-diretor', escola.diretor);
  set('page-escola-contatoDiretor', escola.contatoDiretor || escola.telefone);
  set('page-escola-telefone', escola.telefone);
  set('page-escola-endereco', escola.endereco);
  set('page-escola-bairro', escola.bairro);
  set('page-escola-complemento', escola.complemento);
  set('page-escola-cep', escola.cep);
  set('page-escola-matriculas', escola.totalMatricula > 0 ? escola.totalMatricula : '');
  set('page-escola-salas', escola.salas > 0 ? escola.salas : '');
  set('page-escola-obs', escola.obs || escola.observacao || '');

  // Atualizar modal também para sincronia
  if (typeof _preencherFormEscola === 'function') _preencherFormEscola(escola);

  const titulo = document.getElementById('form-escola-page-titulo');
  if (titulo) titulo.innerHTML = '✏️ Editar Cadastro da Escola';
  const sub = document.getElementById('form-escola-page-subtitulo');
  if (sub) sub.textContent = (escola.nome || 'Escola') + (escola.municipio ? ' - ' + escola.municipio : '');
  const btn = document.getElementById('btn-salvar-escola-page');
  if (btn) btn.textContent = '💾 Salvar Alteraçōes';

  if (typeof navegar === 'function') navegar('form-escola');
}

async function salvarFormularioEscolaPage(evt) {
  if (evt) evt.preventDefault();
  const id = (document.getElementById('page-escola-id') || {}).value || '';
  const method = id ? 'PUT' : 'POST';
  const base = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://seduc-backend.onrender.com';
  const url = base + (id ? '/api/escolas/' + id : '/api/escolas');

  const g = (sel) => { const el = document.getElementById(sel); return el ? el.value.trim() : ''; };
  const data = {
    nome:           g('page-escola-nome'),
    municipio:      g('page-escola-municipio'),
    localizacao:    g('page-escola-localizacao'),
    codigoInep:     g('page-escola-inep'),
    codigoSuper:    g('page-escola-codigoSuper'),
    super:          g('page-escola-super'),
    diretor:        g('page-escola-diretor'),
    contatoDiretor: g('page-escola-contatoDiretor'),
    telefone:       g('page-escola-telefone'),
    endereco:       g('page-escola-endereco'),
    bairro:         g('page-escola-bairro'),
    complemento:    g('page-escola-complemento'),
    cep:            g('page-escola-cep'),
    totalMatricula: g('page-escola-matriculas'),
    salas:          g('page-escola-salas'),
    obs:            g('page-escola-obs')
  };

  const btn = document.getElementById('btn-salvar-escola-page');
  if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

  const token = (typeof getSessionToken === 'function') ? getSessionToken() : (sessionStorage.getItem('sap_session_token') || localStorage.getItem('sap_session_token') || 'active_dev_token');
  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (token || 'active_dev_token') };

  try {
    const res = await fetch(url, { method, headers, body: JSON.stringify(data) });
    if (!res.ok) { const e = await res.json(); throw new Error(e.erro || 'Erro ao salvar escola'); }
    if (typeof toast === 'function') toast('Dados da escola salvos com sucesso!', 'success');
    
    _escolasCache = [];
    carregarEscolasAPI(true);
    if (typeof carregarMapaEscolasAPI === 'function') carregarMapaEscolasAPI();

    if (typeof navegar === 'function') navegar('escolas');
  } catch (err) {
    console.error(err);
    if (typeof toast === 'function') toast(err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '💾 Salvar Alteraçōes'; }
  }
}

// ============================================================
// SEDUC - Módulo de Escolas (ADM ONLY) - v3.0
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
    const token = (typeof getSessionToken === 'function') ? getSessionToken() : (sessionStorage.getItem('sap_session_token') || localStorage.getItem('sap_session_token') || 'active_dev_token');
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
  const selSup = document.getElementById('escolas-filtro-super');
  const selSupTopo = document.getElementById('escolas-filtro-super-topo');

  if (selMun && selLoc) {
    const municipios   = [...new Set(_escolasCache.map(e => e.municipio).filter(Boolean))].sort();
    const localizacoes = [...new Set(_escolasCache.map(e => e.localizacao).filter(Boolean))].sort();
    selMun.innerHTML = '<option value="****">Todos os Municípios</option>' + municipios.map(m => '<option value="' + m + '">' + m + '</option>').join('');
    selLoc.innerHTML = '<option value="****">Localização</option>' + localizacoes.map(l => '<option value="' + l + '">' + l + '</option>').join('');
  }

  const superSet = new Set();
  _escolasCache.forEach(e => {
    const val = (e.super || e.codigoSuper || '').toString().trim();
    if (val) superSet.add(val);
  });
  const supers = [...superSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const superHtml = '<option value="****">Todas as SUPER\'s</option>' + supers.map(s => {
    const label = s.toUpperCase().startsWith('SUPER') ? s : 'SUPER ' + s;
    return '<option value="' + s + '">' + label + '</option>';
  }).join('');

  if (selSup) selSup.innerHTML = superHtml;
  if (selSupTopo) selSupTopo.innerHTML = superHtml;
}

function sincronizarFiltroSuper(val) {
  const selTopo = document.getElementById('escolas-filtro-super-topo');
  const selFiltro = document.getElementById('escolas-filtro-super');
  if (selTopo && selTopo.value !== val) selTopo.value = val;
  if (selFiltro && selFiltro.value !== val) selFiltro.value = val;
  filtrarEscolas();
}

function _escolasAtualizarBadges() {
  const badgeEscolas = document.getElementById('escolas-badge');
  const badgeAlunos  = document.getElementById('escolas-alunos-badge');
  const badgeSalas   = document.getElementById('escolas-salas-badge');

  const totalEscolas = _escolasFiltradas.length;
  const totalAlunos  = _escolasFiltradas.reduce((acc, e) => acc + (Number(e.totalMatricula) || 0), 0);
  const totalSalas   = _escolasFiltradas.reduce((acc, e) => acc + (Number(e.salas) || 0), 0);

  if (badgeEscolas) badgeEscolas.textContent = '🏫 ' + totalEscolas.toLocaleString('pt-BR') + ' Escolas';
  if (badgeAlunos)  badgeAlunos.textContent  = '🎓 ' + totalAlunos.toLocaleString('pt-BR') + ' Alunos';
  if (badgeSalas)   badgeSalas.textContent   = '🚪 ' + totalSalas.toLocaleString('pt-BR') + ' Salas';
}

function filtrarEscolas() {
  const buscaEl = document.getElementById('escolas-busca');
  const munEl   = document.getElementById('escolas-filtro-municipio');
  const locEl   = document.getElementById('escolas-filtro-localizacao');
  const supEl   = document.getElementById('escolas-filtro-super-topo') || document.getElementById('escolas-filtro-super');

  const busca = (buscaEl ? buscaEl.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'') : '');
  const mun   = munEl ? munEl.value : '';
  const loc   = locEl ? locEl.value : '';
  const sup   = supEl ? supEl.value : '';

  _escolasFiltradas = _escolasCache.filter(e => {
    if (mun && e.municipio !== mun) return false;
    if (loc && e.localizacao !== loc) return false;
    if (sup) {
      const eSup = (e.super || e.codigoSuper || '').toString().trim();
      if (eSup !== sup) return false;
    }
    if (busca) {
      const texto = [e.nome, e.municipio, e.codigoInep, e.bairro, e.super, e.codigoSuper].join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if (!texto.includes(busca)) return false;
    }
    return true;
  });
  _escolasPaginaAtual = 1;
  _escolasAtualizarBadges();
  _escolasRenderTabela();
  _escolasRenderPaginacao();
}

function limparFiltrosEscolas() {
  ['escolas-busca','escolas-filtro-municipio','escolas-filtro-localizacao','escolas-filtro-super','escolas-filtro-super-topo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  _escolasFiltradas = [..._escolasCache];
  _escolasPaginaAtual = 1;
  _escolasAtualizarBadges();
  _escolasRenderTabela();
  _escolasRenderPaginacao();
}

// ---- ATUALIZAR UI ----
function _escolasAtualizarUI() {
  const temDados   = _escolasCache.length > 0;
  const filtrosEl  = document.getElementById('escolas-filtros');
  const tableWrap  = document.getElementById('escolas-table-wrap');
  const pagination = document.getElementById('escolas-pagination');
  const emptyEl    = document.getElementById('escolas-empty');

  if (filtrosEl) filtrosEl.style.display  = temDados ? 'flex' : 'none';
  if (tableWrap) tableWrap.style.display  = temDados ? '' : 'none';
  if (pagination) pagination.style.display = temDados ? '' : 'none';
  if (emptyEl) emptyEl.style.display      = temDados ? 'none' : 'block';

  if (temDados) {
    _escolasAtualizarBadges();
    _escolasRenderTabela();
    _escolasRenderPaginacao();
  } else {
    const badgeEscolas = document.getElementById('escolas-badge');
    const badgeAlunos  = document.getElementById('escolas-alunos-badge');
    const badgeSalas   = document.getElementById('escolas-salas-badge');
    if (badgeEscolas) badgeEscolas.textContent = '🏫 Escolas';
    if (badgeAlunos)  badgeAlunos.textContent  = '🎓 Alunos';
    if (badgeSalas)   badgeSalas.textContent   = '🚪 Salas';
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
      : '<span style="color:var(--text-muted)">-</span>';

    const tel  = e.telefone  || '-';
    const cep  = e.cep       || '-';
    const bairro = e.bairro  || '-';
    const comp = e.complemento || '-';
    const end  = [e.endereco].filter(Boolean).join(', ') || '-';
    const mat  = e.totalMatricula > 0 ? Number(e.totalMatricula).toLocaleString('pt-BR') : '-';
    const sal  = e.salas > 0 ? e.salas : '-';

    return '<tr style="cursor:pointer;" onclick="abrirModalEscola(' + gi + ')" ondblclick="abrirFormEscola(' + gi + ')" title="Clique para ver detalhes | Duplo clique para editar"' +
      ' onmouseover="this.style.background=\'rgba(139,92,246,0.07)\'"' +
      ' onmouseout="this.style.background=\'\'">' +
      '<td style="font-family:monospace;font-size:12px;color:#a78bfa;font-weight:600">' + (e.codigoSuper || '-') + '</td>' +
      '<td style="font-size:12px;color:var(--text-secondary)">' + (e.super || '-') + '</td>' +
      '<td style="font-weight:600;color:var(--text-primary)">' + (e.municipio || '-') + '</td>' +
      '<td style="font-family:monospace;font-size:12px;color:#60a5fa">' + (e.codigoInep || '-') + '</td>' +
      '<td style="font-weight:600;color:#f0f4ff;white-space:normal;line-height:1.4;max-width:220px">' + (e.nome || '-') + '</td>' +
      '<td>' + locBadge + '</td>' +
      '<td style="font-size:12px">' + end + '</td>' +
      '<td style="font-size:12px;color:var(--text-secondary)">' + comp + '</td>' +
      '<td style="font-size:12px">' + bairro + '</td>' +
      '<td style="font-size:12px;font-family:monospace">' + cep + '</td>' +
      '<td style="font-size:12px">' + tel + '</td>' +
      '<td style="text-align:right;font-weight:700;color:#34d399">' + mat + '</td>' +
      '<td style="text-align:right;font-weight:700;color:#60a5fa">' + sal + '</td>' +
      '<td style="text-align:center;" onclick="event.stopPropagation()">' +
  '<div style="display:flex;gap:6px;justify-content:center;">' +
    '<button onclick="abrirFormEscola(' + gi + ')" title="Editar Dados da Escola" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);border:none;border-radius:6px;color:#ffffff;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(139,92,246,0.3);">✏️ Editar</button>' +
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
    ? 'Mostrando ' + start + '-' + end + ' de ' + total.toLocaleString('pt-BR') + ' escolas'
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

  let btns = '<button class="page-btn" ' + (_escolasPaginaAtual === 1 ? 'disabled' : '') + ' onclick="navegarEscolas(' + (_escolasPaginaAtual - 1) + ')">»</button>';
  range.forEach(p => {
    if (p === '...') btns += '<span style="padding:0 6px;color:var(--text-muted)">-</span>';
    else btns += '<button class="page-btn ' + (p === _escolasPaginaAtual ? 'active' : '') + '" onclick="navegarEscolas(' + p + ')">' + p + '</button>';
  });
  btns += '<button class="page-btn" ' + (_escolasPaginaAtual === totPag ? 'disabled' : '') + ' onclick="navegarEscolas(' + (_escolasPaginaAtual + 1) + ')">»</button>';
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


// ---- ABRIR FORMULÁRIO DE PROCESSO (PLANILHA DE CONTROLE GDSM) ----
function abrirProcessoFormEscola(idx) {
  const escola = _escolasFiltradas[idx];
  if (!escola) return;

  const todosProcessos = (typeof carregarProcessos === 'function') ? carregarProcessos() : [];
  const nomeNorm = (escola.nome || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const inep = (escola.codigoInep || '').toString().trim();

  // Buscar processo existente correspondente à escola (por nome ou INEP no campo interessado/obs)
  let pEncontrado = todosProcessos.find(p => {
    const inter = (p.interessado || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const obs = ((p.obs || '') + ' ' + (p.anotacao || '')).toLowerCase();
    if (inep && inep.length >= 5 && obs.includes(inep)) return true;
    if (nomeNorm && (inter.includes(nomeNorm) || nomeNorm.includes(inter))) return true;
    return false;
  });

  if (pEncontrado && typeof editarProcesso === 'function') {
    editarProcesso(pEncontrado.id);
    if (typeof toast === 'function') toast('Processo carregado para a escola: ' + (escola.nome || ''), 'success');
  } else {
    // Se não houver processo existente, abre o formulário de novo processo pré-preenchido
    if (typeof novoProcesso === 'function') {
      novoProcesso();
    } else if (typeof navegar === 'function') {
      if (typeof state !== 'undefined') state.editandoId = null;
      navegar('novo');
    }
    setTimeout(() => {
      const inpInter = document.getElementById('form-interessado');
      const inpMun   = document.getElementById('form-municipio');
      const inpAno   = document.getElementById('form-ano');
      if (inpInter) inpInter.value = escola.nome || '';
      if (inpMun)   inpMun.value   = escola.municipio || '';
      if (inpAno && !inpAno.value) inpAno.value = new Date().getFullYear();
      if (typeof toast === 'function') toast('Novo processo iniciado para: ' + (escola.nome || ''), 'info');
    }, 100);
  }
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
      '<span style="font-size:14px;font-weight:600;color:' + (cor || 'var(--text-primary)') + '">' + (valor || '-') + '</span>' +
      '</div>';
  };

  const gmapsQuery = encodeURIComponent(`${escola.nome || ''} ${escola.municipio || ''} Rondônia`);
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${gmapsQuery}`;
  const superLabel = escola.super ? (escola.super.toUpperCase().startsWith('SUPER') ? escola.super : 'SUPER ' + escola.super) : 'Escola';

  const contatoVal = escola.contatoDiretor || escola.telefone;
  const numDigits = String(contatoVal || '').replace(/\D/g, '');
  const waUrl = (numDigits.length >= 8) ? ('https://wa.me/' + (numDigits.startsWith('55') ? numDigits : '55' + numDigits)) : '';
  const waBtn = waUrl ? (' <a href="' + waUrl + '" target="whatsapp" rel="noopener" style="display:inline-flex;align-items:center;gap:4px;background:#25D366;color:#ffffff;text-decoration:none;padding:2px 8px;border-radius:12px;font-weight:700;font-size:11px;margin-left:6px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.2.321-1.155 4.218 4.319-1.133.379.261z"/></svg>WhatsApp</a>') : '';

  content.innerHTML =
    '<div style="padding:24px">' +
      '<div style="background:linear-gradient(135deg,rgba(139,92,246,.18),rgba(99,102,241,.1));border:1px solid rgba(139,92,246,.35);border-radius:12px;padding:20px;margin-bottom:20px">' +
        '<div style="font-size:11px;font-weight:700;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">' + superLabel + '</div>' +
        '<div style="font-size:20px;font-weight:800;color:#f0f4ff;line-height:1.3;margin-bottom:10px">' + (escola.nome || '-') + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
          '<span style="font-size:13px;color:#94a3b8">📍 ' + (escola.municipio || '-') + '</span>' +
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
          field('Nome do Diretor', escola.diretor || 'Não informado', '#38bdf8') +
          field('Contato do Diretor', (escola.contatoDiretor || escola.telefone || 'Não informado') + waBtn, '#38bdf8') +
        '</div>' +
        '<div>' +
          field('Endereço / Nº', escola.endereco) +
          field('Complemento', escola.complemento) +
          field('Bairro', escola.bairro) +
          field('CEP', escola.cep) +
          field('Telefone da Escola', escola.telefone, '#60a5fa') +
          field('Total de Matrículas', escola.totalMatricula > 0 ? Number(escola.totalMatricula).toLocaleString('pt-BR') : '-', '#34d399') +
          field('Salas de Aula Utilizadas', escola.salas > 0 ? escola.salas : '-', '#60a5fa') +
        '</div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);flex-wrap:wrap;gap:10px">' +
        '<a href="' + gmapsUrl + '" target="_blank" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:9px 18px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none;display:inline-flex;align-items:center;gap:6px;box-shadow:0 3px 10px rgba(16,185,129,0.3)">📍 Ver no Google Maps</a>' +
        '<div style="display:flex;gap:10px">' +
          '<button onclick="fecharModalEscola();abrirProcessoFormEscola(' + _escolasFiltradas.indexOf(escola) + ')" style="background:linear-gradient(135deg,#10b981,#059669);border:none;color:#fff;padding:8px 18px;border-radius:8px;font-weight:700;cursor:pointer;">✏️ Editar Processo (GDSM)</button>' +
  '<button onclick="fecharModalEscola();abrirFormEscolaById(\'' + (escola.id || '') + '\')" style="background:rgba(255,255,255,.06);border:1px solid var(--border);color:var(--text-secondary);padding:8px 18px;border-radius:8px;cursor:pointer;">🏫 Dados da Escola</button>' +
          '<button onclick="fecharModalEscola()" style="background:rgba(255,255,255,.06);border:1px solid var(--border);color:var(--text-secondary);padding:8px 18px;border-radius:8px;cursor:pointer;">Fechar</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  overlay.style.display = 'flex';
}

function fecharModalEscola() {
  const overlay = document.getElementById('modal-escola-overlay');
  if (overlay) overlay.style.display = 'none';
}

// ---- FORMULÁRIO DE CADASTRO/EDIÇÃO ----
function novaEscolaForm() {
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

function abrirFormEscolaById(id) {
  let escola = _escolasCache.find(e => e.id === id);
  if (!escola && typeof _mapaCacheEscolas !== 'undefined' && Array.isArray(_mapaCacheEscolas)) {
    escola = _mapaCacheEscolas.find(e => e.id === id);
  }
  if (!escola) {
    toast('Escola não encontrada para edição', 'error');
    return;
  }
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
  set('form-escola-diretor', escola.diretor);
  set('form-escola-contatoDiretor', escola.contatoDiretor || escola.telefone);

  const titulo = document.getElementById('form-escola-titulo');
  if (titulo) titulo.innerHTML = '✏️ Editar Dados da Escola';
  
  const sub = document.getElementById('form-escola-subtitulo');
  if (sub) sub.textContent = (escola.nome || 'Escola') + (escola.municipio ? ' - ' + escola.municipio : '');

  const btn = document.getElementById('btn-salvar-escola');
  if (btn) btn.textContent = '💾 Salvar Alteraçōes';

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
    salas:          g('form-escola-salas'),
    diretor:        g('form-escola-diretor'),
    contatoDiretor: g('form-escola-contatoDiretor') || g('form-escola-telefone')
  };

  const btn = document.getElementById('btn-salvar-escola');
  if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

  const token = (typeof getSessionToken === 'function') ? getSessionToken() : (sessionStorage.getItem('sap_session_token') || localStorage.getItem('sap_session_token') || 'active_dev_token');
  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (token || 'active_dev_token') };

  try {
    const res = await fetch(url, { method, headers, body: JSON.stringify(data) });
    if (!res.ok) { const e = await res.json(); throw new Error(e.erro || 'Erro ao salvar'); }
    toast('Escola salva com sucesso!', 'success');
    fecharModalFormEscola();
    
    // Atualiza caches e recarrega dados
    _escolasCache = [];
    carregarEscolasAPI(true);
    if (typeof carregarMapaEscolasAPI === 'function') {
      carregarMapaEscolasAPI();
    }
  } catch (err) {
    console.error(err);
    toast(err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '💾 Salvar Alteraçōes'; }
  }
}

async function excluirEscola(id) {
  if (!confirm('Tem certeza que deseja excluir esta escola? Esta ação não pode ser desfeita.')) return;
  const base = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : 'https://seduc-backend.onrender.com';
  const token = (typeof getSessionToken === 'function') ? getSessionToken() : (sessionStorage.getItem('sap_session_token') || localStorage.getItem('sap_session_token') || 'active_dev_token');
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
window.abrirFormEscolaById = abrirFormEscolaById;
window.fecharModalFormEscola     = fecharModalFormEscola;
window.salvarEscola              = salvarEscola;
window.abrirProcessoFormEscola = abrirProcessoFormEscola;
window.excluirEscola             = excluirEscola;

window.abrirModalEditarEscolaById = abrirFormEscolaById;


function abrirFormEscolaByInepOrId(identifier) {
  if (!identifier) return;
  const targetStr = String(identifier).trim().toLowerCase();
  
  const pool = [
    ...(Array.isArray(_escolasCache) ? _escolasCache : []),
    ...(typeof _mapaCacheEscolas !== 'undefined' && Array.isArray(_mapaCacheEscolas) ? _mapaCacheEscolas : []),
    ...(typeof _mapaEscolasFiltradas !== 'undefined' && Array.isArray(_mapaEscolasFiltradas) ? _mapaEscolasFiltradas : [])
  ];

  let escola = pool.find(e => e && (
    String(e.id || '').trim().toLowerCase() === targetStr ||
    String(e.codigoInep || '').trim().toLowerCase() === targetStr
  ));

  if (!escola) {
    escola = pool.find(e => e && e.nome && e.nome.toLowerCase().trim() === targetStr);
  }

  if (!escola) {
    escola = pool.find(e => e && e.nome && e.nome.toLowerCase().includes(targetStr));
  }

  if (!escola) {
    if (typeof toast === 'function') toast('Escola não encontrada para edição', 'error');
    return;
  }

  // Garantir que _escolasCache contenha os dados se estava vazio
  if ((!_escolasCache || _escolasCache.length === 0) && pool.length > 0) {
    _escolasCache = [...pool];
  }

  _preencherFormEscolaPage(escola);
}
window.abrirFormEscolaByInepOrId = abrirFormEscolaByInepOrId;
window.abrirModalEditarEscolaById = abrirFormEscolaByInepOrId;
