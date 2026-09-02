const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/Y'\? <span class="btn-text">Ocultar Formulǭrio<\/span>/g, '&#128065; <span class="btn-text">Ocultar Formulário</span>');
html = html.replace(/Y'\? <span class="btn-text">Ocultar<\/span>/g, '&#128065; <span class="btn-text">Ocultar</span>');
fs.writeFileSync('index.html', html);

let js = fs.readFileSync('js/app.js', 'utf8');
js = js.replace(/ <span class="btn-text">Ocultar Formulǭrio<\/span>/g, '&#128065; <span class="btn-text">Ocultar Formulário</span>');
js = js.replace(/ <span class="btn-text">Mostrar Formulǭrio<\/span>/g, '&#10133; <span class="btn-text">Mostrar Formulário</span>');

js = js.replace(/ <span class="btn-text">Ocultar<\/span>/g, '&#128065; <span class="btn-text">Ocultar</span>');
js = js.replace(/ <span class="btn-text">Mostrar<\/span>/g, '&#10133; <span class="btn-text">Mostrar</span>');

fs.writeFileSync('js/app.js', js);
console.log('done');
