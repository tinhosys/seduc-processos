const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Insert filter dropdown
const filterAnchor = '<select id="filtro-agrupamento"';
const filterEnd = '</select>';
const idxFilter = html.indexOf(filterAnchor);
if (idxFilter !== -1) {
  const endIdx = html.indexOf(filterEnd, idxFilter) + filterEnd.length;
  const newFilter = '\n            <select id="filtro-digito" multiple style="border-color: rgba(99,102,241,0.5); color: #818cf8;">\n              <option value="">DÍGITO</option>\n            </select>';
  html = html.substring(0, endIdx) + newFilter + html.substring(endIdx);
} else {
  console.log("filterAnchor not found");
}

// 2. Insert form-digito
const formAnchor = '<label for="form-agrupamento">';
const idxForm = html.indexOf(formAnchor);
if (idxForm !== -1) {
  // Find the end of this form-group div
  const nextFormGroup = html.indexOf('<div class="form-group"', idxForm);
  // Wait, let's just find the closing </div> of the agrupamento form-group
  // actually, let's just look for <datalist id="list-agrupamentos"></datalist>\n              </div>
  const dlAnchor = '<datalist id="list-agrupamentos"></datalist>';
  const idxDl = html.indexOf(dlAnchor);
  if (idxDl !== -1) {
    const endDivIdx = html.indexOf('</div>', idxDl) + 6;
    const newForm = '\n\n              <div class="form-group">\n                <label for="form-digito">Dígito</label>\n                <input type="text" id="form-digito" placeholder="000" autocomplete="off" style="width: 100%; padding: 11px; background: rgba(0,0,0,0.1); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary);">\n              </div>';
    html = html.substring(0, endDivIdx) + newForm + html.substring(endDivIdx);
  } else {
    console.log("dlAnchor not found");
  }
} else {
  console.log("formAnchor not found");
}

fs.writeFileSync('index.html', html, 'utf8');
console.log("Done");
