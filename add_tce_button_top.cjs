const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const oldActions = '<button type="submit" class="btn btn-success">💾 Salvar Processo</button>';
const newActions = `<button type="button" onclick="gerarEExibirManifestoTCEAtual()" class="btn" style="background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; font-weight:700; border:none; box-shadow:0 3px 10px rgba(59,130,246,0.35);">📜 Manifesto TCE-RO</button>\n                <button type="submit" class="btn btn-success">💾 Salvar Processo</button>`;

if (html.includes(oldActions) && !html.includes('gerarEExibirManifestoTCEAtual()')) {
  html = html.replace(oldActions, newActions);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('index.html updated with Manifesto TCE-RO top button.');
}
