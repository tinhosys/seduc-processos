const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove current filtro-digito
const filterHTML = '<select id="filtro-digito" multiple style="border-color: rgba(99,102,241,0.5); color: #818cf8;">\n              <option value="">DIGITO</option>\n            </select>';
html = html.replace(filterHTML, ''); // It might have different whitespaces, so let's use regex

html = html.replace(/<select id="filtro-digito".*?<\/select>/s, '');

// Insert it after filtro-status
const statusEnd = '<select id="filtro-status" multiple>\n                <option value="">STATUS</option>\n              </select>';
const idx = html.indexOf('<option value="">STATUS</option>');
if (idx !== -1) {
  const endIdx = html.indexOf('</select>', idx) + '</select>'.length;
  const newFilter = '\n              <select id="filtro-digito" multiple style="border-color: rgba(99,102,241,0.5); color: #818cf8;">\n                <option value="">DÍGITO</option>\n              </select>';
  html = html.substring(0, endIdx) + newFilter + html.substring(endIdx);
}

// Fix form-digito label
html = html.replace('<label for="form-digito">DIGITO</label>', '<label for="form-digito">DÍGITO</label>');
html = html.replace('<label for="form-digito">D?gito</label>', '<label for="form-digito">DÍGITO</label>');

fs.writeFileSync('index.html', html, 'utf8');
console.log('done');
