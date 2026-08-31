const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

const regexPopular = /const paSet = new Set\(\), setorSet = new Set\(\), tipoSet = new Set\(\);[\s\S]*?document\.getElementById\('orc-desp-filtro-tipo'\)\.addEventListener\('change', window\.renderDespesasRealizadas\);/s;

const newPopular = `const paSet = new Set(), setorSet = new Set(), tipoSet = new Set(), naturezaSet = new Set();
  _crmData.forEach(r => {
    if(r.pa) paSet.add(r.pa);
    if(r.setor) setorSet.add(r.setor);
    if(r.tipo) tipoSet.add(r.tipo);
    if(r.despesa) naturezaSet.add(r.despesa);
  });
  
  const fill = (id, set) => {
    const el = document.getElementById(id);
    if(!el) return;
    el.innerHTML = '<option value="">Todos</option>' + Array.from(set).sort().map(v => \`<option value="\${v}">\${v}</option>\`).join('');
  };
  
  fill('orc-desp-filtro-pa', paSet);
  fill('orc-desp-filtro-setor', setorSet);
  fill('orc-desp-filtro-tipo', tipoSet);
  fill('orc-desp-filtro-natureza', naturezaSet);

  document.getElementById('orc-desp-filtro-pa')?.addEventListener('change', window.renderDespesasRealizadas);
  document.getElementById('orc-desp-filtro-setor')?.addEventListener('change', window.renderDespesasRealizadas);
  document.getElementById('orc-desp-filtro-tipo')?.addEventListener('change', window.renderDespesasRealizadas);
  document.getElementById('orc-desp-filtro-natureza')?.addEventListener('change', window.renderDespesasRealizadas);`;

content = content.replace(regexPopular, newPopular);

const regexRender = /const tipo = document\.getElementById\('orc-desp-filtro-tipo'\)\?\.value \|\| '';[\s\S]*?if \(tipo && r\.tipo !== tipo\) return false;/s;
const newRender = `const tipo = document.getElementById('orc-desp-filtro-tipo')?.value || '';
  const natureza = document.getElementById('orc-desp-filtro-natureza')?.value || '';
  const busca = (document.getElementById('orc-desp-filtro-busca')?.value || '').toLowerCase();

  const filtrado = _crmData.filter(r => {
    if (pa && r.pa !== pa) return false;
    if (setor && r.setor !== setor) return false;
    if (tipo && r.tipo !== tipo) return false;
    if (natureza && r.despesa !== natureza) return false;`;
    
content = content.replace(regexRender, newRender);

fs.writeFileSync(file, content);
console.log('Patched orcamento.js with Natureza filter');
