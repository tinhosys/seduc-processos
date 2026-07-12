// ============================================================
// SEDUC — Módulo de Dados e Estado Global
// ============================================================

const DB_KEY = 'seduc_processos_v1';

var API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? ''
  : 'https://seduc-backend.onrender.com';


// Helper para incluir cabeçalho de autenticação
function getHeaders(extraHeaders = {}) {
  const token = typeof getSessionToken === 'function' ? getSessionToken() : sessionStorage.getItem('sap_session_token');
  return {
    ...extraHeaders,
    ...(token ? { 'Authorization': 'Bearer ' + token } : {})
  };
}


const STATUS_LIST = [
  '.', 'AUTORIZADO', 'CANCELADO', 'CONCLUÍDO', 'DUPLICADO',
  'ENCERRADO', 'Não autorizado', 'Não chegou na CAM',
  'NÃO PRIORIDADE', 'NOTIFICADO', 'NOTIFICAR', 'P/ AUTORIZO',
  'P/AUTORIZO', 'PAGO', 'para autorizo', 'PENDENTE',
  'PRIORIDADE', 'REABERTO'
];

const LOCALIZACAO_LIST = [
  '.', 'Casa Civil', 'Casa Civil p/ Autorizo', 'CC', 'CCTE',
  'COINFRA', 'Convenente', 'GAB', 'GAB-SEDUC', 'GCF',
  'GDSM', 'PAGO', 'PGE-SEDUC', 'SEDUC-GAB', 'SEDUC--GAB'
];

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
  return {
    id: `${row._tabName}__${row._rowNumber}`,
    prefixo: row._tabName || row['Prefixo (codigo de prioridade)'] || row['Prefixo'] || '',
    municipio: row['Município'] || row['Municipio'] || '',
    numero: row['Processo'] || row['Nº Processo'] || '',
    interessado: row['Interessado'] || '',
    objeto: row['Objeto'] || '',
    valorOf: parseMoney(row['Valor Of.']),
    valorPlan: parseMoney(row['Valor/Planilha']),
    diferenca: parseMoney(row['Diferença']),
    status: row['Status'] || '',
    localizacao: row['Localização'] || '',
    obs: row['Obs.:'] || row['Obs'] || '',
    data: row['Data'] || '',
    anotacao: row['Anotação'] || row['Anota\u00e7\u00e3o'] || '',
    marca: String(row['Marca'] || row['marca'] || row['Marcado'] || '').trim(),
    categoria: row['CATEGORIA'] || row['categoria'] || '',
    tipo: row['TIPO'] || row['tipo'] || '',
    ultimaEdicao: row['ULTIMA EDICAO'] || row['ultima edicao'] || row['última edição'] || row['ÚLTIMA EDIÇÃO'] || '',
    dataHoraEdicao: row['DATA/HORA EDICAO'] || row['data/hora edicao'] || row['data/hora edição'] || row['DATA/HORA EDIÇÃO'] || '',
    alerta: String(alertaStr || '').trim(),
    apontamento: apontamentoStr || '',
    contatos: contatosParsed
  };
};

const mapToSheet = (dados) => {
  const formatMoney = (val) => {
    if (!val && val !== 0) return "";
    return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  return {
    'Prefixo (codigo de prioridade)': dados.prefixo || '',
    'Município': dados.municipio || '',
    'Processo': dados.numero || '',
    'Interessado': dados.interessado || '',
    'Objeto': dados.objeto || '',
    'Valor Of.': formatMoney(dados.valorOf),
    'Valor/Planilha': formatMoney(dados.valorPlan),
    'Diferença': formatMoney(dados.diferenca),
    'Status': dados.status || '',
    'Localização': dados.localizacao || '',
    'Obs.:': dados.obs || '',
    'Data': dados.data || '',
    'Anotação': dados.anotacao || '',
    'Marca': dados.marca || '',
    'CATEGORIA': dados.categoria || '',
    'TIPO': dados.tipo || '',
    'ULTIMA EDICAO': dados.ultimaEdicao || '',
    'DATA/HORA EDICAO': dados.dataHoraEdicao || ''
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
      window.processosCache = data.rows.map(mapToApp);
      
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
      body: JSON.stringify(dados)
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
      body: JSON.stringify(dados)
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
          "DATA/HORA EDIÇAO",
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
  if (!str) return '—';
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
