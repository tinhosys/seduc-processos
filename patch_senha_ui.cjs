const fs = require('fs');
let js = fs.readFileSync('js/auth-sap.js', 'utf8');

js = js.replace(/function aplicarPermissoes\(nivel\) \{/, `function aplicarPermissoes(nivel) {
  try {
    const uData = JSON.parse(sessionStorage.getItem("sap_user_data") || localStorage.getItem("sap_user_data") || "{}");
    const elNome = document.getElementById('senha-usuario-nome');
    const elWa = document.getElementById('senha-usuario-whatsapp');
    if (elNome) elNome.textContent = 'Usuário: ' + (uData.nome || 'Desconhecido');
    if (elWa) elWa.textContent = 'WhatsApp: ' + (uData.whatsapp || '');
  } catch(e) {}`);

fs.writeFileSync('js/auth-sap.js', js);
console.log('patched senha ui labels');
