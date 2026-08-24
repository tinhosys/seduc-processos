const fs = require('fs');
let js = fs.readFileSync('js/app.js', 'utf8');

// 1. "Total: " string removal
// if (el) el.textContent = `Total: ${formatCurrency(valorTotal)}`;
const totalRegex = /if \(el\) el\.textContent = `Total: \$\{formatCurrency\(valorTotal\)\}`;/;
const totalReplacement = `if (el) el.innerHTML = \`<span>R$</span> <span>\${formatCurrency(valorTotal).replace('R$ ', '')}</span>\`;`;
js = js.replace(totalRegex, totalReplacement);

// 2. "registros" string modification
// if (elQtd) elQtd.textContent = `${total.toLocaleString('pt-BR')} ${total === 1 ? 'registro' : 'registros'}`;
const qtdRegex = /if \(elQtd\) elQtd\.textContent = `\$\{total\.toLocaleString\('pt-BR'\)\} \$\{total === 1 \? 'registro' : 'registros'\}`;/;
const qtdReplacement = `if (elQtd) elQtd.textContent = \`\${total.toLocaleString('pt-BR')} \${total === 1 ? 'Processo' : 'Processos'}\`;`;
js = js.replace(qtdRegex, qtdReplacement);

fs.writeFileSync('js/app.js', js, 'utf8');
console.log('js/app.js updated');
