const fs = require('fs');
const path = require('path');

const escolasPath = path.join(__dirname, 'js', 'escolas.js');
let code = fs.readFileSync(escolasPath, 'utf8');

// 1. Add abrirProcessoFormEscola function
const abrirProcessoFormFunc = `
// ---- ABRIR FORMULÁRIO DE PROCESSO (PLANILHA DE CONTROLE GDSM) ----
function abrirProcessoFormEscola(idx) {
  const escola = _escolasFiltradas[idx];
  if (!escola) return;

  const todosProcessos = (typeof carregarProcessos === 'function') ? carregarProcessos() : [];
  const nomeNorm = (escola.nome || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').trim();
  const inep = (escola.codigoInep || '').toString().trim();

  // Buscar processo existente correspondente à escola (por nome ou INEP no campo interessado/obs)
  let pEncontrado = todosProcessos.find(p => {
    const inter = (p.interessado || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
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
`;

// Insert function before exports or after abrirModalEscola
if (!code.includes('abrirProcessoFormEscola')) {
  code = code.replace('// ---- MODAL DETALHES ----', abrirProcessoFormFunc + '\n\n// ---- MODAL DETALHES ----');
}

// 2. Update table row action buttons to call abrirProcessoFormEscola
const oldTableBtn = `'<button onclick="abrirModalEditarEscola(' + gi + ')" title="Editar Escola" style="background:linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.2));border:1px solid rgba(139,92,246,0.4);border-radius:6px;color:#a78bfa;padding:6px 12px;cursor:pointer;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:4px;">✏️ Editar</button>'`;

const newTableBtn = `'<div style="display:flex;gap:4px;justify-content:center;">' +
  '<button onclick="abrirProcessoFormEscola(' + gi + ')" title="Editar/Criar Processo na Planilha GDSM" style="background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.2));border:1px solid rgba(16,185,129,0.4);border-radius:6px;color:#34d399;padding:6px 12px;cursor:pointer;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:4px;">✏️ Editar</button>' +
  '<button onclick="abrirModalEditarEscola(' + gi + ')" title="Editar Dados da Escola" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:6px;color:var(--text-secondary);padding:6px 8px;cursor:pointer;font-size:12px;">🏫 Dados</button>' +
'</div>'`;

code = code.replace(
  /'<div style="display:flex;gap:4px;justify-content:center;">' \+\s*'<button onclick="abrirModalEditarEscola\(' \+ gi \+ '\)".*?<\/button>' \+\s*'<\/div>'/s,
  newTableBtn
);

// 3. Update details modal buttons
const oldModalBtns = `'<button onclick="fecharModalEscola();abrirModalEditarEscolaById(\\\'' + (escola.id || '') + '\\\')" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);border:none;color:#fff;padding:8px 18px;border-radius:8px;font-weight:700;cursor:pointer;">✏️ Editar</button>'`;

const newModalBtns = `'<button onclick="fecharModalEscola();abrirProcessoFormEscola(' + _escolasFiltradas.indexOf(escola) + ')" style="background:linear-gradient(135deg,#10b981,#059669);border:none;color:#fff;padding:8px 18px;border-radius:8px;font-weight:700;cursor:pointer;">✏️ Editar Processo (GDSM)</button>' +
  '<button onclick="fecharModalEscola();abrirModalEditarEscolaById(\\\'' + (escola.id || '') + '\\\')" style="background:rgba(255,255,255,.06);border:1px solid var(--border);color:var(--text-secondary);padding:8px 18px;border-radius:8px;cursor:pointer;">🏫 Dados da Escola</button>'`;

code = code.replace(oldModalBtns, newModalBtns);

// 4. Expose globally
if (!code.includes('window.abrirProcessoFormEscola')) {
  code = code.replace('window.excluirEscola', 'window.abrirProcessoFormEscola = abrirProcessoFormEscola;\nwindow.excluirEscola');
}

fs.writeFileSync(escolasPath, code, 'utf8');
console.log('js/escolas.js updated successfully.');
