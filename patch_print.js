const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const printCss = `
    /* === IMPRIMIR ORCAMENTO === */
    @media print {
      body.print-mode-orcamento {
        background: #0f172a !important; /* Keep dark background */
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color: white !important;
      }
      body.print-mode-orcamento > section:not(#page-orcamento) {
        display: none !important;
      }
      body.print-mode-orcamento .sidebar,
      body.print-mode-orcamento .topbar,
      body.print-mode-orcamento .filters-bar { /* The filters bar has naturezas etc, hide it if we want clean report, but user said "COM OS ITENS EM TELA". We'll keep filters if they want? They probably don't want the filter dropdowns on the report. */
        display: none !important;
      }
      body.print-mode-orcamento #page-orcamento {
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      body.print-mode-orcamento .orc-buttons {
        display: none !important; /* Hide export/planilha buttons */
      }
      /* Ensure flex containers don't wrap terribly if A4 is too narrow */
      @page {
        size: A4 landscape; /* Landscape is better for these cards and tables */
        margin: 10mm;
      }
    }
`;
html = html.replace('</style>', printCss + '\n  </style>');
fs.writeFileSync('index.html', html, 'utf8');

let js = fs.readFileSync('js/orcamento.js', 'utf8');
const printJs = `
window.imprimirOrcamento = function() {
  document.body.classList.add('print-mode-orcamento');
  
  // Hide buttons container temporarily for print (can't just use CSS if it doesn't have a class)
  const headerDivs = document.querySelectorAll('#page-orcamento > div');
  if (headerDivs.length > 0 && headerDivs[0].querySelector('button')) {
     headerDivs[0].querySelector('div[style*="display:flex"]').classList.add('orc-buttons');
  }

  // Force chart.js to resize for print if needed? Usually window.print() handles it, but just in case.
  setTimeout(() => {
    window.print();
    document.body.classList.remove('print-mode-orcamento');
  }, 100);
};
`;
js = js + '\n' + printJs;
fs.writeFileSync('js/orcamento.js', js, 'utf8');
console.log('Print logic added');
