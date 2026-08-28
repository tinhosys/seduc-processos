const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

// Fix Tabs Styling
const regexTabs = /<ul class="tabs" style="margin-bottom:20px; display:flex; flex-wrap:wrap; gap:5px;">[\s\S]*?<\/ul>/;
const newTabs = `<ul class="tabs" style="list-style:none; padding:0; margin:0 0 20px 0; display:flex; flex-wrap:wrap; gap:8px;">
      <li class="tab-link active" onclick="mudarAbaDiarias('estadual', this)" style="padding:10px 15px; background:#1e293b; border-radius:8px; cursor:pointer; color:#cbd5e1; font-size:13px; border:1px solid #334155;">Execução Orçamentária Estadual</li>
      <li class="tab-link" onclick="mudarAbaDiarias('federal', this)" style="padding:10px 15px; background:#1e293b; border-radius:8px; cursor:pointer; color:#cbd5e1; font-size:13px; border:1px solid #334155;">Recurso Federal</li>
      <li class="tab-link" onclick="mudarAbaDiarias('parametros', this)" style="padding:10px 15px; background:#1e293b; border-radius:8px; cursor:pointer; color:#cbd5e1; font-size:13px; border:1px solid #334155;">Parâmetros</li>
      <li class="tab-link" onclick="mudarAbaDiarias('consolidado', this)" style="padding:10px 15px; background:#1e293b; border-radius:8px; cursor:pointer; color:#cbd5e1; font-size:13px; border:1px solid #334155;">Consolidado</li>
      <li class="tab-link" onclick="mudarAbaDiarias('gerar', this)" style="padding:10px 15px; background:#3b82f6; border-radius:8px; cursor:pointer; color:white; font-size:13px; border:none; font-weight:bold;">+ Gerar Nova Diária</li>
    </ul>`;

content = content.replace(regexTabs, newTabs);

// Add Date Filters
const regexFiltros = /<div style="flex:1; min-width:150px;">\s*<label style="font-size:10px; color:#94a3b8; text-transform:uppercase; font-weight:bold; letter-spacing:0\.5px; margin-bottom:5px; display:block;">Status<\/label>[\s\S]*?<\/select>\s*<\/div>/;

const newFiltros = `<div style="flex:1; min-width:150px;">
            <label style="font-size:10px; color:#94a3b8; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px; margin-bottom:5px; display:block;">Status</label>
            <select id="diaria-filtro-status" onchange="renderizarDiarias()" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#1e293b; color:#f8fafc; outline:none;">
              <option value="Todos">Todos</option>
              <option value="Pago">Pago (Executado)</option>
              <option value="Reserva">Reserva</option>
              <option value="Anulação">Anulação / Encerrado</option>
            </select>
          </div>
          <div style="flex:1; min-width:110px;">
            <label style="font-size:10px; color:#94a3b8; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px; margin-bottom:5px; display:block;">Data Início</label>
            <input type="date" id="diaria-filtro-data-ini" onchange="renderizarDiarias()" style="width:100%; padding:9px; border-radius:6px; border:1px solid #334155; background:#1e293b; color:#f8fafc; outline:none; font-family:inherit;">
          </div>
          <div style="flex:1; min-width:110px;">
            <label style="font-size:10px; color:#94a3b8; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px; margin-bottom:5px; display:block;">Data Fim</label>
            <input type="date" id="diaria-filtro-data-fim" onchange="renderizarDiarias()" style="width:100%; padding:9px; border-radius:6px; border:1px solid #334155; background:#1e293b; color:#f8fafc; outline:none; font-family:inherit;">
          </div>`;

content = content.replace(regexFiltros, newFiltros);
fs.writeFileSync(file, content);
console.log('index.html patched with date and fixed tabs');
