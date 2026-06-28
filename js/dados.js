// ============================================================
// SEDUC — Módulo de Dados e Estado Global
// ============================================================

const DB_KEY = 'seduc_processos_v1';

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

// ----- CRUD LOCAL -----
function carregarProcessos() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function salvarProcessos(lista) {
  localStorage.setItem(DB_KEY, JSON.stringify(lista));
}

function adicionarProcesso(dados) {
  const lista = carregarProcessos();
  const novo = { ...dados, id: gerarId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  lista.push(novo);
  salvarProcessos(lista);
  return novo;
}

function atualizarProcesso(id, dados) {
  const lista = carregarProcessos();
  const idx = lista.findIndex(p => p.id === id);
  if (idx === -1) return null;
  lista[idx] = { ...lista[idx], ...dados, updatedAt: new Date().toISOString() };
  salvarProcessos(lista);
  return lista[idx];
}

function excluirProcesso(id) {
  const lista = carregarProcessos();
  const nova = lista.filter(p => p.id !== id);
  salvarProcessos(nova);
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

        // Mapear colunas pelo cabeçalho
        const headers = rows[0].map(h => String(h).trim());
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

// ----- EXPORTAÇÃO EXCEL -----
function exportarExcel(filtrados) {
  const dados = filtrados.map(p => ({
    'Prefixo':         p.prefixo      || '',
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
