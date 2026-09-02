const fs = require('fs');
let content = fs.readFileSync('js/auth-sap.js', 'utf8');

// I will just use regex to remove } } } }
content = content.replace(/\}\r?\n\s*\}\r?\n\s*\}\r?\n\s*\}\r?\n\r?\n\/\/ Exibe a tela de login/, `}\n  }\n}\n\n// Exibe a tela de login`);
fs.writeFileSync('js/auth-sap.js', content);
