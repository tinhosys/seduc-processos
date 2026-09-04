const fs = require('fs');

function updateJS(file) {
  let js = fs.readFileSync(file, 'utf8');

  js = js.replace(
    "agrupamento: row['AGRUPAMENTO'] || row['agrupamento'] || row['Agrupamento'] || '',",
    "agrupamento: row['AGRUPAMENTO'] || row['agrupamento'] || row['Agrupamento'] || '',\n    digito: row['DIGITO'] || row['digito'] || row['Digito'] || '',"
  );
  
  js = js.replace(
    "agrupamento: row.Agrupamento || row.agrupamento || agrupamentoCalculado,",
    "agrupamento: row.Agrupamento || row.agrupamento || agrupamentoCalculado,\n      digito: row.DIGITO || row.digito || row.Digito || '',"
  );

  fs.writeFileSync(file, js, 'utf8');
}

updateJS('js/dados.js');
console.log('Done data logic');
