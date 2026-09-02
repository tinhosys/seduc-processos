const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /(<h2 style="[^"]*">Trocar Senha<\/h2>)/;
const replacement = `$1
            <div id="info-usuario-senha" style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); border-radius: 8px; padding: 12px; margin-bottom: 24px; text-align: center; color: #93c5fd;">
              <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;" id="senha-usuario-nome"></div>
              <div style="font-size: 12px; opacity: 0.8;" id="senha-usuario-whatsapp"></div>
            </div>`;

html = html.replace(regex, replacement);
fs.writeFileSync('index.html', html);
console.log('patched senha html');
