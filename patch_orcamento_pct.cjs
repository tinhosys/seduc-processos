const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Add _pctEmp
const pctExecCode = `function _pctExec(inicial, executado) {
    if (!inicial || inicial === 0) return 0;
    let p = Math.round((executado / inicial) * 100);
    return p > 100 ? 100 : p;
  }`;
const pctEmpCode = `function _pctEmp(empenhado, executado) {
    if (!empenhado || empenhado === 0) return 0;
    let p = Math.round((executado / empenhado) * 100);
    return p > 100 ? 100 : p;
  }`;
if (!content.includes('_pctEmp')) {
  content = content.replace(pctExecCode, pctExecCode + '\n  ' + pctEmpCode);
}

// 2. Modify baseHead
content = content.replace(
  /const baseHead = \[\['PA', 'Descri..o', 'Fonte', 'Natureza', 'Inicial', 'Empenhado', 'Executado', 'Saldo L.q.'\]\];/g,
  `const baseHead = [['PA', 'Descrição', 'Fonte', 'Natureza', 'Inicial', 'Empenhado', 'Executado', '%', 'Saldo Líq.']];`
);

// 3. Modify formatRow
content = content.replace(
  /return \[r\.pa, desc, r\.fonte, natText, _fmtBRL\(r\.inicial\), _fmtBRL\(r\.empenhado\), _fmtBRL\(r\.executado\), _fmtBRL\(r\.saldoLiquido\)\];/g,
  `let pct = _pctEmp(r.empenhado, r.executado) + '%';
        return [r.pa, desc, r.fonte, natText, _fmtBRL(r.inicial), _fmtBRL(r.empenhado), _fmtBRL(r.executado), pct, _fmtBRL(r.saldoLiquido)];`
);

// 4. Modify Model 1
const regexModel1 = /head = \[\['Programa', 'Descri..o', 'Inicial', 'Executado', 'Saldo L.quido', '%'\]\];[\s\S]*?body\.push\(\['TOTAIS', '', _fmtBRL\(tI\), _fmtBRL\(tE\), _fmtBRL\(tS\), _pctExec\(tI, tE\) \+ '%'\]\);/;
const replacementModel1 = `head = [['Programa', 'Descrição', 'Inicial', 'Empenhado', 'Executado', '%', 'Saldo Líquido']];
        const grouped = {};
        let tI = 0, tEmp = 0, tE = 0, tS = 0;
        _orcFiltrado.forEach(r => {
          if(!grouped[r.pa]) grouped[r.pa] = { inicial: 0, empenhado: 0, executado: 0, saldo: 0, desc: PA_DESCRICAO[r.pa] || '' };
          grouped[r.pa].inicial += r.inicial;
          grouped[r.pa].empenhado += r.empenhado;
          grouped[r.pa].executado += r.executado;
          grouped[r.pa].saldo += r.saldoLiquido;
          tI += r.inicial; tEmp += r.empenhado; tE += r.executado; tS += r.saldoLiquido;
        });
        for(const [pa, vals] of Object.entries(grouped)) {
          let desc = vals.desc;
          body.push([pa, desc, _fmtBRL(vals.inicial), _fmtBRL(vals.empenhado), _fmtBRL(vals.executado), _pctEmp(vals.empenhado, vals.executado) + '%', _fmtBRL(vals.saldo)]);
        }
        body.push(['TOTAIS', '', _fmtBRL(tI), _fmtBRL(tEmp), _fmtBRL(tE), _pctEmp(tEmp, tE) + '%', _fmtBRL(tS)]);`;
content = content.replace(regexModel1, replacementModel1);

// 5. Modify Model 2
const regexModel2 = /head = \[\['PA', 'Descri..o', 'Fonte', 'Natureza', 'Detalhe', 'Inicial', 'Empenhado', 'Executado', 'Saldo L.q.'\]\];\s*body = _orcFiltrado\.map\(r => \{[\s\S]*?_fmtBRL\(r\.inicial\), _fmtBRL\(r\.empenhado\), _fmtBRL\(r\.executado\), _fmtBRL\(r\.saldoLiquido\)\s*\];\s*\}\);/;
const replacementModel2 = `head = [['PA', 'Descrição', 'Fonte', 'Natureza', 'Detalhe', 'Inicial', 'Empenhado', 'Executado', '%', 'Saldo Líq.']];
        body = _orcFiltrado.map(r => {
          let desc = PA_DESCRICAO[r.pa] || '';
          let pct = _pctEmp(r.empenhado, r.executado) + '%';
          return [
            r.pa, desc, r.fonte, (r.despesa && r.despesa.length === 6 ? r.despesa.substring(0,2)+'.'+r.despesa.substring(2,4)+'.'+r.despesa.substring(4,6)+' - ' : '') + _naturezaNome(r.despesa), r.detalhamento || '',
            _fmtBRL(r.inicial), _fmtBRL(r.empenhado), _fmtBRL(r.executado), pct, _fmtBRL(r.saldoLiquido)
          ];
        });`;
content = content.replace(regexModel2, replacementModel2);

// 6. Modify Subtotal logic in Models 3, 4, 5
content = content.replace(/body\.push\(\['Subtotal ' \+ lastKey, '', '', '', _fmtBRL\(subT\.i\), _fmtBRL\(subT\.emp\), _fmtBRL\(subT\.e\), _fmtBRL\(subT\.s\)\]\);/g, 
  `body.push(['Subtotal ' + lastKey, '', '', '', _fmtBRL(subT.i), _fmtBRL(subT.emp), _fmtBRL(subT.e), _pctEmp(subT.emp, subT.e) + '%', _fmtBRL(subT.s)]);`);

// 7. Modify TOTAIS logic
const regexTotais = /let totalRow = \['TOTAIS', '', '', ''\];\s*if \(modelo === 2\) totalRow\.push\(''\);\s*totalRow\.push\(_fmtBRL\(tI\), _fmtBRL\(tEmp\), _fmtBRL\(tE\), _fmtBRL\(tS\)\);\s*body\.push\(totalRow\);/;
const replacementTotais = `let totalPct = _pctEmp(tEmp, tE) + '%';
         let totalRow = ['TOTAIS', '', '', ''];
         if (modelo === 2) totalRow.push('');
         totalRow.push(_fmtBRL(tI), _fmtBRL(tEmp), _fmtBRL(tE), totalPct, _fmtBRL(tS));
         body.push(totalRow);`;
content = content.replace(regexTotais, replacementTotais);

fs.writeFileSync(file, content);
console.log('Patched percent col');
