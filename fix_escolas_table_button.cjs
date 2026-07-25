const fs = require('fs');
const path = require('path');

const escolasPath = path.join(__dirname, 'js', 'escolas.js');
let code = fs.readFileSync(escolasPath, 'utf8');

// Replace table action column rendering so the primary Editar button opens abrirModalEditarEscola(gi)
const oldActions = /'<td style="text-align:center;" onclick="event\.stopPropagation\(\)">' \+\s*'<div style="display:flex;gap:4px;justify-content:center;">'[\s\S]*?<\/td>'/;

const newActions = `'<td style="text-align:center;" onclick="event.stopPropagation()">' +
  '<div style="display:flex;gap:6px;justify-content:center;">' +
    '<button onclick="abrirModalEditarEscola(' + gi + ')" title="Editar Dados da Escola" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);border:none;border-radius:6px;color:#ffffff;padding:6px 14px;cursor:pointer;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(139,92,246,0.3);">✏️ Editar</button>' +
  '</div>' +
'</td>'`;

if (code.match(oldActions)) {
  code = code.replace(oldActions, newActions);
  console.log('Table action column updated to call abrirModalEditarEscola(gi).');
} else {
  console.log('Pattern not matched directly, applying fallback replacement.');
  // Fallback regex replacement
  code = code.replace(
    /abrirProcessoFormEscola\(' \+ gi \+ '\)/g,
    "abrirModalEditarEscola(' + gi + ')"
  );
}

fs.writeFileSync(escolasPath, code, 'utf8');
console.log('js/escolas.js updated successfully.');
