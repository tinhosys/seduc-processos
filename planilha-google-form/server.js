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
  const sessao = sessoes.get(token);
  if (!sessao) return null;
  // Expirar após 8 horas
  if (Date.now() - sessao.criadoEm > 8 * 60 * 60 * 1000) {
    sessoes.delete(token);
    return null;
  }
  return sessao;
}

// ====== ENDPOINT: LOGIN ======
app.post("/api/auth", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ erro: "E-mail inválido." });
  }

  try {
    // Ler aba "Acessos" da planilha (A=NOME, B=EMAIL, C=NIVEL DE ACESSO, D=BLOQUEADO/LIBERADO)
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Acessos!A:D"
    });

    const rows = result.data.values || [];
    const emailNorm = email.trim().toLowerCase();

    // Skip header row
    const usuario = rows.slice(1).find(row => {
      const emailPlanilha = (row[1] || "").trim().toLowerCase(); // EMAIL é coluna B (index 1)
      return emailPlanilha === emailNorm;
    });

    if (!usuario) {
      return res.status(403).json({ erro: "Acesso negado. Seu e-mail não está na lista de usuários autorizados." });
    }

    const nome  = (usuario[0] || email).trim();               // NOME é coluna A (index 0)
    const nivel = (usuario[2] || "").trim().toLowerCase();    // NIVEL é coluna C (index 2)
    const statusRaw = (usuario[3] || "1").toString().trim();  // STATUS é coluna D (index 3): 1=liberado, 0=bloqueado
    const status = statusRaw === "0" || statusRaw.toLowerCase() === "bloqueado" ? "bloqueado" : "liberado";

    if (status === "bloqueado") {
      return res.status(403).json({ erro: "Seu acesso está bloqueado pelo administrador." });
    }

    if (nivel !== "editor" && nivel !== "leitor" && nivel !== "adm") {
      return res.status(403).json({ erro: "Nível de acesso inválido. Contate o administrador." });
    }

    // Criar sessão
    const token = gerarToken();
    sessoes.set(token, { email: emailNorm, nome, nivel, criadoEm: Date.now() });

    console.log(`[AUTH] Login: ${email} | Nível: ${nivel} | Token: ${token.substring(0,8)}...`);

    return res.json({ token, email: emailNorm, nome, nivel });
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

// ====== MIDDLEWARE DE AUTH ======
const authMiddleware = (req, res, next) => {
  const sessao = validarSessao(req);
  if (!sessao) {
    return res.status(401).json({ erro: "Sessão expirada. Faça o login novamente." });
  }
  req.sessao = sessao;
  next();
};

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

async function getAllRows() {
  const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const allSheets = response.data.sheets;

  // Excluir aba de controle de acessos dos dados de processos
  const processSheets = allSheets.filter(s => s.properties.title !== 'Acessos');

  // IMPORTANTE: nomes de abas com caracteres especiais (/, espaço, etc.)
  // precisam ser envolvidos em aspas simples no range da API
  const ranges = processSheets.map(s => {
    const title = s.properties.title;
    const safeTitle = title.replace(/'/g, "''"); // escapar aspas simples dentro do nome
    return `'${safeTitle}'!A1:Z`;
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
          item[header] = row[colIndex] || "";
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
  res.json({ version: "1.0.3", timestamp: "2026-07-06T02:43:00Z" });
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

function mapDataToRow(data, headers, originalRow = []) {
  const formatMoney = (val) => {
    if (val === undefined || val === null || val === "") return "";
    return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  return headers.map((h, i) => {
    const hLow = h.toLowerCase().trim();
    let val = undefined;
    
    if (hLow.includes('prefixo')) val = data.prefixo;
    else if (hLow.includes('munic')) val = data.municipio;
    else if (hLow.includes('processo')) val = data.numero;
    else if (hLow.includes('interessado')) val = data.interessado;
    else if (hLow.includes('objeto')) val = data.objeto;
    else if (hLow.includes('valor of') || hLow.includes('oficial')) val = formatMoney(data.valorOf);
    else if (hLow.includes('planilha')) val = formatMoney(data.valorPlan);
    else if (hLow.includes('diferen')) val = formatMoney(data.diferenca);
    else if (hLow === 'status') val = data.status;
    else if (hLow.includes('localiza')) val = data.localizacao;
    else if (hLow.includes('obs')) val = data.obs;
    else if (hLow === 'data') val = data.data;
    else if (hLow.includes('anota')) val = data.anotacao;
    else if (hLow.includes('contato')) {
      if (Array.isArray(data.contatos) && data.contatos.length > 0) {
        val = data.contatos.map(c => {
          const tel = c.whatsapp || c.telefone;
          if (c.detalhes && tel) return `${c.detalhes.trim()} - ${tel.trim()}`;
          return (c.detalhes || tel || "").trim();
        }).filter(Boolean).join('; ');
      } else {
        val = "";
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
      range: `${tabName}!A${rowNumber}:Z${rowNumber}` // fetch existing row!
    });
    const existingRow = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : [];

    const headerDefRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A1:Z1`
    });
    const headers = (headerDefRes.data.values && headerDefRes.data.values[0]) ? headerDefRes.data.values[0] : [];

    if (headers.length === 0) {
      return res.status(400).json({ erro: "A planilha não possui cabeçalho." });
    }

    const updatedRow = mapDataToRow(req.body, headers, existingRow);

    const lastColumn = columnToLetter(headers.length);
    const range = `${tabName}!A${rowNumber}:${lastColumn}${rowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedRow] }
    });

    res.json({ sucesso: true, mensagem: "Registro atualizado com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar a planilha." });
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
      range: `${tabName}!A1:Z1`
    });
    
    const headers = (headerRes.data.values && headerRes.data.values[0]) ? headerRes.data.values[0] : [];
    if (headers.length === 0) {
      return res.status(400).json({ erro: `A aba ${tabName} não existe ou não tem cabeçalho.` });
    }

    const newRow = mapDataToRow(req.body, headers, []);

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
      range: "Acessos!A:D"
    });

    const rows = result.data.values || [];
    if (rows.length === 0) {
      return res.json([]);
    }

    const validRows = [];

    // Colunas: A=NOME, B=EMAIL, C=NIVEL DE ACESSO, D=BLOQUEADO/LIBERADO (1=liberado, 0=bloqueado)
    rows.slice(1).forEach((row, index) => {
      // Pular linhas vazias
      if (!row || row.length === 0 || row.every(cell => !cell || String(cell).trim() === "")) {
        return;
      }
      const statusRaw = (row[3] || "1").toString().trim();
      const status = statusRaw === "0" || statusRaw.toLowerCase() === "bloqueado" ? "bloqueado" : "liberado";
      validRows.push({
        nome:   (row[0] || "").trim(),
        email:  (row[1] || "").trim(),
        nivel:  (row[2] || "").trim().toLowerCase(),
        status: status,
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
    const { email, nivel, nome, status } = req.body;
    if (!email || !nivel || !nome) {
      return res.status(400).json({ erro: "Nome, e-mail e nível de acesso são obrigatórios." });
    }

    const nomeTrim  = nome.trim();
    const emailNorm = email.trim().toLowerCase();
    const nivelNorm = nivel.trim().toLowerCase();
    const statusVal = (status === "bloqueado") ? "0" : "1"; // Converte para 1/0

    // Validar se o e-mail já existe (EMAIL está na coluna B)
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Acessos!B:B"
    });
    const rows = result.data.values || [];
    const emailExists = rows.some(r => (r[0] || "").trim().toLowerCase() === emailNorm);
    if (emailExists) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
    }

    // Ordem correta: NOME | EMAIL | NIVEL | STATUS
    const newRow = [nomeTrim, emailNorm, nivelNorm, statusVal];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Acessos!A:D",
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

    const { email, nivel, nome, status } = req.body;
    if (!email || !nivel || !nome) {
      return res.status(400).json({ erro: "Nome, e-mail e nível de acesso são obrigatórios." });
    }

    const nomeTrim  = nome.trim();
    const emailNorm = email.trim().toLowerCase();
    const nivelNorm = nivel.trim().toLowerCase();
    const statusVal = (status === "bloqueado") ? "0" : "1"; // Converte para 1/0

    // Ordem correta: NOME | EMAIL | NIVEL | STATUS
    const updatedRow = [nomeTrim, emailNorm, nivelNorm, statusVal];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Acessos!A${rowNumber}:D${rowNumber}`,
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

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
