const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'js', 'app.js');
let code = fs.readFileSync(appJsPath, 'utf8');

// 1. Add tab switching function and export
const tabFunc = `
function alternarGuiaFormulario(guia) {
  const btnObjeto = document.getElementById('btn-guia-objeto');
  const btnObjetivo = document.getElementById('btn-guia-objetivo');
  const tabObjeto = document.getElementById('tab-content-objeto');
  const tabObjetivo = document.getElementById('tab-content-objetivo');

  if (!tabObjeto || !tabObjetivo) return;

  if (guia === 'objetivo') {
    tabObjeto.style.display = 'none';
    tabObjetivo.style.display = 'block';
    if (btnObjeto) {
      btnObjeto.style.background = 'none';
      btnObjeto.style.color = 'var(--text-secondary)';
      btnObjeto.style.border = '1px solid transparent';
      btnObjeto.style.boxShadow = 'none';
    }
    if (btnObjetivo) {
      btnObjetivo.style.background = 'linear-gradient(135deg,#10b981,#059669)';
      btnObjetivo.style.color = '#ffffff';
      btnObjetivo.style.border = '1px solid #34d399';
      btnObjetivo.style.boxShadow = '0 3px 12px rgba(16,185,129,0.3)';
    }
  } else {
    tabObjeto.style.display = 'block';
    tabObjetivo.style.display = 'none';
    if (btnObjeto) {
      btnObjeto.style.background = 'linear-gradient(135deg,#10b981,#059669)';
      btnObjeto.style.color = '#ffffff';
      btnObjeto.style.border = '1px solid #34d399';
      btnObjeto.style.boxShadow = '0 3px 12px rgba(16,185,129,0.3)';
    }
    if (btnObjetivo) {
      btnObjetivo.style.background = 'none';
      btnObjetivo.style.color = 'var(--text-secondary)';
      btnObjetivo.style.border = '1px solid transparent';
      btnObjetivo.style.boxShadow = 'none';
    }
  }
}
window.alternarGuiaFormulario = alternarGuiaFormulario;
`;

if (!code.includes('alternarGuiaFormulario')) {
  code = tabFunc + '\n' + code;
}

// 2. Add populating objective fields in renderFormulario
const renderFormTarget = "contatosTemporarios = p.contatos ? JSON.parse(JSON.stringify(p.contatos)) : [];";
const renderFormExtra = `
    const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
    setVal('form-qtdeSala', p.qtdeSala);
    setVal('form-tipoSala', p.tipoSala);
    setVal('form-auditorio', p.auditorio);
    setVal('form-tipoAuditorio', p.tipoAuditorio);
    setVal('form-quadra', p.quadra);
    setVal('form-patio', p.patio);
    setVal('form-refeitorio', p.refeitorio);
    setVal('form-banheiros', p.banheiros);
    setVal('form-demaisObservacoes', p.demaisObservacoes);
    if (typeof alternarGuiaFormulario === 'function') alternarGuiaFormulario('objeto');
`;

if (!code.includes("setVal('form-qtdeSala'")) {
  code = code.replace(renderFormTarget, renderFormTarget + '\n' + renderFormExtra);
}

// 3. Add capturing objective fields in salvarFormulario
const salvarFormTarget = "anotacao:    document.getElementById('form-anotacao').value.trim(),";
const salvarFormExtra = `
    qtdeSala:          document.getElementById('form-qtdeSala')?.value.trim() || '',
    tipoSala:          document.getElementById('form-tipoSala')?.value.trim() || '',
    auditorio:         document.getElementById('form-auditorio')?.value.trim() || '',
    tipoAuditorio:     document.getElementById('form-tipoAuditorio')?.value.trim() || '',
    quadra:            document.getElementById('form-quadra')?.value.trim() || '',
    patio:             document.getElementById('form-patio')?.value.trim() || '',
    refeitorio:        document.getElementById('form-refeitorio')?.value.trim() || '',
    banheiros:         document.getElementById('form-banheiros')?.value.trim() || '',
    demaisObservacoes: document.getElementById('form-demaisObservacoes')?.value.trim() || '',`;

if (!code.includes("qtdeSala:")) {
  code = code.replace(salvarFormTarget, salvarFormTarget + '\n' + salvarFormExtra);
}

fs.writeFileSync(appJsPath, code, 'utf8');
console.log('js/app.js updated with tabs and objective fields.');
