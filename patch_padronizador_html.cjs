const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  /Esta ferramenta busca divergências de formatação \(espaços extras, letras minúsculas\) em <u>Status e Localização<\/u>\./,
  'Esta ferramenta busca divergências de formatação (espaços extras, letras minúsculas) em <u>todos os campos de texto</u> da planilha (Status, Localização, Município, Prefixo, Categoria, Tipo, Agrupamento, Interessado, Objeto).'
);

fs.writeFileSync('index.html', html);
console.log('patched html padronizador text');
