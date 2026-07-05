const fs = require('fs');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Change SEI URL to the exact one requested by the user
  const oldUrl = 'https://sei.sistemas.ro.gov.br/sip/login.php?sigla_orgao_sistema=RO&sigla_sistema=SEI';
  const newUrl = 'https://sei.sistemas.ro.gov.br/sei/controlador.php?acao=procedimento_controlar&acao_origem=principal&acao_retorno=principal&inicializando=1&infra_sistema=100000100&infra_unidade_atual=110008268&infra_hash=d21768fa97496caf47af7dad12ce01c9dfbff08550ea48792fd19b301e3848a0';
  
  if (content.includes(oldUrl)) {
    content = content.replace(oldUrl, newUrl);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Fixed', filepath);
  } else {
    console.log('URL not found in', filepath);
  }
}

fixFile('c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js');
fixFile('c:/Users/Elton/SEDUC/js/app.js');
