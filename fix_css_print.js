const fs = require('fs');

function appendToCss(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  const css = `
/* ==================== PRINT LAYOUTS (DETALHADO / ANALISE) ==================== */
@media print {
  body.print-mode-detalhado .sidebar,
  body.print-mode-detalhado .topbar,
  body.print-mode-detalhado .section-header,
  body.print-mode-detalhado .filters-bar,
  body.print-mode-detalhado .table-wrap,
  body.print-mode-detalhado .pagination,
  body.print-mode-detalhado #export-buttons,
  body.print-mode-detalhado .charts-grid,
  body.print-mode-detalhado .dashboard,
  body.print-mode-detalhado > section:not(#page-processos) {
    display: none !important;
  }
  
  body.print-mode-detalhado #print-layout-detalhado {
    display: block !important;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background: white;
  }

  body.print-mode-analise .sidebar,
  body.print-mode-analise .topbar,
  body.print-mode-analise .section-header,
  body.print-mode-analise .filters-bar,
  body.print-mode-analise .table-wrap,
  body.print-mode-analise .pagination,
  body.print-mode-analise #export-buttons,
  body.print-mode-analise .charts-grid,
  body.print-mode-analise .dashboard,
  body.print-mode-analise > section:not(#page-processos) {
    display: none !important;
  }

  body.print-mode-analise #print-layout-analise {
    display: block !important;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background: white;
  }
  
  /* Reset padding for print */
  body.print-mode-detalhado, body.print-mode-analise {
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Table borders in detalhado */
  .print-table-detalhado th, .print-table-detalhado td {
    border: 1px solid #ccc !important;
  }
}
`;

  if (!content.includes('print-mode-detalhado')) {
    content += css;
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Appended to', filepath);
  }
}

appendToCss('c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css');
appendToCss('c:/Users/Elton/SEDUC/css/style.css');
