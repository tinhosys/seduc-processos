const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

// Find the Fichario Tabs area
const regexTabs = /<!-- Fichario Tabs -->[\s\S]*?<div class="card" style="padding:0; overflow:hidden;">/m;

const newTabs = `<!-- Fichario Tabs -->
    <ul class="tabs" style="margin-bottom:20px; display:flex; flex-wrap:wrap; gap:5px;">
      <li class="tab-link active" onclick="mudarAbaDiarias('estadual', this)">Execução Orçamentária Estadual</li>
      <li class="tab-link" onclick="mudarAbaDiarias('federal', this)">Recurso Federal</li>
      <li class="tab-link" onclick="mudarAbaDiarias('parametros', this)">Parâmetros</li>
      <li class="tab-link" onclick="mudarAbaDiarias('consolidado', this)">Consolidado</li>
      <li class="tab-link" onclick="mudarAbaDiarias('gerar', this)" style="background:#3b82f6; color:white; border:none;">+ Gerar Nova Diária</li>
    </ul>

    <div id="diarias-tab-gerar" class="diarias-content-tab" style="display:none; margin-bottom:20px;">
      <div style="background:#1e293b; border-radius:12px; padding:20px; border:1px solid #334155;">
        <h3 style="margin-top:0; color:#e2e8f0; font-size:18px; display:flex; align-items:center; gap:8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
          Regra de Fluxo: Emitir Nova Diária
        </h3>
        <p style="font-size:12px; color:#94a3b8; margin-bottom:20px;">Selecione o empenho orçamentário válido e preencha os dados do beneficiário.</p>
        
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:20px; background:rgba(0,0,0,0.2); padding:15px; border-radius:8px;">
          <div>
            <label style="font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight:bold;">Programa de Ação (PA)</label>
            <select id="diaria-pa" onchange="verificarSaldoDiaria()" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;">
              <option value="">Selecione o PA...</option>
            </select>
          </div>
          <div>
            <label style="font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight:bold;">Fonte de Recurso</label>
            <select id="diaria-fonte" onchange="verificarSaldoDiaria()" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;">
              <option value="">Selecione a Fonte...</option>
            </select>
          </div>
          <div>
            <label style="font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight:bold;">Natureza (ND)</label>
            <select id="diaria-nd" onchange="verificarSaldoDiaria()" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;">
              <option value="339014">339014 - Diárias Pessoal Civil</option>
            </select>
          </div>
        </div>

        <div id="diaria-saldo-aviso" style="margin-bottom:20px; padding:12px; border-radius:6px; background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.3); color:#60a5fa; font-size:13px; display:flex; align-items:center; gap:8px;">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
           Selecione os parâmetros acima para verificar a disponibilidade de saldo.
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:20px;">
          <div>
            <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Nome do Beneficiário</label>
            <input type="text" id="diaria-nome" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;" placeholder="Ex: João da Silva">
          </div>
          <div>
            <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">CPF</label>
            <input type="text" id="diaria-cpf" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;" placeholder="000.000.000-00">
          </div>
          <div>
            <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Cidade de Destino</label>
            <input type="text" id="diaria-cidade" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;" placeholder="Ex: Ji-Paraná">
          </div>
          <div>
            <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Nº do Processo SEI</label>
            <input type="text" id="diaria-proc" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;" placeholder="0029.000000/2026-00">
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 200px; gap:15px; margin-bottom:20px;">
          <div>
            <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Motivo da Viagem</label>
            <input type="text" id="diaria-motivo" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;" placeholder="Descrição do evento/reunião">
          </div>
          <div>
            <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Valor da Diária (R$)</label>
            <input type="number" id="diaria-valor" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;" placeholder="0.00">
          </div>
        </div>

        <button id="btn-registrar-diaria" onclick="inserirDiaria()" disabled style="width:100%; padding:12px; background:#475569; color:#94a3b8; border:none; border-radius:8px; font-weight:bold; font-size:14px; cursor:not-allowed; transition:all 0.3s;">
          Bloqueado - Verifique o Saldo
        </button>
      </div>
    </div>
    
    <div id="diarias-tab-lista" class="diarias-content-tab" style="margin-bottom:20px;">
      <div style="display:flex; gap:10px; margin-bottom:15px; flex-wrap:wrap; align-items:center;">
        <div class="search-box" style="flex:1; min-width:250px; background:#1e293b; border:1px solid #334155; border-radius:8px; display:flex; align-items:center; padding:0 12px;">
          <span style="color:#64748b; margin-right:8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input type="text" id="busca-diarias" oninput="renderizarDiarias()" placeholder="Buscar por nome, CPF, cidade, processo ou motivo..." style="background:transparent; border:none; color:#f8fafc; width:100%; height:40px; outline:none; font-size:13px;">
        </div>
        
        <div style="background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); border-radius:8px; padding:8px 16px; color:#10b981; display:flex; align-items:center; gap:12px; height:40px;">
           <div style="font-size:11px; font-weight:bold; text-transform:uppercase;">Executado (Aba Atual)</div>
           <div style="font-size:16px; font-weight:800;" id="diaria-total-pago">R$ 0,00</div>
        </div>
      </div>
      
      <div class="card" style="padding:0; overflow:hidden;">
        <table class="table" id="table-diarias">`;

content = content.replace(regexTabs, newTabs);

fs.writeFileSync(file, content);
console.log('index.html Diarias tabs and flow patched');
