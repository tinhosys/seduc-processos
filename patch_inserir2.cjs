const fs = require('fs');
let content = fs.readFileSync('js/diarias.js', 'utf8');

const target = `  if (typeof toast === 'function') toast('Diária registrada localmente!', 'success');
  else alert('Registrado com sucesso!');
};`;

const inject = `
  // --- INTEGRAÇÃO GOOGLE SHEETS (APPS SCRIPT) ---
  // A URL abaixo deve ser a URL gerada ao publicar o script no Google Apps Script.
  // Como exemplo (para fins de protótipo), o código usa uma URL ilustrativa.
  // Instruções de backend fornecidas no artifact.
  const WEB_APP_URL = 'SUBSTITUA_PELA_SUA_URL_DO_APPS_SCRIPT';
  
  if (WEB_APP_URL !== 'SUBSTITUA_PELA_SUA_URL_DO_APPS_SCRIPT') {
    if (typeof toast === 'function') toast('Enviando para a planilha oficial...', 'info');
    fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataSaida, nome, cpf, cidade, processo: proc, motivo, valor
      })
    }).then(() => {
      if (typeof toast === 'function') toast('Salvo na planilha com sucesso!', 'success');
    }).catch(err => {
      console.error(err);
      if (typeof toast === 'function') toast('Erro ao salvar na planilha.', 'error');
    });
  } else {
    if (typeof toast === 'function') toast('Diária registrada apenas localmente!', 'success');
  }
};`;

content = content.replace(target, inject);
fs.writeFileSync('js/diarias.js', content);
console.log('fetch code added!');
