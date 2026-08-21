let contatosData = [];
let contatosDataFiltrados = [];

function initContatos() {
  const btn = document.querySelector('.nav-item[data-page="contatos"]');
  if(btn) {
    btn.addEventListener('click', () => {
      
      
      
      
      if (contatosData.length === 0) {
        carregarContatos();
      } else {
        renderContatos(); // Always re-render to update schools/students sums
      }
    });
  }
}

async function carregarContatos(force = false) {
  const badgeStatus = document.getElementById('contatos-badge-status');
  if (badgeStatus) {
    badgeStatus.innerHTML = '⏳ Carregando...';
    badgeStatus.style.background = 'rgba(251,191,36,0.12)';
    badgeStatus.style.color = '#fbbf24';
  }
  
  try {
    const sheetId = '1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08';
    const gid = '1855271818';
    const url = 'https://docs.google.com/spreadsheets/d/' + sheetId + '/gviz/tq?tqx=out:json&headers=1&gid=' + gid + '&nocache=' + Date.now();
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao carregar planilha");
    const text = await res.text();
    
    // Parse the GViz JSON
    const jsonStr = text.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, '');
    const data = JSON.parse(jsonStr);
    
    if (!data || !data.table || data.status === 'error' || !data.table.rows) {
      throw new Error("Formato de dados invalido");
    }
    
    contatosData = data.table.rows.map(row => {
      const c = row.c;
      if (!c || c.length === 0) return null;
      const val = (idx) => (c[idx] && c[idx].v !== null) ? String(c[idx].v).trim() : '';
      if (!val(0) || val(0).toUpperCase() === 'MUNICIPIO' || val(0).toUpperCase() === 'MUNICÍPIO') return null; // Header
      
      return {
        id: val(0), // Using municipio as ID
        municipio: val(0),
        nomePrefeito: val(1),
        celularPrefeito: val(2),
        nomeSecretario: val(3),
        celularSecretario: val(4),
        email: val(5),
        observacoes: val(6)
      };
    }).filter(x => x !== null);
    
    // Sort A-Z by municipio
    contatosData.sort((a, b) => (a.municipio || "").localeCompare(b.municipio || ""));
    
    contatosDataFiltrados = [...contatosData];
    renderContatos();
    
    if (badgeStatus) {
      badgeStatus.innerHTML = '✅ Sincronizado';
      badgeStatus.style.background = 'rgba(16,185,129,0.15)';
      badgeStatus.style.color = '#34d399';
    }
    const badgeTotal = document.getElementById('contatos-badge-total');
    if (badgeTotal) badgeTotal.innerHTML = "👥 " + contatosData.length + " Contatos";
    
  } catch (err) {
    console.error(err);
    if (badgeStatus) {
      badgeStatus.innerHTML = '❌ Erro';
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

function formatarTelefones(telefoneStr) {
  if (!telefoneStr) return '<span style="color:var(--text-muted);font-style:italic;">Não informado</span>';
  
  const partes = String(telefoneStr).split(/[\n/,&]+| e /i);
  let html = '';
  partes.forEach(p => {
    let rawNum = p.replace(/\D/g, '');
    if (!rawNum) return;
    
    if (rawNum.length === 8) {
      rawNum = '699' + rawNum;
    } else if (rawNum.length === 9) {
      rawNum = '69' + rawNum;
    } else if (rawNum.length === 10) {
      rawNum = '699' + rawNum.substring(2);
    } else if (rawNum.length > 11) {
      rawNum = rawNum.substring(rawNum.length - 11);
    }
    
    let formatted = rawNum;
    if (rawNum.length === 11) {
      formatted = `(${rawNum.substring(0,2)}) ${rawNum.substring(2,3)} ${rawNum.substring(3,7)}-${rawNum.substring(7,11)}`;
    }
    
    let wplink = `<a href="https://wa.me/55${rawNum}" target="_blank" title="WhatsApp" style="color:#25D366;text-decoration:none;margin-left:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg></a>`;
    
    html += `<div style="display:flex;align-items:center;font-size:13px;color:var(--text-primary);margin-top:4px;">${formatted}${wplink}</div>`;
  });
  return html;
}

function calcularAgregados(municipio) {
  if (typeof _escolasCache === 'undefined' || !_escolasCache || _escolasCache.length === 0) {
    return { escolas: 0, alunos: 0 };
  }
  
  const nomeMun = (municipio || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/d'oeste/ig, "do oeste").replace(/['\\\-]/g, "").replace(/\s+/g, "").toLowerCase();
  const escolasDoMun = _escolasCache.filter(e => {
    const eMunNorm = (e.municipio || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/d'oeste/ig, "do oeste").replace(/['\\\-]/g, "").replace(/\s+/g, "").toLowerCase();
    const isMun = (e.competencia === "Municipal" || String(e.competencia || "").toLowerCase().trim() === "municipal");
    return (eMunNorm === nomeMun) && isMun;
  });
  
  const ineps = new Set();
  let totalAlunos = 0;
  
  escolasDoMun.forEach(e => {
    if (e.codigoInep) {
       if (!ineps.has(e.codigoInep)) {
         ineps.add(e.codigoInep);
         if (typeof _calcTotalAlunos === 'function') {
           totalAlunos += _calcTotalAlunos(e);
         } else {
           totalAlunos += Number(e.totalMatricula) || 0;
         }
       }
    }
  });
  
  return { escolas: ineps.size, alunos: totalAlunos };
}

function renderContatos() {
  const tbody = document.querySelector('#contatos-table tbody');
  if (!tbody) return;
  
  if (contatosDataFiltrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:48px;color:var(--text-muted);">Nenhum contato encontrado.</td></tr>`;
    return;
  }
  
  let msgAgregando = "";
  if (typeof _escolasCache === 'undefined' || !_escolasCache || _escolasCache.length === 0) {
     msgAgregando = `<tr style="background:rgba(251,191,36,0.05);"><td colspan="7" style="text-align:center;padding:8px;font-size:12px;color:#d97706;">Aguardando dados das escolas para calcular totais...</td></tr>`;
  }
  
  tbody.innerHTML = msgAgregando + contatosDataFiltrados.map(c => {
    const ag = calcularAgregados(c.municipio);
    const htmlPrefeitoPhones = formatarTelefones(c.celularPrefeito);
    const htmlSecretarioPhones = formatarTelefones(c.celularSecretario);
    
    return `
      <tr style="cursor:pointer;" onclick="abrirModalContato('${c.id}')">
        <td style="font-weight:600;">${c.municipio || '-'}</td>
        <td style="vertical-align:top;">
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-weight:700;color:var(--text-primary);">${c.nomePrefeito || '-'}</span>
            <div style="display:flex;flex-direction:column;gap:2px;">
              ${htmlPrefeitoPhones}
            </div>
          </div>
        </td>
        <td style="vertical-align:top;">
          <div style="display:flex;flex-direction:column;gap:4px;">
            <span style="font-weight:700;color:var(--text-primary);">${c.nomeSecretario || '-'}</span>
            <div style="display:flex;flex-direction:column;gap:2px;">
              ${htmlSecretarioPhones}
            </div>
          </div>
        </td>
        <td style="vertical-align:top;">${c.email || '-'}</td>
        <td style="text-align:center;font-weight:bold;color:#3b82f6;vertical-align:top;font-size:16px;">${ag.escolas}</td>
        <td style="text-align:center;font-weight:bold;color:#10b981;vertical-align:top;font-size:16px;">${ag.alunos.toLocaleString('pt-BR')}</td>
        <td style="text-align:center;vertical-align:top;" class="action-editor action-adm">
          <button class="btn btn-outline" style="padding:6px 12px;font-size:13px;" onclick="event.stopPropagation(); abrirModalContato('${c.id}')">✏️ Editar</button>
        </td>
      </tr>
    `;
  }).join('');
}

function fecharModalContato() {
  const modal = document.getElementById('modal-contato-overlay');
  if (modal) modal.style.display = 'none';
}

function abrirModalContato(id) {
  const modal = document.getElementById('modal-contato-overlay');
  if (!modal) return;
  
  if (!id) {
    // Novo contato
    document.getElementById('modal-contato-titulo').innerHTML = '<span>➕</span> Novo Contato';
    document.getElementById('contato-id').value = '';
    document.getElementById('contato-municipio').value = '';
    document.getElementById('contato-prefeito').value = '';
    document.getElementById('contato-cel-prefeito').value = '';
    document.getElementById('contato-secretario').value = '';
    document.getElementById('contato-cel-secretario').value = '';
    document.getElementById('contato-email').value = '';
    document.getElementById('contato-obs').value = '';
    document.getElementById('contato-qtde-escolas').textContent = '0';
    document.getElementById('contato-qtde-alunos').textContent = '0';
    document.getElementById('btn-excluir-contato-container').style.display = 'none';
  } else {
    // Editar contato existente
    const c = contatosData.find(x => x.id === id);
    if (c) {
      document.getElementById('modal-contato-titulo').innerHTML = '<span>✏️</span> Editar Contato';
      document.getElementById('contato-id').value = c.id;
      document.getElementById('contato-municipio').value = c.municipio || '';
      document.getElementById('contato-prefeito').value = c.nomePrefeito || '';
      document.getElementById('contato-cel-prefeito').value = c.celularPrefeito || '';
      document.getElementById('contato-secretario').value = c.nomeSecretario || '';
      document.getElementById('contato-cel-secretario').value = c.celularSecretario || '';
      document.getElementById('contato-email').value = c.email || '';
      document.getElementById('contato-obs').value = c.observacoes || '';
      
      const ag = calcularAgregados(c.municipio);
      document.getElementById('contato-qtde-escolas').textContent = ag.escolas;
      document.getElementById('contato-qtde-alunos').textContent = ag.alunos.toLocaleString('pt-BR');
      document.getElementById('btn-excluir-contato-container').style.display = 'block';
    }
  }
  
  modal.style.display = 'flex';
}

async function salvarContato() {
  alert('Funcionalidade de salvar (ainda) não implementada para leitura direta.');
  fecharModalContato();
}

async function excluirContato() {
  if(!confirm("Tem certeza que deseja excluir este contato definitivamente?")) return;
  alert('Funcionalidade de exclusão (ainda) não implementada para leitura direta.');
  fecharModalContato();
}

document.addEventListener('DOMContentLoaded', () => {
  initContatos();
  if ((typeof _escolasCache === 'undefined' || !_escolasCache || _escolasCache.length === 0) && typeof iniciarPaginaEscolas === 'function') {
    iniciarPaginaEscolas();
  }
  // Se a aba de contatos for aberta logo de inicio, o cache de escolas pode estar vazio
  // Entao a cada 5 segundos re-renderizamos a tela se a aba contatos estiver ativa
  setInterval(() => {
    const page = document.getElementById('page-contatos');
    if (page && page.classList.contains('active')) {
      renderContatos();
    }
  }, 5000);
});







