
function formatarDigitoInteiro(val) {
  if (val === null || val === undefined) return '';
  let s = String(val).trim();
  if (!s) return '';
  s = s.replace(/[,.]0+$/, '');
  if (s.includes(',') || s.includes('.')) {
    s = s.split(/[,.]/)[0].trim();
  }
  return s.replace(/\D/g, '');
}

// ============================================================
// SEDUC - Módulo de Dados e Estado Global
// ============================================================

const DB_KEY = 'seduc_processos_v1';

var API_BASE = 'https://seduc-backend.onrender.com';


// Helper para incluir cabeçalho de autenticação
function getHeaders(extraHeaders = {}) {
  const token = typeof getSessionToken === 'function' ? getSessionToken() : sessionStorage.getItem('sap_session_token');
  return {
    ...extraHeaders,
    ...(token ? { 'Authorization': 'Bearer ' + token } : {})
  };
}


let STATUS_LIST = [
  '.', 'AGUARD. AUT.', 'AUTORIZADO', 'CANCELADO', 'DUPLICADO',
  'N/ AUTORIZADO', 'N/ ENCAM. Á CAM', 'NOTIF. FINAL',
  'NOTIFICADO', 'NOTIFICAR', 'P/ AUTORIZO', 'PAGO', 'REG. DEMANDA'
];

let LOCALIZACAO_LIST = [
  '.', 'CAM | GDSM | GMAC', 'CASA CIVIL', 'CCTE', 'COINFRA',
  'CONVENENTE', 'GAB | SEDUC', 'GCF', 'PGE | SEDUC'
];

function normalizarStatus(status) {
  if (!status) return '.';
  const s = status.trim().toUpperCase();
  return (s === '' || s === '.') ? '.' : status.trim();
}

function normalizarLocalizacao(loc) {
  if (!loc) return '.';
  const l = loc.trim().toUpperCase();
  return (l === '' || l === '.') ? '.' : loc.trim();
}

const OBJETO_LIST = [
  'AQUISIÇÃO DE MATERIAL PERMANENTE',
  'PINTURA INTERNA E EXTERNA',
  'REFORMA',
  'CONSTRUÇÃO',
  'AMPLIAÇÃO',
  'EQUIPAMENTOS',
  'MOBILIÁRIO',
  'OUTRO'
];

// Gerador de ID único
function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ----- CRUD REMOTO (Google Sheets) -----
window.processosCache = [];

const AGRUPAMENTOS_REGIONAIS = {
  "Rolim de Moura": "Zona da Mata",
  "Alta Floresta D'Oeste": "Zona da Mata",
  "Alto Alegre dos Parecis": "Zona da Mata",
  "Castanheiras": "Zona da Mata",
  "Nova Brasilândia D'Oeste": "Zona da Mata",
  "Novo Horizonte do Oeste": "Zona da Mata",
  "Santa Luzia D'Oeste": "Zona da Mata",
  "São Miguel do Guaporé": "Região da 429",
  "Alvorada D'Oeste": "Região da 429",
  "Seringueiras": "Região da 429",
  "São Francisco do Guaporé": "Região da 429",
  "Costa Marques": "Região da 429",
  "Cacoal": "Região do Café",
  "Espigão D'Oeste": "Região do Café",
  "Ministro Andreazza": "Região do Café",
  "Pimenta Bueno": "Região do Café",
  "Primavera de Rondônia": "Região do Café",
  "Jaru": "Bacia Leiteira",
  "Governador Jorge Teixeira": "Bacia Leiteira",
  "Machadinho D'Oeste": "Bacia Leiteira",
  "Theobroma": "Bacia Leiteira",
  "Vale do Anari": "Bacia Leiteira",
  "Ariquemes": "Vale do Jamari",
  "Alto Paraíso": "Vale do Jamari",
  "Buritis": "Vale do Jamari",
  "Cacaulândia": "Vale do Jamari",
  "Campo Novo de Rondônia": "Vale do Jamari",
  "Cujubim": "Vale do Jamari",
  "Monte Negro": "Vale do Jamari",
  "Rio Crespo": "Vale do Jamari",
  "Guajará-Mirim": "Pérola do Mamoré",
  "Nova Mamoré": "Pérola do Mamoré"
};

const mapToApp = (row) => {
  let contatosStr = '';
  let alertaStr = '';
  let apontamentoStr = '';
  for (const key in row) {
    const lower = key.toLowerCase().trim();
    if (lower.includes('contato')) contatosStr = row[key];
    if (lower === 'alerta') alertaStr = row[key];
    if (lower === 'apontamento' || lower === 'apontamentos') apontamentoStr = row[key];
  }

  let contatosParsed = [];
  if (contatosStr) {
    contatosStr.split(';').forEach(c => {
      c = c.trim();
      if (!c) return;
      let matchIdx = c.lastIndexOf(' - ');
      if (matchIdx !== -1) {
        let detalhes = c.substring(0, matchIdx).trim();
        let whatsapp = c.substring(matchIdx + 3).trim();
        contatosParsed.push({ detalhes, whatsapp });
      } else {
        const hasLetters = /[a-zA-Z]/.test(c);
        if (hasLetters) {
          let hyphenIdx = c.lastIndexOf('-');
          let targetHyphen = hyphenIdx;
          if (hyphenIdx === c.length - 5 || hyphenIdx === c.length - 6) {
            targetHyphen = c.substring(0, hyphenIdx).lastIndexOf('-');
          }
          if (targetHyphen !== -1) {
            let detalhes = c.substring(0, targetHyphen).trim();
            let whatsapp = c.substring(targetHyphen + 1).trim();
            contatosParsed.push({ detalhes, whatsapp });
          } else {
            contatosParsed.push({ detalhes: '', whatsapp: c });
          }
        } else {
          contatosParsed.push({ detalhes: '', whatsapp: c });
        }
      }
    });
  }

  const parseMoney = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/[^\d,\.-]/g, '');
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
  };
  
  let mun = (row['MUNICIPIO'] || row['Município'] || row.municipio || row['Municipio'] || '').trim();
  let agrupamentoCalculado = AGRUPAMENTOS_REGIONAIS[mun] || mun;
  
  return {
    id: `${row._tabName}__${row._rowNumber}`,
    _rowNumber: row._rowNumber,
    _tabName: row._tabName,
    prefixo: row._tabName || row['Prefixo'] || row['Prefixo (codigo de prioridade)'] || '',
    digito: formatarDigitoInteiro(row['DIGITO'] || row['DÍGITO'] || row.digito || row.Digito || ''),
    DIGITO: formatarDigitoInteiro(row['DIGITO'] || row['DÍGITO'] || row.digito || row.Digito || ''),
    municipio: mun,
    numero: row['PROCESSOS'] || row['Processo'] || row['Nº Processo'] || row.numero || '',
    interessado: row['INTERESSADO'] || row['Interessado'] || row.interessado || '',
    objeto: row['OBJETO'] || row['Objeto'] || row.objeto || '',
    valorOf: parseMoney(row['VALOR OF'] || row['Valor Of.'] || row['Valor Of'] || row.valorOf),
    valorPlan: parseMoney(row['VLR PLANILHA'] || row['Valor/Planilha'] || row['Valor Planilha'] || row.valorPlan),
    diferenca: parseMoney(row['VLR DIFERENCA'] || row['Diferença'] || row['Diferenca'] || row.diferenca),
    _statusOriginal: row['STATUS'] || row['Status'] || '',
    _localizacaoOriginal: row['LOCALIZACAO'] || row['Localização'] || '',
    status: normalizarStatus(row['STATUS'] || row['Status'] || ''),
    localizacao: normalizarLocalizacao(row['LOCALIZACAO'] || row['Localização'] || ''),
    obs: row['OBSERVACAO'] || row['Observação'] || row['Obs.:'] || row['Obs'] || row.obs || '',
    data: row['DATA'] || row['Data'] || row.data || '',
    anotacao: row['ANOTACAO'] || row['Anotação'] || row.anotacao || '',
    marca: String(row['MARCA'] || row['Marca'] || row.marca || row['Marcado'] || '').trim(),
    categoria: row['CATEGORIA'] || row['categoria'] || '',
    tipo: row['TIPO'] || row['tipo'] || '',
    CAM: (row['CAM'] === '1' || row['CAM'] === 1 || row['CAM'] === true || String(row['CAM']).toLowerCase() === 'sim') ? '1' : '0',
    GAB: (row['GAB-SEDUC'] === '1' || row['GAB-SEDUC'] === 1 || row['GAB'] === '1' || row['GAB'] === 1 || String(row['GAB-SEDUC']).toLowerCase() === 'sim') ? '1' : '0',
    CC: (row['CASA CIVIL'] === '1' || row['CASA CIVIL'] === 1 || row['CC'] === '1' || row['CC'] === 1 || String(row['CASA CIVIL']).toLowerCase() === 'sim') ? '1' : '0',
    ano: row['ANO'] || row['ano'] || '',
    agrupamento: row['AGRUPAMENTO'] || row['Agrupamento'] || row.agrupamento || agrupamentoCalculado,
    tipoAuditorio: row['TIPO AUDITORIO'] || row['tipo auditorio'] || row.tipoAuditorio || '',
    quadra: row['QUADRA'] || row['quadra'] || row.quadra || '',
    patio: row['PATIO'] || row['patio'] || row.patio || '',
    refeitorio: row['REFEITORIO'] || row['refeitorio'] || row.refeitorio || '',
    banheiros: row['BANHEIROS'] || row['banheiros'] || row.banheiros || '',
    oficio: row['OFICIO'] || row['oficio'] || row.oficio || '',
    metragem: row['METRAGEM (M²)'] || row['metragem'] || row.metragem || '',
    detalhamentoItens: row['DETALHAMENTO ITENS'] || row['detalhamento itens'] || row.detalhamentoItens || '',
    demaisObservacoes: row['DEMAIS OBSERVACOES'] || row['demais observacoes'] || row.demaisObservacoes || '',
    ultimaEdicao: row['ULTIMA EDICAO LOGIN'] || row['ULTIMA EDICAO'] || row['ultima edicao'] || row['Última edição'] || '',
    dataHoraEdicao: row['DATA/HORA EDICAO'] || row['data/hora edicao'] || row['data/hora edição'] || '',
    alerta: String(alertaStr || '').trim(),
    apontamento: apontamentoStr || '',
    contatos: contatosParsed
  };
};

const mapToSheet = (dados) => {
  const formatMoney = (val) => {
    if (val === undefined || val === null || val === "") return "";
    return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  return {
    'DIGITO': formatarDigitoInteiro(dados.digito || dados.DIGITO || ''),
    'MUNICIPIO': dados.municipio || '',
    'PROCESSOS': dados.numero || '',
    'INTERESSADO': dados.interessado || '',
    'OBJETO': dados.objeto || '',
    'VALOR OF': formatMoney(dados.valorOf),
    'VLR PLANILHA': formatMoney(dados.valorPlan),
    'VLR DIFERENCA': formatMoney(dados.diferenca),
    'STATUS': dados.status || '',
    'LOCALIZACAO': dados.localizacao || '',
    'OBSERVACAO': dados.obs || '',
    'DATA': dados.data || '',
    'ANOTACAO': dados.anotacao || '',
    'CONTATO': Array.isArray(dados.contatos) ? dados.contatos.map(c => (c.detalhes && c.whatsapp) ? `${c.detalhes.trim()} - ${c.whatsapp.trim()}` : (c.detalhes || c.whatsapp || '').trim()).filter(Boolean).join('; ') : (dados.contato || ''),
    'APONTAMENTO': dados.apontamento || '',
    'ALERTA': dados.alerta || '',
    'ULTIMA EDICAO LOGIN': dados.ultimaEdicao || '',
    'DATA/HORA EDICAO': dados.dataHoraEdicao || '',
    'MARCA': dados.marca || '',
    'CATEGORIA': dados.categoria || '',
    'TIPO': dados.tipo || '',
    'CAM': (dados.CAM === '1' || dados.CAM === 1) ? '1' : '0',
    'GAB-SEDUC': (dados.GAB === '1' || dados.GAB === 1) ? '1' : '0',
    'CASA CIVIL': (dados.CC === '1' || dados.CC === 1) ? '1' : '0',
    'ANO': dados.ano || '',
    'AGRUPAMENTO': dados.agrupamento || '',
    'TIPO AUDITORIO': dados.tipoAuditorio || '',
    'QUADRA': dados.quadra || '',
    'PATIO': dados.patio || '',
    'REFEITORIO': dados.refeitorio || '',
    'BANHEIROS': dados.banheiros || '',
    'OFICIO': dados.oficio || '',
    'METRAGEM (M²)': dados.metragem || '',
    'DETALHAMENTO ITENS': dados.detalhamentoItens || '',
    'DEMAIS OBSERVACOES': dados.demaisObservacoes || ''
  };
};

async function inicializarDados() {
  try {
    const res = await fetch(API_BASE + '/api/registros', { headers: getHeaders() });

    if (res.status === 401 || res.status === 403) {
      fazerLogout();
      return;
    }
    const data = await res.json();
    if (data.rows) {
      window.processosCache = data.rows.filter(r => r._tabName && !r._tabName.toLowerCase().includes('parametro')).map(mapToApp);
      
      // Update global STATUS_LIST and LOCALIZACAO_LIST dynamically, ignoring the hardcoded ones completely
      STATUS_LIST = ['.', ...new Set(window.processosCache.map(p => p.status))].filter((item, i, ar) => ar.indexOf(item) === i && item && item.trim() !== '');
      LOCALIZACAO_LIST = ['.', ...new Set(window.processosCache.map(p => p.localizacao))].filter((item, i, ar) => ar.indexOf(item) === i && item && item.trim() !== '');
      
      // Ensure 'Todos' isn't added here, but keep '.' as placeholder if needed. Or just sort them
      
      STATUS_LIST.sort((a,b) => a.localeCompare(b));
      LOCALIZACAO_LIST.sort((a,b) => a.localeCompare(b));

      if (typeof window.popularFiltrosProcessos === 'function') {
         window.popularFiltrosProcessos();
      }


      
      if (typeof checkAlertasADM === 'function') {
         checkAlertasADM(window.processosCache);
      }
    }
  } catch (err) {
    console.error('Erro ao carregar do backend:', err);
  }
}

function carregarProcessos() {
  return window.processosCache || [];
}

function salvarProcessos(lista) {
  window.processosCache = lista;
}

async function adicionarProcesso(dados) {
  const payload = mapToSheet(dados);
  
  // Update locally for instant feedback
  const novo = { ...dados, id: 'temp-' + Date.now(), createdAt: new Date().toISOString() };
  window.processosCache.push(novo);
  
  try {
    await fetch(API_BASE + '/api/registros', {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...dados, DIGITO: dados.digito || dados.DIGITO || '', 'DÍGITO': dados.digito || dados.DIGITO || '' })
    });
  } catch(err) {
    console.error(err);
  }
  return novo;
}

async function atualizarProcesso(id, dados) {
  const payload = mapToSheet(dados);

  // Update locally for instant feedback
  const idx = window.processosCache.findIndex(p => p.id === id);
  if (idx !== -1) window.processosCache[idx] = { ...window.processosCache[idx], ...dados };

  try {
    if (String(id).startsWith('temp-')) return; // Can't update temp ids yet in backend
    await fetch(API_BASE + `/api/registros/${id}`, {
      method: 'PUT',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...dados, DIGITO: dados.digito || dados.DIGITO || '', 'DÍGITO': dados.digito || dados.DIGITO || '' })
    });
  } catch(err) {
    console.error(err);
  }
}

async function excluirProcesso(id) {
  window.processosCache = window.processosCache.filter(p => p.id !== id);
  try {
    if (String(id).startsWith('temp-')) return;
    await fetch(API_BASE + `/api/registros/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  } catch(err) {
    console.error(err);
  }
}

function buscarProcessoPorId(id) {
  return carregarProcessos().find(p => p.id === id) || null;
}

// ----- IMPORTAÇÃO EXCEL -----
async function importarExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (rows.length < 2) { resolve([]); return; }

        const defaultHeaders = [
          "Município",
          "Processo",
          "Interessado",
          "Objeto",
          "Valor Of.",
          "Valor/Planilha",
          "Diferença",
          "Status",
          "Localização",
          "Observação",
          "Data",
          "Anotação",
          "contatos",
          "Apontamento",
          "ALERTA",
          "ULTIMA EDICAO LOGIN",
          "DATA/HORA EDIÇÃO",
          "marca",
          "CATEGORIA",
          "TIPO"
        ];

        // Mapear colunas pelo cabeçalho
        const headers = rows[0].map((h, colIndex) => {
          const val = String(h || '').trim();
          return val ? val : (defaultHeaders[colIndex] || `Coluna_${colIndex}`);
        });
        const getIdx = (nome) => headers.findIndex(h => h.toLowerCase().includes(nome.toLowerCase()));

        const idxMunicipio   = getIdx('munic');
        const idxProcesso    = getIdx('process');
        const idxInteressado = getIdx('interess');
        const idxObjeto      = getIdx('objeto');
        const idxValorOf     = getIdx('valor of');
        const idxValorPlan   = getIdx('valor/plan');
        const idxDiferenca   = getIdx('difer');
        const idxStatus      = getIdx('status');
        const idxLocalizacao = getIdx('localiz');
        const idxObs        = getIdx('obs');
        const idxData        = getIdx('data');
        const idxAnotacao    = getIdx('anota');
        const idxPrefixo     = getIdx('prefix');

        const existentes = carregarProcessos();
        const numerosExistentes = new Set(existentes.map(p => p.numero).filter(Boolean));

        const novos = [];
        const duplicados = [];

        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          if (row.every(c => c === '' || c === null || c === undefined)) continue;

          const numero = idxProcesso >= 0 ? String(row[idxProcesso] || '').trim() : '';

          // Converter data serial do Excel
          let data = '';
          if (idxData >= 0 && row[idxData]) {
            const serial = Number(row[idxData]);
            if (!isNaN(serial) && serial > 40000) {
              const d = XLSX.SSF.parse_date_code(serial);
              data = `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
            } else if (typeof row[idxData] === 'string' && row[idxData].includes('/')) {
              // Tentar parsear DD/MM/YYYY
              const parts = row[idxData].split('/');
              if (parts.length === 3) {
                data = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
              }
            }
          }

          const processo = {
            id:          gerarId(),
            prefixo:     idxPrefixo >= 0 ? String(row[idxPrefixo] || '').trim().toUpperCase() : '',
            municipio:   idxMunicipio   >= 0 ? String(row[idxMunicipio]   || '').trim() : '',
            numero:      numero,
            interessado: idxInteressado >= 0 ? String(row[idxInteressado] || '').trim() : '',
            objeto:      idxObjeto      >= 0 ? String(row[idxObjeto]      || '').trim() : '',
            valorOf:     idxValorOf     >= 0 ? Number(row[idxValorOf])   || 0 : 0,
            valorPlan:   idxValorPlan   >= 0 ? Number(row[idxValorPlan]) || 0 : 0,
            diferenca:   idxDiferenca   >= 0 ? Number(row[idxDiferenca]) || 0 : 0,
            status:      idxStatus      >= 0 ? String(row[idxStatus]      || '').trim() : '',
            localizacao: idxLocalizacao >= 0 ? String(row[idxLocalizacao] || '').trim() : '',
            obs:         idxObs         >= 0 ? String(row[idxObs]         || '').trim() : '',
            data:        data,
            anotacao:    idxAnotacao    >= 0 ? String(row[idxAnotacao]    || '').trim() : '',
            createdAt:   new Date().toISOString(),
            updatedAt:   new Date().toISOString(),
          };

          if (numero && numerosExistentes.has(numero)) {
            duplicados.push(numero);
          } else {
            novos.push(processo);
            if (numero) numerosExistentes.add(numero);
          }
        }

        // Salvar novos no banco
        const listaAtual = carregarProcessos();
        salvarProcessos([...listaAtual, ...novos]);

        resolve({ novos: novos.length, duplicados: duplicados.length, total: rows.length - 1 });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ----- IMPORTAÇÃO GOOGLE SHEETS -----
async function importarGoogleSheets(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error('URL da planilha inválida. Use o link completo do Google Sheets.');
  
  const id = match[1];
  const exportUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`;
  const proxyUrl = `https://corsproxy.io/?` + encodeURIComponent(exportUrl);

  const response = await fetch(proxyUrl);
  if (!response.ok) {
     throw new Error(`Acesso negado ou erro ao baixar (Status: ${response.status}). Certifique-se de que a planilha está configurada como "Qualquer pessoa com o link pode ver".`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const file = new File([arrayBuffer], "google_sheet.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  return importarExcel(file);
}

// ----- EXPORTAÇÃO EXCEL -----
function exportarExcel(filtrados) {
  const dados = filtrados.map(p => ({
    'Prefixo':         p.prefixo      || '',
    'Categoria':       p.categoria    || '',
    'Tipo':            p.tipo         || '',
    'Município':       p.municipio,
    'Processo':        p.numero,
    'Interessado':     p.interessado,
    'Objeto':          p.objeto,
    'Valor Oficial':   p.valorOf,
    'Valor Planilha':  p.valorPlan,
    'Diferença':       p.diferenca,
    'Status':          p.status,
    'Localização':     p.localizacao,
    'Observações':     p.obs,
    'Data':            p.data,
    'Anotação':        p.anotacao,
  }));

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Processos');
  XLSX.writeFile(wb, `seduc_processos_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ----- UTILITÁRIOS -----
function formatCurrency(val) {
  if (!val || isNaN(val)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function formatDate(str) {
  if (!str) return '-';
  const d = new Date(str + 'T00:00:00');
  if (isNaN(d)) return str;
  return d.toLocaleDateString('pt-BR');
}

function normalizar(str) {
  return String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function getStatusBadgeClass(status) {
  const s = String(status || '').toUpperCase().replace(/[^A-Z]/g, '');
  const map = {
    'AUTORIZADO':     'AUTORIZADO',
    'PAGO':           'PAGO',
    'PENDENTE':       'PENDENTE',
    'CONCLUIDO':      'CONCLUIDO',
    'CANCELADO':      'CANCELADO',
    'ENCERRADO':      'ENCERRADO',
    'NOTIFICADO':     'NOTIFICADO',
    'NOTIFICAR':      'NOTIFICAR',
    'PRIORIDADE':     'PRIORIDADE',
    'REABERTO':       'REABERTO',
    'DUPLICADO':      'DUPLICADO',
  };
  return 'badge-' + (map[s] || 'DEFAULT');
}





// Função global para recarregar todos os dados do sistema
window.recarregarDadosGlobais = async function() {
  const btns = document.querySelectorAll('button[onclick*="recarregarDadosGlobais"]');
  btns.forEach(b => {
    b.disabled = true;
    b.dataset.origHtml = b.innerHTML;
    b.innerHTML = '🔄 Recarregando...';
  });

  try {
    if (typeof inicializarDados === 'function') await inicializarDados();
    if (typeof carregarAcessos === 'function') await carregarAcessos();
    if (typeof carregarPainelSistemaInfo === 'function') await carregarPainelSistemaInfo();
    if (typeof recarregarEscolas === 'function') recarregarEscolas();
    if (typeof carregarOrcamentoData === 'function') carregarOrcamentoData();
    if (typeof carregarDiariasData === 'function') carregarDiariasData();
    if (typeof toast === 'function') toast('Dados atualizados com sucesso!', 'success');
  } catch(e) {
    console.error('Erro ao recarregar dados globais:', e);
    if (typeof toast === 'function') toast('Erro ao sincronizar dados.', 'error');
  } finally {
    btns.forEach(b => {
      b.disabled = false;
      b.innerHTML = b.dataset.origHtml || '🔄 Recarregar';
    });
  }
};
