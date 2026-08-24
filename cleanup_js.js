const fs = require('fs');
let js = fs.readFileSync('js/proalfa.js', 'utf8');

// Remove reference to proalfa-docentes in preencherCombosProalfa
js = js.replace("if (isDoc) { \n    fill('proalfa-docentes', new Set([...docSet].sort((a,b)=>Number(a)-Number(b)))); \n    document.getElementById('proalfa-docentes').disabled = false; \n  } else { \n    document.getElementById('proalfa-docentes').innerHTML='<option value=\"\">N/A</option>'; \n    document.getElementById('proalfa-docentes').disabled = true; \n  }", "");

// Remove reference to proalfa-docentes in filtrarProalfa
js = js.replace("const filterDoc = document.getElementById('proalfa-docentes').value;", "");
js = js.replace("if(isDoc && filterDoc && String(r[8]) !== String(filterDoc)) return false;", "");

fs.writeFileSync('js/proalfa.js', js, 'utf8');
console.log('js/proalfa.js cleaned up');
