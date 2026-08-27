const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

// Add "Diárias" to menu
const menuOld = `<a href="#" class="nav-item sub-item" data-page="proalfa" onclick="navegar('proalfa')" style="font-size: 13px; padding: 10px 16px;"><span>PROALFA</span></a>`;
const menuNew = `<a href="#" class="nav-item sub-item" data-page="diarias" onclick="navegar('diarias')" style="font-size: 13px; padding: 10px 16px;"><span>Diárias</span></a>
            <a href="#" class="nav-item sub-item" data-page="proalfa" onclick="navegar('proalfa')" style="font-size: 13px; padding: 10px 16px;"><span>PROALFA</span></a>`;
if (!content.includes('data-page="diarias"')) {
    content = content.replace(menuOld, menuNew);
}

// Add the Diarias Section before the Closing main
const secDiarias = `
  <!-- ============= PAGE: DIARIAS ============= -->
  <section class="page" id="page-diarias" style="display:none;">
    <div class="section-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
      <div>
        <h2 style="margin:0 0 4px; font-size:20px; font-weight:800;">Controle de Diárias</h2>
        <p style="margin:0; font-size:13px; color:#64748b;">Acompanhamento de Diárias</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
        <button onclick="gerarRelatorioDiarias()" style="display:flex; align-items:center; gap:6px; padding:10px 16px; height:40px; background:#6366f1; border:none; border-radius:8px; color:white; font-weight:700; font-size:13px; text-transform:uppercase; cursor:pointer; transition:background 0.2s;">
          IMPRIMIR RELATÓRIO
        </button>
        <button onclick="window.open('https://docs.google.com/spreadsheets/d/1WunsuLAAIUAAo1q65qmSVMIH0qLJu_TjDsb_u9LO304/edit?gid=807660383','_blank')" style="display:flex; align-items:center; gap:6px; padding:10px 16px; height:40px; background:#10b981; border:none; border-radius:8px; color:white; font-weight:700; font-size:13px; text-transform:uppercase; cursor:pointer; transition:background 0.2s;">
          PLANILHA DE DIÁRIAS
        </button>
      </div>
    </div>
    
    <div style="display:flex; gap:15px; margin-bottom:20px; flex-wrap:wrap;">
      <div style="flex:1; min-width:300px; background:#1e293b; border-radius:12px; padding:20px; border:1px solid #334155;">
        <h3 style="margin-top:0; color:#e2e8f0; font-size:16px;">Inserir Nova Diária</h3>
        <p style="font-size:12px; color:#94a3b8; margin-bottom:15px;">Preencha os dados para deduzir do saldo</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div>
            <label style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Beneficiário</label>
            <input type="text" id="diaria-nome" style="width:100%; padding:8px; border-radius:6px; border:1px solid #334155; background:#0f172a; color:#f8fafc;" placeholder="Nome Completo">
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
         <div style="background:linear-gradient(135deg, #0ea5e9, #3b82f6); border-radius:12px; padding:20px; color:white;">
           <div style="font-size:14px; text-transform:uppercase; opacity:0.8; font-weight:700;">Saldo Total de Diárias</div>
           <div style="font-size:32px; font-weight:800; margin-top:5px;" id="diaria-saldo-total">Carregando...</div>
         </div>
      </div>
    </div>
    
    <div class="card" style="padding:0; overflow:hidden;">
      <table class="table" id="table-diarias">
        <thead>
          <tr>
            <th>Data</th>
            <th>Beneficiário</th>
            <th>Motivo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colspan="4" style="text-align:center; padding:20px;">Carregando dados...</td></tr>
        </tbody>
      </table>
    </div>
  </section>
`;

if (!content.includes('id="page-diarias"')) {
    content = content.replace('</main>', secDiarias + '\n  </main>');
}

// Ensure diarias.js is loaded
if (!content.includes('diarias.js')) {
    content = content.replace('<script src="js/orcamento.js', '<script src="js/diarias.js"></script>\n  <script src="js/orcamento.js');
}

fs.writeFileSync(file, content);
console.log('index.html patched with Diárias tab');
