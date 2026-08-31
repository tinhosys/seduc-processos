const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'css', 'style.css');
let content = fs.readFileSync(file, 'utf8');

const printRules = `

/* ==================== ORCAMENTO PRINT MODE ==================== */
@media print {
  body.print-mode-orcamento {
    background: #fff !important;
    color: #000 !important;
  }
  body.print-mode-orcamento .sidebar,
  body.print-mode-orcamento .topbar,
  body.print-mode-orcamento .orc-buttons,
  body.print-mode-orcamento .section-header {
    display: none !important;
  }
  body.print-mode-orcamento #page-orcamento {
    display: block !important;
    padding: 0 !important;
    background: #fff !important;
  }
  body.print-mode-orcamento .orc-card,
  body.print-mode-orcamento .orc-filters,
  body.print-mode-orcamento .orc-filter-row,
  body.print-mode-orcamento .orc-preset-filters,
  body.print-mode-orcamento .orc-charts,
  body.print-mode-orcamento .orc-chart-box,
  body.print-mode-orcamento .orc-table-container {
    background: #fff !important;
    border: 1px solid #ccc !important;
    box-shadow: none !important;
    color: #000 !important;
    page-break-inside: avoid;
  }
  body.print-mode-orcamento .orc-card-label,
  body.print-mode-orcamento .orc-card-sub,
  body.print-mode-orcamento .orc-filters label,
  body.print-mode-orcamento .orc-preset-filters span {
    color: #333 !important;
  }
  body.print-mode-orcamento .orc-card-value {
    color: #000 !important;
  }
  body.print-mode-orcamento table.orc-table th {
    background: #f1f5f9 !important;
    color: #000 !important;
    border: 1px solid #ccc !important;
  }
  body.print-mode-orcamento table.orc-table td {
    color: #000 !important;
    border: 1px solid #ddd !important;
  }
  body.print-mode-orcamento .orc-filters select,
  body.print-mode-orcamento .orc-preset-btn {
    background: #fff !important;
    color: #000 !important;
    border: 1px solid #999 !important;
  }
}
`;

content += printRules;

fs.writeFileSync(file, content);
console.log('Appended print rules');
