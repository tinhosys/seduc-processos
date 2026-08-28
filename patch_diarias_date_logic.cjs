const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

// Parse data as Date object for easier sorting and filtering
const regexParser = /const mes = cols\[13\] \? cols\[13\]\.trim\(\) : '';/;
const replacementParser = `const mes = cols[13] ? cols[13].trim() : '';
      let dateObj = null;
      if (dataInicio) {
        const parts = dataInicio.split('/');
        if (parts.length === 3) {
           dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      }`;

content = content.replace(regexParser, replacementParser);
content = content.replace(/mes: mes,/g, "mes: mes,\n        dateObj: dateObj,");

// Update render logic to use dates
const regexLimpar = /window\.limparFiltrosDiarias = function\(\) \{[\s\S]*?renderizarDiarias\(\);\n\};/;
const replacementLimpar = `window.limparFiltrosDiarias = function() {
  const ids = ['busca-diarias', 'diaria-filtro-data-ini', 'diaria-filtro-data-fim'];
  ids.forEach(id => { const e = document.getElementById(id); if(e) e.value = ''; });
  const idsSel = ['diaria-filtro-mes', 'diaria-filtro-status', 'diaria-filtro-setor'];
  idsSel.forEach(id => { const e = document.getElementById(id); if(e) e.value = 'Todos'; });
  renderizarDiarias();
};`;
content = content.replace(regexLimpar, replacementLimpar);

const regexRender = /const vSetor = document\.getElementById\('diaria-filtro-setor'\) \? document\.getElementById\('diaria-filtro-setor'\)\.value : 'Todos';/;
const replacementRender = `const vSetor = document.getElementById('diaria-filtro-setor') ? document.getElementById('diaria-filtro-setor').value : 'Todos';
  const vDataIni = document.getElementById('diaria-filtro-data-ini') ? document.getElementById('diaria-filtro-data-ini').value : '';
  const vDataFim = document.getElementById('diaria-filtro-data-fim') ? document.getElementById('diaria-filtro-data-fim').value : '';`;
content = content.replace(regexRender, replacementRender);

const regexFilter2 = /\/\/ Text Search/;
const replacementFilter2 = `// Date Search
  if (vDataIni) {
    const dtIni = new Date(vDataIni + 'T00:00:00');
    filtrados = filtrados.filter(d => d.dateObj && d.dateObj >= dtIni);
  }
  if (vDataFim) {
    const dtFim = new Date(vDataFim + 'T23:59:59');
    filtrados = filtrados.filter(d => d.dateObj && d.dateObj <= dtFim);
  }

  // Text Search`;
content = content.replace(regexFilter2, replacementFilter2);

fs.writeFileSync(file, content);
console.log('diarias.js date logic patched');
