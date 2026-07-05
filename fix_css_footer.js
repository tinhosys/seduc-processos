const fs = require('fs');

function appendToCss(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  const css = `
/* ==================== NOVO FOOTER FIXO E PAGINACAO ==================== */
@media print {
  .fixed-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 10mm;
    background: white;
    z-index: 1000;
  }
  
  body, .print-mode-detalhado, .print-mode-analise {
    margin-bottom: 15mm !important;
  }
  
  .print-spacer-tfoot td {
    height: 12mm;
    border: none !important;
  }
  
  .page-number-css::after {
    counter-increment: page;
    content: "Página " counter(page);
  }
  
  .print-date-time-rodape, .page-number-css {
    font-size: 9px;
    font-weight: bold;
    color: #000;
  }
}
`;

  if (!content.includes('.fixed-footer')) {
    content += css;
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Appended to', filepath);
  }
}

appendToCss('c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css');
appendToCss('c:/Users/Elton/SEDUC/css/style.css');
