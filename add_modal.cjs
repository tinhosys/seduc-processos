const fs = require('fs');
let index = fs.readFileSync('index.html', 'utf8');
const modalHTML = 
  <!-- ===================== MODAL PDF ===================== -->
  <div id="modal-pdf" class="modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;">
    <div style="background:white;width:400px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.1);overflow:hidden;">
      <div style="background:#1e293b;color:white;padding:16px 20px;font-weight:600;font-size:16px;display:flex;justify-content:space-between;align-items:center;">
        Gerar Relatório PDF
        <button onclick="fecharModalPdf()" style="background:transparent;border:none;color:white;cursor:pointer;font-size:18px;">&times;</button>
      </div>
      <div style="padding:20px;">
        <div class="form-group" style="margin-bottom:16px;">
          <label style="display:block;margin-bottom:8px;font-weight:500;font-size:14px;">Filtrar relatório por:</label>
          <select id="pdf-tipo" onchange="atualizarOpcoesPdf()" style="width:100%;padding:10px;border-radius:6px;border:1px solid var(--border);font-size:14px;">
            <option value="municipio">Município</option>
            <option value="prefixo">Planilha (Prefixo)</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:24px;">
          <label style="display:block;margin-bottom:8px;font-weight:500;font-size:14px;" id="pdf-label-valor">Selecione o Município:</label>
          <select id="pdf-valor" style="width:100%;padding:10px;border-radius:6px;border:1px solid var(--border);font-size:14px;">
          </select>
        </div>
        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button class="btn btn-ghost" onclick="fecharModalPdf()">Cancelar</button>
          <button class="btn btn-primary" onclick="iniciarGeracaoPdf()">Gerar PDF</button>
        </div>
      </div>
    </div>
  </div>
;
index = index.replace('<!-- Scripts -->', modalHTML + '\n  <!-- Scripts -->');
fs.writeFileSync('index.html', index, 'utf8');
console.log('Modal adicionado');
