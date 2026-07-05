const fs = require('fs');
let app = fs.readFileSync('public/js/app.js', 'utf8');

app = app.replace(
  '<a href="https://sei.sistemas.ro.gov.br/sip/login.php?sigla_orgao_sistema=RO&sigla_sistema=SEI"',
  '<a href="https://sei.sistemas.ro.gov.br/sei/controlador.php?acao=procedimento_trabalhar&acao_origem=protocolo_pesquisa_rapida&id_protocolo=68568320&infra_sistema=100000100&infra_unidade_atual=110008268&infra_hash=480961f09a8ca1ab98f7a5b1998830ddbb95e5ababa825f2b5b00e556946d40b"'
);

fs.writeFileSync('public/js/app.js', app, 'utf8');
console.log('App.js SEI link updated');
