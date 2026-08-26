
// ============================================================
// SEDUC - Formulário Individualizado de Escola (Página & Modal)
// ============================================================

var _escolaEditandoId = null;
function navegarEscolas(p) {
  const tot = Math.ceil(_escolasFiltradas.length / _escolasItensPorPagina) || 1;
  if (p < 1 || p > tot) return;
  _escolasPaginaAtual = p;
  _escolasRenderTabela();
}

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
  if (titulo) titulo.innerHTML = '✨ Nova Escola';
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
  set('page-escola-secretario', escola.secretario || '');
  set('page-escola-contatoSecretario', escola.contatoSecretario || '');
  set('page-escola-email', escola.email || '');
  set('page-escola-redesSociais', escola.redesSociais || escola.instagram || escola.facebook || '');
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
  if (titulo) titulo.innerHTML = 'âœï¸ Editar Cadastro da Escola';
  const sub = document.getElementById('form-escola-page-subtitulo');
  if (sub) sub.textContent = (escola.nome || 'Escola') + (escola.municipio ? ' - ' + escola.municipio : '');
  const btn = document.getElementById('btn-salvar-escola-page');
  if (btn) btn.textContent = '💾 Salvar Alterações';

  if (typeof navegar === 'function') navegar('form-escola');
}

async function salvarFormularioEscolaPage(evt) {
  if (evt) evt.preventDefault();
  const id = (document.getElementById('page-escola-id') || {}).value || '';
  const method = id ? 'PUT' : 'POST';
  const base = 'https://seduc-backend.onrender.com';
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
    secretario:     g('page-escola-secretario'),
    contatoSecretario: g('page-escola-contatoSecretario'),
    email:          g('page-escola-email'),
    redesSociais:   g('page-escola-redesSociais'),
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
    if (btn) { btn.disabled = false; btn.textContent = '💾 Salvar Alterações'; }
  }
}

// ============================================================
// SEDUC - Módulo de Escolas (ADM ONLY) - v3.0
// ============================================================

var _escolasCache = [];
var _escolasFiltradas = [];
var _escolasPaginaAtual = 1;
var _escolasItensPorPagina = 50;

// ---- HELPERS COMPETENCIA + MODALIDADES v1.0.53 ----
function _normalizarCompetencia(v) {
  if (!v) return '';
  var s = String(v).trim().toLowerCase();
  if (s === 'estadual') return 'Estadual';
  if (s === 'municipal') return 'Municipal';
  if (s === 'federal') return 'Federal';
  return String(v).trim();
}
function _calcTotalAlunos(escola) {
  if (Array.isArray(escola.modalidades) && escola.modalidades.length > 0)
    return escola.modalidades.reduce(function(s,m){ return s+(Number(m.alunos)||0); }, 0);
  if (typeof escola.modalidades === 'string' && escola.modalidades.trim().indexOf('[') === 0) {
    try { var p=JSON.parse(escola.modalidades); if(Array.isArray(p)) return p.reduce(function(s,m){return s+(Number(m.alunos)||0);},0); } catch(e) {}
  }
  return Number(escola.totalMatricula) || 0;
}
function _getModalidades(escola) {
  if (Array.isArray(escola.modalidades) && escola.modalidades.length > 0) return escola.modalidades;
  if (typeof escola.modalidades === 'string' && escola.modalidades.trim().indexOf('[') === 0) {
    try { return JSON.parse(escola.modalidades); } catch(e) {}
  }
  return [];
}
var _COMP_STYLES = {
  'Estadual':  { bg:'rgba(16,185,129,0.15)',color:'#34d399',border:'rgba(16,185,129,0.35)' },
  'Municipal': { bg:'rgba(239,68,68,0.15)', color:'#f87171',border:'rgba(239,68,68,0.35)' },
  'Federal':   { bg:'rgba(59,130,246,0.15)',color:'#60a5fa',border:'rgba(59,130,246,0.35)' }
};
var _MODALIDADES_PADRAO = ['Creche','Educacao Infantil','Ensino Fundamental','Ensino Medio','EJA (Fund.)','EJA (Medio)','AEE','Educacao Profissional'];
function _renderCompetenciaBadge(comp) {
  var c = _normalizarCompetencia(comp);
  var st = _COMP_STYLES[c] || {bg:'rgba(255,255,255,0.06)',color:'var(--text-muted)',border:'rgba(255,255,255,0.1)'};
  return '<span style="display:inline-flex;align-items:center;padding:3px 9px;border-radius:5px;font-size:11px;font-weight:800;background:'+st.bg+';color:'+st.color+';border:1px solid '+st.border+';white-space:nowrap;">'+(c||comp||'-')+'</span>';
}
function _renderModalidadesGrid(escola) {
  var mods = _getModalidades(escola);
  if (!mods || mods.length === 0) return '<span style="color:var(--text-muted);font-size:11px;">-</span>';
  mods.sort(function(a, b) { return (Number(b.alunos) || 0) - (Number(a.alunos) || 0); });
  return '<div style="display:flex;flex-direction:column;gap:4px;">'+mods.map(function(m){
    return '<span style="display:inline-flex;align-items:center;gap:3px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:4px;padding:2px 7px;font-size:10px;color:#fca5a5;white-space:nowrap;width:fit-content;"><b style="color:#f0f4ff;">'+(Number(m.alunos)||0)+'</b> '+m.modalidade+'</span>';
  }).join('')+'</div>';
}
function _renderFormModalidadesGrid(containerId, mods) {
  var el = document.getElementById(containerId);
  if (!el) return;
  if (!mods || mods.length === 0) mods = [];
  mods.sort(function(a, b) { return (Number(b.alunos) || 0) - (Number(a.alunos) || 0); });
  el.innerHTML = mods.map(function(m,i){
    var opts = _MODALIDADES_PADRAO.map(function(mp){ return '<option value="'+mp+'"'+(mp===m.modalidade?' selected':'')+'>'+mp+'</option>'; }).join('');
    return '<div class="mod-row" style="display:grid;grid-template-columns:1fr 90px 32px;gap:8px;align-items:center;margin-bottom:6px;">'
      +'<select class="mod-nome form-control" style="background:rgba(0,0,0,0.3);border-color:rgba(239,68,68,0.4);color:#f87171;font-weight:600;padding:7px 10px;">'+opts+'</select>'
      +'<input type="number" class="mod-alunos form-control" value="'+(m.alunos||0)+'" min="0" style="background:rgba(0,0,0,0.3);border-color:rgba(52,211,153,0.4);color:#34d399;font-weight:700;text-align:right;" oninput="_recalcTotalModalidades(\''+containerId+'\')">'
      +'<button type="button" onclick="this.closest(\'.mod-row\').remove();_recalcTotalModalidades(\''+containerId+'\')" style="background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.3);border-radius:6px;color:#f87171;cursor:pointer;font-size:14px;width:32px;height:32px;">x</button>'
      +'</div>';
  }).join('');
  _recalcTotalModalidades(containerId);
}
function _recalcTotalModalidades(containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;
  var total = 0;
  el.querySelectorAll('.mod-alunos').forEach(function(inp){ total += Number(inp.value)||0; });
  var tot = document.getElementById(containerId+'-total');
  if (tot) tot.textContent = 'Total: '+total.toLocaleString('pt-BR')+' alunos';
}
function _adicionarModalidade(containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;
  var row = document.createElement('div');
  row.className = 'mod-row';
  row.style.cssText = 'display:grid;grid-template-columns:1fr 90px 32px;gap:8px;align-items:center;margin-bottom:6px;';
  var opts = _MODALIDADES_PADRAO.map(function(mp){ return '<option value="'+mp+'">'+mp+'</option>'; }).join('');
  row.innerHTML = '<select class="mod-nome form-control" style="background:rgba(0,0,0,0.3);border-color:rgba(239,68,68,0.4);color:#f87171;font-weight:600;padding:7px 10px;">'+opts+'</select>'
    +'<input type="number" class="mod-alunos form-control" value="0" min="0" style="background:rgba(0,0,0,0.3);border-color:rgba(52,211,153,0.4);color:#34d399;font-weight:700;text-align:right;" oninput="_recalcTotalModalidades(\''+containerId+'\')">'
    +'<button type="button" onclick="this.closest(\'.mod-row\').remove();_recalcTotalModalidades(\''+containerId+'\')" style="background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.3);border-radius:6px;color:#f87171;cursor:pointer;font-size:14px;width:32px;height:32px;">x</button>';
  el.appendChild(row);
}
window._normalizarCompetencia  = _normalizarCompetencia;
window._renderCompetenciaBadge = _renderCompetenciaBadge;
window._calcTotalAlunos        = _calcTotalAlunos;
window._adicionarModalidade    = _adicionarModalidade;
window._recalcTotalModalidades = _recalcTotalModalidades;


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
const MUNICIPIOS_RO = [
  "Alta Floresta d'Oeste", "Alto Alegre dos Parecis", "Alto Paraíso", "Alvorada d'Oeste", "Ariquemes", 
  "Buritis", "Cabixi", "Cacaulândia", "Cacoal", "Campo Novo de Rondônia", "Candeias do Jamari", 
  "Castanheiras", "Cerejeiras", "Chupinguaia", "Colorado do Oeste", "Corumbiara", "Costa Marques", 
  "Cujubim", "Espigão d'Oeste", "Governador Jorge Teixeira", "Guajará-Mirim", "Itapuã do Oeste", 
  "Jaru", "Ji-Paraná", "Machadinho d'Oeste", "Ministro Andreazza", "Mirante da Serra", "Monte Negro", 
  "Nova Brasilândia d'Oeste", "Nova Mamoré", "Nova União", "Novo Horizonte do Oeste", "Ouro Preto do Oeste", 
  "Parecis", "Pimenta Bueno", "Pimenteiras do Oeste", "Porto Velho", "Presidente Médici", 
  "Primavera de Rondônia", "Rio Crespo", "Rolim de Moura", "Santa Luzia d'Oeste", "São Felipe d'Oeste", 
  "São Francisco do Guaporé", "São Miguel do Guaporé", "Seringueiras", "Teixeirópolis", "Theobroma", 
  "Urupá", "Vale do Anari", "Vale do Paraíso", "Vilhena"
];

function _parseGvizText(text) {
  try {
    const jsonStr = text.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, '');
    const data = JSON.parse(jsonStr);
    if (!data || !data.table || data.status === 'error') return null;
    if (!data.table.rows || data.table.rows.length === 0) return null;
    return data.table.rows;
  } catch(e) { return null; }
}

function _parseRow(row) {
  if (!row.c || row.c.length === 0) return null;
  const val = (idx) => (row.c[idx] && row.c[idx].v !== null) ? String(row.c[idx].v).trim() : '';
  if (val(0).toUpperCase() === 'MUNICÍPIO/DISTRITO' || val(0).toUpperCase() === 'MUNICÍPIO') return null;
  if (!val(1)) return null; 
  
  let comp = val(9).trim();
  let superV = val(10).trim();
  
  if (!comp) {
    if (superV.toUpperCase().startsWith('SUPER')) comp = 'Estadual';
    else comp = 'Municipal';
  } else {
    if (comp.toUpperCase() === 'ESTADUAL') comp = 'Estadual';
    else if (comp.toUpperCase() === 'MUNICIPAL') comp = 'Municipal';
  }

  return {
    id: Math.random().toString(36).substr(2,9),
    competencia: comp,
    municipio: val(0),
    nome: val(1),
    alunosModalidade: parseInt(val(2)) || 0,
    modalidadeStr: val(3),
    codigoInep: val(4),
    endereco: val(5),
    bairro: val(6),
    complemento: val(7),
    cep: val(8),
    super: superV,
    codigoSuper: superV,
    redesSociais: val(11),
    telefone: val(12),
    email: val(13),
    diretor: val(14),
    contatoDiretor: val(15),
    secretario: val(16),
    contatoSecretario: val(17),
    salas: parseInt(val(18)) || 0,
    localidade: val(26),
    modalidades: [],
    alunos: 0,
    totalMatricula: 0
  };
}

async function carregarEscolasAPI(silencioso) {
  const emptyEl   = document.getElementById('escolas-empty');
  const tableWrap = document.getElementById('escolas-table-wrap');
  const badgeEl   = document.getElementById('escolas-badge');

  if (badgeEl) badgeEl.textContent = '⏳ Carregando...';
  if (emptyEl) emptyEl.style.display = 'none';
  if (tableWrap) tableWrap.style.display = 'none';
  
  const toastMsg = (msg, type) => { if(typeof toast === 'function') toast(msg, type); else console.log(msg); };

  // ------------------------------------
  // Definição de todas as abas a buscar
  // ------------------------------------
  const SHEET_ID = '1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08';
  
  // Aba estadual -> competencia forçada = 'Estadual'
  const ABAS = [
    { sheet: 'estadual', competencia: 'Estadual' },
    // 52 abas municipais -> competencia forçada = 'Municipal'
    ...MUNICIPIOS_RO.map(m => ({ sheet: m, competencia: 'Municipal' }))
  ];

  // Função que busca e parseia UMA aba
  async function _fetchAba({ sheet, competencia }) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheet)}&nocache=${Date.now()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const text = await res.text();
      const rows = _parseGvizText(text);
      if (!rows) return [];
      return rows.map(r => {
        const parsed = _parseRow(r);
        if (!parsed) return null;
        // Sobrescreve a competência com a da aba, nunca deixa ambiguidade
        parsed.competencia = competencia;
        return parsed;
      }).filter(Boolean);
    } catch(e) {
      console.warn('Erro ao buscar aba:', sheet, e);
      return [];
    }
  }

  try {
    let escolaMap = new Map();
    const BATCH = 10; // até 10 requisições simultâneas por vez

    const totalAbas = ABAS.length;
    let processadas = 0;

    for (let i = 0; i < totalAbas; i += BATCH) {
      const lote = ABAS.slice(i, i + BATCH);
      if (badgeEl) badgeEl.textContent = `⏳ Carregando abas ${i + 1}–${Math.min(i + BATCH, totalAbas)} de ${totalAbas}...`;

      const resultados = await Promise.all(lote.map(_fetchAba));

      resultados.flat().forEach(parsed => {
        const key = (parsed.codigoInep && parsed.codigoInep.length > 3)
          ? parsed.codigoInep.trim()
          : (parsed.nome.trim().toUpperCase() + '|' + (parsed.municipio || '').trim().toUpperCase());

        if (!escolaMap.has(key)) {
          escolaMap.set(key, { ...parsed, modalidades: [], alunos: 0, totalMatricula: 0 });
        }

        const school = escolaMap.get(key);

        // Atualiza campos de contato / endereço se a linha tiver mais dados
        if (!school.endereco && parsed.endereco) school.endereco = parsed.endereco;
        if (!school.email    && parsed.email)    school.email    = parsed.email;
        if (!school.telefone && parsed.telefone) school.telefone = parsed.telefone;
        if (!school.diretor  && parsed.diretor)  school.diretor  = parsed.diretor;
        if (!school.super    && parsed.super)    school.super    = parsed.super;
        if (!school.localidade && parsed.localidade) school.localidade = parsed.localidade;

        // Agrega modalidades
        if (parsed.modalidadeStr && parsed.modalidadeStr !== '-') {
          const modStr = parsed.modalidadeStr.trim();
          const existing = school.modalidades.find(m => m.modalidade === modStr);
          if (existing) {
            existing.alunos += parsed.alunosModalidade;
          } else {
            school.modalidades.push({ modalidade: modStr, alunos: parsed.alunosModalidade });
          }
        }

        school.totalMatricula += parsed.alunosModalidade;
        school.alunos         += parsed.alunosModalidade;
      });

      processadas += lote.length;
    }

    let mergedSchools = Array.from(escolaMap.values());
    mergedSchools.sort((a, b) => (a.municipio || '').localeCompare(b.municipio || '') || (a.nome || '').localeCompare(b.nome || ''));

    _escolasCache = mergedSchools;


    const qtdEst = mergedSchools.filter(e => e.competencia === 'Estadual').length;
    const qtdMun = mergedSchools.filter(e => e.competencia === 'Municipal').length;
    if (!silencioso) toastMsg(`✅ ${mergedSchools.length} escolas carregadas (${qtdEst} estaduais, ${qtdMun} municipais)`, 'success');

    if (typeof _escolasPopularFiltros === 'function') _escolasPopularFiltros();
    if (typeof filtrarEscolas === 'function') filtrarEscolas(true);
    if (typeof _escolasAtualizarUI === 'function') _escolasAtualizarUI();
    if (typeof carregarMapaEscolasAPI === 'function') carregarMapaEscolasAPI();

  } catch (err) {
    console.error('Erro ao carregar escolas das planilhas:', err);
    if (badgeEl) badgeEl.textContent = '❌ Erro ao carregar escolas';
    toastMsg('Erro ao conectar com as planilhas do Google', 'error');
  }
}



// =============================================================
// MULTI-SELECT CHECKLIST ENGINE
// =============================================================

// State: which values are selected per field
const _chkSelected = { super: new Set(), municipio: new Set(), competencia: new Set(), localizacao: new Set(), modalidade: new Set() };
// All options per field (full list for search reset)
const _chkAllOptions = { super: [], municipio: [], competencia: [], localizacao: [], modalidade: [] };

// Toggle dropdown open/close
function _escolasToggleDropdown(field) {
  const drop = document.getElementById('chk-drop-' + field);
  if (!drop) return;
  const isOpen = drop.style.display !== 'none';
  // Close all first
  ['super','municipio','competencia','localizacao','modalidade'].forEach(f => {
    const d = document.getElementById('chk-drop-' + f);
    if (d) d.style.display = 'none';
  });
  if (!isOpen) {
    drop.style.display = 'block';
    // Focus search input if present
    const si = drop.querySelector('input[type=text]');
    if (si) setTimeout(() => si.focus(), 50);
  }
}

// Close all when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.esc-chk-wrap')) {
    ['super','municipio','competencia','localizacao','modalidade'].forEach(f => {
      const d = document.getElementById('chk-drop-' + f);
      if (d) d.style.display = 'none';
    });
  }
});

// Render a checkbox item inside a dropdown list
function _chkRenderItem(field, value, label) {
  const checked = _chkSelected[field].has(value);
  const id = 'chk-' + field + '-' + value.replace(/[^a-zA-Z0-9]/g, '_');
  return `<label for="${id}" onclick="_chkToggleItem('${field}','${value.replace(/'/g,"\\'")}')"
    style="display:flex;align-items:center;gap:8px;padding:6px 14px;cursor:pointer;font-size:12px;color:#f0f4ff;transition:background 0.15s;"
    onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background=''">
    <span style="width:15px;height:15px;border:1.5px solid rgba(255,255,255,0.3);border-radius:3px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;background:${checked ? 'rgba(99,102,241,0.8)' : 'transparent'};transition:background 0.15s;">
      ${checked ? '<span style="color:#fff;font-size:10px;line-height:1;">✓</span>' : ''}
    </span>
    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${label}</span>
  </label>`;
}

// Toggle a value's selected state
function _chkToggleItem(field, value) {
  if (_chkSelected[field].has(value)) {
    _chkSelected[field].delete(value);
  } else {
    _chkSelected[field].add(value);
  }
  _chkRenderList(field, _chkAllOptions[field]);
  _chkUpdateLabel(field);
  filtrarEscolas();
}

// Render the list of options into the dropdown
function _chkRenderList(field, options) {
  const list = document.getElementById('chk-list-' + field);
  if (!list) return;
  if (!options || options.length === 0) {
    list.innerHTML = '<div style="padding:8px 14px;color:#64748b;font-size:12px;">Sem opções</div>';
    return;
  }
  list.innerHTML = options.map(opt => _chkRenderItem(field, opt.value, opt.label)).join('');
}

// Filter options when user types in search box inside dropdown
function _escolasFiltrarOpcoes(field, query) {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const filtered = _chkAllOptions[field].filter(opt => {
    const l = opt.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return l.includes(q);
  });
  _chkRenderList(field, filtered);
}

// Update the button label to show how many are selected
function _chkUpdateLabel(field) {
  const labelEl = document.getElementById('chk-label-' + field);
  if (!labelEl) return;
  const LABELS = { super: 'SUPER', municipio: 'MUNICÍPIO', competencia: 'COMPETÊNCIA', localizacao: 'LOCALIZAÇÃO', modalidade: 'MODALIDADE' };
  const count = _chkSelected[field].size;
  const btn = document.getElementById('chk-btn-' + field);
  if (count === 0) {
    labelEl.textContent = LABELS[field];
    if (btn) btn.style.borderColor = 'rgba(255,255,255,0.1)';
  } else {
    labelEl.textContent = LABELS[field] + ' (' + count + ')';
    if (btn) btn.style.borderColor = '#6366f1';
  }
}

function _escolasPopularFiltros() {
  const superSet = new Set();
  const munSet   = new Set();
  const locSet   = new Set();
  const compSet  = new Set();
  const modSet   = new Set();

  _escolasCache.forEach(e => {
    if (e.super || e.codigoSuper) superSet.add((e.super || e.codigoSuper).toString().trim());
    if (e.municipio)  munSet.add(e.municipio.trim());
    if (e.localidade) locSet.add(e.localidade.trim());
    else if (e.localizacao) locSet.add(e.localizacao.trim());
    if (e.competencia) compSet.add(e.competencia.trim());
    _getModalidades(e).forEach(m => { if (m.modalidade) modSet.add(m.modalidade.trim()); });
  });

  const toOpts = (set, labelFn) => [...set].sort((a,b)=>a.localeCompare(b,'pt-BR',{numeric:true})).map(v => ({ value: v, label: labelFn ? labelFn(v) : v }));

  _chkAllOptions.super       = toOpts(superSet, s => s.toUpperCase().startsWith('SUPER') ? s : 'SUPER ' + s);
  _chkAllOptions.municipio   = toOpts(munSet);
  _chkAllOptions.localizacao = toOpts(locSet);
  _chkAllOptions.competencia = toOpts(compSet);
  _chkAllOptions.modalidade  = toOpts(modSet);

  ['super','municipio','competencia','localizacao','modalidade'].forEach(f => {
    _chkRenderList(f, _chkAllOptions[f]);
    _chkUpdateLabel(f);
  });
}

// Aplica filtros multi-seleção
function filtrarEscolas(manterPagina = false) {
  const buscaEl = document.getElementById('escolas-busca');
  const busca = buscaEl ? buscaEl.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'') : '';

  _escolasFiltradas = _escolasCache.filter(e => {
    // --- SUPER (OR dentro do campo)
    if (_chkSelected.super.size > 0) {
      const eSup = (e.super || e.codigoSuper || '').toString().trim();
      if (!_chkSelected.super.has(eSup)) return false;
    }
    // --- MUNICÍPIO
    if (_chkSelected.municipio.size > 0) {
      if (!_chkSelected.municipio.has((e.municipio||'').trim())) return false;
    }
    // --- COMPETÊNCIA
    if (_chkSelected.competencia.size > 0) {
      if (!_chkSelected.competencia.has((e.competencia||'').trim())) return false;
    }
    // --- LOCALIZAÇÃO
    if (_chkSelected.localizacao.size > 0) {
      const eLoc = (e.localidade || e.localizacao || '').trim();
      if (!_chkSelected.localizacao.has(eLoc)) return false;
    }
    // --- MODALIDADE (escola tem pelo menos uma das modalidades selecionadas)
    if (_chkSelected.modalidade.size > 0) {
      const mods = _getModalidades(e).map(m => m.modalidade.trim());
      const hasAny = mods.some(m => _chkSelected.modalidade.has(m));
      if (!hasAny) return false;
    }
    // --- BUSCA TEXTUAL
    if (busca) {
      const mods = _getModalidades(e).map(m => m.modalidade).join(' ');
      const texto = [e.nome, e.municipio, e.super, e.competencia, e.codigoInep, e.diretor, mods]
        .join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if (!texto.includes(busca)) return false;
    }
    return true;
  });

  if (!manterPagina) _escolasPaginaAtual = 1;
  _escolasAtualizarBadges();
  _escolasRenderTabela();
  _escolasRenderPaginacao();
}

// Limpa filtros
function limparFiltrosEscolas() {
  const buscaEl = document.getElementById('escolas-busca');
  if (buscaEl) buscaEl.value = '';
  ['super','municipio','competencia','localizacao','modalidade'].forEach(f => {
    _chkSelected[f].clear();
    _chkRenderList(f, _chkAllOptions[f]);
    _chkUpdateLabel(f);
  });
  _escolasFiltradas = [..._escolasCache];
  _escolasPaginaAtual = 1;
  _escolasAtualizarBadges();
  _escolasRenderTabela();
  _escolasRenderPaginacao();
}

function _escolasAtualizarBadges() {
  const badgeEscolas = document.getElementById('escolas-badge');
  const badgeAlunos  = document.getElementById('escolas-alunos-badge');
  const badgeSalas   = document.getElementById('escolas-salas-badge');

  const totalEscolas = _escolasFiltradas.length;
  const totalAlunos  = _escolasFiltradas.reduce((acc, e) => acc + _calcTotalAlunos(e), 0);
  const totalSalas   = _escolasFiltradas.reduce((acc, e) => acc + (Number(e.salas) || 0), 0);

  if (badgeEscolas) badgeEscolas.textContent = '🏫 ' + totalEscolas.toLocaleString('pt-BR') + ' Escolas';
  if (badgeAlunos)  badgeAlunos.textContent  = '🎓 ' + totalAlunos.toLocaleString('pt-BR') + ' Alunos';
  if (badgeSalas)   badgeSalas.textContent   = '📚 ' + totalSalas.toLocaleString('pt-BR') + ' Salas';
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

  // Trigger update for other pages that depend on _escolasCache
  if (typeof renderContatos === 'function') {
    try { renderContatos(); } catch(e){}
  }


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
    if (badgeSalas)   badgeSalas.textContent   = '📚 Salas';
  }
}

function _escolasEsconderTabela() {
  const tableWrap = document.getElementById('escolas-table-wrap');
  const pagination = document.getElementById('escolas-pagination');
  const emptyEl = document.getElementById('escolas-empty');
  if (tableWrap) tableWrap.style.display = 'none';
  if (pagination) pagination.style.display = 'none';
  if (emptyEl) emptyEl.style.display = 'block';
}

// ---- RENDERIZAR TABELA ----
function _escolasRenderTabela() {
  const tbody    = document.getElementById('table-escolas');
  const emptyEl  = document.getElementById('escolas-empty');
  const tableWrap= document.getElementById('escolas-table-wrap');
  const badgeEscolas = document.getElementById('escolas-badge');

  if (_escolasFiltradas.length === 0) {
    if (badgeEscolas) badgeEscolas.textContent = '🏫 Escolas';
    _escolasEsconderTabela();
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  if (tableWrap) tableWrap.style.display = '';

  const start = (_escolasPaginaAtual - 1) * _escolasItensPorPagina;
  const slice = _escolasFiltradas; // Pagination removed

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
    const _eCompT = _normalizarCompetencia(e.codigoSuper);
    const _totalA = _calcTotalAlunos(e);
    const mat  = _totalA > 0 ? _totalA.toLocaleString('pt-BR') : '-';
    const sal  = e.salas > 0 ? e.salas : '-';
    const dir  = e.diretor || '-';
    const inep = e.codigoInep || '-';

    const idKey = e.codigoInep ? e.codigoInep : (e.id || gi);
    return '<tr style="cursor:pointer;" onclick="abrirModalEscola(\'' + idKey + '\')" ondblclick="abrirFormEscolaByInepOrId(\'' + idKey + '\')" title="Clique para ver detalhes | Duplo clique para editar"' +
      ' onmouseover="this.style.background=\'rgba(139,92,246,0.07)\'"' +
      ' onmouseout="this.style.background=\'\'">' +
      '<td>' + _renderCompetenciaBadge(e.competencia) + '</td>' +
      '<td style="font-weight:600;color:var(--text-primary)">' + (e.municipio || '-') + '</td>' +
      '<td style="font-weight:600;color:#f0f4ff;white-space:normal;line-height:1.4;max-width:220px">' + (e.nome || '-') + '</td>' +
      '<td style="font-weight:600;color:var(--text-primary)">' + inep + '</td>' +
      '<td>' + locBadge + '</td>' +
      '<td style="font-size:12px;color:var(--text-secondary)">' + (e.super || '-') + '</td>' +
      '<td style="max-width:160px;vertical-align:middle;padding:6px 10px;">' + _renderModalidadesGrid(e) + '</td>' +
      '<td style="text-align:right;font-weight:700;color:#34d399">' + mat + '</td>' +
      '<td style="font-size:12px;color:var(--text-secondary);max-width:130px;white-space:normal;">' + dir + '</td>' +
      '<td style="font-size:12px">' + tel + '</td>' +
      '<td style="text-align:center;" onclick="event.stopPropagation()">' +
        '<div style="display:flex;gap:6px;justify-content:center;">' +
          '<button onclick="abrirFormEscolaByInepOrId(\'' + idKey + '\')" title="Editar Dados da Escola" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);border:none;border-radius:6px;color:#ffffff;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(139,92,246,0.3);"><span style="font-family:sans-serif">✏️</span> Editar</button>' +
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

  let btns = '<button class="page-btn" ' + (_escolasPaginaAtual === 1 ? 'disabled' : '') + ' onclick="navegarEscolas(' + (_escolasPaginaAtual - 1) + ')">◀</button>';
  range.forEach(p => {
    if (p === '...') btns += '<span style="padding:0 6px;color:var(--text-muted)">-</span>';
    else btns += '<button class="page-btn ' + (p === _escolasPaginaAtual ? 'active' : '') + '" onclick="navegarEscolas(' + p + ')">' + p + '</button>';
  });
  btns += '<button class="page-btn" ' + (_escolasPaginaAtual === totPag ? 'disabled' : '') + ' onclick="navegarEscolas(' + (_escolasPaginaAtual + 1) + ')">▶</button>';
  ctrlEl.innerHTML = btns;
}

function abrirModalEscola(idx) {
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
  set('form-escola-codigoSuper', _normalizarCompetencia(escola.codigoSuper) || escola.codigoSuper);
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
  set('form-escola-secretario', escola.secretario || '');
  set('form-escola-contatoSecretario', escola.contatoSecretario || '');
  set('form-escola-email', escola.email || '');
  set('form-escola-redesSociais', escola.redesSociais || escola.instagram || escola.facebook || '');

  // Modalidades grid (modal form)
  if (typeof _renderFormModalidadesGrid === 'function') {
    _renderFormModalidadesGrid('modal-form-escola-modalidades', _getModalidades(escola));
    var _smModal = document.getElementById('secao-modalidades-modal');
    if (_smModal) _smModal.style.display = _normalizarCompetencia(escola.codigoSuper) === 'Municipal' ? 'block' : 'none';
    var _scModal = document.getElementById('form-escola-codigoSuper');
    if (_scModal && !_scModal._modL) { _scModal._modL=true; _scModal.addEventListener('change',function(){ var sm=document.getElementById('secao-modalidades-modal'); if(sm) sm.style.display=_normalizarCompetencia(this.value)==='Municipal'?'block':'none'; }); }
  }

  const titulo = document.getElementById('form-escola-titulo');
  if (titulo) titulo.innerHTML = 'âœï¸ Editar Dados da Escola';
  
  const sub = document.getElementById('form-escola-subtitulo');
  if (sub) sub.textContent = (escola.nome || 'Escola') + (escola.municipio ? ' - ' + escola.municipio : '');

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
  const base = 'https://seduc-backend.onrender.com';
  const url = base + (id ? '/api/escolas/' + id : '/api/escolas');

  const g = (sel) => { const el = document.getElementById(sel); return el ? el.value.trim() : ''; };
  // Coletar modalidades do grid
  var _modsEls = document.querySelectorAll('#modal-form-escola-modalidades .mod-row');
  var _modalidades = [];
  _modsEls.forEach(function(row) {
    var mod=(row.querySelector('.mod-nome')||{}).value; var al=(row.querySelector('.mod-alunos')||{}).value;
    if(mod&&mod.trim()) _modalidades.push({modalidade:mod.trim(),alunos:Number(al)||0});
  });
  var _totalCalc = _modalidades.length>0
    ? _modalidades.reduce(function(s,m){return s+m.alunos;},0)
    : Number(g('form-escola-matriculas'))||0;

  const data = {
    nome:              g('form-escola-nome'),
    municipio:         g('form-escola-municipio'),
    localizacao:       g('form-escola-localizacao'),
    codigoInep:        g('form-escola-inep'),
    codigoSuper:       _normalizarCompetencia(g('form-escola-codigoSuper')) || g('form-escola-codigoSuper'),
    super:             g('form-escola-super'),
    endereco:          g('form-escola-endereco'),
    complemento:       g('form-escola-complemento'),
    bairro:            g('form-escola-bairro'),
    cep:               g('form-escola-cep'),
    telefone:          g('form-escola-telefone'),
    totalMatricula:    _totalCalc,
    salas:             g('form-escola-salas'),
    diretor:           g('form-escola-diretor'),
    contatoDiretor:    g('form-escola-contatoDiretor') || g('form-escola-telefone'),
    secretario:        g('form-escola-secretario'),
    contatoSecretario: g('form-escola-contatoSecretario'),
    email:             g('form-escola-email'),
    redesSociais:      g('form-escola-redesSociais'),
    modalidades:       _modalidades.length>0 ? JSON.stringify(_modalidades) : ''
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
    if (btn) { btn.disabled = false; btn.textContent = '💾 Salvar Alterações'; }
  }
}

async function excluirEscola(id) {
  if (!confirm('Tem certeza que deseja excluir esta escola? Esta ação não pode ser desfeita.')) return;
  const base = 'https://seduc-backend.onrender.com';
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
window.abrirModalFormEscola      = novaEscolaForm;
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

window.imprimirRelatorioEscolas = function() {
  try {
    const dt = new Date();
    const today = dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR');
    
    let h = '';
    h += '<style>';
    h += '#print-layout-escolas { font-family: "Segoe UI", Arial, sans-serif; font-size: 11px; color: #333; }';
    h += '#print-layout-escolas h2 { text-align: center; color: #1e293b; font-size: 16px; margin-bottom: 20px; text-transform: uppercase; }';
    h += '#print-layout-escolas .header-info { text-align: center; margin-bottom: 20px; font-size: 12px; font-weight: 600; color: #64748b; }';
    h += '#print-layout-escolas table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }';
    h += '#print-layout-escolas th, #print-layout-escolas td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; vertical-align: middle; }';
    h += '#print-layout-escolas th { background-color: #f1f5f9; color: #334155; font-weight: 700; font-size: 10px; text-transform: uppercase; }';
    h += '#print-layout-escolas .num { text-align: center; width: 40px; }';
    h += '#print-layout-escolas .center { text-align: center; }';
    h += '#print-layout-escolas .right { text-align: right; }';
    h += '</style>';
    
    h += '<h2>Relatório de Escolas - SEDUC/RO (CAM)</h2>';
    
    let tMat = 0, tSal = 0;
    _escolasFiltradas.forEach(e => {
      tMat += _calcTotalAlunos(e);
      tSal += Number(e.salas) || 0;
    });
    
    h += '<div class="header-info">Total de Escolas: ' + _escolasFiltradas.length + ' &nbsp;|&nbsp; Total de Alunos: ' + tMat.toLocaleString('pt-BR') + ' &nbsp;|&nbsp; Total de Salas: ' + tSal.toLocaleString('pt-BR') + '</div>';
    
    h += '<table><thead><tr>';
    h += '<th class="num">Nº</th>';
    h += '<th>Competência</th>';
    h += '<th>SUPER</th>';
    h += '<th>Município</th>';
    h += '<th>Nome da Escola</th>';
    h += '<th class="center">Localização</th>';
    h += '<th>Telefone</th>';
    h += '<th class="right">Matrículas</th>';
    h += '<th class="center">Salas</th>';
    h += '</tr></thead><tbody>';
    
    _escolasFiltradas.forEach((e, i) => {
      h += '<tr>';
      h += '<td class="num">' + (i + 1) + '</td>';
      h += '<td>' + (e.codigoSuper || '-') + '</td>';
      h += '<td>' + (e.super || '-') + '</td>';
      h += '<td>' + (e.municipio || '-') + '</td>';
      h += '<td>' + (e.nome || '-') + '</td>';
      h += '<td class="center">' + (e.localizacao || '-') + '</td>';
      h += '<td>' + (e.telefone || '-') + '</td>';
      h += '<td class="right">' + (Number(e.totalMatricula) > 0 ? Number(e.totalMatricula).toLocaleString('pt-BR') : '-') + '</td>';
      h += '<td class="center">' + (Number(e.salas) > 0 ? e.salas : '-') + '</td>';
      h += '</tr>';
    });
    
    h += '</tbody></table>';
    h += '<div style="text-align: right; font-size: 10px; color: #94a3b8; margin-top: 20px;">Gerado em: ' + today + '</div>';
    
    let printDiv = document.getElementById('print-layout-escolas');
    if (!printDiv) {
      printDiv = document.createElement('div');
      printDiv.id = 'print-layout-escolas';
      printDiv.style.display = 'none';
      document.body.appendChild(printDiv);
    }
    printDiv.innerHTML = h;
    
    const styleEl = document.createElement('style');
    styleEl.innerHTML = '@media print { body > *:not(#print-layout-escolas) { display: none !important; } #print-layout-escolas { display: block !important; position: absolute; top: 0; left: 0; width: 100%; background: white; padding: 0 !important; margin: 0 !important; } @page { size: A4 landscape; margin: 10mm; } }';
    document.head.appendChild(styleEl);
    
    printDiv.style.display = 'block';
    document.body.classList.add('print-mode-escolas');
    
    const origTitle = document.title;
    document.title = 'Relatorio_Escolas_CAM';
    
    window.print();
    
    document.title = origTitle;
    setTimeout(() => {
      document.body.classList.remove('print-mode-escolas');
      if (document.head.contains(styleEl)) document.head.removeChild(styleEl);
      printDiv.style.display = 'none';
    }, 2000);
  } catch (err) {
    alert('Erro ao gerar relatÃ³rio: ' + err.message);
  }
};




