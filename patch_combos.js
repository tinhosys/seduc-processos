const fs = require('fs');
let js = fs.readFileSync('js/proalfa.js', 'utf8');

// Update preencherCombosProalfa
js = js.replace('const depSet = new Set();', 'const depSet = new Set();\n  const docSet = new Set();');
js = js.replace('if(r[5]) depSet.add(r[5]);', 'if(r[5]) depSet.add(r[5]);\n    if(isDoc && r[8]) docSet.add(r[8]);');

// wait, I need to know if it's isDoc inside preencherCombosProalfa
js = js.replace('function preencherCombosProalfa() {', 'function preencherCombosProalfa() {\n  const isDoc = TAB_CONFIG.find(t => t.id === currentTabProalfa)?.type === "docentes";');

js = js.replace("fill('proalfa-dep', depSet);", "fill('proalfa-dep', depSet);\n  if (isDoc) { fill('proalfa-docentes', new Set([...docSet].sort((a,b)=>Number(a)-Number(b)))); document.getElementById('proalfa-docentes').disabled = false; } else { document.getElementById('proalfa-docentes').innerHTML='<option value=\"\">N/A</option>'; document.getElementById('proalfa-docentes').disabled = true; }");

// Update filtrarProalfa
js = js.replace("const filterDep = document.getElementById('proalfa-dep').value;", "const filterDep = document.getElementById('proalfa-dep').value;\n  const filterDoc = document.getElementById('proalfa-docentes').value;");
js = js.replace("if(filterDep && r[5] !== filterDep) return false;", "if(filterDep && r[5] !== filterDep) return false;\n    if(isDoc && filterDoc && String(r[8]) !== String(filterDoc)) return false;");

fs.writeFileSync('js/proalfa.js', js, 'utf8');
console.log('Patched combos logic');
