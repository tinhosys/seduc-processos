const fs = require('fs');

function injectFunction() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Inject formatNumberOnly right before imprimirPadrao
  if (!app.includes('window.formatNumberOnly =')) {
    const injection = `
window.formatNumberOnly = function(valor) {
  if (typeof valor !== 'number') return '0,00';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
`;
    app = app.replace('window.imprimirPadrao = function() {', injection + '\nwindow.imprimirPadrao = function() {');
  }
  
  // Update the calls inside imprimirPadrao and imprimirDetalhado to use window.formatNumberOnly
  // Actually, standard formatNumberOnly should be fine since it's on window.
  
  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('Function formatNumberOnly injected successfully');
}

injectFunction();
