
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
  return '<div style="display:flex;flex-wrap:wrap;gap:4px;">'+mods.map(function(m){
    return '<span style="display:inline-flex;align-items:center;gap:3px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:4px;padding:2px 7px;font-size:10px;color:#fca5a5;white-space:nowrap;"><b style="color:#f0f4ff;">'+(Number(m.alunos)||0)+'</b> '+m.modalidade+'</span>';
  }).join('')+'</div>';
}
function _renderFormModalidadesGrid(containerId, mods) {
  var el = document.getElementById(containerId);
  if (!el) return;
  if (!mods || mods.length === 0) mods = [];
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

function _parseRowEstadual(row) {
  if (!row.c || row.c.length === 0) return null;
  const val = (idx) => (row.c[idx] && row.c[idx].v !== null) ? String(row.c[idx].v).trim() : '';
  if (val(0).toUpperCase() === 'CÓDIGO SUPER') return null;
  if (!val(4)) return null; 
  
  return {
    id: 'est_' + Math.random().toString(36).substr(2,9),
    competencia: 'Estadual',
    codigoSuper: 'Estadual',
    super: val(1),
    municipio: val(2),
    codigoInep: val(3),
    nome: val(4),
    localidade: val(5),
    endereco: val(6),
    complemento: val(7),
    bairro: val(8),
    cep: val(9),
    totalMatricula: parseInt(val(10)) || 0,
    alunos: parseInt(val(10)) || 0,
    salas: parseInt(val(11)) || 0,
    diretor: val(12),
    secretario: val(13),
    contatoDiretor: val(14),
    contatoSecretario: val(15),
    telefone: val(16),
    email: val(17),
    redesSociais: val(18),
    modalidade: '',
    modalidades: []
  };
}

function _parseRowMunicipal(row) {
  if (!row.c || row.c.length === 0) return null;
  const val = (idx) => (row.c[idx] && row.c[idx].v !== null) ? String(row.c[idx].v).trim() : '';
  if (val(0).toUpperCase() === 'MUNICÍPIO/DISTRITO' || val(0).toUpperCase() === 'MUNICÍPIO') return null;
  if (!val(1)) return null; 
  
  return {
    competencia: 'Municipal',
    municipio: val(0),
    nome: val(1),
    alunosModalidade: parseInt(val(2)) || 0,
    modalidadeStr: val(3),
    codigoInep: val(4),
    endereco: val(5),
    bairro: val(6),
    complemento: val(7),
    cep: val(8),
    super: val(10),
    redesSociais: val(11),
    telefone: val(12),
    email: val(13),
    diretor: val(14),
    contatoDiretor: val(15),
    secretario: val(16),
    contatoSecretario: val(17),
    salas: parseInt(val(18)) || 0,
    localidade: val(26)
  };
}

async function carregarEscolasAPI(silencioso) {
  const emptyEl   = document.getElementById('escolas-empty');
  const tableWrap = document.getElementById('escolas-table-wrap');
  const badgeEl   = document.getElementById('escolas-badge');

  if (badgeEl) badgeEl.textContent = '🏫 Carregando...';
  if (emptyEl) emptyEl.style.display = 'none';
  if (tableWrap) tableWrap.style.display = 'none';
  
  const toastMsg = (msg, type) => { if(typeof toast === 'function') toast(msg, type); else console.log(msg); };

  try {
    let mergedSchools = [];
    
    if (badgeEl) badgeEl.textContent = '🏫 Carregando Estadual...';
    try {
      const urlEstadual = 'https://docs.google.com/spreadsheets/d/1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E/gviz/tq?tqx=out:json&gid=220005692&nocache=' + Date.now();
      const resEst = await fetch(urlEstadual);
      if (resEst.ok) {
        const textEst = await resEst.text();
        const rowsEst = _parseGvizText(textEst);
        if (rowsEst) {
          rowsEst.forEach(r => {
            const parsed = _parseRowEstadual(r);
            if (parsed) mergedSchools.push(parsed);
          });
        }
      }
    } catch(e) { console.error('Erro Estadual:', e); }

    let municipalMap = new Map();
    const TE_SHEET_ID = '1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08';
    const TE_BATCH_SIZE = 10;
    
    for (let batchStart = 0; batchStart < MUNICIPIOS_RO.length; batchStart += TE_BATCH_SIZE) {
      const batchMuns = MUNICIPIOS_RO.slice(batchStart, batchStart + TE_BATCH_SIZE);
      if (badgeEl) badgeEl.textContent = '🏫 Carregando Municipal (' + (batchStart+batchMuns.length) + '/' + MUNICIPIOS_RO.length + ')...';
      
      const results = await Promise.allSettled(
        batchMuns.map(mun => {
          const url = 'https://docs.google.com/spreadsheets/d/' + TE_SHEET_ID + '/gviz/tq?tqx=out:json&sheet=' + encodeURIComponent(mun) + '&nocache=' + Date.now();
          return fetch(url).then(r => r.ok ? r.text() : Promise.reject('HTTP ' + r.status));
        })
      );
      
      results.forEach((res, i) => {
        if (res.status === 'rejected') return;
        const text = res.value;
        const rows = _parseGvizText(text);
        if (!rows) return;
        
        rows.forEach(r => {
          const parsed = _parseRowMunicipal(r);
          if (!parsed) return;
          
          const key = (parsed.codigoInep && parsed.codigoInep.length > 3) ? parsed.codigoInep.trim() : parsed.nome.trim().toUpperCase();
          if (!municipalMap.has(key)) {
             municipalMap.set(key, {
               id: 'mun_' + Math.random().toString(36).substr(2,9),
               competencia: 'Municipal',
               codigoSuper: 'Municipal',
               municipio: parsed.municipio || batchMuns[i],
               nome: parsed.nome,
               codigoInep: parsed.codigoInep,
               endereco: parsed.endereco,
               bairro: parsed.bairro,
               complemento: parsed.complemento,
               cep: parsed.cep,
               super: parsed.super,
               redesSociais: parsed.redesSociais,
               telefone: parsed.telefone,
               email: parsed.email,
               diretor: parsed.diretor,
               contatoDiretor: parsed.contatoDiretor,
               secretario: parsed.secretario,
               contatoSecretario: parsed.contatoSecretario,
               salas: parsed.salas,
               localidade: parsed.localidade,
               modalidades: [],
               totalMatricula: 0,
               alunos: 0
             });
          }
          
          const school = municipalMap.get(key);
          if (parsed.modalidadeStr) {
             school.modalidades.push({
               modalidade: parsed.modalidadeStr,
               alunos: parsed.alunosModalidade
             });
             school.totalMatricula += parsed.alunosModalidade;
             school.alunos += parsed.alunosModalidade;
          }
        });
      });
    }

    mergedSchools = mergedSchools.concat(Array.from(municipalMap.values()));
    mergedSchools.sort((a,b) => (a.nome || '').localeCompare(b.nome || ''));

    _escolasCache = mergedSchools;

    if (!silencioso) toastMsg('Dados combinados: ' + _escolasCache.length + ' escolas', 'success');

    const selMun = document.getElementById('escolas-filtro-municipio');
    const selLoc = document.getElementById('escolas-filtro-localizacao');
    const selSup = document.getElementById('escolas-filtro-super');
    const selSupTopo = document.getElementById('escolas-filtro-super-topo');
    
    // Check if variables exist in window to avoid reference error
    const currentPage = typeof _escolasPaginaAtual !== 'undefined' ? _escolasPaginaAtual : 1;
    const currentMun = selMun ? selMun.value : null;
    const currentLoc = selLoc ? selLoc.value : null;
    const currentSup = selSup ? selSup.value : null;
    const currentSupTopo = selSupTopo ? selSupTopo.value : null;

    if (typeof _escolasPopularFiltros === 'function') _escolasPopularFiltros();

    if (selMun && currentMun !== null) selMun.value = currentMun;
    if (selLoc && currentLoc !== null) selLoc.value = currentLoc;
    if (selSup && currentSup !== null) selSup.value = currentSup;
    if (selSupTopo && currentSupTopo !== null) selSupTopo.value = currentSupTopo;

    if (typeof filtrarEscolas === 'function') filtrarEscolas(true);
    if (typeof _escolasAtualizarUI === 'function') _escolasAtualizarUI();
    if (typeof carregarMapaEscolasAPI === 'function') carregarMapaEscolasAPI();

  } catch (err) {
    console.error('Erro ao carregar escolas das planilhas:', err);
    if (badgeEl) badgeEl.textContent = '❌ Erro ao carregar escolas';
    toastMsg('Erro ao conectar com as planilhas do Google', 'error');
  }
}

// ---- FILTROS ----
function _escolasPopularFiltros() {
    const selMun = document.getElementById('escolas-filtro-municipio');
    const selLoc = document.getElementById('escolas-filtro-localizacao');
    const selComp = document.getElementById('escolas-filtro-competencia');
    if (!selMun || !selLoc) return;
    const municipios   = [...new Set(_escolasCache.map(e => e.municipio).filter(Boolean))].sort();
    const localizacoes = [...new Set(_escolasCache.map(e => e.localizacao).filter(Boolean))].sort();
    const competencias = ['Estadual', 'Municipal', 'Federal'];
    
    selMun.innerHTML = '<option value="">MUNICÍPIO</option>' + municipios.map(m => '<option value="' + m + '">' + m + '</option>').join('');
    selLoc.innerHTML = '<option value="">LOCALIZAÇÃO</option>' + localizacoes.map(l => '<option value="' + l + '">' + l + '</option>').join('');
    if (selComp) selComp.innerHTML = '<option value="">COMPETÊNCIA</option>' + competencias.map(c => '<option value="' + c + '">' + c + '</option>').join('');
    
    const selSup = document.getElementById('escolas-filtro-super');

  const superSet = new Set();
  _escolasCache.forEach(e => {
    const val = (e.super || e.codigoSuper || '').toString().trim();
    if (val) superSet.add(val);
  });
    const supers = [...superSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const superHtml = '<option value="">SUPER</option>' + supers.map(s => {
      const label = s.toUpperCase().startsWith('SUPER') ? s : 'SUPER ' + s;
      return '<option value="' + s + '">' + label + '</option>';
    }).join('');

  if (selSup) selSup.innerHTML = superHtml;
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
  if (badgeSalas)   badgeSalas.textContent   = '🚪 ' + totalSalas.toLocaleString('pt-BR') + ' Salas';
}

// Aplica filtros
function filtrarEscolas(manterPagina = false) {
    const buscaEl = document.getElementById('escolas-busca');
    const munEl   = document.getElementById('escolas-filtro-municipio');
    const locEl   = document.getElementById('escolas-filtro-localizacao');
    const supEl   = document.getElementById('escolas-filtro-super');
    const compEl  = document.getElementById('escolas-filtro-competencia');
  
    const busca = (buscaEl ? buscaEl.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'') : '');
    const mun   = (munEl && munEl.value) ? munEl.value : '';
    const loc   = (locEl && locEl.value) ? locEl.value : '';
    const sup   = (supEl && supEl.value) ? supEl.value : '';
    const comp  = (compEl && compEl.value) ? compEl.value : '';
  
    _escolasFiltradas = _escolasCache.filter(e => {
      if (mun && e.municipio !== mun) return false;
      if (loc && e.localizacao !== loc) return false;
      if (comp && _normalizarCompetencia(e.codigoSuper) !== comp) return false;
      if (sup) {
        const eSup = (e.super || e.codigoSuper || '').toString().trim();
        if (eSup !== sup) return false;
      }
      if (busca) {
        const texto = [e.nome, e.municipio, e.super, _normalizarCompetencia(e.codigoSuper), e.codigoInep, e.diretor].join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
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
    ['escolas-busca', 'escolas-filtro-municipio', 'escolas-filtro-localizacao', 'escolas-filtro-super', 'escolas-filtro-competencia'].forEach(id => {
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
    const _eCompT = _normalizarCompetencia(e.codigoSuper);
    const _totalA = _calcTotalAlunos(e);
    const mat  = _totalA > 0 ? _totalA.toLocaleString('pt-BR') : '-';
    const sal  = e.salas > 0 ? e.salas : '-';

    return '<tr style="cursor:pointer;" onclick="abrirModalEscola(' + gi + ')" ondblclick="abrirFormEscola(' + gi + ')" title="Clique para ver detalhes | Duplo clique para editar"' +
      ' onmouseover="this.style.background=\'rgba(139,92,246,0.07)\'"' +
      ' onmouseout="this.style.background=\'\'">' +
      '<td>' + _renderCompetenciaBadge(e.codigoSuper) + '</td>' +
      (_eCompT === 'Municipal' ? '<td style="max-width:220px;">' + _renderModalidadesGrid(e) + '</td>' : '<td style="font-size:12px;color:var(--text-secondary)">' + (e.super || '-') + '</td>') +
      '<td style="font-weight:600;color:var(--text-primary)">' + (e.municipio || '-') + '</td>' +
      '<td style="font-weight:600;color:#f0f4ff;white-space:normal;line-height:1.4;max-width:220px">' + (e.nome || '-') + '</td>' +
      '<td>' + locBadge + '</td>' +
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
          field('Competência', _normalizarCompetencia(escola.codigoSuper)||escola.codigoSuper, '#a78bfa') +
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
          field('Total de Matrículas', _calcTotalAlunos(escola) > 0 ? _calcTotalAlunos(escola).toLocaleString('pt-BR') : '-', '#34d399') +
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
    if (btn) { btn.disabled = false; btn.textContent = '💾 Salvar Alteraçōes'; }
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
    alert('Erro ao gerar relatório: ' + err.message);
  }
};
