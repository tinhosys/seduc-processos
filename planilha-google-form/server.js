
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

app.use(cors());
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
      return res.status(403).json({ erro: "Seu acesso está bloqueado pelo administrador." });
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
  "DIGITO",
  "MUNICIPIO",
  "PROCESSOS",
  "INTERESSADO",
  "OBJETO",
  "VALOR OF",
  "VLR PLANILHA",
  "VLR DIFERENCA",
  "STATUS",
  "LOCALIZACAO",
  "OBSERVACAO",
  "DATA",
  "ANOTACAO",
  "CONTATO",
  "APONTAMENTO",
  "ALERTA",
  "ULTIMA EDICAO LOGIN",
  "DATA/HORA EDICAO",
  "MARCA",
  "CATEGORIA",
  "TIPO",
  "CAM",
  "GAB-SEDUC",
  "CASA CIVIL",
  "ANO",
  "AGRUPAMENTO",
  "TIPO AUDITORIO",
  "QUADRA",
  "PATIO",
  "REFEITORIO",
  "BANHEIROS",
  "OFICIO",
  "METRAGEM (M²)",
  "DETALHAMENTO ITENS",
  "DEMAIS OBSERVACOES"
];

async function getAllRows() {
  const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const allSheets = response.data.sheets;

  // Excluir aba de controle de acessos e a aba de escolas dos dados de processos
  const processSheets = allSheets.filter(s => s.properties.title !== 'Acessos' && s.properties.title.toLowerCase() !== 'escolas' && s.properties.title.toLowerCase() !== 'escola');

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
  res.json({ version: "1.0.7", timestamp: "2026-07-08T23:30:00Z" });
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
    } else if (hLow === 'data') {
      val = data.data || data.DATA;
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

    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A${rowNumber}:ZZ${rowNumber}` // fetch existing row!
    });
    const existingRow = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : [];

    const headerDefRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A1:ZZ1`
    });
    const headers = (headerDefRes.data.values && headerDefRes.data.values[0]) ? headerDefRes.data.values[0] : [];

    if (headers.length === 0) {
      return res.status(400).json({ erro: "A planilha não possui cabeçalho." });
    }

    const updatedRow = mapDataToRow(req.body, headers, existingRow, req.sessao);

    const lastColumn = columnToLetter(headers.length);
    const range = `${tabName}!A${rowNumber}:${lastColumn}${rowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedRow] }
    });

    res.json({ sucesso: true, mensagem: "Atualizado com sucesso." });
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
    let tabName = req.body.prefixo;
    
    if (!tabName) {
      const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
      tabName = response.data.sheets[0].properties.title;
    }

    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A1:ZZ1`
    });
    
    const headers = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : [];
    if (headers.length === 0) {
      return res.status(400).json({ erro: `A aba ${tabName} não existe ou não tem cabeçalho.` });
    }

    const newRow = mapDataToRow(req.body, headers, [], req.sessao);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A:Z`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [newRow] }
    });

    res.json({ sucesso: true, mensagem: "Novo registro inserido com sucesso." });
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
  return {
    codigoSuper: get(['codigo super', 'cod super', 'cd super']),
    super: get(['super', 'superintendencia', 'superintendência', 'nome super', 'nome da super', 'cre']),
    municipio: get(['municipio', 'município']),
    codigoInep: get(['inep', 'codigo inep', 'código inep']),
    nome: get(['nome da escola', 'escola']),
    localizacao: get(['localização', 'localizacao', 'localiza']),
    endereco: get(['endereço - nº', 'endereço', 'endereco', 'logradouro', 'nº']),
    complemento: get(['complemento', 'complement']),
    bairro: get(['bairro']),
    cep: get(['cep']),
    telefone: get(['nº de telefone', 'telefone', 'fone']),
    totalMatricula: getNum(['total matrícula', 'total matricula', 'matricula']),
    salas: getNum(['salas de aula ultilizadas na escola', 'salas de aula', 'sala']),
    diretor: get(['diretor', 'gestor', 'nome diretor', 'nome do diretor']),
    contatoDiretor: get(['contato diretor', 'telefone diretor', 'celular diretor', 'contato']),
    secretario: get(['secretario', 'secretário', 'nome secretario', 'nome do secretário']),
    contatoSecretario: get(['contato secretario', 'telefone secretario', 'celular secretario', 'whats secretario']),
    email: get(['email', 'e-mail']),
    redesSociais: get(['redes sociais', 'instagram', 'facebook', 'instagran', 'redes'])
  };
}

app.get("/api/escolas", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "escolas!A1:Z"
    });
    const rows = response.data.values || [];
    if (rows.length < 2) return res.json({ rows: [] });
    
    const headers = rows[0];
    const dataRows = rows.slice(1).map((r, idx) => {
      return {
        id: (idx + 2) + "__escolas",
        _tabName: "escolas",
        ...mapRowToEscolaObj(headers, r)
      };
    });
    res.json({ rows: dataRows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar escolas." });
  }
});

app.post("/api/escolas", editorOnly, async (req, res) => {
  try {
    const headerDefRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "escolas!A1:Z1"
    });
    let headers = (headerDefRes.data.values && headerDefRes.data.values[0]) ? headerDefRes.data.values[0] : [];
    
    if (headers.length === 0) {
      headers = defaultEscolasHeaders;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "escolas!A1",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [headers] }
      });
    }

    const newRow = mapDataToEscolaRow(req.body, headers, [], req.sessao);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "escolas!A:A",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [newRow] }
    });
    res.json({ sucesso: true, mensagem: "Escola cadastrada com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao cadastrar escola." });
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
    console.log("🔍 Verificando se as colunas 'Marca', 'CATEGORIA' e 'TIPO' existem nas abas de processos...");
    const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const allSheets = response.data.sheets;
    const processSheets = allSheets.filter(s => s.properties.title !== 'Acessos' && s.properties.title.toLowerCase() !== 'escolas' && s.properties.title.toLowerCase() !== 'escola');

    for (const s of processSheets) {
      const tabName = s.properties.title;
      const headerRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A1:ZZ1`
      });
      let headers = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : [];
      if (headers.length > 0) {
        const colunasParaGarantir = ["Marca", "CATEGORIA", "TIPO", "CAM", "GAB", "CC"];
        
        for (const col of colunasParaGarantir) {
          const hasCol = headers.some(h => (h || "").toLowerCase().trim() === col.toLowerCase());
          if (!hasCol) {
            const nextColLetter = columnToLetter(headers.length + 1);
            const range = `${tabName}!${nextColLetter}1`;
            await sheets.spreadsheets.values.update({
              spreadsheetId: SPREADSHEET_ID,
              range: range,
              valueInputOption: "USER_ENTERED",
              requestBody: { values: [[col]] }
            });
            console.log(`✅ Coluna '${col}' adicionada na aba: ${tabName} (posição ${nextColLetter}1)`);
            headers.push(col); // Atualiza cabeçalhos locais para calcular a letra da próxima coluna corretamente
          }
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
