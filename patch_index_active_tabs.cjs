const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

const regex = /function mudarAbaDiarias\(aba, el\) \{[\s\S]*?if \(el\) el\.classList\.add\('active'\);/;
const replacement = `function mudarAbaDiarias(aba, el) {
  document.querySelectorAll('#page-diarias .tabs .tab-link').forEach(t => {
    t.classList.remove('active');
    t.style.background = '#1e293b';
    t.style.color = '#cbd5e1';
    t.style.borderColor = '#334155';
    if(t.innerText.includes('Gerar Nova Diária')) {
      t.style.background = '#3b82f6';
      t.style.color = 'white';
      t.style.border = 'none';
    }
  });
  
  if (el) {
    el.classList.add('active');
    if(!el.innerText.includes('Gerar Nova Diária')) {
      el.style.background = '#3b82f6';
      el.style.color = 'white';
      el.style.borderColor = '#3b82f6';
    }
  }`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('index.html active tabs fixed');
