const fs = require('fs');

function fix() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Add date formatting function
  if (!app.includes('getFormattedDateForTitle')) {
    const fn = `
function getFormattedDateForTitle() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return \`\${d}\${m}\${y}_\${h}\${min}\${s}\`;
}
`;
    app = app.replace('function getCommonHeader', fn + '\nfunction getCommonHeader');
  }

  // Remove top border line under header (magenta line in first image)
  app = app.replace(/border-bottom:2px solid #000;/g, '');

  // Modify footer line to have 1 line, and font size -2pts (7px)
  app = app.replace(/border-top:1px solid #000;/g, 'border-top:2px solid #000;');
  app = app.replace(/font-size:9px;/g, 'font-size:7px;');

  // Imprimir Padrao Title
  app = app.replace(/window\.print\(\);/g, (match, offset, str) => {
    // Only target the one in imprimirPadrao
    const context = str.substring(Math.max(0, offset - 100), offset);
    if (context.includes('padrao-header-subtitle')) {
      return `const orig = document.title;
    document.title = 'CAM_PADRAO_' + getFormattedDateForTitle();
    window.print();
    setTimeout(() => document.title = orig, 1000);`;
    }
    return match;
  });

  // Imprimir Detalhado Title
  app = app.replace(/document\.body\.classList\.remove\('print-mode-analise'\);\s*window\.print\(\);/g, `document.body.classList.remove('print-mode-analise');
    const orig = document.title;
    document.title = 'CAM_DETALHADO_' + getFormattedDateForTitle();
    window.print();
    setTimeout(() => document.title = orig, 1000);`);

  // Imprimir Analitico Title
  app = app.replace(/document\.body\.classList\.remove\('print-mode-detalhado'\);\s*window\.print\(\);/g, `document.body.classList.remove('print-mode-detalhado');
    const orig = document.title;
    document.title = 'CAM_ANALITICO_' + getFormattedDateForTitle();
    window.print();
    setTimeout(() => document.title = orig, 1000);`);

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  // Fix CSS
  const cssPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css';
  let css = fs.readFileSync(cssPath, 'utf8');

  // Prevent wrapping in Processo column
  if (!css.includes('.col-numero { white-space: nowrap !important; }')) {
    css += `\n@media print { .col-numero { white-space: nowrap !important; } }\n`;
  }
  
  // Also we want to ensure `Páginas 1/4` uses CSS `counter(pages)`. 
  // Let's replace the fixed "/1" if present
  css = css.replace(/content:\s*"Páginas\s*"\s*counter\(page\)\s*"\/1";/g, 'content: "Páginas " counter(page) "/" counter(pages);');

  fs.writeFileSync(cssPath, css, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/css/style.css', css, 'utf8');

  console.log('Fixed');
}

fix();
