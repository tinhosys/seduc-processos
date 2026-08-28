const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

const regex = /<div style="display:flex; gap:15px; margin-bottom:20px; flex-wrap:wrap;">[\s\S]*?<table class="table" id="table-diarias">/;

const replacement = `
    <!-- Fichario Tabs -->
    <ul class="tabs" style="margin-bottom:20px;">
      <li class="tab-link active" onclick="mudarAbaDiarias('todas', this)">Visão Geral</li>
      <li class="tab-link" onclick="mudarAbaDiarias('executadas', this)">Despesas Executadas (Pagas)</li>
    </ul>

    <div id="diarias-tab-todas" class="diarias-content-tab">
      <div style="display:flex; gap:15px; margin-bottom:20px; flex-wrap:wrap;">
        <div style="flex:1; min-width:300px; background:#1e293b; border-radius:12px; padding:20px; border:1px solid #334155;">
          <h3 style="margin-top:0; color:#e2e8f0; font-size:16px;">Inserir Nova Diária</h3>
          <p style="font-size:12px; color:#94a3b8; margin-bottom:15px;">Preencha os dados para deduzir do saldo</p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Setor / Proc.</label>
              <input type="text" id="diaria-nome" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;" placeholder="Setor ou Processo">
            </div>
            <div>
              <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Valor (R$)</label>
              <input type="number" id="diaria-valor" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;" placeholder="0.00">
            </div>
            <div style="grid-column:1 / span 2;">
              <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Motivo / Destino</label>
              <input type="text" id="diaria-motivo" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;" placeholder="Destino e motivo da viagem">
            </div>
          </div>
          <button onclick="inserirDiaria()" style="margin-top:15px; width:100%; padding:10px; background:#3b82f6; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
            Registrar e Subtrair Saldo
          </button>
        </div>
        
        <div style="flex:1; min-width:300px; display:flex; flex-direction:column; gap:15px;">
           <div style="background:linear-gradient(135deg, #0ea5e9, #3b82f6); border-radius:12px; padding:20px; color:white; flex:1; display:flex; flex-direction:column; justify-content:center;">
             <div style="font-size:14px; text-transform:uppercase; opacity:0.8; font-weight:700;">Saldo Disponível (Simulado)</div>
             <div style="font-size:36px; font-weight:800; margin-top:5px;" id="diaria-saldo-total">Carregando...</div>
           </div>
        </div>
      </div>
    </div>
    
    <div id="diarias-tab-executadas" class="diarias-content-tab" style="display:none; margin-bottom:20px;">
       <div style="background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); border-radius:12px; padding:20px; color:#10b981; display:flex; justify-content:space-between; align-items:center;">
         <div>
           <div style="font-size:13px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;">Total Executado (Pago)</div>
           <div style="font-size:28px; font-weight:800; margin-top:4px;" id="diaria-total-pago">R$ 0,00</div>
         </div>
         <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
       </div>
    </div>

    <div class="card" style="padding:0; overflow:hidden;">
      <table class="table" id="table-diarias">`;

content = content.replace(regex, replacement);

const scriptAdd = `
<script>
function mudarAbaDiarias(aba, el) {
  document.querySelectorAll('#page-diarias .tabs .tab-link').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  
  document.getElementById('diarias-tab-todas').style.display = aba === 'todas' ? 'block' : 'none';
  document.getElementById('diarias-tab-executadas').style.display = aba === 'executadas' ? 'block' : 'none';
  
  window._filtroDiariasAba = aba;
  if(typeof renderizarDiarias === 'function') renderizarDiarias();
}
</script>
</body>`;

content = content.replace('</body>', scriptAdd);
fs.writeFileSync(file, content);
console.log('index.html patched with Diarias tabs');
