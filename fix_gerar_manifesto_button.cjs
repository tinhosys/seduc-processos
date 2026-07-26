const fs = require('fs');
const path = require('path');

// 1. Update index.html button labels to exact "GERAR MANIFESTO"
const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace any occurrence of "Gerar Manifesto TCE-RO" or "Manifesto TCE-RO" in buttons
html = html.replace(
  />\s*📜\s*Gerar Manifesto TCE-RO\s*</g,
  '>GERAR MANIFESTO<'
);

html = html.replace(
  />\s*📜\s*Manifesto TCE-RO\s*</g,
  '>GERAR MANIFESTO<'
);

html = html.replace(
  />\s*Gerar Manifesto TCE-RO\s*</g,
  '>GERAR MANIFESTO<'
);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('index.html button text updated to exact "GERAR MANIFESTO".');

// 2. Update js/app.js to fix input capturing and PDF generation
const appJsPath = path.join(__dirname, 'js', 'app.js');
let code = fs.readFileSync(appJsPath, 'utf8');

const newGerarFunc = `function gerarEExibirManifestoTCEAtual() {
  const g = (id) => (document.getElementById(id) || {}).value || '';
  
  const inputsNum = Array.from(document.querySelectorAll('input[name="numero[]"]'));
  const numeroProc = inputsNum.map(i => i.value.trim()).filter(Boolean).join(', ') || g('form-numero') || 'Sem número';

  const valPlan = (typeof parseCurrency === 'function') ? parseCurrency(g('form-valorPlan')) : ((typeof parseMoney === 'function') ? parseMoney(g('form-valorPlan')) : 0);
  const valOf = (typeof parseCurrency === 'function') ? parseCurrency(g('form-valorOf')) : ((typeof parseMoney === 'function') ? parseMoney(g('form-valorOf')) : 0);

  const p = {
    numero: numeroProc,
    municipio: g('form-municipio'),
    interessado: g('form-interessado'),
    objeto: g('form-objeto'),
    tipo: (document.querySelector('#control-tipo .segment-btn.active') || {}).dataset?.value || g('form-tipo'),
    oficioNumero: g('form-oficioNumero'),
    metragemM2: g('form-metragemM2'),
    detalhamentoItens: g('form-detalhamentoItens'),
    qtdeSala: g('form-qtdeSala'),
    tipoSala: g('form-tipoSala'),
    auditorio: g('form-auditorio'),
    tipoAuditorio: g('form-tipoAuditorio'),
    quadra: g('form-quadra'),
    refeitorio: g('form-refeitorio'),
    banheiros: g('form-banheiros'),
    valorPlan: valPlan,
    valorOf: valOf
  };

  if (typeof state !== 'undefined' && state.editandoId) {
    const editando = (state.processos || []).find(item => item.id === state.editandoId);
    if (editando) {
      if (!p.numero || p.numero === 'Sem número') p.numero = editando.numero;
      if (!p.municipio) p.municipio = editando.municipio;
      if (!p.interessado) p.interessado = editando.interessado;
      if (!p.objeto) p.objeto = editando.objeto;
      if (!p.valorPlan) p.valorPlan = editando.valorPlan;
      if (!p.valorOf) p.valorOf = editando.valorOf;
      if (!p.oficioNumero) p.oficioNumero = editando.oficioNumero;
      if (!p.metragemM2) p.metragemM2 = editando.metragemM2;
      if (!p.detalhamentoItens) p.detalhamentoItens = editando.detalhamentoItens;
    }
  }

  abrirModalManifestoTCE(p);
}`;

code = code.replace(/function gerarEExibirManifestoTCEAtual\(\) \{[\s\S]*?\n\}/, newGerarFunc);

fs.writeFileSync(appJsPath, code, 'utf8');
console.log('js/app.js updated with robust process data capturing for GERAR MANIFESTO.');
