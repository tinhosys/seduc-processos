const fs = require('fs');

let dados = fs.readFileSync('public/js/dados.js', 'utf8');
dados = dados.replace(/const token = localStorage\.getItem\('sap_token'\);\s*if \(!token\) return;\s*const res = await fetch\('\/api\/registros', \{\s*headers: \{ 'Authorization': 'Bearer ' \+ token \}\s*\}\);\s*if \(res\.status === 401\) \{\s*fazerLogout\(\);\s*return;\s*\}/, "const res = await fetch('/api/registros');");

dados = dados.replace(/headers: \{ \s*'Content-Type': 'application\/json',\s*'Authorization': 'Bearer ' \+ localStorage\.getItem\('sap_token'\)\s*\}/g, "headers: { 'Content-Type': 'application/json' }");
fs.writeFileSync('public/js/dados.js', dados, 'utf8');
console.log('dados.js reverted');

let app = fs.readFileSync('public/js/app.js', 'utf8');
app = app.replace(/\/\/ ===================== AUTENTICAÇÃO E LOGIN =====================[\s\S]*$/, "");
fs.writeFileSync('public/js/app.js', app, 'utf8');
console.log('app.js reverted');
