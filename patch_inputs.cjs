const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regexStatus = /<select id="form-status"><\/select>/;
const replacementStatus = `<input type="text" id="form-status" list="list-status" autocomplete="off" placeholder="Selecione ou digite..." style="width: 100%; padding: 11px; background: rgba(0,0,0,0.1); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 13px;">\n                <datalist id="list-status"></datalist>`;

const regexLocal = /<select id="form-localizacao"><\/select>/;
const replacementLocal = `<input type="text" id="form-localizacao" list="list-localizacao" autocomplete="off" placeholder="Selecione ou digite..." style="width: 100%; padding: 11px; background: rgba(0,0,0,0.1); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 13px;">\n                <datalist id="list-localizacao"></datalist>`;

content = content.replace(regexStatus, replacementStatus);
content = content.replace(regexLocal, replacementLocal);

fs.writeFileSync('index.html', content);
console.log('patched index.html inputs');
