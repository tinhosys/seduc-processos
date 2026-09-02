const fs = require('fs');

const logic = `
window.getCategoryBadge = function(categoria) {
  if (!categoria) return '';
  const char = String(categoria).trim().toUpperCase()[0];
  if (char === 'F') {
    return \`<span class="badge-cat badge-cat-f" title="Categoria: Fomento" style="margin-left: 4px; padding: 2px 6px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">F</span>\`;
  }
  if (char === 'C') {
    return \`<span class="badge-cat badge-cat-c" title="Categoria: Convênio" style="margin-left: 4px; padding: 2px 6px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">C</span>\`;
  }
  if (char === 'O') {
    return \`<span class="badge-cat badge-cat-o" title="Categoria: Outro" style="margin-left: 4px; padding: 2px 6px; background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">O</span>\`;
  }
  if (char === 'T') {
    return \`<span class="badge-cat badge-cat-t" title="Categoria: Termo de Cooperação" style="margin-left: 4px; padding: 2px 6px; background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">T</span>\`;
  }
  return '';
};

window.getTypeBadge = function(tipo) {
  if (!tipo) return '';
  const char = String(tipo).trim().toUpperCase();
  if (char === 'OB') {
    return \`<span class="badge-tipo badge-tipo-ob" title="Tipo: Obras" style="margin-left: 4px; padding: 2px 6px; background: rgba(6, 182, 212, 0.15); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">OB</span>\`;
  }
  if (char === 'MP') {
    return \`<span class="badge-tipo badge-tipo-mp" title="Tipo: Material Permanente" style="margin-left: 4px; padding: 2px 6px; background: rgba(249, 115, 22, 0.15); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">MP</span>\`;
  }
  if (char === 'MC') {
    return \`<span class="badge-tipo badge-tipo-mc" title="Tipo: Material de Consumo" style="margin-left: 4px; padding: 2px 6px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">MC</span>\`;
  }
  if (char === 'SI') {
    return \`<span class="badge-tipo badge-tipo-si" title="Tipo: Sistema" style="margin-left: 4px; padding: 2px 6px; background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">SI</span>\`;
  }
  if (char === 'TR') {
    return \`<span class="badge-tipo badge-tipo-tr" title="Tipo: Treinamento" style="margin-left: 4px; padding: 2px 6px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">TR</span>\`;
  }
  if (char === 'OUT' || char === 'OU') {
    return \`<span class="badge-tipo badge-tipo-out" title="Tipo: Outros" style="margin-left: 4px; padding: 2px 6px; background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 4px; font-size: 11px; font-weight: 700; cursor: default;">OUT</span>\`;
  }
  return '';
};
`;

let js = fs.readFileSync('js/app.js', 'utf8');
js += logic;
fs.writeFileSync('js/app.js', js);
console.log('patched badges');
