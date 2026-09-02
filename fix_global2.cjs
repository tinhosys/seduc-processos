const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/Formulǭrio/g, 'Formulário');
html = html.replace(/Parǽmetros/g, 'Parâmetros');
fs.writeFileSync('index.html', html);

let js = fs.readFileSync('js/app.js', 'utf8');
js = js.replace(/Formulǭrio/g, 'Formulário');
js = js.replace(/Parǽmetros/g, 'Parâmetros');
fs.writeFileSync('js/app.js', js);
console.log('fixed');
