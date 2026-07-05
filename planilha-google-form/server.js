import express from "express";
import dotenv from "dotenv";
import { google } from "googleapis";
import crypto from "crypto";
import cors from "cors";

dotenv.config();

const app = express();

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
    // Ler aba "Acessos" da planilha
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Acessos!A:C"
    });

    const rows = result.data.values || [];
    const emailNorm = email.trim().toLowerCase();

    // Skip header row
    const usuario = rows.slice(1).find(row => {
      const emailPlanilha = (row[0] || "").trim().toLowerCase();
      return emailPlanilha === emailNorm;
    });

    if (!usuario) {
      return res.status(403).json({ erro: "Acesso negado. Seu e-mail não está na lista de usuários autorizados." });
    }

    const nivel = (usuario[1] || "").trim().toLowerCase(); // 'editor' ou 'leitor'
    const nome = (usuario[2] || email).trim();

    if (nivel !== "editor" && nivel !== "leitor") {
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

// Middleware para bloquear somente-leitores em mutações
const editorOnly = (req, res, next) => {
  const sessao = validarSessao(req);
  if (!sessao) {
    return res.status(401).json({ erro: "Não autenticado." });
  }
  if (sessao.nivel !== "editor") {
    return res.status(403).json({ erro: "Seu nível de acesso é 'Leitor'. Apenas editores podem modificar dados." });
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
  
  const ranges = allSheets.map(s => `${s.properties.title}!A1:Z`);
  const batchResponse = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: ranges
  });

  const valueRanges = batchResponse.data.valueRanges || [];
  
  let globalHeaders = [];
  let allRows = [];

  valueRanges.forEach((vr, sheetIndex) => {
    const tabName = allSheets[sheetIndex].properties.title;
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
          
          // Se a célula começa com "total" ou tem "total geral", "total a pagar", "total 1+2"
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

  return { rows: allRows, headers: globalHeaders };
}

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

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
