const fs = require('fs');

function applyHeaderRepeatFix() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // STRATEGY: Move the common header OUT of the <thead> table rows.
  // Instead, place it in a separate <div> with position:fixed on the page,
  // OR use a simpler approach: put the header in a SEPARATE outer wrapper table
  // that's NOT part of the data table, and let the browser repeat the column-header row (just th).
  
  // The REAL issue in the screenshot is: The page is a blank white space at top, THEN content.
  // This happens because the fixed-footer with position:fixed is taking space,
  // AND the getCommonHeader div inside <thead><tr><td> causes blank space at page breaks
  // because the browser tries to repeat the ENTIRE thead (including the 15mm tall logo header)
  // on each page, pushing the content DOWN.
  
  // SOLUTION: 
  // 1. Take the common header ROW out of <thead> and put it in a SEPARATE fixed header div (like the footer)
  // 2. Only keep the column-headers (th row) inside <thead>
  // 3. Set print margin-top to account for the fixed header height
  
  // The CSS already has a fixed-footer. Let's add a fixed-header similarly.
  
  // Step 1: In app.js, change the imprimirPadrao to inject a fixed-header div for the logo/title
  // and remove it from the <thead>
  
  // Fix imprimirPadrao thead - remove the common header row from thead
  const oldPadraoThead = `            <thead>
            <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td colspan="9" style="border:none;">\${getCommonHeader('Lista de Processos')}</td></tr>
            <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">`;
  const newPadraoThead = `            <thead>
            <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">`;
  app = app.replace(oldPadraoThead, newPadraoThead);

  // Fix imprimirDetalhado tableHtml thead - remove common header row from thead 
  const oldDetalhadoThead = `            <thead>
            <tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;">
              <th style="color:#000000; border: 1px solid #ccc; border-top: none; padding: 2px; text-align:center; width:3%; font-size:12px; font-weight:bold;">Nº</th>`;
  
  // This one is already correct - no common header in it. Good.
  
  // Fix imprimirDetalhado outer html - remove common header from outer table thead  
  const oldDetalhadoOuterThead = `    <table style="width:100%; font-family: Arial, sans-serif;">
      <thead><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>\${getCommonHeader('RELATÓRIO DETALHADO DE PROCESSOS')}</td></tr></thead>
      <tbody><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>
        \${cardsHtml}
        \${tableHtml}
        \${execSummaryHtml}
      </td></tr></tbody>
      <tfoot class="print-spacer-tfoot"><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td></td></tr></tfoot>
    </table>`;
  const newDetalhadoOuterHtml = `    \${getCommonHeaderFixedBlock('RELATÓRIO DETALHADO DE PROCESSOS')}
    <div style="margin-top: 20mm;">
      \${cardsHtml}
      \${tableHtml}
      \${execSummaryHtml}
    </div>`;
  app = app.replace(oldDetalhadoOuterThead, newDetalhadoOuterHtml);
  
  // Fix imprimirAnalise similarly
  // Also inject the fixed header function
  
  // Add the injectFixedHeader function after getCommonHeader function
  const headerFunc = `
function injectFixedHeader(subtitle) {
  let header = document.getElementById('fixed-print-header');
  if (!header) {
    header = document.createElement('div');
    header.id = 'fixed-print-header';
    header.className = 'print-only fixed-header';
    document.body.appendChild(header);
  }
  header.innerHTML = getCommonHeader(subtitle);
}
`;
  if (!app.includes('function injectFixedHeader')) {
    app = app.replace('function getCommonFooter()', headerFunc + 'function getCommonFooter()');
  }
  
  // Add CSS for fixed-print-header
  const cssPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css';
  let css = fs.readFileSync(cssPath, 'utf8');
  
  if (!css.includes('.fixed-header')) {
    css = css.replace('.fixed-footer {', `.fixed-header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 18mm;
      background: white;
      z-index: 1000;
    }
    
    .fixed-footer {`);
    
    // Add margin to the content to avoid header overlap
    css = css.replace('@media print {\n  * { font-family: Arial, sans-serif !important; }', 
      '@media print {\n  * { font-family: Arial, sans-serif !important; }\n  body { margin-top: 18mm !important; }');
    
    fs.writeFileSync(cssPath, css, 'utf8');
    fs.writeFileSync('c:/Users/Elton/SEDUC/css/style.css', css, 'utf8');
  }

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');
  console.log('Header repeat fix applied');
}

applyHeaderRepeatFix();
