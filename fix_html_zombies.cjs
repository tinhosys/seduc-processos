const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/Y"O/g, '👁');
html = html.replace(/Formulǭrio/g, 'Formulário');
html = html.replace(/Y'/g, '👤');
html = html.replace(/Parǽmetros/g, 'Parâmetros');

// Fix app.js just in case
let app = fs.readFileSync('js/app.js', 'utf8');
app = app.replace(/Y"O/g, '👁');
app = app.replace(/Formulǭrio/g, 'Formulário');

fs.writeFileSync('index.html', html);
fs.writeFileSync('js/app.js', app);
console.log('fixed html zombies');
