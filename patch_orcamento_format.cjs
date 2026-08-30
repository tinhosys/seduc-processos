const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove truncation from formatRow and add Code to Natureza
const regexFormatRow = /const formatRow = \(r\) => \{[\s\S]*?return \[r\.pa, desc\.length > 25 \? desc\.substring\(0, 25\) \+ '\.\.\.' : desc, r\.fonte, _naturezaNome\(r\.despesa\), _fmtBRL\(r\.inicial\), _fmtBRL\(r\.empenhado\), _fmtBRL\(r\.executado\), _fmtBRL\(r\.saldoLiquido\)\];\s*\};/g;

const replacementFormatRow = `const formatRow = (r) => {
      let desc = PA_DESCRICAO[r.pa] || '';
      let natCode = r.despesa || '';
      if (natCode.length === 6) natCode = natCode.substring(0,2) + '.' + natCode.substring(2,4) + '.' + natCode.substring(4,6);
      let natText = (natCode ? natCode + ' - ' : '') + _naturezaNome(r.despesa);
      return [r.pa, desc, r.fonte, natText, _fmtBRL(r.inicial), _fmtBRL(r.empenhado), _fmtBRL(r.executado), _fmtBRL(r.saldoLiquido)];
    };`;
content = content.replace(regexFormatRow, () => replacementFormatRow);

// Model 2 - Remove truncation from Descrição
const regexModel2 = /desc\.length > 20 \? desc\.substring\(0, 20\)\+'\.\.\.' : desc/g;
content = content.replace(regexModel2, "desc");

// Model 1 - Remove truncation from Descrição
const regexModel1 = /desc\.length > 35 \? desc\.substring\(0,35\)\+'\.\.\.' : desc/g;
content = content.replace(regexModel1, "desc");

// We need to implement subtotals for Models 3, 4, 5
const regexModels345 = /else if \(modelo === 3\) \{[\s\S]*?else if \(modelo === 6\)/;

const replacementModels345 = `else if (modelo === 3 || modelo === 4 || modelo === 5) {
      if (modelo === 3) title = "Agrupado por Programa de Ação";
      if (modelo === 4) title = "Agrupado por Fonte de Recurso";
      if (modelo === 5) title = "Agrupado por Natureza da Despesa";
      head = baseHead;
      
      let sortKey = 'pa';
      if (modelo === 4) sortKey = 'fonte';
      if (modelo === 5) sortKey = 'despesa';
      
      const sorted = [..._orcFiltrado].sort((a,b) => (a[sortKey]||'').localeCompare(b[sortKey]||''));
      
      let lastKey = null;
      let subT = {i:0, emp:0, e:0, s:0};
      
      sorted.forEach(r => {
         const currentKey = r[sortKey];
         if (lastKey && lastKey !== currentKey) {
            body.push(['Subtotal ' + lastKey, '', '', '', _fmtBRL(subT.i), _fmtBRL(subT.emp), _fmtBRL(subT.e), _fmtBRL(subT.s)]);
            subT = {i:0, emp:0, e:0, s:0};
         }
         body.push(formatRow(r));
         subT.i += r.inicial; subT.emp += r.empenhado; subT.e += r.executado; subT.s += r.saldoLiquido;
         lastKey = currentKey;
      });
      if (lastKey) {
         body.push(['Subtotal ' + lastKey, '', '', '', _fmtBRL(subT.i), _fmtBRL(subT.emp), _fmtBRL(subT.e), _fmtBRL(subT.s)]);
      }
    } else if (modelo === 6)`;

content = content.replace(regexModels345, () => replacementModels345);

fs.writeFileSync(file, content);
console.log('Patched formats and subtotals');
