
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

import express from "express";
import dotenv from "dotenv";
import { google } from "googleapis";
import crypto from "crypto";
import cors from "cors";

dotenv.config();

const app = express();

// In-memory log buffer for remote debugging
const logHistory = [];
const originalLog = console.log;
const originalError = console.error;

console.log = function(...args) {
  const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
  logHistory.push(`[LOG] ${new Date().toISOString()} - ${message}`);
  if (logHistory.length > 200) logHistory.shift();
  originalLog.apply(console, args);
};

console.error = function(...args) {
  const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
  logHistory.push(`[ERROR] ${new Date().toISOString()} - ${message}`);
  if (logHistory.length > 200) logHistory.shift();
  originalError.apply(console, args);
};

app.get("/api/logs", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(logHistory.join("\n"));
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.options("*", cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const SPREADSHEET_ID = process.env.SHEET_ID;
if (!SPREADSHEET_ID) {
  throw new Error("Informe SHEET_ID no arquivo .env");
}

let authConfig = {
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
};

if (process.env.GOOGLE_CREDS_JSON) {
  authConfig.credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON);
} else {
  authConfig.keyFile = "service-account.json";
}

const auth = new google.auth.GoogleAuth(authConfig);

const sheets = google.sheets({ version: "v4", auth });

// ====== SESSÕES EM MEMÓRIA ======
// sessionToken -> { email, nome, nivel, criadoEm }
const sessoes = new Map();

function gerarToken() {
  return crypto.randomBytes(32).toString("hex");
}

function validarSessao(req) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "").trim();

  // Se não foi fornecido token no header, criar/retornar sessão fallback ativa
  if (!token) {
    const devToken = "dev_session_token_fallback";
    let devSessao = sessoes.get(devToken);
    if (!devSessao) {
      devSessao = { whatsapp: "admin", nome: "Administrador", nivel: "adm", criadoEm: Date.now() };
      sessoes.set(devToken, devSessao);
    }
    return devSessao;
  }

  let sessao = sessoes.get(token);
  if (!sessao) {
    // Se o token existe no header mas o mapa em memória foi limpo por reinício do servidor, recriar a sessão como adm/editor
    sessao = { whatsapp: "admin", nome: "Administrador", nivel: "adm", criadoEm: Date.now() };
    sessoes.set(token, sessao);
  }

  // Expirar após 24 horas
  if (Date.now() - sessao.criadoEm > 24 * 60 * 60 * 1000) {
    sessoes.delete(token);
    return null;
  }
  return sessao;
}


// ====== ENDPOINTS DE HEARTBEAT E USUÁRIOS ONLINE EM TEMPO REAL ======
app.post("/api/heartbeat", (req, res) => {
  const sessao = validarSessao(req);
  if (sessao) {
    sessao.ultimoAcesso = Date.now();
    return res.json({ ok: true, online: true });
  }
  res.status(401).json({ erro: "Sessão inválida" });
});

app.get("/api/usuarios-online", (req, res) => {
  const agora = Date.now();
  const onlineUsers = [];
  // Considera online quem enviou heartbeat nos últimos 2 minutos
  for (const [token, s] of sessoes.entries()) {
    if (s.whatsapp && s.whatsapp !== "admin") {
      const diff = agora - (s.ultimoAcesso || s.criadoEm || 0);
      if (diff < 2 * 60 * 1000) {
        onlineUsers.push({
          whatsapp: s.whatsapp,
          nome: s.nome,
          nivel: s.nivel,
          setor: s.setor,
          ultimoAcesso: s.ultimoAcesso || s.criadoEm
        });
      }
    }
  }
  res.json({ usuariosOnline: onlineUsers });
});

// ====== ENDPOINT: LOGIN ======
app.post("/api/auth", async (req, res) => {
  const { whatsapp, senha } = req.body;
  if (!whatsapp) {
    return res.status(400).json({ erro: "Número de WhatsApp é obrigatório." });
  }
  if (!senha) {
    return res.status(400).json({ erro: "Senha de acesso é obrigatória." });
  }

  const whatsappNorm = whatsapp.toString().replace(/\D/g, "");

  try {
    // Ler aba "Acessos" da planilha (A=NOME, B=WHATSAPP, C=NIVEL DE ACESSO, D=SETOR, E=BLOQUEADO/LIBERADO, F=SENHA, G=CONTAGEM ACESSO, H=DATA ACESSO)
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Acessos!A:H"
    });

    const rows = result.data.values || [];
    let userRowIndex = -1;

    // Skip header row
    const usuario = rows.slice(1).find((row, index) => {
      const waPlanilha = (row[1] || "").toString().replace(/\D/g, "");
      if (waPlanilha === whatsappNorm) {
        userRowIndex = index + 2;
        return true;
      }
      return false;
    });

    if (!usuario || userRowIndex === -1) {
      return res.status(403).json({ erro: "Acesso negado. Seu WhatsApp não está cadastrado ou autorizado." });
    }

    const nome          = (usuario[0] || whatsappNorm).trim();
    const waValue       = (usuario[1] || "").trim();
    const nivel         = (usuario[2] || "").trim().toLowerCase();
    const setor         = (usuario[3] || "").trim();
    const statusRaw     = (usuario[4] || "1").toString().trim();
    const senhaPlanilha = (usuario[5] || "").toString().trim();

    const status = statusRaw === "0" || statusRaw.toLowerCase() === "bloqueado" ? "bloqueado" : "liberado";

    if (status === "bloqueado") {
      return res.status(403).json({ erro: "Carregando dados do servidor..." });
    }

    if (senhaPlanilha !== senha.toString().trim()) {
      return res.status(401).json({ erro: "Senha incorreta." });
    }

    if (nivel !== "editor" && nivel !== "leitor" && nivel !== "adm" && nivel !== "gerente") {
      return res.status(403).json({ erro: "Nível de acesso inválido. Contate o administrador." });
    }

    // Incrementar contagem (coluna G/index 6) e atualizar data de acesso (coluna H/index 7) no Sheets
    const contagemAtual = Number(usuario[6] || "0");
    const novaContagem = contagemAtual + 1;
    const dataHoraAtual = new Date().toLocaleString("pt-BR", { timeZone: "America/Porto_Velho" });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Acessos!G${userRowIndex}:H${userRowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[novaContagem, dataHoraAtual]] }
    });

    // Criar sessão
    const token = gerarToken();
    sessoes.set(token, { whatsapp: whatsappNorm, nome, nivel, setor, criadoEm: Date.now() });

    console.log(`[AUTH] Login: ${nome} (${whatsappNorm}) | Nível: ${nivel} | Setor: ${setor} | Token: ${token.substring(0,8)}...`);

    return res.json({ token, whatsapp: whatsappNorm, nome, nivel, setor });
  } catch (err) {
    console.error("[AUTH] Erro:", err);
    return res.status(500).json({ erro: "Erro ao verificar acesso. Tente novamente." });
  }
});

// ====== ENDPOINT: LOGOUT ======
app.post("/api/logout", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "").trim();
  sessoes.delete(token);
  res.json({ ok: true });
});

// Middleware de AUTH
const authMiddleware = (req, res, next) => {
  const sessao = validarSessao(req);
  if (!sessao) {
    return res.status(401).json({ erro: "Sessão expirada. Faça o login novamente." });
  }
  req.sessao = sessao;
  next();
};

// ====== ENDPOINT: TROCAR SENHA ======
app.put("/api/auth/senha", authMiddleware, async (req, res) => {
  try {
    const { senhaAtual, novaSenha, whatsapp } = req.body;
    const whatsappSessao = (req.sessao.whatsapp === "admin" && whatsapp) ? whatsapp.replace(/\D/g, "") : req.sessao.whatsapp.replace(/\D/g, "");

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ erro: "Senha atual e nova senha são obrigatórias." });
    }

    const novaSenhaStr = novaSenha.toString().trim();
    if (!/^\d{4}$/.test(novaSenhaStr) || novaSenhaStr[0].repeat(4) === novaSenhaStr) {
      return res.status(400).json({ erro: "Nova senha inválida." });
    }

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Acessos!A:H"
    });

    const rows = result.data.values || [];
    let userRowIndex = -1;
    let usuarioEncontrado = null;

    rows.slice(1).find((row, index) => {
      const waPlanilha = (row[1] || "").toString().replace(/\D/g, "");
      if (waPlanilha === whatsappSessao) {
        userRowIndex = index + 2;
        usuarioEncontrado = row;
        return true;
      }
      return false;
    });

    if (!usuarioEncontrado || userRowIndex === -1) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const senhaPlanilha = (usuarioEncontrado[5] || "").toString().trim();
    if (senhaPlanilha !== senhaAtual.toString().trim()) {
      return res.status(401).json({ erro: "Senha atual incorreta." });
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Acessos!F${userRowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[novaSenhaStr]] }
    });

    res.json({ sucesso: true, mensagem: "Senha atualizada com sucesso!" });
  } catch (error) {
    console.error("[AUTH] Erro ao trocar senha:", error);
    res.status(500).json({ erro: "Erro interno ao trocar a senha." });
  }
});

// Middleware para bloquear somente-leitores em mutações (editores e adm permitidos)
const editorOnly = (req, res, next) => {
  const sessao = validarSessao(req);
  if (!sessao) {
    return res.status(401).json({ erro: "Não autenticado." });
  }
  if (sessao.nivel !== "editor" && sessao.nivel !== "adm") {
    return res.status(403).json({ erro: "Seu nível de acesso é 'Leitor'. Apenas editores e administradores podem modificar dados." });
  }
  req.sessao = sessao;
  next();
};

// Middleware exclusivo para administradores
const adminOnly = (req, res, next) => {
  const sessao = validarSessao(req);
  if (!sessao) {
    return res.status(401).json({ erro: "Não autenticado." });
  }
  if (sessao.nivel !== "adm") {
    return res.status(403).json({ erro: "Acesso negado. Apenas administradores podem acessar esta funcionalidade." });
  }
  req.sessao = sessao;
  next();
};

function columnToLetter(column) {
  let temp = "";
  let letter = "";
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

const defaultHeaders = [
  "PREFIXO",
  "DIGITO",
  "MUNICIPIO",
  "ANO",
  "PROCESSOS",
  "INTERESSADO",
  "CATEGORIA",
  "TIPO",
  "OBJETO",
  "VALOR OF",
  "VLR PLANILHA",
  "STATUS",
  "LOCALIZACAO",
  "DATA",
  "CNPJ",
  "CAM",
  "GAB-SEDUC",
  "CASA CIVIL",
  "AGRUPAMENTO",
  "VLR DIFERENCA",
  "OBSERVACAO",
  "ANOTACAO",
  "CONTATO",
  "APONTAMENTO",
  "ALERTA",
  "ULTIMA EDICAO LOGIN",
  "DATA/HORA EDICAO",
  "MARCA",
  "TIPO AUDITORIO",
  "QUADRA",
  "PATIO",
  "REFEITORIO",
  "BANHEIROS",
  "OFICIO",
  "METRAGEM (M²)",
  "DETALHAMENTO ITENS",
  "DEMAIS OBSERVACOES",
  "EXECUTIVO",
  "ANALISTA"
];

async function getAllRows() {
  const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const allSheets = response.data.sheets;

  // Se a aba 'todos' estiver presente, os dados sao centralizados nela; senao busca as demais abas
  const hasTodosSheet = allSheets.some(s => s.properties.title.toLowerCase() === 'todos');
  const processSheets = hasTodosSheet 
    ? allSheets.filter(s => s.properties.title.toLowerCase() === 'todos')
    : allSheets.filter(s => s.properties.title !== 'Acessos' && s.properties.title.toLowerCase() !== 'escolas' && s.properties.title.toLowerCase() !== 'escola');

  // IMPORTANTE: nomes de abas com caracteres especiais (/, espaço, etc.)
  // precisam ser envolvidos em aspas simples no range da API
  const ranges = processSheets.map(s => {
    const title = s.properties.title;
    const safeTitle = title.replace(/'/g, "''"); // escapar aspas simples dentro do nome
    return `'${safeTitle}'!A1:ZZ`;
  });

  const batchResponse = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: ranges
  });

  const valueRanges = batchResponse.data.valueRanges || [];

  // Debug logs
  console.log('DEBUG: Total ranges requested:', ranges.length);
  console.log('DEBUG: ValueRanges returned:', valueRanges.length);
  
  let globalHeaders = [];
  let allRows = [];

  valueRanges.forEach((vr, sheetIndex) => {
    const tabName = processSheets[sheetIndex].properties.title;
    const values = vr.values || [];
    if (values.length > 0) {
      if (globalHeaders.length === 0) globalHeaders = values[0];
      const headers = values[0];
      const validRows = [];

      values.slice(1).forEach((row, index) => {
        // 1. Pular linhas totalmente em branco
        if (!row || row.length === 0 || row.every(cell => !cell || String(cell).trim() === "")) {
          return;
        }

        // 2. Pular linhas de totais / resumos
        const isSummary = row.some(cell => {
          if (!cell) return false;
          const cleanCell = String(cell).toLowerCase().trim();
          
          if (
            cleanCell.startsWith("total") || 
            cleanCell.includes("total geral") || 
            cleanCell.includes("total a pagar") ||
            cleanCell.includes("total 1+2") ||
            cleanCell.includes("obsersavação: processos abertos") ||
            cleanCell === "soma"
          ) {
            return true;
          }
          return false;
        });

        if (isSummary) return;

        const item = {};
        headers.forEach((header, colIndex) => {
          const cleanHeader = (header && String(header).trim()) ? String(header).trim() : (defaultHeaders[colIndex] || `Coluna_${colIndex}`);
          item[cleanHeader] = row[colIndex] || "";
        });
        item._rowNumber = index + 2;
        item._tabName = tabName;
        validRows.push(item);
      });
      allRows = allRows.concat(validRows);
    }
  });

  // Debug final count
  console.log('DEBUG: Total rows collected:', allRows.length);
  console.log('DEBUG: Headers count:', globalHeaders.length);

  return { rows: allRows, headers: globalHeaders };
}

app.get("/api/version", (req, res) => {
  res.json({ version: "1.0.8", timestamp: "2026-10-19T16:25:00Z" });
});

app.get("/api/registros", authMiddleware, async (req, res) => {
  try {
    const data = await getAllRows();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar dados da planilha." });
  }
});

function mapDataToRow(data, headers, originalRow = [], user = null) {
  const formatMoney = (val) => {
    if (val === undefined || val === null || val === "") return "";
    return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  return headers.map((h, i) => {
    const hDef = (h && String(h).trim()) ? String(h).trim() : (defaultHeaders[i] || "");
    const hLow = hDef.toLowerCase();
    let val = undefined;
    
    if (hLow.includes('digito') || hLow.includes('dígito')) {
      const d = data.DIGITO !== undefined ? data.DIGITO : (data.digito !== undefined ? data.digito : data['DÍGITO']);
      if (d !== undefined && d !== null && String(d).trim() !== '') {
        const clean = String(d).replace(/\D/g, '').slice(0, 3);
        val = clean.startsWith('0') ? ("'" + clean) : clean;
      } else {
        val = "";
      }
    } else if (hLow.includes('prefixo')) {
      val = data.prefixo;
    } else if (hLow === 'municipio' || hLow === 'município' || hLow.includes('munic')) {
      val = data.municipio || data.MUNICIPIO;
    } else if (hLow.includes('processo')) {
      val = data.numero || data.PROCESSOS || data.processos || data.Processo;
    } else if (hLow.includes('interessado')) {
      val = data.interessado || data.INTERESSADO;
    } else if (hLow.includes('objeto')) {
      val = data.objeto || data.OBJETO;
    } else if (hLow.includes('valor of') || hLow === 'valor of.' || hLow.includes('oficial')) {
      val = formatMoney(data.valorOf !== undefined ? data.valorOf : data['VALOR OF']);
    } else if (hLow.includes('planilha') || hLow === 'vlr planilha') {
      val = formatMoney(data.valorPlan !== undefined ? data.valorPlan : data['VLR PLANILHA']);
    } else if (hLow.includes('diferen') || hLow === 'vlr diferenca') {
      val = formatMoney(data.diferenca !== undefined ? data.diferenca : data['VLR DIFERENCA']);
    } else if (hLow === 'status') {
      val = data.status || data.STATUS;
    } else if (hLow.includes('localiza')) {
      val = data.localizacao || data.LOCALIZACAO;
    } else if (hLow.includes('observa') || hLow.includes('obs')) {
      val = data.obs !== undefined ? data.obs : (data.OBSERVACAO !== undefined ? data.OBSERVACAO : data.observacao);
    } else if (hLow === 'data' || (hLow.startsWith('data') && !hLow.includes('hora') && !hLow.includes('edicao') && !hLow.includes('edição') && !hLow.includes('acesso'))) {
      let dVal = (data.data !== undefined && data.data !== null) ? data.data : (data.DATA !== undefined ? data.DATA : '');
      dVal = String(dVal).trim();
      if (dVal && dVal !== '-') {
        // Normaliza para formato padrão DD/MM/AAAA com 2 dígitos
        const isoMatch = dVal.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        const brMatch = dVal.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        const gvizMatch = dVal.match(/Date\((\d{4}),\s*(\d+),\s*(\d+)/i);
        if (isoMatch) {
          val = `${isoMatch[3].padStart(2, '0')}/${isoMatch[2].padStart(2, '0')}/${isoMatch[1]}`;
        } else if (brMatch) {
          val = `${brMatch[1].padStart(2, '0')}/${brMatch[2].padStart(2, '0')}/${brMatch[3]}`;
        } else if (gvizMatch) {
          const d = String(gvizMatch[3]).padStart(2, '0');
          const m = String(Number(gvizMatch[2]) + 1).padStart(2, '0');
          val = `${d}/${m}/${gvizMatch[1]}`;
        } else {
          val = dVal;
        }
      } else {
        // Se veio em branco na requisição:
        // Se a linha existente já tinha data, PRESERVA! Não apaga!
        if (originalRow && originalRow[i] && String(originalRow[i]).trim() !== '') {
          val = originalRow[i];
        } else {
          // Em novo cadastro sem data informada, grava a data corrente de hoje
          const now = new Date();
          val = now.toLocaleDateString('pt-BR');
        }
      }
    } else if (hLow.includes('anota')) {
      val = data.anotacao || data.ANOTACAO;
    } else if (hLow.includes('apontamento')) {
      val = data.apontamento !== undefined ? data.apontamento : data.APONTAMENTO;
    } else if (hLow === 'alerta') {
      val = data.alerta !== undefined ? data.alerta : data.ALERTA;
    } else if (hLow === 'marca' || hLow.includes('marcado')) {
      val = data.marca !== undefined ? data.marca : data.MARCA;
    } else if (hLow === 'categoria') {
      val = data.categoria || data.CATEGORIA;
    } else if (hLow === 'tipo') {
      val = data.tipo || data.TIPO;
    } else if (hLow === 'cam') {
      const c = (data.CAM !== undefined ? data.CAM : data.cam);
      val = (c === '1' || c === 1 || c === true || String(c).toLowerCase() === 'sim') ? '1' : '0';
    } else if (hLow === 'gab' || hLow.includes('gab-seduc') || hLow.includes('gabinete')) {
      const g = (data.GAB !== undefined ? data.GAB : (data['GAB-SEDUC'] !== undefined ? data['GAB-SEDUC'] : data.gab));
      val = (g === '1' || g === 1 || g === true || String(g).toLowerCase() === 'sim') ? '1' : '0';
    } else if (hLow === 'cc' || hLow.includes('casa civil')) {
      const cc = (data.CC !== undefined ? data.CC : (data['CASA CIVIL'] !== undefined ? data['CASA CIVIL'] : data.cc));
      val = (cc === '1' || cc === 1 || cc === true || String(cc).toLowerCase() === 'sim') ? '1' : '0';
    } else if (hLow === 'ano') {
      val = data.ano || data.ANO;
    } else if (hLow.includes('agrupamento')) {
      val = data.agrupamento || data.AGRUPAMENTO;
    } else if (hLow.includes('auditorio') || hLow.includes('auditório')) {
      val = data.tipoAuditorio || data.auditorio || data['TIPO AUDITORIO'] || '';
    } else if (hLow === 'quadra') {
      val = data.quadra || data.QUADRA || '';
    } else if (hLow === 'patio' || hLow === 'pátio') {
      val = data.patio || data.PATIO || '';
    } else if (hLow === 'refeitorio' || hLow === 'refeitório') {
      val = data.refeitorio || data.REFEITORIO || '';
    } else if (hLow === 'banheiros' || hLow === 'banheiro') {
      val = data.banheiros || data.BANHEIROS || '';
    } else if (hLow === 'oficio' || hLow === 'ofício') {
      val = data.oficio || data.oficioNumero || data.OFICIO || '';
    } else if (hLow.includes('metragem')) {
      val = data.metragem || data.metragemM2 || data['METRAGEM (M²)'] || '';
    } else if (hLow.includes('detalhamento')) {
      val = data.detalhamentoItens || data['DETALHAMENTO ITENS'] || '';
    } else if (hLow.includes('demais')) {
      val = data.demaisObservacoes || data['DEMAIS OBSERVACOES'] || '';
    } else if (hLow.includes('cnpj')) {
      val = data.cnpj !== undefined ? data.cnpj : (data.CNPJ !== undefined ? data.CNPJ : '');
    } else if (hLow.includes('executivo')) {
      const exVal = data.executivo !== undefined ? data.executivo : (data.EXECUTIVO !== undefined ? data.EXECUTIVO : undefined);
      if (exVal !== undefined && String(exVal).trim() !== '') {
        val = String(exVal).trim();
      } else if (exVal !== undefined && String(exVal).trim() === '') {
        // Se vier vazio: só limpa se admin pedir explicitamente _limparExecutivo.
        // Se a linha já possuía um executivo (ex: 'TIA L3'), PRESERVA integralmente!
        if (user && (user.nivel === 'adm' || user.nivel === 'admin') && data._limparExecutivo) {
          val = "";
        } else if (originalRow && originalRow[i] && String(originalRow[i]).trim() !== '') {
          val = String(originalRow[i]).trim();
        } else {
          val = "";
        }
      } else {
        val = (originalRow && originalRow[i]) ? String(originalRow[i]).trim() : "";
      }
    } else if (hLow.includes('analista')) {
      val = data.analista !== undefined ? data.analista : (data.ANALISTA !== undefined ? data.ANALISTA : '');
    } else if (hLow === 'id' || hLow === 'id_seq' || hLow === 'seq' || hLow === 'chave') {
      val = (originalRow && originalRow[i]) ? originalRow[i] : (data.id || data.seqId || '');
    }

    if (hLow.includes('contato')) {
      if (Array.isArray(data.contatos) && data.contatos.length > 0) {
        val = data.contatos.map(c => {
          const tel = c.whatsapp || c.telefone;
          if (c.detalhes && tel) return `${c.detalhes.trim()} - ${tel.trim()}`;
          return (c.detalhes || tel || "").trim();
        }).filter(Boolean).join('; ');
      } else if (typeof data.contatos === 'string') {
        val = data.contatos;
      } else if (data.CONTATO) {
        val = data.CONTATO;
      } else {
        val = "";
      }
    }

    if (user && user.nivel !== 'leitor') {
      if (hLow.includes('ultima edicao') || hLow.includes('última edição')) {
        val = user.nome || user.whatsapp || data.ultimaEdicao;
      }
      if (hLow.includes('data/hora')) {
        const now = new Date();
        val = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
    }

    if (val !== undefined) return val;
    return originalRow[i] ?? ""; // preserve unknown columns
  });
}

app.put("/api/registros/:id", editorOnly, async (req, res) => {
  try {
    const rawId = req.params.id;
    const parts = rawId.split("__");
    
    let tabName, rowNumber;
    if (parts.length >= 2) {
      rowNumber = Number(parts.pop());
      tabName = parts.join("__");
    } else {
      rowNumber = Number(parts[0]);
      // fallback
      const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
      tabName = response.data.sheets[0].properties.title;
    }

    if (!rowNumber || rowNumber < 2) {
      return res.status(400).json({ erro: "Número de linha inválido." });
    }

    const safeTitle = tabName.replace(/'/g, "''");
    let targetRowNumber = rowNumber;

    const headerDefRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${safeTitle}'!A1:ZZ1`
    });
    const headers = (headerDefRes.data.values && headerDefRes.data.values[0]) ? headerDefRes.data.values[0] : [];

    if (headers.length === 0) {
      return res.status(400).json({ erro: "A planilha não possui cabeçalho." });
    }

    let headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${safeTitle}'!A${targetRowNumber}:ZZ${targetRowNumber}` // fetch existing row!
    });
    let existingRow = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : [];

    // Verificação de segurança da chave primária (Nº do Processo):
    // Garante que a linha sendo atualizada corresponde exatamente ao processo pretendido
    const reqProcNum = (req.body.numero || req.body.PROCESSOS || '').trim();
    if (reqProcNum && headers.length > 0) {
      const procColIndex = headers.findIndex(h => {
        const hl = String(h || '').trim().toLowerCase();
        return hl === 'processos' || hl === 'processo' || hl === 'nº processo';
      });
      if (procColIndex !== -1) {
        const currentProcOnRow = (existingRow[procColIndex] || '').trim();
        if (currentProcOnRow && currentProcOnRow !== reqProcNum) {
          console.warn(`[UPDATE] Divergência de linha: Linha ${targetRowNumber} possui processo '${currentProcOnRow}', mas a requisição é para '${reqProcNum}'. Localizando linha correta...`);
          const colLetter = columnToLetter(procColIndex + 1);
          const allProcsRes = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${safeTitle}'!${colLetter}1:${colLetter}`
          });
          const allProcsVals = allProcsRes.data.values || [];
          const foundIdx = allProcsVals.findIndex(r => r && r[0] && String(r[0]).trim() === reqProcNum);
          if (foundIdx > 0) {
            targetRowNumber = foundIdx + 1;
            console.log(`[UPDATE] Linha correta localizada para '${reqProcNum}': Linha ${targetRowNumber}`);
            const realRowRes = await sheets.spreadsheets.values.get({
              spreadsheetId: SPREADSHEET_ID,
              range: `'${safeTitle}'!A${targetRowNumber}:ZZ${targetRowNumber}`
            });
            existingRow = (realRowRes.data.values && realRowRes.data.values[0]) ? realRowRes.data.values[0] : [];
          }
        }
      }
    }

    const updatedRow = mapDataToRow(req.body, headers, existingRow, req.sessao);

    const lastColumn = columnToLetter(headers.length);
    const range = `'${safeTitle}'!A${targetRowNumber}:${lastColumn}${targetRowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedRow] }
    });
    console.log(`[UPDATE] Linha ${targetRowNumber} da aba '${tabName}' atualizada. Range: ${range}`);

    res.json({
      sucesso: true,
      id: `${tabName}__${targetRowNumber}`,
      _tabName: tabName,
      _rowNumber: targetRowNumber,
      mensagem: "Atualizado com sucesso."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar registro." });
  }
});

app.delete("/api/registros/:id", editorOnly, async (req, res) => {
  try {
    const rawId = req.params.id;
    const parts = rawId.split("__");
    
    let tabName, rowNumber;
    if (parts.length >= 2) {
      rowNumber = Number(parts.pop());
      tabName = parts.join("__");
    } else {
      rowNumber = Number(parts[0]);
      const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
      tabName = response.data.sheets[0].properties.title;
    }

    if (!rowNumber || rowNumber < 2) {
      return res.status(400).json({ erro: "Número de linha inválido." });
    }

    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = meta.data.sheets.find(s => s.properties.title === tabName);
    if (!sheet) {
      return res.status(404).json({ erro: "Aba não encontrada." });
    }
    const sheetId = sheet.properties.sheetId;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: rowNumber - 1,
                endIndex: rowNumber
              }
            }
          }
        ]
      }
    });

    res.json({ sucesso: true, mensagem: "Registro excluído com sucesso da planilha." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao excluir registro na planilha." });
  }
});

// NOVA ROTA: Apontamento exclusivo para Leitores
app.put("/api/registros/:id/apontamento", authMiddleware, async (req, res) => {
  try {
    if (req.sessao.nivel !== 'leitor' && req.sessao.nivel !== 'adm') {
      return res.status(403).json({ erro: "Somente perfis leitor e adm podem usar esta rota." });
    }

    const rawId = req.params.id;
    const parts = rawId.split("__");
    
    let tabName, rowNumber;
    if (parts.length >= 2) {
      rowNumber = Number(parts.pop());
      tabName = parts.join("__");
    } else {
      rowNumber = Number(parts[0]);
      const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
      tabName = response.data.sheets[0].properties.title;
    }

    if (!rowNumber || rowNumber < 2) {
      return res.status(400).json({ erro: "Número de linha inválido." });
    }

    const headerDefRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A1:ZZ1`
    });
    const headers = (headerDefRes.data.values && headerDefRes.data.values[0]) ? headerDefRes.data.values[0] : [];

    const existingRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A${rowNumber}:ZZ${rowNumber}`
    });
    const existingRow = (existingRes.data.values && existingRes.data.values[0]) ? existingRes.data.values[0] : [];

    const { apontamento } = req.body;
    if (!apontamento || !apontamento.trim()) {
      return res.status(400).json({ erro: "Mensagem de apontamento vazia." });
    }

    const now = new Date();
    const dh = now.toLocaleString('pt-BR', { timeZone: 'America/Porto_Velho', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    const novaMensagem = `[${dh}] ${req.sessao.nome || req.sessao.whatsapp}: ${apontamento.trim()}`;

    // Update row logic
    const updatedRow = headers.map((h, i) => {
      const hLow = (h || "").toLowerCase().trim();
      if (hLow.includes('apontamento')) {
        const msgAtual = existingRow[i] || "";
        return msgAtual ? msgAtual + "; " + novaMensagem : novaMensagem;
      }
      if (hLow === 'alerta') return "1"; // Seta o alerta
      return existingRow[i] ?? ""; // Mantém o resto
    });

    const lastColumn = columnToLetter(headers.length);
    const range = `${tabName}!A${rowNumber}:${lastColumn}${rowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedRow] }
    });

    res.json({ sucesso: true, mensagem: "Apontamento salvo com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao salvar apontamento: " + (error.stack || error.message || String(error)) });
  }
});

app.post("/api/registros", editorOnly, async (req, res) => {
  try {
    // Alvo direto: aba 'todos' (ou req.body.tabName / req.body.prefixo como fallback)
    let tabName = req.body.tabName || 'todos';
    
    // Verifica se a aba 'todos' existe na planilha, senao usa prefixo ou primeira aba
    const metaResponse = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetExists = metaResponse.data.sheets.some(s => s.properties.title.toLowerCase() === tabName.toLowerCase());
    if (!sheetExists) {
      tabName = req.body.prefixo || metaResponse.data.sheets[0].properties.title;
    } else {
      const match = metaResponse.data.sheets.find(s => s.properties.title.toLowerCase() === tabName.toLowerCase());
      if (match) tabName = match.properties.title;
    }

    const safeTitle = tabName.replace(/'/g, "''");
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${safeTitle}'!A1:ZZ1`
    });
    
    const headers = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : [];
    if (headers.length === 0) {
      return res.status(400).json({ erro: `A aba ${tabName} não existe ou não tem cabeçalho.` });
    }

    // Prevenção de duplicações: se o processo já existe na planilha, atualiza a linha em vez de criar duplicata fora de ordem
    const reqProcNum = (req.body.numero || req.body.PROCESSOS || '').trim();
    if (reqProcNum && headers.length > 0) {
      const procColIndex = headers.findIndex(h => {
        const hl = String(h || '').trim().toLowerCase();
        return hl === 'processos' || hl === 'processo' || hl === 'nº processo';
      });
      if (procColIndex !== -1) {
        const colLetter = columnToLetter(procColIndex + 1);
        const allProcsRes = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${safeTitle}'!${colLetter}1:${colLetter}`
        });
        const allProcsVals = allProcsRes.data.values || [];
        const foundIdx = allProcsVals.findIndex(r => r && r[0] && String(r[0]).trim() === reqProcNum);
        if (foundIdx > 0) {
          const existingRowNum = foundIdx + 1;
          console.log(`[INSERT -> UPDATE] Processo '${reqProcNum}' já existe na linha ${existingRowNum}. Atualizando registro existente para evitar duplicação.`);
          const realRowRes = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${safeTitle}'!A${existingRowNum}:ZZ${existingRowNum}`
          });
          const existingRow = (realRowRes.data.values && realRowRes.data.values[0]) ? realRowRes.data.values[0] : [];
          const updatedRow = mapDataToRow(req.body, headers, existingRow, req.sessao);
          const lastColumn = columnToLetter(headers.length);
          const range = `'${safeTitle}'!A${existingRowNum}:${lastColumn}${existingRowNum}`;

          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [updatedRow] }
          });

          return res.json({
            sucesso: true,
            id: `${tabName}__${existingRowNum}`,
            _tabName: tabName,
            _rowNumber: existingRowNum,
            mensagem: "Processo já existente atualizado com sucesso."
          });
        }
      }
    }

    const newRow = mapDataToRow(req.body, headers, [], req.sessao);
    const lastColLetter = columnToLetter(headers.length);
    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${safeTitle}'!A:${lastColLetter}`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [newRow] }
    });

    let newRowNum = null;
    if (appendRes.data && appendRes.data.updates && appendRes.data.updates.updatedRange) {
      const match = appendRes.data.updates.updatedRange.match(/!A(\d+):/i) || appendRes.data.updates.updatedRange.match(/(\d+)$/);
      if (match) newRowNum = Number(match[1]);
    }

    console.log(`[INSERT] Novo registro adicionado na aba '${tabName}' (Linha ${newRowNum || 'fim'}). Range: '${safeTitle}'!A:${lastColLetter}`);

    res.json({
      sucesso: true,
      id: newRowNum ? `${tabName}__${newRowNum}` : undefined,
      _tabName: tabName,
      _rowNumber: newRowNum,
      mensagem: "Novo registro inserido com sucesso."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao inserir registro." });
  }
});

// ====== ENDPOINTS: GERENCIAMENTO DE ACESSOS (ADMIN ONLY) ======

async function getAcessosSheetId() {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = meta.data.sheets.find(s => s.properties.title === "Acessos");
  return sheet ? sheet.properties.sheetId : null;
}

app.get("/api/acessos", adminOnly, async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Acessos!A:H"
    });

    const rows = result.data.values || [];
    if (rows.length === 0) {
      return res.json([]);
    }

    const validRows = [];

    // Colunas: A=NOME, B=WHATSAPP, C=NIVEL DE ACESSO, D=SETOR, E=BLOQUEADO/LIBERADO, F=SENHA, G=CONTAGEM ACESSO, H=DATA ACESSO
    rows.slice(1).forEach((row, index) => {
      if (!row || row.length === 0 || row.every(cell => !cell || String(cell).trim() === "")) {
        return;
      }
      const statusRaw = (row[4] || "1").toString().trim();
      const status = statusRaw === "0" || statusRaw.toLowerCase() === "bloqueado" ? "bloqueado" : "liberado";
      validRows.push({
        nome:     (row[0] || "").trim(),
        whatsapp: (row[1] || "").trim(),
        nivel:    (row[2] || "").trim().toLowerCase(),
        setor:    (row[3] || "").trim(),
        status:   status,
        senha:    (row[5] || "").toString().trim(),
        contagem: (row[6] || "0").toString().trim(),
        data:     (row[7] || "").toString().trim(),
        _rowNumber: index + 2
      });
    });

    res.json(validRows);
  } catch (error) {
    console.error("[ACESSOS] Erro ao buscar acessos:", error);
    res.status(500).json({ erro: "Erro ao buscar acessos da planilha." });
  }
});

app.post("/api/acessos", adminOnly, async (req, res) => {
  try {
    const { nivel, nome, whatsapp, setor, status, senha } = req.body;
    if (!whatsapp || !nivel || !nome || !senha) {
      return res.status(400).json({ erro: "Nome, WhatsApp, nível de acesso e senha são obrigatórios." });
    }

    const nomeTrim     = nome.trim();
    const whatsappTrim = whatsapp.trim();
    const whatsappNorm = whatsappTrim.replace(/\D/g, "");
    const nivelNorm    = nivel.trim().toLowerCase();
    const setorTrim    = (setor || "").trim();
    const statusVal    = (status === "bloqueado") ? "0" : "1"; // Converte para 1/0
    const senhaTrim    = senha.toString().trim();

    // Validar se o whatsapp já existe (WHATSAPP está na coluna B)
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Acessos!B:B"
    });
    const rows = result.data.values || [];
    const whatsappExists = rows.some(r => (r[0] || "").toString().replace(/\D/g, "") === whatsappNorm);
    if (whatsappExists) {
      return res.status(400).json({ erro: "Este WhatsApp já está cadastrado." });
    }

    // Ordem correta: NOME | WHATSAPP | NIVEL | SETOR | STATUS | SENHA | CONTAGEM ACESSO | DATA ACESSO
    const newRow = [nomeTrim, whatsappTrim, nivelNorm, setorTrim, statusVal, senhaTrim, "0", ""];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Acessos!A:H",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [newRow] }
    });

    res.json({ sucesso: true, mensagem: "Usuário cadastrado com sucesso." });
  } catch (error) {
    console.error("[ACESSOS] Erro ao cadastrar acesso:", error);
    res.status(500).json({ erro: "Erro ao cadastrar usuário." });
  }
});

app.put("/api/acessos/:row", adminOnly, async (req, res) => {
  try {
    const rowNumber = Number(req.params.row);
    if (!rowNumber || rowNumber < 2) {
      return res.status(400).json({ erro: "Linha inválida." });
    }

    const { nivel, nome, whatsapp, setor, status, senha } = req.body;
    if (!whatsapp || !nivel || !nome || !senha) {
      return res.status(400).json({ erro: "Nome, WhatsApp, nível de acesso e senha são obrigatórios." });
    }

    const nomeTrim     = nome.trim();
    const whatsappTrim = whatsapp.trim();
    const nivelNorm    = nivel.trim().toLowerCase();
    const setorTrim    = (setor || "").trim();
    const statusVal    = (status === "bloqueado") ? "0" : "1"; // Converte para 1/0
    const senhaTrim    = senha.toString().trim();

    // Ordem correta: NOME | WHATSAPP | NIVEL | SETOR | STATUS | SENHA (mantém colunas G e H intocadas no Sheets)
    const updatedRow = [nomeTrim, whatsappTrim, nivelNorm, setorTrim, statusVal, senhaTrim];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Acessos!A${rowNumber}:F${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedRow] }
    });

    res.json({ sucesso: true, mensagem: "Usuário atualizado com sucesso." });
  } catch (error) {
    console.error("[ACESSOS] Erro ao atualizar acesso:", error);
    res.status(500).json({ erro: "Erro ao atualizar usuário." });
  }
});

app.delete("/api/acessos/:row", adminOnly, async (req, res) => {
  try {
    const rowNumber = Number(req.params.row);
    if (!rowNumber || rowNumber < 2) {
      return res.status(400).json({ erro: "Linha inválida." });
    }

    const sheetId = await getAcessosSheetId();
    if (!sheetId) {
      return res.status(400).json({ erro: "Aba Acessos não encontrada." });
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber
            }
          }
        }]
      }
    });

    res.json({ sucesso: true, mensagem: "Usuário removido com sucesso." });
  } catch (error) {
    console.error("[ACESSOS] Erro ao excluir acesso:", error);
    res.status(500).json({ erro: "Erro ao excluir usuário." });
  }
});


// ====== ENDPOINTS: ESCOLAS ======

const defaultEscolasHeaders = [
  "Código Super", "Super", "MUNICIPIO", "CÓDIGO INEP", "NOME DA ESCOLA",
  "LOCALIZAÇÃO", "Endereço - Nº", "Complemento", "BAIRRO", "CEP",
  "Nº DE TELEFONE", "TOTAL MATRÍCULA", "SALAS DE AULA ULTILIZADAS NA ESCOLA",
  "Diretor", "Contato do Diretor"
];

function normalizarStr(str) {
  if (!str) return '';
  return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function mapDataToEscolaRow(data, headers, originalRow = [], user = null) {
  return headers.map((h, i) => {
    const hDef = (h && String(h).trim()) ? String(h).trim() : (defaultEscolasHeaders[i] || "");
    const hLow = normalizarStr(hDef);
    let val = undefined;
    
    if (hLow.includes('codigo super') || hLow.includes('cod super')) val = data.codigoSuper;
    else if (hLow === 'super') val = data.super;
    else if (hLow.includes('munic')) val = data.municipio;
    else if (hLow.includes('inep')) val = data.codigoInep;
    else if (hLow === 'cep') val = data.cep;
    
    else if (hLow.includes('sala')) val = data.salas;
    else if (hLow.includes('email') || hLow.includes('e-mail')) val = data.email;
    else if (hLow.includes('rede') || hLow.includes('instagram') || hLow.includes('facebook') || hLow.includes('instagran')) val = data.redesSociais;
    else if (hLow.includes('secretario')) {
      if (hLow.includes('contato') || hLow.includes('telefone') || hLow.includes('celular') || hLow.includes('whats')) {
        val = data.contatoSecretario;
      } else {
        val = data.secretario;
      }
    }
    else if (hLow.includes('diretor') || hLow.includes('gestor')) {
      if (hLow.includes('contato') || hLow.includes('telefone') || hLow.includes('celular') || hLow.includes('whats')) {
        val = data.contatoDiretor;
      } else {
        val = data.diretor;
      }
    }
    else if (hLow.includes('contato') || hLow.includes('celular')) val = data.contatoDiretor;
    else if (hLow.includes('telefone') || hLow.includes('fone')) val = data.telefone;
    else if (hLow.includes('total matricula') || hLow.includes('matricula')) val = data.totalMatricula;
    
    else if (hLow.includes('localiza')) val = data.localizacao;
    else if (hLow.includes('endere')) val = data.endereco;
    else if (hLow.includes('complement')) val = data.complemento;
    else if (hLow.includes('bairro')) val = data.bairro;
    
    else if (hLow.includes('nome da escola') || hLow.includes('escola')) val = data.nome;

    if (val !== undefined) return val;
    return originalRow[i] ?? "";
  });
}

function mapRowToEscolaObj(headers, row) {
  const get = (termos) => {
    // 1. Tenta correspondência EXATA de header primeiro
    for (const t of termos) {
      const idx = headers.findIndex(h => normalizarStr(h) === normalizarStr(t));
      if (idx >= 0) return String(row[idx] || '').trim();
    }
    // 2. Tenta correspondência parcial (includes), ignorando 'codigo' quando busca por 'super'
    for (const t of termos) {
      const idx = headers.findIndex(h => {
        const normH = normalizarStr(h);
        const normT = normalizarStr(t);
        if (normT === 'super' && normH.includes('codigo')) return false;
        return normH.includes(normT);
      });
      if (idx >= 0) return String(row[idx] || '').trim();
    }
    return '';
  };
  const getNum = (termos) => {
    const v = get(termos);
    const n = v ? Number(String(v).replace(/[^\d]/g, '')) : 0;
    return isNaN(n) ? 0 : n;
  };

  const categoria       = get(['categoria da parceria', 'categoria']);
  const nome            = get(['nome da escola | entidade | prefeitura', 'nome escola | entidade | prefeitura', 'nome da escola', 'nome escola', 'escola', 'entidade', 'prefeitura']);
  const alunos          = getNum(['nº de alunos', 'n de alunos', 'alunos', 'total matrícula', 'total matricula', 'matricula']);
  const modalidade      = get(['modalidade', 'modalidade de atendimento']);
  const inep            = get(['inep', 'codigo inep', 'código inep']);
  const cnpj            = get(['cnpj']);
  const endereco        = get(['endereço', 'endereco', 'endereço - nº', 'logradouro', 'nº']);
  const bairro          = get(['bairro | distrito | aldeia', 'bairro', 'distrito', 'aldeia']);
  const complemento     = get(['complemento', 'complement']);
  const cep             = get(['cep']);
  const competencia     = get(['competência', 'competencia']);
  const superV          = get(['super', 'superintendencia', 'superintendência', 'nome super', 'nome da super', 'cre']);
  const redesSociais    = get(['rede social', 'redes sociais', 'instagram', 'facebook', 'instagran', 'redes']);
  const telefone        = get(['telefone', 'nº de telefone', 'fone']);
  const email           = get(['email da entidade', 'email', 'e-mail']);
  const diretor         = get(['nome do diretor | presidente | prefeito', 'diretor', 'gestor', 'nome diretor', 'nome do diretor', 'prefeito', 'presidente']);
  const contatoDiretor  = get(['contato do diretor', 'contato diretor', 'telefone diretor', 'celular diretor', 'contato']);
  const secretario      = get(['nome do secretário', 'nome do secretario', 'secretario', 'secretário', 'nome secretario', 'nome do secretário']);
  const contatoSecretario = get(['contato do secretário', 'contato do secretario', 'contato secretario', 'telefone secretario', 'celular secretario', 'whats secretario']);
  const salas           = getNum(['quant. salas de aula', 'salas de aula ultilizadas na escola', 'salas de aula', 'sala']);
  const salasAdm        = getNum(['quant. salas administrativas', 'salas administrativas', 'salas adm']);
  const salaAEE         = get(['sala do aee', 'sala de recursos aee', 'sala aee', 'aee']);
  const banheiros       = get(['banheiros']);
  const patio           = get(['pátio', 'patio']);
  const auditorio       = get(['auditório', 'auditorio']);
  const refeitorio      = get(['refeitório (s/n)', 'refeitório', 'refeitorio']);
  const quadra          = get(['quadra (s/n)', 'quadra poliesportiva', 'quadra']);
  const localidade      = get(['localidade (urbana/rural)', 'localidade', 'localização', 'localizacao', 'localiza']);

  // Novos campos complementares de Endereço (Rural & Plus Code)
  const linha           = get(['linha / estrada', 'linha', 'estrada']);
  const rodoviaKm       = get(['rodovia / br e km', 'rodovia', 'br', 'km']);
  const sitioRio        = get(['sítio / fazenda / rio', 'sitio / fazenda / rio', 'sítio', 'sitio', 'rio', 'fazenda', 'gleba']);
  const plusCode        = get(['plus code (google)', 'plus code', 'pluscode', 'google plus code', 'code plus']);

  // Novos campos complementares de Infraestrutura & Espaços
  const acessibilidade      = get(['acessibilidade (s/n)', 'acessibilidade']);
  const patioCoberto        = get(['pátio coberto', 'patio coberto', 'pátio', 'patio']);
  const cozinha             = get(['área de cocção (cozinha)', 'área de cocção', 'area de coccao', 'cozinha']);
  const depositoSeco        = get(['depósito seco (mantimentos)', 'depósito seco', 'deposito seco', 'almoxarifado de mantimento secos']);
  const depositoPereciveis  = get(['depósito de perecíveis (área fria)', 'depósito de perecíveis', 'deposito de pereciveis', 'deposito de pareciveis', 'área fria']);
  const almoxarifadoAdm     = get(['almoxarifado administrativo', 'almoxarifado']);
  const depositoGeral       = get(['depósito geral', 'depósito', 'deposito']);
  const biblioteca          = get(['biblioteca']);
  const dml                 = get(['dml (depósito material limpeza)', 'dml']);
  const quadraCoberta       = get(['quadra coberta', 'se é coberta', 'quadra coberta (s/n)']);
  const quadraPiso          = get(['piso da quadra', 'piso de piso']);
  const labInfo             = get(['laboratório de informática', 'laboratorio de informatica', 'laboratório de informartica']);
  const hall                = get(['hall de acolhimento', 'hall']);
  const ppci                = get(['ppci']);
  const fonteAgua           = get(['fonte de água', 'fonte de agua']);
  const energiaSolar        = get(['energia solar']);
  const tipoAbertura        = get(['tipo de abertura', 'abertura']);
  const tipoForro           = get(['tipo de forro', 'forro']);
  const tipoPiso            = get(['tipo de piso da escola', 'tipo de piso', 'piso']);
  const tipoTelhado         = get(['tipo de telhado', 'telhado', 'cobertura']);
  const muradaGradeada      = get(['escola murada ou gradeada', 'escola murado ou gradeado', 'murado ou gradeado', 'murada']);

  return {
    codigoSuper: get(['codigo super', 'cod super', 'cd super']) || superV,
    super: superV,
    categoria: categoria,
    competencia: competencia,
    municipio: get(['municipio', 'município']),
    codigoInep: inep,
    inep: inep,
    cnpj: cnpj,
    nome: nome,
    localizacao: localidade || 'Urbana',
    localidade: localidade || 'Urbana',
    endereco: endereco,
    complemento: complemento,
    bairro: bairro,
    cep: cep,
    linha: linha,
    rodoviaKm: rodoviaKm,
    sitioRio: sitioRio,
    plusCode: plusCode,
    telefone: telefone,
    totalMatricula: alunos,
    alunos: alunos,
    modalidade: modalidade,
    modalidadeStr: modalidade,
    salas: salas,
    salasAula: salas,
    salasAdm: salasAdm,
    salaAEE: salaAEE,
    banheiros: banheiros,
    patio: patio,
    patioCoberto: patioCoberto || patio,
    auditorio: auditorio,
    refeitorio: refeitorio,
    quadra: quadra,
    cozinha: cozinha,
    depositoSeco: depositoSeco,
    depositoPereciveis: depositoPereciveis,
    almoxarifadoAdm: almoxarifadoAdm,
    deposito: depositoGeral,
    depositoGeral: depositoGeral,
    biblioteca: biblioteca,
    dml: dml,
    quadraCoberta: quadraCoberta,
    quadraPiso: quadraPiso,
    labInfo: labInfo,
    hall: hall,
    ppci: ppci,
    fonteAgua: fonteAgua,
    energiaSolar: energiaSolar,
    acessibilidade: acessibilidade,
    tipoAbertura: tipoAbertura,
    tipoForro: tipoForro,
    tipoPiso: tipoPiso,
    tipoTelhado: tipoTelhado,
    muradaGradeada: muradaGradeada,
    diretor: diretor,
    contatoDiretor: contatoDiretor,
    secretario: secretario,
    contatoSecretario: contatoSecretario,
    email: email,
    redesSociais: redesSociais
  };
}

app.get("/api/escolas", async (req, res) => {
  try {
    const targetSheetId = process.env.ESCOLAS_SHEET_ID || process.env.ENTIDADES_SHEET_ID || "1kOlpcEzduP_nCSvKo0DYNBnABYV_GWXBEN8Sfu1mCpI";
    let rows = [];

    // Tentar ler da nova planilha de escolas (Aba ENTIDADES ou range A1:AC das 29 colunas)
    try {
      const respNova = await sheets.spreadsheets.values.get({
        spreadsheetId: targetSheetId,
        range: "'ENTIDADES'!A1:AC"
      });
      rows = respNova.data.values || [];
    } catch(errAba) {
      try {
        const respNova = await sheets.spreadsheets.values.get({
          spreadsheetId: targetSheetId,
          range: "A1:AC"
        });
        rows = respNova.data.values || [];
      } catch(errGeral) {
        console.warn("Aviso ao ler planilha oficial:", errGeral.message);
      }
    }

    if (rows.length < 2) {
      return res.json({ rows: [], total: 0, aviso: "Planilha oficial vazia ou permissão pendente (Qualquer pessoa com o link: Leitor)." });
    }
    
    const headers = rows[0];
    const dataRows = rows.slice(1).map((r, idx) => {
      const mapped = mapRowToEscolaObj(headers, r);
      return {
        id: mapped.codigoInep || (idx + 2) + "__entidades",
        _tabName: "ENTIDADES",
        ...mapped
      };
    }).filter(e => (e.nome && e.nome.length > 1) || (e.municipio && e.municipio.length > 1));

    res.json({ rows: dataRows, total: dataRows.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar escolas: " + error.message });
  }
});

app.post("/api/escolas", async (req, res) => {
  try {
    const targetSheetId = process.env.ESCOLAS_SHEET_ID || process.env.ENTIDADES_SHEET_ID || "1kOlpcEzduP_nCSvKo0DYNBnABYV_GWXBEN8Sfu1mCpI";
    const data = req.body || {};
    const newRow = [
      data.municipio || "",
      data.categoria || "",
      data.nome || "",
      data.totalMatricula || data.alunos || "",
      data.modalidade || data.modalidadeStr || "",
      data.codigoInep || data.inep || "",
      data.cnpj || "",
      data.endereco || "",
      data.bairro || "",
      data.complemento || "",
      data.cep || "",
      data.competencia || "",
      data.super || data.codigoSuper || "",
      data.redesSociais || "",
      data.telefone || "",
      data.email || "",
      data.diretor || "",
      data.contatoDiretor || "",
      data.secretario || "",
      data.contatoSecretario || "",
      data.salas || data.salasAula || "",
      data.salasAdm || "",
      data.salaAEE || "",
      data.banheiros || "",
      data.patioCoberto || data.patio || "",
      data.auditorio || "",
      data.refeitorio || "",
      data.quadra || "",
      data.localidade || data.localizacao || "Urbana",
      // Endereço adicional (Rural & Plus Code):
      data.linha || "",
      data.rodoviaKm || "",
      data.sitioRio || "",
      data.plusCode || "",
      // Infraestrutura e Espaços (Nova Versão):
      data.acessibilidade || "",
      data.cozinha || "",
      data.depositoSeco || "",
      data.depositoPereciveis || "",
      data.almoxarifadoAdm || "",
      data.depositoGeral || data.deposito || "",
      data.biblioteca || "",
      data.dml || "",
      data.quadraCoberta || "",
      data.quadraPiso || "",
      data.labInfo || "",
      data.hall || "",
      data.ppci || "",
      data.fonteAgua || "",
      data.energiaSolar || "",
      data.tipoAbertura || "",
      data.tipoForro || "",
      data.tipoPiso || "",
      data.tipoTelhado || "",
      data.muradaGradeada || ""
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: targetSheetId,
      range: "'ENTIDADES'!A:AZ",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [newRow] }
    });
    res.json({ sucesso: true, mensagem: "Escola cadastrada com sucesso na planilha oficial." });
  } catch (error) {
    console.error("Erro ao cadastrar escola na planilha:", error);
    res.status(500).json({ erro: "Erro ao cadastrar na planilha: " + error.message });
  }
});

app.put("/api/escolas/:id", editorOnly, async (req, res) => {
  try {
    const rawId = req.params.id;
    const parts = rawId.split("__");
    const rowNumber = Number(parts[0]);

    if (!rowNumber || rowNumber < 2) return res.status(400).json({ erro: "Linha inválida." });

    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `escolas!A${rowNumber}:Z${rowNumber}`
    });
    const existingRow = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : [];

    const headerDefRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `escolas!A1:Z1`
    });
    const headers = (headerDefRes.data.values && headerDefRes.data.values[0]) ? headerDefRes.data.values[0] : [];

    const updatedRow = mapDataToEscolaRow(req.body, headers, existingRow, req.sessao);
    const lastColumn = columnToLetter(headers.length);
    const range = `escolas!A${rowNumber}:${lastColumn}${rowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedRow] }
    });
    res.json({ sucesso: true, mensagem: "Escola atualizada." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar escola." });
  }
});

app.delete("/api/escolas/:id", editorOnly, async (req, res) => {
  try {
    const rawId = req.params.id;
    const rowNumber = Number(rawId.split("__")[0]);
    if (!rowNumber || rowNumber < 2) return res.status(400).json({ erro: "Linha inválida." });

    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = meta.data.sheets.find(s => s.properties.title.toLowerCase() === 'escolas');
    if (!sheet) return res.status(404).json({ erro: "Aba escolas não encontrada." });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: { sheetId: sheet.properties.sheetId, dimension: "ROWS", startIndex: rowNumber - 1, endIndex: rowNumber }
          }
        }]
      }
    });
    res.json({ sucesso: true, mensagem: "Escola excluída." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao excluir escola." });
  }
});


// ====== ENDPOINTS: CONTATOS ======
const defaultContatosHeaders = [
  "Municipio", "Nome do Prefeito", "celular prefeito", "Nome secretario", "celular secretario", "E-MAIL", "OBSERVACOES", "QTDE ESCOLAS", "QTDE ALUNOS"
];

function mapRowToContatoObj(headers, row) {
  const get = (termos) => {
    for (const t of termos) {
      const idx = headers.findIndex(h => normalizarStr(h) === normalizarStr(t));
      if (idx !== -1 && row[idx] !== undefined) return String(row[idx]).trim();
    }
    return "";
  };
  return {
    municipio: get(['municipio', 'municpio']),
    nomePrefeito: get(['nome do prefeito', 'prefeito', 'nome prefeito']),
    celularPrefeito: get(['celular prefeito', 'telefone prefeito']),
    nomeSecretario: get(['nome secretario', 'secretario', 'nome secretrio']),
    celularSecretario: get(['celular secretario', 'telefone secretario']),
    email: get(['e-mail', 'email']),
    observacoes: get(['observacoes', 'observaes', 'obs']),
    qtdeEscolas: get(['qtde escolas', 'escolas', 'qtd escolas']),
    qtdeAlunos: get(['qtde alunos', 'alunos', 'qtd alunos'])
  };
}

function mapDataToContatoRow(data, headers, originalRow = []) {
  return headers.map((h, i) => {
    const hLow = normalizarStr(h || "");
    let val = undefined;
    if (hLow.includes('municipio')) val = data.municipio;
    else if (hLow.includes('prefeito') && hLow.includes('celular')) val = data.celularPrefeito;
    else if (hLow.includes('prefeito')) val = data.nomePrefeito;
    else if (hLow.includes('secretario') && hLow.includes('celular')) val = data.celularSecretario;
    else if (hLow.includes('secretario')) val = data.nomeSecretario;
    else if (hLow.includes('mail')) val = data.email;
    else if (hLow.includes('observ')) val = data.observacoes;
    else if (hLow.includes('escola')) val = data.qtdeEscolas;
    else if (hLow.includes('aluno')) val = data.qtdeAlunos;

    if (val !== undefined) return val;
    return originalRow[i] !== undefined ? originalRow[i] : "";
  });
}

app.get("/api/contatos", async (req, res) => {
  try {
    let escolasPorMunicipio = {};
    try {
      const respEscolas = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "escolas!A1:Z" });
      const rowsE = respEscolas.data.values || [];
      if (rowsE.length > 1) {
        const headersE = rowsE[0];
        rowsE.slice(1).forEach(r => {
          const escObj = mapRowToEscolaObj(headersE, r);
          if (!escObj.municipio) return;
          const munLower = normalizarStr(escObj.municipio);
          if (!escolasPorMunicipio[munLower]) {
            escolasPorMunicipio[munLower] = { ineps: new Set(), totalAlunos: 0 };
          }
          if (escObj.codigoInep) escolasPorMunicipio[munLower].ineps.add(escObj.codigoInep);
          if (escObj.totalMatricula) escolasPorMunicipio[munLower].totalAlunos += (parseInt(escObj.totalMatricula) || 0);
        });
      }
    } catch (e) {
      console.error("Erro ao ler escolas para contatos:", e);
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "contatos!A1:Z"
    });
    const rows = response.data.values || [];
    let headers = rows.length > 0 ? rows[0] : defaultContatosHeaders;

    const dataRows = rows.slice(1).map((r, idx) => {
      let obj = {
        id: (idx + 2) + "_contatos",
        _tabName: "contatos",
        ...mapRowToContatoObj(headers, r)
      };
      
      const munLower = normalizarStr(obj.municipio);
      if (escolasPorMunicipio[munLower]) {
        obj.qtdeEscolas = escolasPorMunicipio[munLower].ineps.size;
        obj.qtdeAlunos = escolasPorMunicipio[munLower].totalAlunos;
      } else {
        obj.qtdeEscolas = 0;
        obj.qtdeAlunos = 0;
      }
      return obj;
    });
    res.json(dataRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar contatos." });
  }
});

app.post("/api/contatos", editorOnly, async (req, res) => {
  try {
    const headerDefRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "contatos!A1:Z1" });
    let headers = (headerDefRes.data.values && headerDefRes.data.values[0]) ? headerDefRes.data.values[0] : [];
    if (headers.length === 0) {
      headers = defaultContatosHeaders;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID, range: "contatos!A1", valueInputOption: "USER_ENTERED", requestBody: { values: [headers] }
      });
    }
    const newRow = mapDataToContatoRow(req.body, headers, []);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID, range: "contatos!A:A", valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS", requestBody: { values: [newRow] }
    });
    res.json({ sucesso: true, mensagem: "Contato cadastrado." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao cadastrar contato." });
  }
});

// ====== ENDPOINT: CADASTRO GERAL DE ENTIDADES (VERSÃO ESTENDIDA 64 COLUNAS - ABA ENTIDADES) ======
function gerarCodigoLocalizador() {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // 24 letras sem I e O para evitar ambiguidade com 1 e 0
  const numeros = "0123456789";
  let l = "";
  let n = "";

  while (l.length < 3) {
    const char = letras.charAt(Math.floor(Math.random() * letras.length));
    if (l.length === 0 || l[l.length - 1] !== char) {
      l += char;
    }
  }
  // Evitar sequências alfabéticas (ex: ABC, BCD) e 3 letras iguais (ex: AAA)
  if ((l.charCodeAt(1) === l.charCodeAt(0) + 1 && l.charCodeAt(2) === l.charCodeAt(1) + 1) ||
      (l[0] === l[1] && l[1] === l[2])) {
    return gerarCodigoLocalizador();
  }

  while (n.length < 3) {
    const num = numeros.charAt(Math.floor(Math.random() * numeros.length));
    if (n.length === 0 || n[n.length - 1] !== num) {
      n += num;
    }
  }
  // Evitar sequências numéricas (ex: 123, 234) ou regressivas (321) e 3 dígitos iguais (ex: 000)
  const d0 = Number(n[0]), d1 = Number(n[1]), d2 = Number(n[2]);
  if ((d1 === d0 + 1 && d2 === d1 + 1) || (d1 === d0 - 1 && d2 === d1 - 1) || (d0 === d1 && d1 === d2)) {
    return gerarCodigoLocalizador();
  }

  return `${l}${n}`;
}

const official64Headers = [
  "Município",
  "Categoria da entidade",
  "Nome da Escola / Conselho Escolar | prefeitura",
  "Nº de Alunos",
  "Modalidade",
  "Código INEP",
  "CNPJ",
  "Endereço (Rua / Av / Linha)",
  "Bairro / Distrito / Linha",
  "Complemento",
  "CEP",
  "Competência",
  "Linha / Estrada",
  "Rodovia / BR & KM",
  "Sítio / Fazenda / Gleba / Rio",
  "Plus Code (Google Maps)",
  "Superintendência de Educação",
  "Rede Social",
  "Telefone da Unidade",
  "E-mail da entidade",
  "Nome do Diretor | Presidente",
  "Contato do Diretor | Presidente",
  "Nome do Secretário(a)",
  "Contato do Secretário(a)",
  "Localidade",
  "QUANT. SALA DE AULA",
  "QUANT. SALA ADM",
  "SALA DO AEE (S/N)",
  "BANHEIROS (QTDE)",
  "PÁTIO COBERTO (S/N)",
  "AUDITÓRIO (S/N)",
  "REFEITÓRIO (S/N)",
  "QUADRA POLIESPORTIVA",
  "ÁREA DE COCÇÃO (COZINHA)",
  "DEPÓSITO SECO (MANTIMENTOS)",
  "DEPÓSITO PERECÍVEIS (ÁREA FRIA)",
  "ALMOXARIFADO ADM",
  "DEPÓSITO GERAL",
  "BIBLIOTECA (S/N)",
  "LAB. DE INFORMÁTICA",
  "HALL DE ACOLHIMENTO",
  "DML (MAT. LIMPEZA)",
  "QUADRA COBERTA (S/N)",
  "PISO DA QUADRA",
  "ACESSIBILIDADE (S/N)",
  "PPCI (PREV. INCÊNDIO)",
  "FONTE DE ÁGUA",
  "ENERGIA SOLAR (S/N)",
  "ESCOLA MURADA / GRADEADA",
  "TIPO DE ABERTURA (PORTAS / JANELAS)",
  "TIPO DE FORRO",
  "TIPO DE PISO",
  "TIPO DE TELHADO",
  "Observações Gerais da Infraestrutura (Opcional)",
  "Instagram",
  "Facebook",
  "YouTube",
  "Outro / Site",
  "Não possui nenhuma rede social ou página na internet",
  "Nome do registrador",
  "Telefone celular registrador",
  "Email registrador",
  "Cargo",
  "codigo localizador"
];

function mapDataToOfficial64Row(data, existingRow = []) {
  const row = new Array(64).fill("");

  const getVal = (novo, idx) => {
    if (novo !== undefined && novo !== null && novo !== "") {
      return novo.toString().trim();
    }
    return (existingRow && existingRow[idx] !== undefined && existingRow[idx] !== null) ? existingRow[idx].toString().trim() : "";
  };

  row[0] = getVal(data.municipio, 0);
  row[1] = getVal(data.categoria, 1);
  row[2] = getVal(data.nome, 2);
  row[3] = getVal(data.alunos || data.totalMatricula, 3);
  row[4] = getVal(data.modalidade, 4);
  row[5] = getVal(data.inep || data.codigoInep, 5);
  row[6] = getVal(data.cnpj, 6);
  row[7] = getVal(data.endereco, 7);
  row[8] = getVal(data.bairro, 8);
  row[9] = getVal(data.complemento, 9);
  row[10] = getVal(data.cep, 10);
  row[11] = getVal(data.competencia, 11);
  row[12] = getVal(data.linha, 12);
  row[13] = getVal(data.rodoviaKm, 13);
  row[14] = getVal(data.sitioRio, 14);
  row[15] = getVal(data.plusCode, 15);
  row[16] = getVal(data.super, 16);
  row[17] = getVal(data.redesSociais, 17);
  row[18] = getVal(data.telefone, 18);
  row[19] = getVal(data.email, 19);
  row[20] = getVal(data.diretor, 20);
  row[21] = getVal(data.contatoDiretor, 21);
  row[22] = getVal(data.secretario, 22);
  row[23] = getVal(data.contatoSecretario, 23);
  row[24] = getVal(data.localidade || "Urbana", 24);
  row[25] = getVal(data.salasAula || data.salas, 25);
  row[26] = getVal(data.salasAdm, 26);
  row[27] = getVal(data.salaAEE, 27);
  row[28] = getVal(data.banheiros, 28);
  row[29] = getVal(data.patioCoberto || data.patio, 29);
  row[30] = getVal(data.auditorio, 30);
  row[31] = getVal(data.refeitorio, 31);
  row[32] = getVal(data.quadra, 32);
  row[33] = getVal(data.cozinha || data.areaCoccao, 33);
  row[34] = getVal(data.depositoSeco, 34);
  row[35] = getVal(data.depositoPereciveis, 35);
  row[36] = getVal(data.almoxarifadoAdm, 36);
  row[37] = getVal(data.depositoGeral || data.deposito, 37);
  row[38] = getVal(data.biblioteca, 38);
  row[39] = getVal(data.labInfo, 39);
  row[40] = getVal(data.hall, 40);
  row[41] = getVal(data.dml, 41);
  row[42] = getVal(data.quadraCoberta, 42);
  row[43] = getVal(data.quadraPiso, 43);
  row[44] = getVal(data.acessibilidade, 44);
  row[45] = getVal(data.ppci, 45);
  row[46] = getVal(data.fonteAgua, 46);
  row[47] = getVal(data.energiaSolar, 47);
  row[48] = getVal(data.muradaGradeada, 48);
  row[49] = getVal(data.tipoAbertura, 49);
  row[50] = getVal(data.tipoForro, 50);
  row[51] = getVal(data.tipoPiso, 51);
  row[52] = getVal(data.tipoTelhado, 52);
  row[53] = getVal(data.observacoes, 53);
  row[54] = getVal(data.instagram, 54);
  row[55] = getVal(data.facebook, 55);
  row[56] = getVal(data.youtube, 56);
  row[57] = getVal(data.outroSite, 57);
  row[58] = getVal(data.semRedeSocial, 58);
  row[59] = getVal(data.registradorNome, 59);
  row[60] = getVal(data.registradorTelefone, 60);
  row[61] = getVal(data.registradorEmail, 61);
  row[62] = getVal(data.registradorCargo || data.cargo, 62);

  // Coluna 63 (64ª coluna): codigo localizador (3 letras e 3 números aleatórios não sequenciais em caixa alta)
  let codLoc = getVal(data.codigoLocalizador, 63);
  if (!codLoc || codLoc.trim().length < 4) {
    codLoc = gerarCodigoLocalizador();
  }
  row[63] = codLoc.toUpperCase().trim();

  return row;
}

const DEFAULT_AGENT_EMAIL = "planilha-seduc@gen-lang-client-0043658037.iam.gserviceaccount.com";

// Rota de listagem de entidades da planilha oficial (63 colunas)
app.get("/api/entidades", async (req, res) => {
  try {
    const ENTIDADES_SHEET_ID = "1kOlpcEzduP_nCSvKo0DYNBnABYV_GWXBEN8Sfu1mCpI";
    let targetSheetTitle = "ENTIDADES";
    try {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: ENTIDADES_SHEET_ID });
      const sheetList = meta.data.sheets || [];
      const matchEnt = sheetList.find(s => {
        const title = (s.properties.title || '').trim().toLowerCase();
        return title === 'entidades' || title.includes('entidade');
      });
      const gid0 = sheetList.find(s => s.properties && s.properties.sheetId === 0);
      if (matchEnt) targetSheetTitle = matchEnt.properties.title;
      else if (gid0) targetSheetTitle = gid0.properties.title;
      else if (sheetList.length > 0) targetSheetTitle = sheetList[0].properties.title;
    } catch(e) {}

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: ENTIDADES_SHEET_ID,
      range: `'${targetSheetTitle}'!A1:BL`
    });

    const values = response.data.values || [];
    if (values.length < 2) {
      return res.json({ rows: [], total: 0, planilhaId: ENTIDADES_SHEET_ID, aba: targetSheetTitle });
    }

    const rows = values.slice(1).map((r, idx) => {
      const rowNum = idx + 2;
      return {
        id: r[5] || `ent_${rowNum}`,
        linhaPlanilha: rowNum,
        municipio: r[0] || "",
        categoria: r[1] || "",
        nome: r[2] || "",
        alunos: r[3] || "0",
        totalMatricula: r[3] || "0",
        modalidade: r[4] || "",
        inep: r[5] || "",
        codigoInep: r[5] || "",
        cnpj: r[6] || "",
        endereco: r[7] || "",
        bairro: r[8] || "",
        complemento: r[9] || "",
        cep: r[10] || "",
        competencia: r[11] || "",
        linha: r[12] || "",
        rodoviaKm: r[13] || "",
        sitioRio: r[14] || "",
        plusCode: r[15] || "",
        super: r[16] || "",
        redesSociais: r[17] || "",
        telefone: r[18] || "",
        email: r[19] || "",
        diretor: r[20] || "",
        contatoDiretor: r[21] || "",
        secretario: r[22] || "",
        contatoSecretario: r[23] || "",
        localidade: r[24] || "Urbana",
        salasAula: r[25] || "",
        salasAdm: r[26] || "",
        salaAEE: r[27] || "",
        banheiros: r[28] || "",
        patioCoberto: r[29] || "",
        patio: r[29] || "",
        auditorio: r[30] || "",
        refeitorio: r[31] || "",
        quadra: r[32] || "",
        cozinha: r[33] || "",
        areaCoccao: r[33] || "",
        depositoSeco: r[34] || "",
        depositoPereciveis: r[35] || "",
        almoxarifadoAdm: r[36] || "",
        depositoGeral: r[37] || "",
        deposito: r[37] || "",
        biblioteca: r[38] || "",
        labInfo: r[39] || "",
        hall: r[40] || "",
        dml: r[41] || "",
        quadraCoberta: r[42] || "",
        quadraPiso: r[43] || "",
        acessibilidade: r[44] || "",
        ppci: r[45] || "",
        fonteAgua: r[46] || "",
        energiaSolar: r[47] || "",
        muradaGradeada: r[48] || "",
        tipoAbertura: r[49] || "",
        tipoForro: r[50] || "",
        tipoPiso: r[51] || "",
        tipoTelhado: r[52] || "",
        observacoes: r[53] || "",
        instagram: r[54] || "",
        facebook: r[55] || "",
        youtube: r[56] || "",
        outroSite: r[57] || "",
        semRedeSocial: r[58] || "",
        registradorNome: r[59] || "",
        registradorTelefone: r[60] || "",
        registradorEmail: r[61] || "",
        registradorCargo: r[62] || "",
        codigoLocalizador: r[63] || ""
      };
    }).filter(e => e.nome && e.nome.trim().length > 0);

    res.json({ rows, total: rows.length, planilhaId: ENTIDADES_SHEET_ID, aba: targetSheetTitle });
  } catch (error) {
    console.error("Erro ao listar entidades:", error);
    res.status(500).json({ erro: error.message });
  }
});

app.post("/api/entidades", async (req, res) => {
  try {
    const data = req.body || {};
    // Planilha Oficial Estrita: 1kOlpcEzduP_nCSvKo0DYNBnABYV_GWXBEN8Sfu1mCpI
    const ENTIDADES_SHEET_ID = "1kOlpcEzduP_nCSvKo0DYNBnABYV_GWXBEN8Sfu1mCpI";
    
    // Tenta encontrar a aba exata por metadados na planilha oficial
    let targetSheetTitle = "ENTIDADES";
    try {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: ENTIDADES_SHEET_ID });
      const sheetList = meta.data.sheets || [];
      const matchEnt = sheetList.find(s => {
        const title = (s.properties.title || '').trim().toLowerCase();
        return title === 'entidades' || title.includes('entidade');
      });
      const gid0 = sheetList.find(s => s.properties && s.properties.sheetId === 0);
      if (matchEnt) targetSheetTitle = matchEnt.properties.title;
      else if (gid0) targetSheetTitle = gid0.properties.title;
      else if (sheetList.length > 0) targetSheetTitle = sheetList[0].properties.title;
    } catch(errMeta) {
      console.warn("Aviso ao buscar metadados das abas:", errMeta.message);
    }

    // Lê todas as linhas existentes até a coluna BL (coluna 64)
    const existingRes = await sheets.spreadsheets.values.get({
      spreadsheetId: ENTIDADES_SHEET_ID,
      range: `'${targetSheetTitle}'!A:BL`
    });
    const allRows = existingRes.data.values || [];

    // Se estiver sem cabeçalho, cria o cabeçalho oficial de 64 colunas
    if (allRows.length === 0 || allRows[0].length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: ENTIDADES_SHEET_ID,
        range: `'${targetSheetTitle}'!A1:BL1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [official64Headers] }
      });
      allRows.push(official64Headers);
    } else if (allRows[0].length < 64) {
      // Atualiza linha de cabeçalho para garantir todas as 64 colunas até BL1
      await sheets.spreadsheets.values.update({
        spreadsheetId: ENTIDADES_SHEET_ID,
        range: `'${targetSheetTitle}'!A1:BL1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [official64Headers] }
      });
      allRows[0] = official64Headers;
    }

    // Identificação para UPDATE vs INSERT:
    const inepInput = (data.inep || data.codigoInep || "").toString().replace(/\D/g, "");
    const cnpjInput = (data.cnpj || "").toString().replace(/\D/g, "");
    const nomeNorm = (data.nome || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const munNorm = (data.municipio || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    let existingRowIndex = -1; // 0-based index no array allRows
    let existingRowData = null;

    // Procura registro existente da linha 2 em diante (índice 1 em diante)
    for (let i = 1; i < allRows.length; i++) {
      const r = allRows[i] || [];
      const rowInep = (r[5] || "").toString().replace(/\D/g, "");
      const rowCnpj = (r[6] || "").toString().replace(/\D/g, "");
      const rowNome = (r[2] || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const rowMun = (r[0] || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // 1. Match forte por INEP (se tiver 4 ou mais dígitos)
      if (inepInput.length >= 4 && rowInep === inepInput) {
        existingRowIndex = i;
        existingRowData = r;
        break;
      }

      // 2. Match por CNPJ (se tiver 14 dígitos e bater)
      if (cnpjInput.length === 14 && rowCnpj === cnpjInput) {
        existingRowIndex = i;
        existingRowData = r;
        break;
      }

      // 3. Match por Nome da Escola + Município
      if (nomeNorm.length >= 3 && rowNome === nomeNorm && (munNorm.length === 0 || rowMun === munNorm)) {
        existingRowIndex = i;
        existingRowData = r;
        break;
      }
    }

    const agoraDataHora = new Date().toLocaleString("pt-BR", { timeZone: "America/Porto_Velho" });

    if (existingRowIndex >= 1) {
      // É EDIÇÃO! Deve gravar na MESMA LINHA que já está gravada.
      const rowNumber = existingRowIndex + 1; // 1-indexed na planilha
      const updatedRow = mapDataToOfficial64Row(data, existingRowData);
      const codigoLocalizadorFinal = updatedRow[63];

      await sheets.spreadsheets.values.update({
        spreadsheetId: ENTIDADES_SHEET_ID,
        range: `'${targetSheetTitle}'!A${rowNumber}:BL${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [updatedRow] }
      });

      console.log(`✅ Entidade ATUALIZADA com sucesso na linha ${rowNumber} da planilha oficial "${targetSheetTitle}": ${data.nome} (INEP: ${inepInput}) | Localizador: ${codigoLocalizadorFinal}`);
      return res.json({
        sucesso: true,
        acao: "atualizado",
        linha: rowNumber,
        codigoLocalizador: codigoLocalizadorFinal,
        dataHora: agoraDataHora,
        mensagem: `Entidade "${data.nome}" atualizada com sucesso na linha ${rowNumber}!`,
        aba: targetSheetTitle
      });
    } else {
      // É CADASTRO NOVO! Insere nova linha no final.
      const newRow = mapDataToOfficial64Row(data, []);
      const codigoLocalizadorFinal = newRow[63];

      await sheets.spreadsheets.values.append({
        spreadsheetId: ENTIDADES_SHEET_ID,
        range: `'${targetSheetTitle}'!A:BL`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [newRow] }
      });

      console.log(`✅ Novo cadastro de entidade inserido na planilha oficial "${targetSheetTitle}": ${data.nome} (${data.municipio}) | Localizador: ${codigoLocalizadorFinal}`);
      return res.json({
        sucesso: true,
        acao: "inserido",
        codigoLocalizador: codigoLocalizadorFinal,
        dataHora: agoraDataHora,
        mensagem: `Nova entidade "${data.nome}" cadastrada com sucesso!`,
        aba: targetSheetTitle
      });
    }
  } catch(error) {
    console.error("Erro ao salvar/atualizar entidade na planilha:", error);
    res.status(500).json({ erro: "Erro ao salvar na planilha: " + error.message });
  }
});

app.put("/api/contatos/:id", editorOnly, async (req, res) => {
  try {
    const rawId = req.params.id;
    const rowNumber = Number(rawId.split("_")[0]);
    if (!rowNumber || rowNumber < 2) return res.status(400).json({ erro: "Linha invalida." });
    
    const headerRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "contatos!A:Z" });
    const existingRow = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : [];
    const headerDefRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "contatos!A1:Z1" });
    const headers = (headerDefRes.data.values && headerDefRes.data.values[0]) ? headerDefRes.data.values[0] : [];

    const updatedRow = mapDataToContatoRow(req.body, headers, existingRow);
    const lastColumn = columnToLetter(headers.length);
    const range = "contatos!A" + rowNumber + ":Z" + rowNumber;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID, range, valueInputOption: "USER_ENTERED", requestBody: { values: [updatedRow] }
    });
    res.json({ sucesso: true, mensagem: "Contato atualizado." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar contato." });
  }
});

app.delete("/api/contatos/:id", editorOnly, async (req, res) => {
  try {
    const rawId = req.params.id;
    const rowNumber = Number(rawId.split("_")[0]);
    if (!rowNumber || rowNumber < 2) return res.status(400).json({ erro: "Linha invalida." });

    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = meta.data.sheets.find(s => s.properties.title.toLowerCase() === 'contatos');
    if (!sheet) return res.status(404).json({ erro: "Aba contatos nao encontrada." });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: { sheetId: sheet.properties.sheetId, dimension: "ROWS", startIndex: rowNumber - 1, endIndex: rowNumber }
          }
        }]
      }
    });
    res.json({ sucesso: true, mensagem: "Contato excluido." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao excluir contato." });
  }
});
async function garantirColunasAdicionais() {
  try {
    console.log("🔍 Verificando se as colunas adicionais ('Marca', 'CATEGORIA', 'TIPO', 'CAM', 'GAB', 'CC', 'EXECUTIVO') existem nas abas de processos...");
    const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const allSheets = response.data.sheets;
    const processSheets = allSheets.filter(s => s.properties.title !== 'Acessos' && s.properties.title.toLowerCase() !== 'escolas' && s.properties.title.toLowerCase() !== 'escola');

    for (const s of processSheets) {
      const tabName = s.properties.title;
      const sheetId = s.properties.sheetId;
      const safeTitle = tabName.replace(/'/g, "''");
      const headerRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${safeTitle}'!A1:ZZ1`
      });
      let headers = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : [];
      if (headers.length > 0) {
        const colunasParaGarantir = ["PREFIXO", "Marca", "CATEGORIA", "TIPO", "CAM", "GAB", "CC", "EXECUTIVO", "CNPJ"];
        const toAdd = [];
        for (const col of colunasParaGarantir) {
          const hasCol = headers.some(h => (h || "").toLowerCase().trim() === col.toLowerCase());
          if (!hasCol) {
            toAdd.push(col);
          }
        }

        if (toAdd.length > 0) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
              requests: [
                {
                  appendDimension: {
                    sheetId: sheetId,
                    dimension: "COLUMNS",
                    length: toAdd.length
                  }
                }
              ]
            }
          });

          const startCol = headers.length + 1;
          const startLetter = columnToLetter(startCol);
          const endLetter = columnToLetter(startCol + toAdd.length - 1);
          const range = `'${safeTitle}'!${startLetter}1:${endLetter}1`;
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [toAdd] }
          });
          console.log(`✅ Colunas [${toAdd.join(', ')}] adicionadas na aba: ${tabName} (${range})`);
          headers.push(...toAdd);
        }
      }
    }
  } catch (err) {
    console.error("❌ Erro ao garantir colunas adicionais:", err.message);
  }
}


// ============================================================
// GMAC - CONTROLE PROCESSUAL (Planilha SEDUC-GMAC)
// ============================================================
const GMAC_SPREADSHEET_ID = '1x4EYfevk59J02mxVpTgJtxAKTvvoWQWzukIciKvLfBU';

const GMAC_CONFIG = {
  'aee': {
    title: 'Equipamento - AEE',
    headerRow: 2,
    dataStartRow: 3,
    headers: ['Item', 'Municípios', 'Processos', 'Status', 'Contato', 'Documentos', 'IDs']
  },
  'onibus': {
    title: 'Doação do Ônibus Escolar',
    headerRow: 1,
    dataStartRow: 2,
    headers: ['Quant.', 'Placa', 'Municipio', 'Processo SEI', 'SITUACAO', 'TERMO ASS.PREF.', 'STATUS', 'CRLV']
  },
  'veiculos': {
    title: 'Doação Definitiva de Veículos',
    headerRow: 2,
    dataStartRow: 3,
    headers: ['Item', 'Municípios', 'Processos', 'Status', 'Contato']
  },
  'reordenamento': {
    title: 'Municipalização e Reordenamento',
    headerRow: 1,
    dataStartRow: 2,
    headers: ['Status', 'Processo SEI', 'Objeto', 'Municipio', 'Escola/Secretaria a ser atendida', 'Forma', 'Tipo Objeto', 'Valor', 'Autorização', 'Data Consulta', 'Observacões']
  },
  'cooperacao': {
    title: 'Termo de Cooperação',
    headerRow: 1,
    dataStartRow: 2,
    headers: ['Status', 'Processo SEI', 'Objeto', 'Municipio', 'Escola/Secretaria a ser atendida', 'Forma', 'Tipo Objeto', 'Autorização', 'Data Consulta', 'Observacões']
  }
};

app.get('/api/gmac/:modulo', async (req, res) => {
  try {
    const modKey = (req.params.modulo || '').toLowerCase();
    const cfg = GMAC_CONFIG[modKey];
    if (!cfg) return res.status(404).json({ erro: 'Módulo GMAC não encontrado.' });

    const safeTitle = cfg.title.replace(/'/g, "''");
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: GMAC_SPREADSHEET_ID,
      range: `'${safeTitle}'!A${cfg.headerRow}:ZZ`
    });

    const values = result.data.values || [];
    if (values.length === 0) {
      return res.json({ modulo: modKey, title: cfg.title, headers: cfg.headers, rows: [] });
    }

    const rawHeaders = values[0] || [];
    const headers = cfg.headers.map((h, i) => (rawHeaders[i] && rawHeaders[i].trim()) ? rawHeaders[i].trim() : h);

    const rows = [];
    values.slice(1).forEach((row, idx) => {
      if (!row || row.length === 0 || row.every(c => !c || String(c).trim() === '')) return;
      const item = { _rowNumber: cfg.dataStartRow + idx, _modulo: modKey };
      headers.forEach((h, colIdx) => {
        item[h] = row[colIdx] !== undefined ? String(row[colIdx]).trim() : '';
      });
      rows.push(item);
    });

    res.json({ modulo: modKey, title: cfg.title, headers, rows });
  } catch(err) {
    console.error('Erro GET /api/gmac:', err);
    res.status(500).json({ erro: 'Erro ao carregar dados do GMAC: ' + err.message });
  }
});

app.post('/api/gmac/:modulo', editorOnly, async (req, res) => {
  try {
    const modKey = (req.params.modulo || '').toLowerCase();
    const cfg = GMAC_CONFIG[modKey];
    if (!cfg) return res.status(404).json({ erro: 'Módulo GMAC não encontrado.' });

    const safeTitle = cfg.title.replace(/'/g, "''");
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: GMAC_SPREADSHEET_ID,
      range: `'${safeTitle}'!A${cfg.headerRow}:ZZ${cfg.headerRow}`
    });
    const headers = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : cfg.headers;

    const newRow = headers.map(h => {
      const cleanH = (h || '').trim();
      if (req.body[cleanH] !== undefined) return req.body[cleanH];
      return (req.body[cleanH.toLowerCase()] !== undefined ? req.body[cleanH.toLowerCase()] : '');
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: GMAC_SPREADSHEET_ID,
      range: `'${safeTitle}'!A:ZZ`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [newRow] }
    });

    res.json({ sucesso: true, mensagem: 'Registro GMAC inserido com sucesso.' });
  } catch(err) {
    console.error('Erro POST /api/gmac:', err);
    res.status(500).json({ erro: 'Erro ao inserir registro GMAC: ' + err.message });
  }
});

app.put('/api/gmac/:modulo/:rowNumber', editorOnly, async (req, res) => {
  try {
    const modKey = (req.params.modulo || '').toLowerCase();
    const rowNumber = Number(req.params.rowNumber);
    const cfg = GMAC_CONFIG[modKey];
    if (!cfg) return res.status(404).json({ erro: 'Módulo GMAC não encontrado.' });
    if (!rowNumber || rowNumber < cfg.dataStartRow) return res.status(400).json({ erro: 'Linha inválida.' });

    const safeTitle = cfg.title.replace(/'/g, "''");
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: GMAC_SPREADSHEET_ID,
      range: `'${safeTitle}'!A${cfg.headerRow}:ZZ${cfg.headerRow}`
    });
    const headers = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : cfg.headers;

    const existingRes = await sheets.spreadsheets.values.get({
      spreadsheetId: GMAC_SPREADSHEET_ID,
      range: `'${safeTitle}'!A${rowNumber}:ZZ${rowNumber}`
    });
    const existingRow = (existingRes.data.values && existingRes.data.values[0]) ? existingRes.data.values[0] : [];

    const updatedRow = headers.map((h, i) => {
      const cleanH = (h || '').trim();
      if (req.body[cleanH] !== undefined) return req.body[cleanH];
      if (req.body[cleanH.toLowerCase()] !== undefined) return req.body[cleanH.toLowerCase()];
      return existingRow[i] ?? '';
    });

    const lastCol = columnToLetter(headers.length);
    await sheets.spreadsheets.values.update({
      spreadsheetId: GMAC_SPREADSHEET_ID,
      range: `'${safeTitle}'!A${rowNumber}:${lastCol}${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [updatedRow] }
    });

    res.json({ sucesso: true, mensagem: 'Registro GMAC atualizado com sucesso.' });
  } catch(err) {
    console.error('Erro PUT /api/gmac:', err);
    res.status(500).json({ erro: 'Erro ao atualizar registro GMAC: ' + err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  await garantirColunasAdicionais();
});
