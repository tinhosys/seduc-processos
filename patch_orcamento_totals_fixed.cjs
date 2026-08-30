const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

const regexBaseHead = /const baseHead = \[\['PA', 'Fonte', 'Natureza', 'Inicial', 'Empenhado', 'Executado', 'Saldo L.q\.'\]\];\s*const formatRow = \(r\) => \[\s*r\.pa, r\.fonte, _naturezaNome\(r\.despesa\), _fmtBRL\(r\.inicial\), _fmtBRL\(r\.empenhado\), _fmtBRL\(r\.executado\), _fmtBRL\(r\.saldoLiquido\)\s*\];/;
const replacementBaseHead = `const baseHead = [['PA', 'Descrição', 'Fonte', 'Natureza', 'Inicial', 'Empenhado', 'Executado', 'Saldo Líq.']];
    const formatRow = (r) => {
      let desc = PA_DESCRICAO[r.pa] || '';
      return [r.pa, desc.length > 25 ? desc.substring(0, 25) + '...' : desc, r.fonte, _naturezaNome(r.despesa), _fmtBRL(r.inicial), _fmtBRL(r.empenhado), _fmtBRL(r.executado), _fmtBRL(r.saldoLiquido)];
    };`;
content = content.replace(regexBaseHead, replacementBaseHead);

const regexModel1 = /if \(modelo === 1\) \{[\s\S]*?body\.push\(\[pa, _fmtBRL\(vals\.inicial\), _fmtBRL\(vals\.executado\), _fmtBRL\(vals\.saldo\), _pctExec\(vals\.inicial, vals\.executado\) \+ '%'\]\);\s*\}\s*\}/;
const replacementModel1 = `if (modelo === 1) {
      title = "Resumo Geral por Programa";
      head = [['Programa', 'Descrição', 'Inicial', 'Executado', 'Saldo Líquido', '%']];
      const grouped = {};
      let tI = 0, tE = 0, tS = 0;
      _orcFiltrado.forEach(r => {
        if(!grouped[r.pa]) grouped[r.pa] = { inicial: 0, executado: 0, saldo: 0, desc: PA_DESCRICAO[r.pa] || '' };
        grouped[r.pa].inicial += r.inicial;
        grouped[r.pa].executado += r.executado;
        grouped[r.pa].saldo += r.saldoLiquido;
        tI += r.inicial; tE += r.executado; tS += r.saldoLiquido;
      });
      for(const [pa, vals] of Object.entries(grouped)) {
        let desc = vals.desc;
        body.push([pa, desc.length > 35 ? desc.substring(0,35)+'...' : desc, _fmtBRL(vals.inicial), _fmtBRL(vals.executado), _fmtBRL(vals.saldo), _pctExec(vals.inicial, vals.executado) + '%']);
      }
      body.push(['TOTAIS', '', _fmtBRL(tI), _fmtBRL(tE), _fmtBRL(tS), _pctExec(tI, tE) + '%']);
    }`;
content = content.replace(regexModel1, replacementModel1);

const regexModel2 = /else if \(modelo === 2\) \{[\s\S]*?\]\);\s*\}/;
const replacementModel2 = `else if (modelo === 2) {
      title = "Listagem Detalhada";
      head = [['PA', 'Descrição', 'Fonte', 'Natureza', 'Detalhe', 'Inicial', 'Empenhado', 'Executado', 'Saldo Líq.']];
      body = _orcFiltrado.map(r => {
        let desc = PA_DESCRICAO[r.pa] || '';
        return [
          r.pa, desc.length > 20 ? desc.substring(0, 20)+'...' : desc, r.fonte, _naturezaNome(r.despesa), r.detalhamento ? r.detalhamento.substring(0, 25) : '',
          _fmtBRL(r.inicial), _fmtBRL(r.empenhado), _fmtBRL(r.executado), _fmtBRL(r.saldoLiquido)
        ];
      });
    }`;
content = content.replace(regexModel2, replacementModel2);

const regexBeforePrint = /doc\.text\(title, 14, 35\);/;
const replacementBeforePrint = `
    if (modelo >= 2 && modelo <= 6) {
       let arr = (modelo === 6) ? _orcFiltrado.filter(r => _pctExec(r.inicial, r.executado) >= 80 || r.saldoLiquido <= 10000) : _orcFiltrado;
       let tI = 0, tEmp = 0, tE = 0, tS = 0;
       arr.forEach(r => { tI += r.inicial; tEmp += r.empenhado; tE += r.executado; tS += r.saldoLiquido; });
       
       let totalRow = ['TOTAIS', '', '', ''];
       if (modelo === 2) totalRow.push('');
       totalRow.push(_fmtBRL(tI), _fmtBRL(tEmp), _fmtBRL(tE), _fmtBRL(tS));
       body.push(totalRow);
    }
    doc.text(title, 14, 35);`;
content = content.replace(regexBeforePrint, replacementBeforePrint);

const regexAutoTable = /doc\.autoTable\(\{ startY: 40, head: head, body: body, styles: \{ fontSize: 8 \}, headStyles: \{ fillColor: \[79, 70, 229\] \} \}\);/;
const replacementAutoTable = `doc.autoTable({ 
      startY: 40, 
      head: head, 
      body: body, 
      styles: { fontSize: 8 }, 
      headStyles: { fillColor: [79, 70, 229] },
      didParseCell: function(data) {
        const txt = data.cell.text[0] || '';
        if (txt.includes('R$$$') || txt.includes('%') || (data.section === 'head' && ['Inicial', 'Executado', 'Saldo Líq.', 'Saldo Líquido', '%', 'Empenhado'].includes(txt))) {
           data.cell.styles.halign = 'right';
        }
        if (data.section === 'body' && data.row.index === data.table.body.length - 1) {
           const isTotalRow = (data.table.body[data.row.index].cells[0].text[0] || '').includes('TOTAIS');
           if (isTotalRow) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.lineWidth = { top: 1 };
              data.cell.styles.lineColor = [220, 38, 38];
           }
        }
      }
    });`;
// NOTE: I used R$$$ which evaluates to R$ in String.replace()!
content = content.replace(regexAutoTable, replacementAutoTable);

fs.writeFileSync(file, content);
console.log('Fixed all styles');
