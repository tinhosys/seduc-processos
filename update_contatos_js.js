const fs = require('fs');
let js = fs.readFileSync('js/contatos.js', 'utf8');

const oldRender = `function renderContatos() {
  const tbody = document.querySelector('#contatos-table tbody');
  if (!tbody) return;
  
  if (contatosDataFiltrados.length === 0) {
    tbody.innerHTML = \`<tr><td colspan="7" style="text-align:center;padding:48px;color:var(--text-muted);">Nenhum contato encontrado.</td></tr>\`;
    return;
  }
  
  let msgAgregando = "";
  if (typeof _escolasCache === 'undefined' || !_escolasCache || _escolasCache.length === 0) {
     msgAgregando = \`<tr style="background:rgba(251,191,36,0.05);"><td colspan="7" style="text-align:center;padding:8px;font-size:12px;color:#d97706;">Aguardando dados das escolas para calcular totais...</td></tr>\`;
  }
  
  tbody.innerHTML = msgAgregando + contatosDataFiltrados.map(c => {
    const ag = calcularAgregados(c.municipio);
    const htmlPrefeitoPhones = formatarTelefones(c.celularPrefeito);
    const htmlSecretarioPhones = formatarTelefones(c.celularSecretario);
    
    return \`
      <tr style="cursor:pointer;" onclick="abrirModalContato('\${c.id}')">
        <td style="font-weight:600;">\${c.municipio || '-'}</td>
        <td style="vertical-align:top;">
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-weight:700;color:var(--text-primary);">\${c.nomePrefeito || '-'}</span>
            <div style="display:flex;flex-direction:column;gap:2px;">
              \${htmlPrefeitoPhones}
            </div>
          </div>
        </td>
        <td style="vertical-align:top;">
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-weight:700;color:var(--text-primary);">\${c.nomeSecretario || '-'}</span>
            <div style="display:flex;flex-direction:column;gap:2px;">
              \${htmlSecretarioPhones}
            </div>
          </div>
        </td>
        <td style="vertical-align:top;">\${c.email || '-'}</td>
        <td style="text-align:center;font-weight:bold;color:#3b82f6;vertical-align:top;font-size:16px;">\${ag.escolas}</td>
        <td style="text-align:center;font-weight:bold;color:#10b981;vertical-align:top;font-size:16px;">\${ag.alunos.toLocaleString('pt-BR')}</td>
        <td style="text-align:center;vertical-align:top;" class="action-editor action-adm">
          <button class="btn btn-outline" style="padding:6px 12px;font-size:13px;" onclick="event.stopPropagation(); abrirModalContato('\${c.id}')">✏️ Editar</button>
        </td>
      </tr>
    \`;
  }).join('');
}`;

const newRender = `function renderContatos() {
  const tbody = document.querySelector('#contatos-table tbody');
  if (!tbody) return;
  
  let grandTotalEscolas = 0;
  let grandTotalAlunos = 0;
  
  if (contatosDataFiltrados.length === 0) {
    tbody.innerHTML = \`<tr><td colspan="6" style="text-align:center;padding:48px;color:var(--text-muted);">Nenhum contato encontrado.</td></tr>\`;
    
    document.getElementById('contatos-badge-total').innerHTML = "👥 " + contatosDataFiltrados.length + " Municípios";
    document.getElementById('contatos-badge-escolas').innerHTML = "🏫 0 Escolas";
    document.getElementById('contatos-badge-alunos').innerHTML = "🎓 0 Alunos";
    return;
  }
  
  let msgAgregando = "";
  if (typeof _escolasCache === 'undefined' || !_escolasCache || _escolasCache.length === 0) {
     msgAgregando = \`<tr style="background:rgba(251,191,36,0.05);"><td colspan="6" style="text-align:center;padding:8px;font-size:12px;color:#d97706;">Aguardando dados das escolas para calcular totais...</td></tr>\`;
  }
  
  tbody.innerHTML = msgAgregando + contatosDataFiltrados.map(c => {
    const ag = calcularAgregados(c.municipio);
    grandTotalEscolas += ag.escolas;
    grandTotalAlunos += ag.alunos;
    
    const htmlPrefeitoPhones = formatarTelefones(c.celularPrefeito);
    const htmlSecretarioPhones = formatarTelefones(c.celularSecretario);
    
    return \`
      <tr>
        <td style="font-weight:600;">\${c.municipio || '-'}</td>
        <td style="vertical-align:top;">
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-weight:700;color:var(--text-primary);">\${c.nomePrefeito || '-'}</span>
            <div style="display:flex;flex-direction:column;gap:2px;">
              \${htmlPrefeitoPhones}
            </div>
          </div>
        </td>
        <td style="vertical-align:top;">
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-weight:700;color:var(--text-primary);">\${c.nomeSecretario || '-'}</span>
            <div style="display:flex;flex-direction:column;gap:2px;">
              \${htmlSecretarioPhones}
            </div>
          </div>
        </td>
        <td style="vertical-align:top;">\${c.email || '-'}</td>
        <td style="text-align:center;font-weight:bold;color:#3b82f6;vertical-align:top;font-size:16px;">\${ag.escolas}</td>
        <td style="text-align:center;font-weight:bold;color:#10b981;vertical-align:top;font-size:16px;">\${ag.alunos.toLocaleString('pt-BR')}</td>
      </tr>
    \`;
  }).join('');
  
  const badgeTotal = document.getElementById('contatos-badge-total');
  if (badgeTotal) badgeTotal.innerHTML = "👥 " + contatosDataFiltrados.length + " Municípios";
  
  const badgeEscolas = document.getElementById('contatos-badge-escolas');
  if (badgeEscolas) badgeEscolas.innerHTML = "🏫 " + grandTotalEscolas + " Escolas";
  
  const badgeAlunos = document.getElementById('contatos-badge-alunos');
  if (badgeAlunos) badgeAlunos.innerHTML = "🎓 " + grandTotalAlunos.toLocaleString('pt-BR') + " Alunos";
}`;

js = js.replace(oldRender, newRender);

// Also replace the update of total in carregarContatos
js = js.replace(`const badgeTotal = document.getElementById('contatos-badge-total');
    if (badgeTotal) badgeTotal.innerHTML = "👥 " + contatosData.length + " Contatos";`, `const badgeTotal = document.getElementById('contatos-badge-total');
    if (badgeTotal) badgeTotal.innerHTML = "👥 " + contatosData.length + " Municípios";`);

fs.writeFileSync('js/contatos.js', js, 'utf8');
console.log('js/contatos.js updated successfully');
