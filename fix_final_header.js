const fs = require('fs');

function finalFix() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Fix the Detalhado: it's calling getCommonHeaderFixedBlock which doesn't exist. 
  // Replace it with getCommonHeader
  app = app.replace(/\$\{getCommonHeaderFixedBlock\('RELATÓRIO DETALHADO DE PROCESSOS'\)\}/g, 
                    '${getCommonHeader(\'RELATÓRIO DETALHADO DE PROCESSOS\')}');
  
  // Fix the Analise: the outer wrapper still has getCommonHeader in thead which is the old broken pattern
  // The Analise outer html still wraps with outer table. Let's check and fix it.
  const oldAnaliseOuter = `<thead><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>\${getCommonHeader('ANÁLISE GERENCIAL')}</td></tr></thead>
        <tbody><tr class="no-page-break" style="page-break-inside: avoid; break-inside: avoid;"><td>`;
  const newAnaliseOuter = `<thead><tr><td style="border:none;">\${getCommonHeader('ANÁLISE GERENCIAL')}</td></tr></thead>
        <tbody><tr><td>`;
  app = app.replace(oldAnaliseOuter, newAnaliseOuter);

  // Fix Padrao: make sure the thead ONLY has column headers (no common header row)
  // Already done in previous fix. Let's verify the Padrao thead structure is clean.
  // At line 1159: <thead>\n<tr> (with column headers) - Good, the getCommonHeader row was removed.
  
  // Put the common header as a separate div BEFORE the table in Padrao
  // Find the html template for padrao and inject getCommonHeader before the table  
  const oldPadraoHtml = `      const html = \`
          <table class="print-table-detalhado"`;
  const newPadraoHtml = `      const html = \`
          \${getCommonHeader('Lista de Processos')}
          <table class="print-table-detalhado"`;
  app = app.replace(oldPadraoHtml, newPadraoHtml);

  // For Analise, extract from outer table pattern - check if there's an outer table wrapper
  // The Analise html likely wraps in a table. Let's check for the pattern and remove the outer wrapper
  // Instead, just put getCommonHeader directly and content in divs.
  
  // CSS fixes: remove the body margin-top we added (it causes issues with screen layout)
  const cssPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css';
  let css = fs.readFileSync(cssPath, 'utf8');
  css = css.replace('  body { margin-top: 18mm !important; }\n', '');
  
  // Instead, add a print margin at the top only for the print containers
  // which are .print-only-layout
  if (!css.includes('.print-only-layout')) {
    css = css.replace('@media print {\n  * { font-family: Arial, sans-serif !important; }',
      '@media print {\n  * { font-family: Arial, sans-serif !important; }\n  .print-only-layout { padding-top: 0; }');
  }
  
  fs.writeFileSync(cssPath, css, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/css/style.css', css, 'utf8');
  
  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');
  console.log('Final fix applied');
}

finalFix();
