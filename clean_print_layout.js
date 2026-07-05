const fs = require('fs');

function cleanPrintLayout() {
  // ===== 1. FIX THE CSS =====
  const cssPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css';
  let css = fs.readFileSync(cssPath, 'utf8');

  // Change @page margin to leave room for browser native header/footer
  css = css.replace('@page { margin: 5mm 15mm; }', '@page { margin: 10mm 10mm; }');
  
  // Remove fixed-header block (we no longer want fixed positioning - it causes the blank space bug)
  css = css.replace(/\.fixed-header \{[\s\S]*?z-index: 1000;\s*\}\s*\n/g, '');
  
  // Remove fixed-footer block completely
  css = css.replace(/\.fixed-footer \{[\s\S]*?z-index: 1000;\s*\}\s*\n/g, '');
  
  // Remove the body margin-bottom for footer
  css = css.replace(/\s*body, \.print-mode-detalhado, \.print-mode-analise \{\s*margin-bottom: 15mm !important;\s*\}/g, '');
  css = css.replace(/\s*body\.print-mode-padrao \{\s*padding: 0 !important;\s*margin: 0 !important;\s*margin-bottom: 15mm !important;\s*\}/g, '');
  
  // Remove print-spacer-tfoot (we no longer need it)
  css = css.replace(/\s*\.print-spacer-tfoot td \{[\s\S]*?\}/g, '');
  
  // Remove page-number-css (browser handles it now)
  css = css.replace(/\s*\.page-number-css::after \{[\s\S]*?\}/g, '');
  css = css.replace(/\s*\.print-date-time-rodape, \.page-number-css \{[\s\S]*?\}/g, '');
  
  // Remove watermark print (hide it)
  css = css.replace(/\.watermark-print \{[\s\S]*?display: block !important;\s*\}/g, '.watermark-print { display: none !important; }');
  
  // Keep the thead repeat rule
  // The key rule: thead { display: table-header-group; } 
  // Let's add it if not present
  if (!css.includes('thead { display: table-header-group')) {
    css = css.replace('@media print {\n  * { font-family: Arial, sans-serif !important; }', 
      '@media print {\n  * { font-family: Arial, sans-serif !important; }\n  thead { display: table-header-group !important; }');
  }

  fs.writeFileSync(cssPath, css, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/css/style.css', css, 'utf8');
  console.log('CSS cleaned');

  // ===== 2. FIX THE JS =====
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Remove the injectFixedFooter calls from all print functions
  app = app.replace(/\s*injectFixedFooter\(\);\n/g, '\n');
  
  // Remove updatePrintDateTime calls (no more custom footer)
  // Keep it for the header though - let's keep the date in the header
  // Actually let's keep it - it updates the date in the header's .print-date-time-rodape span
  
  // Remove the injectFixedFooter function body (keep the shell but make it do nothing)
  const oldFooterFunc = /function injectFixedFooter\(\) \{[\s\S]*?document\.body\.appendChild\(footer\);\s*\}\s*\}/;
  app = app.replace(oldFooterFunc, 'function injectFixedFooter() { /* Removed - using browser native footer */ }');
  
  // Remove the fixed-print-footer div from the HTML (in case it was already created)
  // Also remove the print-spacer-tfoot rows since we no longer need the spacer
  app = app.replace(/<tfoot class="print-spacer-tfoot">[\s\S]*?<\/tfoot>/g, '');
  
  // Ensure Padrao thead has logo header inside it for page-1 only.
  // The Padrao table currently has: getCommonHeader ABOVE the table (as a div), then column headers in thead.
  // This is correct! The getCommonHeader div will appear once at top.
  // The thead with only column headers will repeat on every page!
  
  // Similarly for Detalhado - verify the thead only has column headers.
  // The Detalhado has tableHtml with thead containing only <th> rows - GOOD.
  
  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');
  console.log('JS cleaned - footer removed, header will show on page 1 only, column titles repeat via thead');
}

cleanPrintLayout();
