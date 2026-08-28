const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

const regex = /<div id="diarias-tab-lista" class="diarias-content-tab" style="margin-bottom:20px;">[\s\S]*?<div class="card" style="padding:0; overflow:hidden;">/m;

const replacement = `<div id="diarias-tab-lista" class="diarias-content-tab" style="margin-bottom:20px;">
      
      <!-- ESQUEMA DE BUSCA -->
      <div style="background:#111827; border-radius:12px; padding:20px; border:1px solid #1f2937; margin-bottom:15px; display:flex; flex-direction:column; gap:15px;">
        
        <!-- Barra de Busca -->
        <div class="search-box" style="background:#0f172a; border:1px solid #334155; border-radius:8px; display:flex; align-items:center; padding:0 12px;">
          <span style="color:#64748b; margin-right:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input type="text" id="busca-diarias" oninput="renderizarDiarias()" placeholder="Buscar por processo, cpf, nome, cidade, motivo..." style="background:transparent; border:none; color:#f8fafc; width:100%; height:45px; outline:none; font-size:14px;">
        </div>

        <!-- Filtros em Linha -->
        <div style="display:flex; gap:15px; flex-wrap:wrap;">
          <div style="flex:1; min-width:150px;">
            <label style="font-size:10px; color:#94a3b8; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px; margin-bottom:5px; display:block;">Mês de Pagamento</label>
            <select id="diaria-filtro-mes" onchange="renderizarDiarias()" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#1e293b; color:#f8fafc; outline:none;">
              <option value="Todos">Todos</option>
            </select>
          </div>
          <div style="flex:1; min-width:150px;">
            <label style="font-size:10px; color:#94a3b8; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px; margin-bottom:5px; display:block;">Status</label>
            <select id="diaria-filtro-status" onchange="renderizarDiarias()" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#1e293b; color:#f8fafc; outline:none;">
              <option value="Todos">Todos</option>
              <option value="Pago">Pago (Executado)</option>
              <option value="Reserva">Reserva</option>
              <option value="Anulação">Anulação / Encerrado</option>
            </select>
          </div>
          <div style="flex:1; min-width:150px;">
            <label style="font-size:10px; color:#94a3b8; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px; margin-bottom:5px; display:block;">Setor</label>
            <select id="diaria-filtro-setor" onchange="renderizarDiarias()" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#1e293b; color:#f8fafc; outline:none;">
              <option value="Todos">Todos</option>
            </select>
          </div>
        </div>

        <!-- Totais da Busca & Limpar -->
        <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:center;">
          <div style="background:#1e293b; border-radius:8px; padding:10px 15px; color:#cbd5e1; font-size:13px; font-weight:bold; display:flex; align-items:center; border:1px solid #334155;">
            <span id="diaria-qtd-listadas">0 diárias listadas</span>
          </div>
          
          <div style="flex:1; background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); border-radius:8px; padding:10px 15px; color:#10b981; display:flex; align-items:center; gap:15px;">
            <div style="font-size:12px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;">Totais da Busca:</div>
            <div>
               <div style="font-size:10px; color:rgba(16,185,129,0.7); text-transform:uppercase;">Valor Filtrado</div>
               <div style="font-size:16px; font-weight:800;" id="diaria-total-pago">R$ 0,00</div>
            </div>
          </div>
          
          <button onclick="limparFiltrosDiarias()" style="background:#f59e0b; color:#fff; border:none; border-radius:8px; padding:10px 20px; font-weight:bold; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:8px; transition:background 0.2s;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            LIMPAR PARÂMETROS
          </button>
        </div>

      </div>
      <!-- FIM ESQUEMA DE BUSCA -->

      <div class="card" style="padding:0; overflow:hidden;">`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('index.html patched with advanced search for Diarias');
