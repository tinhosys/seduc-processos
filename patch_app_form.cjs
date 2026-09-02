const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

const replacement = `
  fillSelect('list-status', STATUS_LIST, '');
  fillSelect('list-localizacao', LOCALIZACAO_LIST, '');
  if(document.getElementById('form-status')) document.getElementById('form-status').value = p.status || '';
  if(document.getElementById('form-localizacao')) document.getElementById('form-localizacao').value = p.localizacao || '';
`;

const regex = /fillSelect\('form-status',\s*STATUS_LIST,\s*p\.status\s*\|\|\s*''\);\s*fillSelect\('form-localizacao',\s*LOCALIZACAO_LIST,\s*p\.localizacao\s*\|\|\s*''\);/m;

content = content.replace(regex, replacement);
fs.writeFileSync('js/app.js', content);
console.log('patched app.js form population');
