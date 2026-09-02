const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<button type="button" id="btn-toggle-form-processo".*?<\/button>/s, `<button type="button" id="btn-toggle-form-processo" onclick="toggleFormProcesso()" class="btn btn-ghost btn-sm" style="border: 1px solid var(--border); padding: 8px 12px; height: 38px; border-radius: 8px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
              &#128065; <span class="btn-text">Ocultar Formulário</span>
            </button>`);

html = html.replace(/<button type="button" id="btn-toggle-form-acesso".*?<\/button>/s, `<button type="button" id="btn-toggle-form-acesso" onclick="toggleFormAcesso()" class="btn btn-ghost btn-sm" style="border: 1px solid var(--border); padding: 4px 10px; font-size: 12px; font-weight: 600; text-transform: none; letter-spacing: normal; cursor: pointer;">
              &#128065; <span class="btn-text">Ocultar</span>
            </button>`);

fs.writeFileSync('index.html', html);
console.log('fixed html buttons');
