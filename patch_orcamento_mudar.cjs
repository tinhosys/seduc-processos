const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

const replacement = `_guiaAtualGid = gid;

  const viewConsolidado = document.getElementById('orc-view-consolidado');
  const viewDespesas = document.getElementById('orc-view-despesas');
  if (gid === '807660383') {
     if(viewConsolidado) viewConsolidado.style.display = 'none';
     if(viewDespesas) viewDespesas.style.display = 'block';
  } else {
     if(viewConsolidado) viewConsolidado.style.display = 'block';
     if(viewDespesas) viewDespesas.style.display = 'none';
  }
`;

// There are multiple `_guiaAtualGid = gid;` ? Only one inside `mudarGuiaOrcamento`.
content = content.replace(/_guiaAtualGid = gid;/, replacement);

fs.writeFileSync(file, content);
console.log('Patched mudarGuiaOrcamento');
