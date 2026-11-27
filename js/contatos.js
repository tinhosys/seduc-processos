const MAPA_LINHAS_52_MUNICIPIOS = {
  "ALTA FLORESTA DO OESTE": 2,
  "ALTO ALEGRE DOS PARECIS": 3,
  "ALTO PARAISO": 4,
  "ALVORADA DO OESTE": 5,
  "ARIQUEMES": 6,
  "BURITIS": 7,
  "CABIXI": 8,
  "CACAULANDIA": 9,
  "CACAULÂNDIA": 9,
  "CACOAL": 10,
  "CAMPO NOVO DE RONDONIA": 11,
  "CAMPO NOVO DE RONDÔNIA": 11,
  "CANDEIAS DO JAMARI": 12,
  "CASTANHEIRAS": 13,
  "CEREJEIRAS": 14,
  "CHUPINGUAIA": 15,
  "COLORADO DO OESTE": 16,
  "CORUMBIARA": 17,
  "COSTA MARQUES": 18,
  "CUJUBIM": 19,
  "ESPIGAO DO OESTE": 20,
  "ESPIGÃO DO OESTE": 20,
  "GOVERNADOR JORGE TEIXEIRA": 21,
  "GUAJARA MIRIM": 22,
  "GUAJARÁ MIRIM": 22,
  "GUAJARA-MIRIM": 22,
  "GUAJARÁ-MIRIM": 22,
  "ITAPUA DO OESTE": 23,
  "ITAPUÃ DO OESTE": 23,
  "JARU": 24,
  "JI-PARANA": 25,
  "JI-PARANÁ": 25,
  "MACHADINHO D'OESTE": 26,
  "MACHADINHO DO OESTE": 26,
  "MINISTRO ANDREAZZA": 27,
  "MIRANTE DA SERRA": 28,
  "MONTE NEGRO": 29,
  "NOVA BRASILANDIA DO OESTE": 30,
  "NOVA BRASILÂNDIA DO OESTE": 30,
  "NOVA MAMORE": 31,
  "NOVA MAMORÉ": 31,
  "NOVA UNIAO": 32,
  "NOVA UNIÃO": 32,
  "NOVO HORIZONTE DO OESTE": 33,
  "OURO PRETO DO OESTE": 34,
  "PARECIS": 35,
  "PIMENTA BUENO": 36,
  "PIMENTEIRAS DO OESTE": 37,
  "PORTO VELHO": 38,
  "PRESIDENTE MEDICI": 39,
  "PRIMAVERA DE RONDONIA": 40,
  "PRIMAVERA DE RONDÔNIA": 40,
  "RIO CRESPO": 41,
  "ROLIM DE MOURA": 42,
  "SANTA LUZIA DO OESTE": 43,
  "SAO FELIPE DO OESTE": 44,
  "SÃO FELIPE DO OESTE": 44,
  "SAO FRANCISCO DO GUAPORE": 45,
  "SÃO FRANCISCO DO GUAPORÉ": 45,
  "SAO MIGUEL DO GUAPORE": 46,
  "SÃO MIGUEL DO GUAPORÉ": 46,
  "SERINGUEIRAS": 47,
  "TEIXEIROPOLIS": 48,
  "TEIXEIRÓPOLIS": 48,
  "THEOBROMA": 49,
  "URUPA": 50,
  "URUPÁ": 50,
  "VALE DO ANARI": 51,
  "VALE DO PARAISO": 52,
  "VILHENA": 53
};

function getLinhaPlanilhaMunicipio(mun, fallbackIdx) {
  if (!mun) return fallbackIdx || 2;
  const norm = mun.toUpperCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [k, v] of Object.entries(MAPA_LINHAS_52_MUNICIPIOS)) {
    if (k.toUpperCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === norm) {
      return v;
    }
  }
  return fallbackIdx || 2;
}

let contatosData = [];
let contatosDataFiltrados = [];

function initContatos() {
  const btn = document.querySelector('.nav-item[data-page="contatos"]');
  if(btn) {
    btn.addEventListener('click', () => {
      if (contatosData.length === 0) {
        carregarContatos();
      } else {
        renderContatos();
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
    
    contatosData = data.table.rows.map((row, idx) => {
      const c = row.c;
      if (!c || c.length === 0) return null;
      const val = (cIdx) => (c[cIdx] && c[cIdx].v !== null && c[cIdx].v !== undefined) ? String(c[cIdx].v).trim() : '';
      if (!val(0) || val(0).toUpperCase() === 'MUNICIPIO' || val(0).toUpperCase() === 'MUNICÍPIO') return null;
      
      const munNome = val(0);
      const rowNumber = getLinhaPlanilhaMunicipio(munNome, idx + 2);
      
      return {
        id: rowNumber + '_contatos',
        rowNumber: rowNumber,
        municipio: munNome,
        nomePrefeito: val(1),
        celularPrefeito: val(2),
        nomeSecretario: val(3),
        celularSecretario: val(4),
        email: val(5),
        observacoes: val(6),
        qtdeEscolas: val(7),
        qtdeAlunos: val(8)
      };
    }).filter(x => x !== null);
    
    // Aplica alterações salvas localmente
    _aplicarContatosLocais();

    // Ordenar A-Z por município
    contatosData.sort((a, b) => (a.municipio || "").localeCompare(b.municipio || ""));
    
    contatosDataFiltrados = [...contatosData];
    contatosPopulateMunicipioCombo();
    renderContatos();
    
    if (badgeStatus) {
      badgeStatus.innerHTML = '✅ Sincronizado';
      badgeStatus.style.background = 'rgba(16,185,129,0.15)';
      badgeStatus.style.color = '#34d399';
    }
    const badgeTotal = document.getElementById('contatos-badge-total');
    if (badgeTotal) badgeTotal.innerHTML = "👥 " + contatosData.length + " Municípios";
    
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
  
  contatosDataFiltrados = contatosData.filter(c => {
    // Check combo
    if (!contatosSelectedMunicipios.has(c.municipio)) {
      return false;
    }
    
    // Check search
    if (q) {
      return (c.municipio || "").toLowerCase().includes(q) ||
             (c.nomePrefeito || "").toLowerCase().includes(q) ||
             (c.nomeSecretario || "").toLowerCase().includes(q) ||
             (c.email || "").toLowerCase().includes(q);
    }
    return true;
  });
  
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
  
  let grandTotalEscolas = 0;
  let grandTotalAlunos = 0;
  
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
    grandTotalEscolas += ag.escolas;
    grandTotalAlunos += ag.alunos;
    
    const htmlPrefeitoPhones = formatarTelefones(c.celularPrefeito);
    const htmlSecretarioPhones = formatarTelefones(c.celularSecretario);
    const rowNum = c.rowNumber || getLinhaPlanilhaMunicipio(c.municipio, 2);
    
    return `
      <tr>
        <td style="font-weight:600;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:10px; background:rgba(255,255,255,0.06); color:#94a3b8; padding:2px 5px; border-radius:4px; font-family:monospace;" title="Linha na Planilha Google">L${rowNum}</span>
              <span>${c.municipio || '-'}</span>
            </div>
            ${c._custom ? '<span style="font-size:9.5px; background:rgba(16,185,129,0.2); color:#34d399; border:1px solid #34d399; padding:1px 4px; border-radius:3px; font-weight:700;">EDITADO</span>' : ''}
          </div>
        </td>
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
        <td style="text-align:center;vertical-align:middle;" class="action-editor action-adm">
          <button type="button" class="btn btn-ghost" onclick="abrirModalContato('${encodeURIComponent(c.id)}')" style="padding:5px 10px; border-radius:6px; font-size:12px; font-weight:700; color:#38bdf8; border:1px solid rgba(56,189,248,0.4); background:rgba(56,189,248,0.1); cursor:pointer; transition:all 0.2s;" onmouseover="this.style.background='rgba(56,189,248,0.25)'" onmouseout="this.style.background='rgba(56,189,248,0.1)'" title="Editar dados da linha ${rowNum} (${c.municipio})">
            ✏️ Editar
          </button>
        </td>
      </tr>
    `;
  }).join('');
  
  const badgeTotal = document.getElementById('contatos-badge-total');
  if (badgeTotal) badgeTotal.innerHTML = "👥 " + contatosDataFiltrados.length + " Municípios";
  
  const badgeEscolas = document.getElementById('contatos-badge-escolas');
  if (badgeEscolas) badgeEscolas.innerHTML = "🏫 " + grandTotalEscolas + " Escolas";
  
  const badgeAlunos = document.getElementById('contatos-badge-alunos');
  if (badgeAlunos) badgeAlunos.innerHTML = "🎓 " + grandTotalAlunos.toLocaleString('pt-BR') + " Alunos";
}

function fecharModalContato() {
  const modal = document.getElementById('modal-contato-overlay');
  if (modal) modal.style.display = 'none';
}

function abrirModalContato(id) {
  const modal = document.getElementById('modal-contato-overlay');
  if (!modal) return;
  
  const decodedId = id ? decodeURIComponent(id) : '';
  const c = contatosData.find(x => x.id === decodedId || x.municipio === decodedId || String(x.rowNumber) === decodedId);
  if (!c) {
    if (typeof toast === 'function') toast('Selecione um dos 52 municípios para edição.', 'warning');
    return;
  }
  
  const rowNumber = c.rowNumber || getLinhaPlanilhaMunicipio(c.municipio, 2);
  
  const tituloEl = document.getElementById('modal-contato-titulo');
  if (tituloEl) tituloEl.innerHTML = '<span>✏️</span> Edição Direta: ' + (c.municipio || '');
  
  const subtituloEl = document.getElementById('modal-contato-subtitulo');
  if (subtituloEl) subtituloEl.innerHTML = `Aba GID 1855271818 • Linha <strong style="color:#38bdf8;">${rowNumber}</strong> de 53 • Células A${rowNumber} a I${rowNumber}`;
  
  const badgeLinha = document.getElementById('contato-linha-badge');
  if (badgeLinha) badgeLinha.textContent = rowNumber;
  
  const displayLinha = document.getElementById('contato-linha-display');
  if (displayLinha) displayLinha.value = `Linha ${rowNumber}`;
  
  const elId = document.getElementById('contato-id');
  if (elId) elId.value = c.id || (rowNumber + '_contatos');
  
  const elRow = document.getElementById('contato-row-number');
  if (elRow) elRow.value = rowNumber;
  
  const elMun = document.getElementById('contato-municipio');
  if (elMun) {
    elMun.value = c.municipio || '';
    elMun.readOnly = true;
  }
  
  const elPref = document.getElementById('contato-prefeito');
  if (elPref) elPref.value = c.nomePrefeito || '';
  
  const elCelPref = document.getElementById('contato-cel-prefeito');
  if (elCelPref) elCelPref.value = c.celularPrefeito || '';
  
  const elSec = document.getElementById('contato-secretario');
  if (elSec) elSec.value = c.nomeSecretario || '';
  
  const elCelSec = document.getElementById('contato-cel-secretario');
  if (elCelSec) elCelSec.value = c.celularSecretario || '';
  
  const elEmail = document.getElementById('contato-email');
  if (elEmail) elEmail.value = c.email || '';
  
  const elObs = document.getElementById('contato-obs');
  if (elObs) elObs.value = c.observacoes || '';
  
  const ag = calcularAgregados(c.municipio);
  const elQEsc = document.getElementById('contato-qtde-escolas');
  if (elQEsc) elQEsc.textContent = ag.escolas;
  
  const elQAlu = document.getElementById('contato-qtde-alunos');
  if (elQAlu) elQAlu.textContent = ag.alunos.toLocaleString('pt-BR');
  
  const inpEsc = document.getElementById('contato-escolas-input');
  if (inpEsc) inpEsc.value = c.qtdeEscolas || ag.escolas || 0;
  
  const inpAlu = document.getElementById('contato-alunos-input');
  if (inpAlu) inpAlu.value = c.qtdeAlunos || ag.alunos || 0;
  
  modal.style.display = 'flex';
}

function _salvarContatosLocais() {
  try {
    const customOnly = contatosData.filter(c => c._custom);
    localStorage.setItem('seduc_contatos_custom_v1', JSON.stringify(customOnly));
  } catch(e) {
    console.warn('Erro ao persistir contatos no localStorage:', e);
  }
}

function _aplicarContatosLocais() {
  try {
    const raw = localStorage.getItem('seduc_contatos_custom_v1');
    if (!raw) return;
    const customs = JSON.parse(raw);
    if (!Array.isArray(customs)) return;
    customs.forEach(c => {
      const idx = contatosData.findIndex(x => (c.rowNumber && x.rowNumber === c.rowNumber) || (x.municipio && c.municipio && x.municipio.toUpperCase() === c.municipio.toUpperCase()));
      if (idx >= 0) {
        contatosData[idx] = { ...contatosData[idx], ...c, _custom: true };
      }
    });
  } catch(e) {}
}

async function salvarContato(e) {
  if (e && e.preventDefault) e.preventDefault();
  
  const rowNumber = Number(document.getElementById('contato-row-number')?.value || 0);
  const mun = (document.getElementById('contato-municipio')?.value || '').trim();
  const pref = (document.getElementById('contato-prefeito')?.value || '').trim();
  const celPref = (document.getElementById('contato-cel-prefeito')?.value || '').trim();
  const sec = (document.getElementById('contato-secretario')?.value || '').trim();
  const celSec = (document.getElementById('contato-cel-secretario')?.value || '').trim();
  const email = (document.getElementById('contato-email')?.value || '').trim();
  const obs = (document.getElementById('contato-obs')?.value || '').trim();
  const esc = (document.getElementById('contato-escolas-input')?.value || '').trim();
  const alu = (document.getElementById('contato-alunos-input')?.value || '').trim();
  
  if (!mun) {
    alert('Por favor, selecione um município válido.');
    return;
  }
  
  const btnSalvar = document.getElementById('btn-salvar-contato');
  const btnOriginalText = btnSalvar ? btnSalvar.innerHTML : '';
  if (btnSalvar) {
    btnSalvar.disabled = true;
    btnSalvar.innerHTML = '⏳ Gravando na planilha...';
  }
  
  const registro = {
    id: (rowNumber || mun) + '_contatos',
    rowNumber: rowNumber || getLinhaPlanilhaMunicipio(mun, 2),
    municipio: mun,
    nomePrefeito: pref,
    celularPrefeito: celPref,
    nomeSecretario: sec,
    celularSecretario: celSec,
    email: email,
    observacoes: obs,
    qtdeEscolas: esc,
    qtdeAlunos: alu,
    _custom: true
  };
  
  // 1. Tentar salvar diretamente no Google Sheets via Agente Backend
  let salvoBackend = false;
  try {
    const baseApi = (typeof API_BASE !== 'undefined' && API_BASE) ? API_BASE : 'https://seduc-backend.onrender.com';
    const token = (typeof getSessionToken === 'function') ? getSessionToken() : (sessionStorage.getItem('sap_session_token') || localStorage.getItem('sap_session_token') || 'active_dev_token');
    
    const res = await fetch(`${baseApi}/api/contatos/${registro.rowNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (token || 'active_dev_token')
      },
      body: JSON.stringify(registro)
    });
    
    if (res.ok) {
      salvoBackend = true;
    } else {
      const errData = await res.json().catch(() => ({}));
      console.warn('[Agente Planilha] Resposta:', errData);
    }
  } catch(err) {
    console.warn('[Agente Planilha] Falha de conexao:', err.message);
  }
  
  // 2. Atualizar estado local
  const idx = contatosData.findIndex(x => (registro.rowNumber && x.rowNumber === registro.rowNumber) || x.municipio.toUpperCase() === mun.toUpperCase());
  if (idx >= 0) {
    contatosData[idx] = { ...contatosData[idx], ...registro };
  }
  
  _salvarContatosLocais();
  contatosData.sort((a, b) => (a.municipio || "").localeCompare(b.municipio || ""));
  contatosPopulateMunicipioCombo();
  filtrarContatos();
  fecharModalContato();
  
  if (btnSalvar) {
    btnSalvar.disabled = false;
    btnSalvar.innerHTML = btnOriginalText;
  }
  
  if (salvoBackend) {
    if (typeof toast === 'function') {
      toast(`✅ Linha ${registro.rowNumber} (${mun}) gravada com sucesso nas células da planilha!`, 'success');
    }
  } else {
    if (typeof toast === 'function') {
      toast(`💾 Linha ${registro.rowNumber} (${mun}) salva na aplicação. (Agente registrado)`, 'info');
    }
  }
}

// Bloqueio explícito de exclusão (52 municípios são fixos)
async function excluirContato() {
  alert('Não é permitido excluir municípios. A estrutura da planilha é fixa em 52 municípios (Linhas 2 a 53).');
}

function abrirModalAgentePlanilha() {
  const m = document.getElementById('modal-agente-planilha');
  if (m) m.style.display = 'flex';
}

function fecharModalAgentePlanilha() {
  const m = document.getElementById('modal-agente-planilha');
  if (m) m.style.display = 'none';
}

function copiarEmailAgente() {
  const emailInput = document.getElementById('input-email-agente');
  if (emailInput) {
    emailInput.select();
    navigator.clipboard.writeText(emailInput.value).then(() => {
      if (typeof toast === 'function') toast('E-mail do Agente copiado para a área de transferência!', 'success');
      else alert('E-mail do Agente copiado: ' + emailInput.value);
    }).catch(() => {
      document.execCommand('copy');
      if (typeof toast === 'function') toast('E-mail do Agente copiado!', 'success');
    });
  }
}

window.abrirModalAgentePlanilha = abrirModalAgentePlanilha;
window.fecharModalAgentePlanilha = fecharModalAgentePlanilha;
window.copiarEmailAgente = copiarEmailAgente;

document.addEventListener('DOMContentLoaded', () => {
  initContatos();
  if ((typeof _escolasCache === 'undefined' || !_escolasCache || _escolasCache.length === 0) && typeof iniciarPaginaEscolas === 'function') {
    iniciarPaginaEscolas();
  }
  setInterval(() => {
    const page = document.getElementById('page-contatos');
    if (page && page.classList.contains('active')) {
      renderContatos();
    }
  }, 5000);
});

let contatosAllMunicipios = [];
let contatosSelectedMunicipios = new Set();

function contatosPopulateMunicipioCombo() {
  const muns = new Set();
  contatosData.forEach(c => {
    if (c.municipio) muns.add(c.municipio.trim());
  });
  contatosAllMunicipios = Array.from(muns).sort();
  contatosSelectedMunicipios = new Set(contatosAllMunicipios);
  contatosRenderMunicipioList(contatosAllMunicipios);
  contatosUpdateMunicipioLabel();
}

function contatosRenderMunicipioList(list) {
  const container = document.getElementById('contatos-municipio-list');
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = '<div style="padding:8px 12px;color:#64748b;font-size:12px;">Nenhum município</div>';
    return;
  }
  container.innerHTML = list.map(m => {
    const isChecked = contatosSelectedMunicipios.has(m) ? 'checked' : '';
    return `
      <label style="display:flex;align-items:center;padding:6px 12px;cursor:pointer;font-size:13px;color:var(--text-secondary);">
        <input type="checkbox" ${isChecked} value="${m}" onchange="contatosToggleMunicipio(this.value, this.checked)" style="margin-right:8px;cursor:pointer;">
        ${m}
      </label>
    `;
  }).join('');
}

function contatosToggleMunicipio(val, isChecked) {
  if (isChecked) {
    contatosSelectedMunicipios.add(val);
  } else {
    contatosSelectedMunicipios.delete(val);
  }
  contatosUpdateMunicipioLabel();
  filtrarContatos();
}

function contatosFiltrarComboMunicipio(query) {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const filtered = contatosAllMunicipios.filter(m => {
    return m.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q);
  });
  contatosRenderMunicipioList(filtered);
}

function contatosToggleTodosMunicipios(checkAll) {
  if (checkAll) {
    contatosSelectedMunicipios = new Set(contatosAllMunicipios);
  } else {
    contatosSelectedMunicipios.clear();
  }
  const qInput = document.querySelector('#contatos-municipio-dropdown input[type="text"]');
  const q = qInput ? qInput.value : '';
  contatosFiltrarComboMunicipio(q);
  contatosUpdateMunicipioLabel();
  filtrarContatos();
}

function contatosUpdateMunicipioLabel() {
  const lbl = document.getElementById('contatos-municipio-label');
  if (!lbl) return;
  if (contatosSelectedMunicipios.size === contatosAllMunicipios.length) {
    lbl.textContent = 'MUNICÍPIO (Todos)';
  } else if (contatosSelectedMunicipios.size === 0) {
    lbl.textContent = 'MUNICÍPIO (Nenhum)';
  } else {
    lbl.textContent = 'MUNICÍPIO (' + contatosSelectedMunicipios.size + ')';
  }
}

document.addEventListener('click', (e) => {
  const drop = document.getElementById('contatos-municipio-dropdown');
  const btn = drop ? drop.previousElementSibling : null;
  if (drop && drop.style.display !== 'none') {
    if (!drop.contains(e.target) && !btn.contains(e.target)) {
      drop.style.display = 'none';
    }
  }
});