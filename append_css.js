const fs = require('fs');
fs.appendFileSync('css/style.css', `
/* Congelar coluna Prefixo */
.table-wrap th[data-sort="prefixo"], .table-wrap td.col-prefixo {
  position: sticky;
  left: 0;
  z-index: 10;
  background-color: var(--surface);
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}
.process-row:hover td.col-prefixo {
  background-color: rgba(255, 255, 255, 0.05);
}
`);
