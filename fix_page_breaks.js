const fs = require('fs');

function applyPageBreakRules() {
  const cssPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css';
  let css = fs.readFileSync(cssPath, 'utf8');

  // Inject break-inside rules to @media print
  if (css.includes('@media print {') && !css.includes('break-inside: avoid')) {
    css = css.replace('@media print {\n  * { font-family: Arial, sans-serif !important; }', 
      '@media print {\n  * { font-family: Arial, sans-serif !important; }\n  tr, .no-page-break { page-break-inside: avoid !important; break-inside: avoid !important; }');
    fs.writeFileSync(cssPath, css, 'utf8');
    fs.writeFileSync('c:/Users/Elton/SEDUC/css/style.css', css, 'utf8');
    console.log('Page break CSS added');
  }

  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Inject break-inside to the Analise divs just to be absolutely certain it works everywhere, or use the class
  // Let's add class="no-page-break" to the div
  app = app.replace(/<div style="border-left:\$\{\(idx % 2 === 0\)/g, '<div class="no-page-break" style="page-break-inside: avoid; break-inside: avoid; border-left:${(idx % 2 === 0)');

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');
  console.log('App.js updated with break-inside inline styles');
}

applyPageBreakRules();
