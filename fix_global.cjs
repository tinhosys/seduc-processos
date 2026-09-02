const fs = require('fs');

function fixFile(file) {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/Formulǭrio/g, 'Formulário');
  text = text.replace(/Parǽmetros/g, 'Parâmetros');
  text = text.replace(/Y'/g, '👤');
  text = text.replace(/Y'\?/g, '👤');
  text = text.replace(/Y"/g, '👁');
  text = text.replace(//g, ''); // strip any remaining replacement chars
  fs.writeFileSync(file, text);
}

fixFile('index.html');
fixFile('js/app.js');
console.log('fixed global');
