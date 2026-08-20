let contatosData = [];
let contatosDataFiltrados = [];

function initContatos() {
  const btn = document.querySelector('.nav-item[data-page="contatos"]');
  if(btn) {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
      document.getElementById('page-contatos').style.display = 'block';
      if (contatosData.length === 0) carregarContatos();
    });
  }
}

async function carregarContatos(force = false) {
  const badgeStatus = document.getElementById('contatos-badge-status');
  if (badgeStatus) {
    badgeStatus.innerHTML = '? Carregando...';
    badgeStatus.style.background = 'rgba(251,191,36,0.12)';
    badgeStatus.style.color = '#fbbf24';
  }
  
  try {
    const res = await fetch(API_BASE + '/api/contatos' + (force ? '?t=' + Date.now() : ''));
    if (!res.ok) throw new Error("Erro na API");
    contatosData = await res.json();
    
    // Sort A-Z by municipio
    contatosData.sort((a, b) => (a.municipio || "").localeCompare(b.municipio || ""));
    
    contatosDataFiltrados = [...contatosData];
    renderContatos();
    
    if (badgeStatus) {
      badgeStatus.innerHTML = '? Sincronizado';
      badgeStatus.style.background = 'rgba(16,185,129,0.15)';
      badgeStatus.style.color = '#34d399';
    }
    const badgeTotal = document.getElementById('contatos-badge-total');
    if (badgeTotal) badgeTotal.innerHTML = `?? ${contatosData.length} Contatos`;
    
  } catch (err) {
    console.error(err);
    if (badgeStatus) {
      badgeStatus.innerHTML = '? Erro';
      badgeStatus.style.background = 'rgba(239,68,68,0.15)';
      badgeStatus.style.color = '#ef4444';
    }
  }
}

function filtrarContatos() {
  const q = (document.getElementById('contatos-busca').value || "").toLowerCase();
  if (!q) {
    contatosDataFiltrados = [...contatosData];
  } else {
    contatosDataFiltrados = contatosData.filter(c => {
      return (c.municipio || "").toLowerCase().includes(q) ||
             (c.nomePrefeito || "").toLowerCase().includes(q) ||
             (c.nomeSecretario || "").toLowerCase().includes(q) ||
             (c.email || "").toLowerCase().includes(q);
    });
  }
  renderContatos();
}

function renderContatos() {
  const tbody = document.querySelector('#contatos-table tbody');
  if (!tbody) return;
  
  if (contatosDataFiltrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:48px;color:var(--text-muted);">Nenhum contato encontrado.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = contatosDataFiltrados.map(c => {
    // Generate WhatsApp links
    let wpPrefeito = '';
    if (c.celularPrefeito) {
      const num = String(c.celularPrefeito).replace(/\D/g, '');
      if (num.length >= 10) wpPrefeito = `<a href="https://wa.me/55${num}" target="_blank" title="WhatsApp" style="color:#25D366;text-decoration:none;">??</a>`;
    }
    let wpSecretario = '';
    if (c.celularSecretario) {
      const num = String(c.celularSecretario).replace(/\D/g, '');
      if (num.length >= 10) wpSecretario = `<a href="https://wa.me/55${num}" target="_blank" title="WhatsApp" style="color:#25D366;text-decoration:none;">??</a>`;
    }
    
    return `
      <tr style="cursor:pointer;" onclick="abrirModalContato('${c.id}')">
        <td style="font-weight:600;">${c.municipio || '-'}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px;justify-content:space-between;">
            <span>${c.nomePrefeito || '-'}</span>
            ${wpPrefeito}
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:6px;justify-content:space-between;">
            <span>${c.nomeSecretario || '-'}</span>
            ${wpSecretario}
          </div>
        </td>
        <td>${c.email || '-'}</td>
        <td style="text-align:center;font-weight:bold;">${c.qtdeEscolas || 0}</td>
        <td style="text-align:center;font-weight:bold;">${c.qtdeAlunos || 0}</td>
        <td style="text-align:center;" class="action-editor action-adm">
          <button class="btn btn-outline" style="padding:4px 8px;font-size:12px;" onclick="event.stopPropagation(); abrirModalContato('${c.id}')">?? Editar</button>
        </td>
      </tr>
    `;
  }).join('');
}

function abrirModalContato(id = null) {
  document.getElementById('modal-contato-overlay').style.display = 'flex';
  const form = document.getElementById('form-contato');
  form.reset();
  
  if (id) {
    const c = contatosData.find(x => x.id === id);
    if (c) {
      document.getElementById('modal-contato-titulo').innerHTML = '<span>??</span> Editar Contato';
      document.getElementById('contato-id').value = c.id;
      document.getElementById('contato-municipio').value = c.municipio || '';
      document.getElementById('contato-prefeito').value = c.nomePrefeito || '';
      document.getElementById('contato-cel-prefeito').value = c.celularPrefeito || '';
      document.getElementById('contato-secretario').value = c.nomeSecretario || '';
      document.getElementById('contato-cel-secretario').value = c.celularSecretario || '';
      document.getElementById('contato-email').value = c.email || '';
      document.getElementById('contato-obs').value = c.observacoes || '';
      document.getElementById('contato-qtde-escolas').textContent = c.qtdeEscolas || '0';
      document.getElementById('contato-qtde-alunos').textContent = c.qtdeAlunos || '0';
      document.getElementById('btn-excluir-contato-container').style.display = 'block';
    }
  } else {
    document.getElementById('modal-contato-titulo').innerHTML = '<span>?</span> Novo Contato';
    document.getElementById('contato-id').value = '';
    document.getElementById('contato-qtde-escolas').textContent = '-';
    document.getElementById('contato-qtde-alunos').textContent = '-';
    document.getElementById('btn-excluir-contato-container').style.display = 'none';
  }
}

function fecharModalContato() {
  document.getElementById('modal-contato-overlay').style.display = 'none';
}

async function salvarContato(e) {
  e.preventDefault();
  const id = document.getElementById('contato-id').value;
  const data = {
    municipio: document.getElementById('contato-municipio').value,
    nomePrefeito: document.getElementById('contato-prefeito').value,
    celularPrefeito: document.getElementById('contato-cel-prefeito').value,
    nomeSecretario: document.getElementById('contato-secretario').value,
    celularSecretario: document.getElementById('contato-cel-secretario').value,
    email: document.getElementById('contato-email').value,
    observacoes: document.getElementById('contato-obs').value
  };
  
  const btn = document.getElementById('btn-salvar-contato');
  const txtOrig = btn.textContent;
  btn.textContent = 'Salvando...';
  btn.disabled = true;
  
  try {
    const url = id ? API_BASE + `/api/contatos/${id}` : API_BASE + '/api/contatos';
    const method = id ? 'PUT' : 'POST';
    
    let token = "";
    if (typeof localStorage !== "undefined") {
      const sessaoStr = localStorage.getItem("sessao_gdsm");
      if (sessaoStr) {
        const sess = JSON.parse(sessaoStr);
        token = sess.token;
      }
    }
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) throw new Error("Erro ao salvar contato");
    
    fecharModalContato();
    carregarContatos(true);
  } catch (err) {
    console.error(err);
    alert('Erro ao salvar contato.');
  } finally {
    btn.textContent = txtOrig;
    btn.disabled = false;
  }
}

async function excluirContato() {
  if(!confirm("Tem certeza que deseja excluir este contato definitivamente?")) return;
  const id = document.getElementById('contato-id').value;
  if(!id) return;
  
  try {
    let token = "";
    if (typeof localStorage !== "undefined") {
      const sessaoStr = localStorage.getItem("sessao_gdsm");
      if (sessaoStr) {
        const sess = JSON.parse(sessaoStr);
        token = sess.token;
      }
    }
    const res = await fetch(API_BASE + `/api/contatos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Erro ao excluir");
    fecharModalContato();
    carregarContatos(true);
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir contato");
  }
}

document.addEventListener('DOMContentLoaded', initContatos);


