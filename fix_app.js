const fs = require('fs');
let js = fs.readFileSync('js/app.js', 'utf8');

const regexToggle = /btn\.innerHTML = '\?\? <span class="btn-text">Mostrar Filtros<\/span>';/;
const replacementToggle = `btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polyline></svg> <span class="btn-text">MOSTRAR FILTROS</span>';`;
js = js.replace(regexToggle, replacementToggle);

const regexToggle2 = /btn\.innerHTML = '\?\? <span class="btn-text">Ocultar Filtros<\/span>';/;
const replacementToggle2 = `btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> <span class="btn-text">OCULTAR FILTROS</span>';`;
js = js.replace(regexToggle2, replacementToggle2);

// Also, the user says "Processos 371", place Processos on the left and value on the right
// It was:
// if (elQtd) elQtd.textContent = `${total.toLocaleString('pt-BR')} ${total === 1 ? 'Processo' : 'Processos'}`;
// Change it to:
// if (elQtd) elQtd.innerHTML = `<span>Processos</span> <span>${total.toLocaleString('pt-BR')}</span>`;
const regexQtd = /if \(elQtd\) elQtd\.textContent = `\$\{total\.toLocaleString\('pt-BR'\)\} \$\{total === 1 \? 'Processo' : 'Processos'\}`;/;
const replacementQtd = `if (elQtd) elQtd.innerHTML = \`<span>\${total === 1 ? 'Processo' : 'Processos'}</span> <span>\${total.toLocaleString('pt-BR')}</span>\`;`;
js = js.replace(regexQtd, replacementQtd);

fs.writeFileSync('js/app.js', js, 'utf8');
console.log('js/app.js fixed');
