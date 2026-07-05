const fs = require('fs');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Change SEI URL back to the safe login URL which automatically redirects to the dashboard if logged in.
  const oldUrl = 'https://sei.sistemas.ro.gov.br/sei/controlador.php?acao=procedimento_controlar&infra_sistema=100000100&infra_unidade_atual=110008268&infra_hash=88abf6ab115405904b3374fbe47e5ae0897bd6e44c3793ce3ae4aeb0a68d352ab32e5a19aaa28a0f27c86b7edcaca07b76ca0bbed12ec96eb37b108f84b7ad3ec2a61f6690d5df816fa0bb01627c3a818c56e2f27e8fde42dc486bca667355be';
  const newUrl = 'https://sei.sistemas.ro.gov.br/sip/login.php?sigla_orgao_sistema=RO&sigla_sistema=SEI';
  
  if (content.includes(oldUrl)) {
    content = content.replace(oldUrl, newUrl);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Fixed', filepath);
  }
}

fixFile('c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js');
fixFile('c:/Users/Elton/SEDUC/js/app.js');
