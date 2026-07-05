const fs = require('fs');
let app = fs.readFileSync('public/js/app.js', 'utf8');

app = app.replace('async function fazerLogin(e) {', 'async function carregarLogins() {\n  try {\n    const res = await fetch(\"/api/logins\");\n    const logins = await res.json();\n    const select = document.getElementById(\"input-login\");\n    if (!select) return;\n    logins.forEach(l => {\n      const opt = document.createElement(\"option\");\n      opt.value = l;\n      opt.textContent = l;\n      select.appendChild(opt);\n    });\n  } catch(e) { console.error(e); }\n}\n\nasync function fazerLogin(e) {');

app = app.replace('const senha = document.getElementById(\"input-senha\").value;', 'const login = document.getElementById(\"input-login\").value;\n  const senha = document.getElementById(\"input-senha\").value;\n  if(!login) { toast(\"Selecione o usuário\", \"error\"); return; }');

app = app.replace('body: JSON.stringify({ senha })', 'body: JSON.stringify({ login, senha })');

app = app.replace('verificarAuth();\n});', 'verificarAuth();\n  carregarLogins();\n});');

fs.writeFileSync('public/js/app.js', app, 'utf8');
console.log('App.js updated');
