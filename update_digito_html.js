const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Insert Digito input
const targetInput = '<div class="form-group">\n                <label for="form-agrupamento">Agrupamento</label>\n                <input type="text" id="form-agrupamento" placeholder="Digite ou selecione..." list="list-agrupamentos" autocomplete="off" style="width: 100%; padding: 11px; background: rgba(0,0,0,0.1); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary);">\n                <datalist id="list-agrupamentos"></datalist>\n              </div>';
const replacementInput = targetInput + '\n\n              <div class="form-group">\n                <label for="form-digito">Dígito</label>\n                <input type="text" id="form-digito" placeholder="000" autocomplete="off" style="width: 100%; padding: 11px; background: rgba(0,0,0,0.1); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary);">\n              </div>';
html = html.replace(targetInput, replacementInput);

// Insert Digito filter
const targetFilter = '<select id="filtro-agrupamento" multiple style="border-color: rgba(168,85,247,0.5); color: #c084fc;">\n              <option value="">AGRUPAMENTO</option>\n            </select>';
const replacementFilter = targetFilter + '\n            <select id="filtro-digito" multiple style="border-color: rgba(99,102,241,0.5); color: #818cf8;">\n              <option value="">DÍGITO</option>\n            </select>';
html = html.replace(targetFilter, replacementFilter);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Done modifying index.html');
