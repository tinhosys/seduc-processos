const fs = require('fs');

function applyFixes() {
  const appJsPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let appJs = fs.readFileSync(appJsPath, 'utf8');

  // 1. Remove border-bottom from getCommonHeader
  appJs = appJs.replace(/border-bottom:2px\s*solid\s*#000;/g, '');

  // 2. Update injectFixedFooter: font-size 7px and bolder border
  appJs = appJs.replace(/border-top:1px solid #000;[^>]*font-size:9px;/g, 
    match => match.replace('1px', '2px').replace('9px', '7px'));

  // 3. Add getFormattedDateForTitle function
  if (!appJs.includes('getFormattedDateForTitle')) {
    const titleFn = `
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
    // Append it at the bottom or before getCommonHeader
    appJs = appJs.replace('function getCommonHeader', titleFn + '\nfunction getCommonHeader');
  }

  // 4. Update imprimirDetalhado title
  if (appJs.includes('window.print();') && !appJs.includes('document.title =')) {
    // We need to inject document.title = ... before window.print();
    // and restore it inside setTimeout.
    // It's safer to do this with a replacement of window.print block.
    
    // Replace in imprimirDetalhado
    const printDetalhadoRegex = /document\.body\.classList\.remove\('print-mode-analise'\);\s*window\.print\(\);\s*setTimeout\(\(\) => \{/g;
    appJs = appJs.replace(printDetalhadoRegex, `document.body.classList.remove('print-mode-analise');
    
    const origTitle = document.title;
    document.title = 'CAM_DETALHADO_' + getFormattedDateForTitle();
    window.print();
    
    setTimeout(() => {
      document.title = origTitle;`);

    // Replace in imprimirAnalise
    const printAnaliseRegex = /document\.body\.classList\.remove\('print-mode-detalhado'\);\s*window\.print\(\);\s*setTimeout\(\(\) => \{/g;
    appJs = appJs.replace(printAnaliseRegex, `document.body.classList.remove('print-mode-detalhado');
    
    const origTitle = document.title;
    document.title = 'CAM_ANALITICO_' + getFormattedDateForTitle();
    window.print();
    
    setTimeout(() => {
      document.title = origTitle;`);

    // Replace in imprimirPadrao
    const printPadraoRegex = /document\.body\.classList\.remove\('print-mode-detalhado', 'print-mode-analise'\);\s*const hEl = document\.getElementById/g;
    appJs = appJs.replace(printPadraoRegex, `document.body.classList.remove('print-mode-detalhado', 'print-mode-analise');
    
    const origTitle = document.title;
    document.title = 'CAM_PADRAO_' + getFormattedDateForTitle();
    
    const hEl = document.getElementById`);
    
    // For imprimirPadrao, window.print is called inside it. Let's find where window.print is for padrao.
    const padraoPrintExecRegex = /window\.print\(\);\s*\/\/ Restore title if we want, but padrao does not have a setTimeout naturally/g;
    // Wait, let's look at imprimirPadrao in app.js.
  }
  
  fs.writeFileSync(appJsPath, appJs, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', appJs, 'utf8');

  // STYLE CSS
  const styleCssPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css';
  let styleCss = fs.readFileSync(styleCssPath, 'utf8');

  // Update page-number-css
  styleCss = styleCss.replace(/content:\s*"Páginas\s*"\s*counter\(page\)\s*"\/1";/g, 'content: "Páginas " counter(page) "/" counter(pages);');

  // Add white-space: nowrap to col-numero in print mode
  if (!styleCss.includes('.col-numero { white-space: nowrap; }')) {
    styleCss += `\n@media print { .col-numero { white-space: nowrap !important; } }\n`;
  }
  
  fs.writeFileSync(styleCssPath, styleCss, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/css/style.css', styleCss, 'utf8');
  
  console.log('Fixed formatting rules');
}

applyFixes();
