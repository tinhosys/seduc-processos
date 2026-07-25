const fs = require('fs');
const path = require('path');

const escolasPath = path.join(__dirname, 'js', 'escolas.js');
let code = fs.readFileSync(escolasPath, 'utf8');

const newFunctions = `
// ============================================================
// SEDUC — Formulário Individualizado de Escola (Página & Modal)
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
  if (sub) sub.textContent = (escola.nome || 'Escola') + (escola.municipio ? ' — ' + escola.municipio : '');
  const btn = document.getElementById('btn-salvar-escola-page');
  if (btn) btn.textContent = '💾 Salvar Alterações';

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

  const token = (typeof getSessionToken === 'function') ? getSessionToken() : sessionStorage.getItem('sap_session_token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) };

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
`;

if (!code.includes('abrirFormEscola')) {
  code = newFunctions + '\n' + code;
}

// Update table row rendering to call abrirFormEscola(gi) on click/dblclick and button click
code = code.replace(
  /onclick="abrirModalEditarEscola\(' \+ gi \+ '\)"/g,
  "onclick=\"abrirFormEscola(' + gi + ')\""
);

code = code.replace(
  /ondblclick="abrirModalEditarEscola\(' \+ gi \+ '\)"/g,
  "ondblclick=\"abrirFormEscola(' + gi + ')\""
);

// Update Nova Escola header button to call novaEscolaForm()
code = code.replace(
  'abrirModalFormEscola()',
  'novaEscolaForm()'
);

// Update details modal Editar button to call abrirFormEscolaById
code = code.replace(
  /abrirModalEditarEscolaById/g,
  'abrirFormEscolaById'
);

// Expose globals
const windowExports = `
window.abrirFormEscola          = abrirFormEscola;
window.abrirFormEscolaById      = abrirFormEscolaById;
window.novaEscolaForm           = novaEscolaForm;
window.salvarFormularioEscolaPage = salvarFormularioEscolaPage;
`;

if (!code.includes('window.abrirFormEscola')) {
  code += '\n' + windowExports;
}

fs.writeFileSync(escolasPath, code, 'utf8');
console.log('js/escolas.js updated with full page individualized school form logic.');
