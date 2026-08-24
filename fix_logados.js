const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the <script> block for abrirLogados that I added previously
const regexScript = /function abrirLogados\(\) \{[\s\S]*?\}[\s\S]*?<\/script>/;
const newScript = `function abrirLogados() {
  let usuario = null;
  try {
    const raw = sessionStorage.getItem('sap_user_data') || localStorage.getItem('sap_user_data');
    if (raw) usuario = JSON.parse(raw);
  } catch(e) {}
  
  if (!usuario || (usuario.nivel !== 'adm' && usuario.role !== 'adm' && (!usuario.role || usuario.role.toLowerCase() !== 'administrador'))) {
    alert("Acesso Negado: Apenas Administradores podem visualizar as sessões de usuários logados.");
    return;
  }
  
  const tbody = document.getElementById('tbody-logados');
  tbody.innerHTML = '';
  
  // Buscar a data de acesso na aba acessos (listaAcessos)
  let dataAcesso = usuario.data;
  if (typeof window.listaAcessos !== 'undefined' && Array.isArray(window.listaAcessos)) {
      const u = window.listaAcessos.find(x => x.whatsapp === usuario.whatsapp || x.nome === usuario.nome);
      if (u && u.data) {
          dataAcesso = u.data;
      }
  }
  
  if (!dataAcesso) {
      dataAcesso = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');
  }

  // Tentar parsear DD/MM/YYYY HH:MM
  let start = new Date();
  const m = String(dataAcesso).match(/(\\d{2})\\/(\\d{2})\\/(\\d{4}) (\\d{2}):(\\d{2})(:(\\d{2}))?/);
  if (m) {
      start = new Date(m[3], m[2]-1, m[1], m[4], m[5], m[7] || 0);
  }

  const now = new Date();
  let diffMs = now.getTime() - start.getTime();
  if (diffMs < 0) diffMs = 0;

  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSec = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  const tempoLogado = \`\${diffHoras.toString().padStart(2, '0')}:\${diffMin.toString().padStart(2, '0')}:\${diffSec.toString().padStart(2, '0')}\`;

  const tr = document.createElement('tr');
  tr.innerHTML = \`
    <td style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); color:#e2e8f0;">\${usuario.nome || 'Admin'}</td>
    <td style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); color:#e2e8f0;">\${String(dataAcesso).split(' ')[0]}</td>
    <td style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); color:#e2e8f0;">\${String(dataAcesso).split(' ')[1] || '-'}</td>
    <td style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); color:#34d399; font-weight:700;">\${tempoLogado}</td>
  \`;
  
  tbody.appendChild(tr);
  
  document.getElementById('modal-logados').style.display = 'flex';
}
</script>`;

html = html.replace(regexScript, newScript);
fs.writeFileSync('index.html', html, 'utf8');
console.log('Script abrirLogados updated');
