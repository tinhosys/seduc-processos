const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the Parâmetros tab
content = content.replace(/<li class="tab-link" onclick="mudarAbaDiarias\('parametros', this\)"[^>]*>Par.*metros<\/li>/g, '');

// 2. Add #diarias-tab-consolidado
if (!content.includes('id="diarias-tab-consolidado"')) {
  const target = '<div id="diarias-tab-gerar" style="display:none;">';
  const inject = `
    <!-- ABA CONSOLIDADO -->
    <div id="diarias-tab-consolidado" style="display:none;"></div>
  `;
  content = content.replace(target, inject + '\n' + target);
}

// 3. Update mudarAbaDiarias logic
content = content.replace(
  /const gerar = document.getElementById\('diarias-tab-gerar'\);\s*const lista = document.getElementById\('diarias-tab-lista'\);/g,
  "const gerar = document.getElementById('diarias-tab-gerar');\n    const lista = document.getElementById('diarias-tab-lista');\n    const consol = document.getElementById('diarias-tab-consolidado');"
);

content = content.replace(
  /if \(gerar\) gerar.style.display = aba === 'gerar' \? 'block' : 'none';\s*if \(lista\) lista.style.display = aba !== 'gerar' \? 'block' : 'none';/g,
  `if (gerar) gerar.style.display = aba === 'gerar' ? 'block' : 'none';
    if (lista) lista.style.display = (aba === 'estadual' || aba === 'federal') ? 'block' : 'none';
    if (consol) consol.style.display = aba === 'consolidado' ? 'block' : 'none';`
);

fs.writeFileSync(file, content);
console.log('Patched index.html');
