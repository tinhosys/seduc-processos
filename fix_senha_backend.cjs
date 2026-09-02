const fs = require('fs');
let server = fs.readFileSync('planilha-google-form/server.js', 'utf8');

server = server.replace(/const \{ senhaAtual, novaSenha \} = req\.body;/, 'const { senhaAtual, novaSenha, whatsapp } = req.body;');
server = server.replace(/const whatsappSessao = req\.sessao\.whatsapp;/, 'const whatsappSessao = (req.sessao.whatsapp === "admin" && whatsapp) ? whatsapp.replace(/\\D/g, "") : req.sessao.whatsapp.replace(/\\D/g, "");');

fs.writeFileSync('planilha-google-form/server.js', server);
console.log('fixed server.js');
