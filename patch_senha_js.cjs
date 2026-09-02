const fs = require('fs');
let js = fs.readFileSync('js/auth-sap.js', 'utf8');

// We need to inject the population logic into the function that opens the page, or just right before we call API.
// Actually, `navegar('senha')` is what opens the page. But we can just populate it when navigating or globally on load.
// Wait, `aplicarPermissoes(nivel)` is called on load and sets up UI.
// Let's just create a global function or modify the submit.
// We can just populate it inside `alterarSenha()` because it grabs `sessionStorage.getItem('sap_user_data')`.

const alterarSenhaMatch = /async function alterarSenha\(\) \{[\s\S]*?const token = sessionStorage\.getItem\("sap_session_token"\) \|\| localStorage\.getItem\("sap_session_token"\);/;

js = js.replace(alterarSenhaMatch, `async function alterarSenha() {
  const msg = document.getElementById('page-senha-msg');
  const senhaAtual = document.getElementById('page-senha-atual').value;
  const novaSenha = document.getElementById('page-nova-senha').value;
  const confirmaSenha = document.getElementById('page-confirma-senha').value;

  if (!senhaAtual || !novaSenha || !confirmaSenha) {
    msg.style.color = '#ef4444';
    msg.textContent = 'Preencha todos os campos.';
    return;
  }

  if (novaSenha !== confirmaSenha) {
    msg.style.color = '#ef4444';
    msg.textContent = 'A nova senha e a confirmação não conferem.';
    return;
  }

  if (novaSenha.length !== 4) {
    msg.style.color = '#ef4444';
    msg.textContent = 'A nova senha deve ter exatamente 4 números.';
    return;
  }

  if (novaSenha[0].repeat(4) === novaSenha) {
    msg.style.color = '#ef4444';
    msg.textContent = 'A nova senha não pode ser números repetidos (ex: 1111).';
    return;
  }

  const token = sessionStorage.getItem("sap_session_token") || localStorage.getItem("sap_session_token");`);

// Now modify the fetch body to include whatsapp
js = js.replace(/body: JSON\.stringify\(\{ senhaAtual, novaSenha \}\)/, `body: JSON.stringify({ senhaAtual, novaSenha, whatsapp: (JSON.parse(sessionStorage.getItem("sap_user_data") || localStorage.getItem("sap_user_data") || "{}")).whatsapp })`);

fs.writeFileSync('js/auth-sap.js', js);
console.log('patched senha api call');
