const fs = require('fs');

function applyFixedHeader() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // STRATEGY: 
  // 1. Create a separate fixed-header div (like the old fixed-footer) via injectFixedHeader()
  // 2. The header div has position:fixed; top:0 in @media print CSS
  // 3. Add a print margin-top on the print containers (padding-top:22mm) so content doesn't hide under header
  // 4. The data table thead only repeats column headers (already set up)

  // Restore injectFixedFooter as injectFixedHeader
  // Add a new function injectPrintHeader() to app.js
  const headerFunc = `
function injectPrintHeader(subtitle) {
  // Create or update the fixed print header (repeats on all pages via CSS)
  let header = document.getElementById('fixed-print-header');
  if (!header) {
    header = document.createElement('div');
    header.id = 'fixed-print-header';
    header.className = 'print-only fixed-print-header-el';
    document.body.appendChild(header);
  }
  const now = new Date();
  const d = now.toLocaleDateString('pt-BR');
  const t = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  header.innerHTML = \`
    <div style="display:flex; justify-content:space-between; align-items:center; padding: 3mm 5mm 3mm 5mm; border-bottom: 1px solid #999; background:white; width:100%;">
      <img src="img/logo-seduc.png" style="height:28px;">
      <div style="text-align:right; font-family:Arial, sans-serif;">
        <div style="font-size:9px; font-weight:bold; color:#000;">CAM - COORDENAÇÃO DE ARTICULAÇÃO COM OS MUNICÍPIOS</div>
        <div style="font-size:9px; font-weight:bold; color:#000;">\${subtitle.toUpperCase()}</div>
        <div style="font-size:7px; color:#555; font-style:italic;">\${d} / \${t}</div>
      </div>
    </div>
  \`;
}

`;

  // Insert this function before window.imprimirPadrao
  if (!app.includes('function injectPrintHeader(')) {
    app = app.replace('window.imprimirPadrao = function() {', headerFunc + 'window.imprimirPadrao = function() {');
  }

  // Call injectPrintHeader in each print function
  app = app.replace('window.imprimirPadrao = function() {\n', 
                    'window.imprimirPadrao = function() {\n      injectPrintHeader(\'Lista de Processos\');\n      updatePrintDateTime();\n');
  
  // For Detalhado - already has updatePrintDateTime, add injectPrintHeader
  app = app.replace('window.imprimirDetalhado = function() {\n  updatePrintDateTime();', 
                    'window.imprimirDetalhado = function() {\n  injectPrintHeader(\'Relatório Detalhado de Processos\');\n  updatePrintDateTime();');

  // For Analise
  app = app.replace('window.imprimirAnalise = function() {\n  updatePrintDateTime();', 
                    'window.imprimirAnalise = function() {\n  injectPrintHeader(\'Análise Gerencial\');\n  updatePrintDateTime();');

  // Remove the old getCommonHeader call from the Padrao html template (since header is now fixed)
  // The old code: `${getCommonHeader('Lista de Processos')}\n          <table class=...`
  // Replace with just the table
  app = app.replace(
    '          ${getCommonHeader(\'Lista de Processos\')}\n          <table class="print-table-detalhado"',
    '          <table class="print-table-detalhado" style="margin-top:0;"'
  );

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');
  console.log('Fixed print header added to JS');

  // ===== 2. UPDATE CSS =====
  const cssPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css';
  let css = fs.readFileSync(cssPath, 'utf8');

  // Add fixed-print-header-el rule
  const fixedHeaderCss = `
  /* ====== CABECALHO FIXO QUE REPETE EM TODAS AS PAGINAS ====== */
  .fixed-print-header-el {
    display: none;
  }
  @media print {
    .fixed-print-header-el {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: white;
      z-index: 9999;
    }
    @page { margin-top: 25mm; margin-bottom: 10mm; margin-left: 10mm; margin-right: 10mm; }
  }
`;

  // Inject before the last @media print block
  if (!css.includes('fixed-print-header-el')) {
    css += fixedHeaderCss;
    fs.writeFileSync(cssPath, css, 'utf8');
    fs.writeFileSync('c:/Users/Elton/SEDUC/css/style.css', css, 'utf8');
    console.log('Fixed header CSS added');
  }
}

applyFixedHeader();
