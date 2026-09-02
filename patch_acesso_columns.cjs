const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

const regex = /listaAcessos = await res\.json\(\);/;
const replacement = `listaAcessos = await res.json();
    
    // Correção temporária para o caso do backend retornar colunas deslocadas (devido à inserção da coluna Setor na planilha)
    listaAcessos = listaAcessos.map(u => {
      // Se a coluna 'senha' está retornando 1 ou 0 (que é o padrão de bloqueado/liberado), sabemos que deslocou.
      if (u.senha === 1 || u.senha === 0 || u.senha === '1' || u.senha === '0') {
        return {
          ...u,
          setor: u.status,
          status: (u.senha == 1 || String(u.senha).toLowerCase() === 'liberado') ? 'liberado' : 'bloqueado',
          senha: u.contagem,
          contagem: u.data,
          data: 'N/D' // Data foi cortada pelo backend que limita a A:G
        };
      }
      return u;
    });`;

content = content.replace(regex, replacement);
fs.writeFileSync('js/app.js', content);
console.log('patched acesso columns');
