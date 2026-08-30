const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// Patch 1: Global sort in filtrarOrcamento
const regexFilt = /_orcFiltrado = ORCAMENTO_DATA\.filter\([^)]*\)\s*;/;
// wait, the filter spans multiple lines
const regexFilt2 = /_orcFiltrado = ORCAMENTO_DATA\.filter\(row =>[\s\S]*?\n\s*\);/;
const replacementFilt = `_orcFiltrado = ORCAMENTO_DATA.filter(row =>
      (!pa      || row.pa      === pa)      &&
      (!fonte   || row.fonte   === fonte)   &&
      (!despesa || row.despesa === despesa)
    ).sort((a, b) => {
       let cPA = (a.pa||'').localeCompare(b.pa||'');
       if (cPA !== 0) return cPA;
       let cDesp = (a.despesa||'').localeCompare(b.despesa||'');
       if (cDesp !== 0) return cDesp;
       return (a.fonte||'').localeCompare(b.fonte||'');
    });`;
content = content.replace(regexFilt2, replacementFilt);

// Patch 2: Sort in Models 3, 4, 5
const regexSort = /const sorted = \[\.\.\._orcFiltrado\]\.sort\(\(a,b\) => \(a\[sortKey\]\|\|''\)\.localeCompare\(b\[sortKey\]\|\|''\)\);/;
const replacementSort = `const sorted = [..._orcFiltrado].sort((a,b) => {
          let cmp = (a[sortKey]||'').localeCompare(b[sortKey]||'');
          if (cmp !== 0) return cmp;
          return (a.despesa||'').localeCompare(b.despesa||'');
        });`;
content = content.replace(regexSort, replacementSort);

fs.writeFileSync(file, content);
console.log('Patched sorting');
