const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

const regex = /window\.mudarGuiaOrcamento = async function\(nomeGuia, gid, el\) \{[\s\S]*?_guiaAtualSheet = nomeGuia;/;

const replacement = `window.mudarGuiaOrcamento = async function(nomeGuia, gid, el) {
  if (el) {
    document.querySelectorAll('#page-orcamento .tabs .tab-link').forEach(t => {
      t.classList.remove('active');
      t.style.background = '#1e293b';
      t.style.color = '#cbd5e1';
      t.style.border = '1px solid #334155';
    });
    el.classList.add('active');
    el.style.background = '#3b82f6';
    el.style.color = 'white';
    el.style.border = '1px solid #3b82f6';
  }
  _guiaAtualSheet = nomeGuia;`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('Active tab style patched in orcamento.js');
