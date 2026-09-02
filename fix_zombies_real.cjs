const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<button type="button" id="btn-toggle-form-processo"[\s\S]*?<\/button>/, `<button type="button" id="btn-toggle-form-processo" onclick="toggleFormProcesso()" class="btn btn-ghost btn-sm" style="border: 1px solid var(--border); padding: 8px 12px; height: 38px; border-radius: 8px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
              👁 <span class="btn-text">Ocultar Formulário</span>
            </button>`);

html = html.replace(/<button type="button" id="btn-toggle-form-acesso"[\s\S]*?<\/button>/, `<button type="button" id="btn-toggle-form-acesso" onclick="toggleFormAcesso()" class="btn btn-ghost btn-sm" style="border: 1px solid var(--border); padding: 4px 10px; font-size: 12px; font-weight: 600; text-transform: none; letter-spacing: normal; cursor: pointer;">
              👁 <span class="btn-text">Ocultar</span>
            </button>`);

html = html.replace(/title="Mostrar\/Ocultar[\s\S]*?"/g, 'title="Mostrar/Ocultar Parâmetros"');

// Fix "Nvel" in form labels if there are still any left
html = html.replace(/Nvel/g, 'Nível');
html = html.replace(/nǧmeros/g, 'números');
html = html.replace(/Aes/g, 'Ações');

fs.writeFileSync('index.html', html);

let js = fs.readFileSync('js/app.js', 'utf8');
js = js.replace(/<span class="btn-text">Ocultar Formul.*?<\/span>/g, '<span class="btn-text">Ocultar Formulário</span>');
js = js.replace(/<span class="btn-text">Mostrar Formul.*?<\/span>/g, '<span class="btn-text">Mostrar Formulário</span>');
fs.writeFileSync('js/app.js', js);
console.log('fixed zombies real');
