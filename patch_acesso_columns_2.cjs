const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

const regex = /listaAcessos = await res\.json\(\);/;
const replacement = `listaAcessos = await res.json();
    
    // Corrige os campos deslocados
    listaAcessos = listaAcessos.map(u => {
      // Se a coluna senha tem 1/0, e a contagem tem a senha real (ex 4791)
      if (u.senha === 1 || u.senha === 0 || u.senha === '1' || u.senha === '0') {
        return {
          ...u,
          status: (u.senha == 1 || String(u.senha).toLowerCase() === 'liberado' || String(u.status).toLowerCase() === 'liberado') ? 'liberado' : 'bloqueado',
          senha: u.contagem,
          contagem: u.data,
          data: 'N/D'
        };
      }
      return u;
    });`;

content = content.replace(regex, replacement);
fs.writeFileSync('js/app.js', content);
console.log('patched columns again');
