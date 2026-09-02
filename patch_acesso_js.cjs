const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

// 1. renderListaAcessosUI: add GERENTE, add Setor column, remove Excluir button
const nivelDisplayRegex = /adm: `[\s\S]*?`/;
const nivelDisplayReplace = `adm: \`
          <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: rgba(59, 130, 246, 0.12); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); text-transform: uppercase; letter-spacing: 0.5px; user-select: none;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Admin
          </span>
        \`,
        gerente: \`
          <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: rgba(139, 92, 246, 0.12); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.2); text-transform: uppercase; letter-spacing: 0.5px; user-select: none;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            Gerente
          </span>
        \``;
content = content.replace(nivelDisplayRegex, nivelDisplayReplace);

const tdTableRegex = /<td style="padding:12px 16px; font-size:14px; color:var\(--text-secondary\);">\$\{nivelDisplay\}<\/td>/;
content = content.replace(tdTableRegex, `<td style="padding:12px 16px; font-size:14px; color:var(--text-secondary);">\${nivelDisplay}</td>\n          <td style="padding:12px 16px; font-size:14px; color:var(--text-secondary);">\${user.setor || '-'}</td>`);

const deleteBtnRegex = /<button class="btn btn-danger btn-sm" onclick="deletarAcesso[^>]*>[\s\S]*?Excluir\s*<\/button>/;
content = content.replace(deleteBtnRegex, '');


// 2. salvarAcessoForm: add setor
content = content.replace(/const nivel = document\.getElementById\('acesso-nivel'\)\.value;/, `const nivel = document.getElementById('acesso-nivel').value;\n    const setor = document.getElementById('acesso-setor').value.trim();`);
content = content.replace(/const payload = \{ nome, whatsapp, nivel, status, senha \};/, `const payload = { nome, whatsapp, nivel, status, senha, setor };`);

// 3. abrirModalAcesso & cancelarEdicaoAcesso & novoAcessoForm
const editAcessoRegex = /function abrirModalAcesso\(index = null\) \{[\s\S]*?cancelarEdicaoAcesso\(\);\s*\}/;
const newEditAcesso = `
window.novoAcessoForm = function() {
  cancelarEdicaoAcesso();
  const form = document.getElementById('form-acesso');
  const btnCancelar = document.getElementById('btn-cancelar-edicao');
  if (form) form.style.display = 'grid';
  if (btnCancelar) btnCancelar.style.display = 'inline-flex';
  
  const nomeInput = document.getElementById('acesso-nome');
  const whatsappInput = document.getElementById('acesso-whatsapp');
  const nivelInput = document.getElementById('acesso-nivel');
  const setorInput = document.getElementById('acesso-setor');
  const senhaInput = document.getElementById('acesso-senha');
  const btnSalvar = document.getElementById('btn-salvar-acesso');
  
  if(nomeInput) nomeInput.disabled = false;
  if(whatsappInput) whatsappInput.disabled = false;
  if(nivelInput) nivelInput.disabled = false;
  if(setorInput) setorInput.disabled = false;
  if(senhaInput) senhaInput.disabled = false;
  if(btnSalvar) btnSalvar.disabled = false;
  
  if(nomeInput) nomeInput.focus();
};

function abrirModalAcesso(index = null) {
  const rowInput = document.getElementById('acesso-row');
  const nomeInput = document.getElementById('acesso-nome');
  const whatsappInput = document.getElementById('acesso-whatsapp');
  const nivelInput = document.getElementById('acesso-nivel');
  const setorInput = document.getElementById('acesso-setor');
  const senhaInput = document.getElementById('acesso-senha');
  const btnCancelar = document.getElementById('btn-cancelar-edicao');
  const btnSalvar = document.getElementById('btn-salvar-acesso');
  const form = document.getElementById('form-acesso');

  if (!rowInput) return;

  if (index !== null) {
    if (form) form.style.display = 'grid';
    const user = listaAcessos[index];
    rowInput.value = user._rowNumber;
    nomeInput.value = user.nome;
    whatsappInput.value = user.whatsapp || '';
    nivelInput.value = user.nivel;
    if(setorInput) setorInput.value = user.setor || '';
    senhaInput.value = user.senha || '';

    nomeInput.disabled = false;
    whatsappInput.disabled = true; // WhatsApp nǜo pode ser alterado na ediǜo
    nivelInput.disabled = false;
    if(setorInput) setorInput.disabled = false;
    senhaInput.disabled = false;

    if (btnSalvar) btnSalvar.disabled = false;
    if (btnCancelar) btnCancelar.style.display = 'inline-flex';
    
    nomeInput.focus();
  } else {
    cancelarEdicaoAcesso();
  }
}

function cancelarEdicaoAcesso() {
  const form = document.getElementById('form-acesso');
  const rowInput = document.getElementById('acesso-row');
  const nomeInput = document.getElementById('acesso-nome');
  const whatsappInput = document.getElementById('acesso-whatsapp');
  const nivelInput = document.getElementById('acesso-nivel');
  const setorInput = document.getElementById('acesso-setor');
  const senhaInput = document.getElementById('acesso-senha');
  const btnCancelar = document.getElementById('btn-cancelar-edicao');
  const btnSalvar = document.getElementById('btn-salvar-acesso');

  if (form) {
    form.reset();
    form.style.display = 'none';
  }
  if (rowInput) rowInput.value = '';

  if (nomeInput) nomeInput.disabled = true;
  if (whatsappInput) whatsappInput.disabled = true;
  if (nivelInput) nivelInput.disabled = true;
  if (setorInput) setorInput.disabled = true;
  if (senhaInput) senhaInput.disabled = true;
  if (btnSalvar) btnSalvar.disabled = true;
  if (btnCancelar) btnCancelar.style.display = 'none';
}`;
content = content.replace(/function abrirModalAcesso\(index = null\) \{[\s\S]*?function cancelarEdicaoAcesso\(\) \{[\s\S]*?if \(btnCancelar\) btnCancelar\.style\.display = 'none';\s*\}/, newEditAcesso);


fs.writeFileSync('js/app.js', content);
console.log('patched acesso CRUD in app.js');
