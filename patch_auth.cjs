const fs = require('fs');
let content = fs.readFileSync('js/auth-sap.js', 'utf8');

const regex = /const elRole = document\.getElementById\('user-role'\);[\s\S]*?elRole\.style\.color = '#f59e0b';\s*\}/;
const replacement = `const elRole = document.getElementById('user-role');
  if (elRole) {
    if (nivel === 'adm') {
      elRole.textContent = '👑 Admin';
      elRole.style.color = '#3b82f6';
    } else {
      let setorDisplay = user.setor && user.setor.trim() !== '' ? user.setor : (nivel === 'gerente' ? 'Gerente' : (nivel === 'editor' ? 'Editor' : 'Leitor'));
      elRole.textContent = '🏢 ' + setorDisplay;
      elRole.style.color = nivel === 'gerente' ? '#a78bfa' : (nivel === 'editor' ? '#10b981' : '#f59e0b');
    }
  }`;

content = content.replace(regex, replacement);
fs.writeFileSync('js/auth-sap.js', content);
console.log('patched auth-sap.js');
