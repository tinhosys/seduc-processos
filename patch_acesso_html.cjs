const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Hide form by default
content = content.replace(/<form id="form-acesso" [^>]*>/, `<form id="form-acesso" onsubmit="salvarAcessoForm(event)" style="display: none; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; align-items: flex-end; transition: all 0.3s ease; background: rgba(0,0,0,0.2); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.05);">`);

// 2. Add 'GERENTE' to options
content = content.replace(/<option value="editor">.*?EDITOR<\/option>/, `<option value="editor">✏️ EDITOR</option>\n                  <option value="gerente">💼 GERENTE</option>`);

// 3. Add 'Setor' field between Nivel and Senha
const setorField = `
              <div class="form-group" style="margin: 0;">
                <label for="acesso-setor" style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:var(--text-secondary);">Setor</label>
                <input type="text" id="acesso-setor" style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:6px; font-size:14px; background:#475569; color:white; outline:none; height: 40px; box-sizing: border-box;" placeholder="Ex: GDSM" disabled>
              </div>
`;
content = content.replace(/(<div class="form-group"[^>]*>\s*<label for="acesso-senha"[^>]*>Senha \([^)]+\)<\/label>)/, setorField + '\n$1');

// 4. Change header from 'Administrador' to user's 'Setor'
// (Already done dynamically in JS, but I'll make sure it's updated correctly in JS)

fs.writeFileSync('index.html', content);
console.log('patched index.html for acesso form');
