const fs = require('fs');
let js = fs.readFileSync('js/app.js', 'utf8');

// The issue: formatCurrency returns "R$ 201.202.201,48"
// The code does: formatCurrency(valorTotal).replace('R$ ', '')
// BUT the browser's toLocaleString with pt-BR uses a NON-BREAKING SPACE between R$ and the value
// So the replace('R$ ', '') doesn't match.
// Fix: strip everything before and including the first space (or just use a regex)

js = js.replace(
  `if (el) el.innerHTML = \`<span>R$</span> <span>\${formatCurrency(valorTotal).replace('R$ ', '')}</span>\`;`,
  `if (el) el.innerHTML = \`<span>R$</span> <span>\${formatCurrency(valorTotal).replace(/^R\\\$\\s*/u, '')}</span>\`;`
);

// Also fix line 3263 which has "R$ ${formatCurrency(...)}" - double R$
js = js.replace(
  `R\$ \${formatCurrency(p.valorOf)}`,
  `\${formatCurrency(p.valorOf)}`
);

fs.writeFileSync('js/app.js', js, 'utf8');
console.log('app.js fixed - R$ duplicate removed');

// Version bump in index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v1\.1\.04/g, 'v1.1.05');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Version bumped to v1.1.05');
