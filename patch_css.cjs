const fs = require('fs');
let content = fs.readFileSync('css/style.css', 'utf8');

const regex = /\/\* ==================== CONTROLE DE ACESSO \(ADM ONLY\) ==================== \*\/\s*body:not\(\.role-adm\) \.action-adm \{\s*display: none !important;\s*\}/;
const replacement = `/* ==================== CONTROLE DE ACESSO (ADM ONLY) ==================== */
body:not(.role-adm) .action-adm {
  display: none !important;
}

/* ==================== CONTROLE DE ACESSO (REPORTS - ADM/GERENTE ONLY) ==================== */
body:not(.role-adm):not(.role-gerente) .action-report {
  display: none !important;
}`;

content = content.replace(regex, replacement);
fs.writeFileSync('css/style.css', content);
console.log('patched css');
