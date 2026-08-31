const fs = require('fs');
let content = fs.readFileSync('js/diarias.js', 'utf8');

// 1. popularSelectsDiarias: add nota
content = content.replace(
  /fill\('diaria-filtro-setor', PARAM_SETORES\.length > 0 \? PARAM_SETORES : \[\.\.\.new Set\(DIARIAS_DATA\.map\(d => d\.setorOriginal\)\)\]\.filter\(x => x\)\);/,
  `fill('diaria-filtro-setor', PARAM_SETORES.length > 0 ? PARAM_SETORES : [...new Set(DIARIAS_DATA.map(d => d.setorOriginal))].filter(x => x));
    fill('diaria-filtro-nota', [...new Set(DIARIAS_DATA.map(d => d.nota))].filter(x => x));`
);

// 2. renderizarDiarias: add vNota
content = content.replace(
  /const vSetor = document\.getElementById\('diaria-filtro-setor'\) \? document\.getElementById\('diaria-filtro-setor'\)\.value : 'Todos';/,
  `const vSetor = document.getElementById('diaria-filtro-setor') ? document.getElementById('diaria-filtro-setor').value : 'Todos';
    const vNota = document.getElementById('diaria-filtro-nota') ? document.getElementById('diaria-filtro-nota').value : 'Todos';`
);

content = content.replace(
  /if \(vSetor !== 'Todos'\) filtrados = filtrados\.filter\(d => d\.setorOriginal === vSetor\);/,
  `if (vSetor !== 'Todos') filtrados = filtrados.filter(d => d.setorOriginal === vSetor);
    if (vNota !== 'Todos') filtrados = filtrados.filter(d => d.nota === vNota);`
);

// 3. limparFiltrosDiarias: add diaria-filtro-nota
content = content.replace(
  /const idsSel = \['diaria-filtro-mes', 'diaria-filtro-status', 'diaria-filtro-setor'\];/,
  `const idsSel = ['diaria-filtro-mes', 'diaria-filtro-status', 'diaria-filtro-setor', 'diaria-filtro-nota'];`
);

// 4. renderConsolidadoDiarias: format currency
content = content.replace(
  /CONSOL_DATA_NOTAS\.forEach\(n => \{/g,
  `const formatMoeda = (val) => {
      if (!val) return 'R$ 0,00';
      if (val.toString().includes('R$')) return val;
      let num = parseFloat(val.toString().replace(/\\./g, '').replace(',', '.'));
      if (isNaN(num)) return val;
      return num.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    };
    CONSOL_DATA_NOTAS.forEach(n => {`
);

content = content.replace(
  /<td style="padding:12px; color:#cbd5e1;">\$\{n\.empenhado\}<\/td>/,
  `<td style="padding:12px; color:#cbd5e1;">\${formatMoeda(n.empenhado)}</td>`
);

content = content.replace(
  /<td style="padding:12px; color:#3b82f6; font-weight:bold;">\$\{n\.saldoLiquido\}<\/td>/,
  `<td style="padding:12px; color:#3b82f6; font-weight:bold;">\${formatMoeda(n.saldoLiquido)}</td>`
);

fs.writeFileSync('js/diarias.js', content);
console.log('Fixed filters and formatting!');
