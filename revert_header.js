const fs = require('fs');

function revertToSingleHeader() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Remove injectPrintHeader calls from all 3 print functions
  app = app.replace(/\s*injectPrintHeader\('[^']*'\);\n/g, '\n');
  
  // Remove the injectPrintHeader function itself
  app = app.replace(/\nfunction injectPrintHeader\(subtitle\) \{[\s\S]*?header\.innerHTML[\s\S]*?\};\n\}\n\n/g, '\n');

  // Restore the common header ABOVE the Padrao table (as a div, page 1 only)
  // Currently: `<table class="print-table-detalhado" style="margin-top:0;">
  // Restore to: `${getCommonHeader('Lista de Processos')}\n<table class="print-table-detalhado"
  app = app.replace(
    `          <table class="print-table-detalhado" style="margin-top:0;"`,
    `          \${getCommonHeader('Lista de Processos')}\n          <table class="print-table-detalhado"`
  );

  // Remove fixed header div from DOM (clean up any lingering fixed-print-header div)
  // Add cleanup in all print functions after window.print()
  // Actually, let's just make the injectPrintHeader function a no-op if it still exists
  if (app.includes('function injectPrintHeader(')) {
    app = app.replace(/function injectPrintHeader\(subtitle\) \{[\s\S]*?\n\}\n/, 
                      'function injectPrintHeader(subtitle) { /* disabled */ }\n');
  }

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');
  console.log('Reverted to single header');

  // ===== FIX CSS =====
  const cssPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css';
  let css = fs.readFileSync(cssPath, 'utf8');

  // Remove the fixed-print-header-el block
  css = css.replace(/\n\s*\/\* ====== CABECALHO FIXO[\s\S]*?@media print \{\s*@page \{ margin-top: 25mm[\s\S]*?\}\s*\}/g, '');

  // Restore @page to landscape with normal margins
  css = css.replace(/@page \{ margin-top: 25mm; margin-bottom: 10mm; margin-left: 10mm; margin-right: 10mm; \}/g, '');

  fs.writeFileSync(cssPath, css, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/css/style.css', css, 'utf8');
  console.log('CSS reverted');
}

revertToSingleHeader();
