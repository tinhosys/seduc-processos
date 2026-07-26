const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Inject TCE fields into tab-content-objetivo in index.html
const tceFieldsHtml = `
              <!-- SEÇÃO: PEDIDOS DAS ESCOLAS & DADOS PARA TCE-RO (MANIFESTO SINTÉTICO) -->
              <div style="margin-top:24px; padding:20px; background:linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05)); border:1px solid rgba(59,130,246,0.3); border-radius:12px; margin-bottom:20px;">
                <div style="font-size:13px; font-weight:800; color:#60a5fa; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span>📜</span> <span>Detalhamento dos Pedidos das Escolas (Relatório Sintético TCE-RO)</span>
                  </div>
                  <button type="button" onclick="gerarEExibirManifestoTCEAtual()" style="background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; border:none; font-size:12px; font-weight:700; padding:8px 16px; border-radius:6px; cursor:pointer; box-shadow:0 3px 10px rgba(59,130,246,0.35); display:inline-flex; align-items:center; gap:6px;">
                    📜 Gerar Manifesto TCE-RO
                  </button>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:14px;">
                  <div class="form-group">
                    <label style="color:#f0f4ff; font-weight:600; font-size:13px;">📩 Nº do Ofício / Solicitação da Escola</label>
                    <input type="text" id="form-oficioNumero" class="form-control" placeholder="Ex: OF-123/2026 - EEEFM Anísio Teixeira" style="border-color:rgba(59,130,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
                  </div>

                  <div class="form-group">
                    <label style="color:#f0f4ff; font-weight:600; font-size:13px;">📐 Metragem m² (Obras / Ampliação / Reforma)</label>
                    <input type="text" id="form-metragemM2" class="form-control" placeholder="Ex: 450 m²" style="border-color:rgba(59,130,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
                  </div>
                </div>

                <div class="form-group">
                  <label style="color:#f0f4ff; font-weight:700; font-size:13px; display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                    <span>📦</span> <span>Detalhamento dos Itens & Quantidades Pedidas (Móveis, Equipamentos, Obras...)</span>
                  </label>
                  <textarea id="form-detalhamentoItens" class="form-control" rows="3" placeholder="Ex: 10 mesas para sala de aula, 2 caixas de som, 4 armários, 5 poltronas para sala dos professores..." style="width:100%; border-color:rgba(59,130,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:500; padding:10px 12px; border-radius:8px; line-height:1.4; box-sizing:border-box;"></textarea>
                </div>
              </div>
`;

if (!html.includes('id="form-oficioNumero"')) {
  const targetTag = '<!-- DEMAIS OBSERVAÇÕES -->';
  if (html.includes(targetTag)) {
    html = html.replace(targetTag, tceFieldsHtml + '\n' + targetTag);
  }
}

// 2. Add Modal Manifesto TCE-RO to index.html
const modalManifestoHtml = `
  <!-- ============= MODAL: MANIFESTO SINTÉTICO TCE-RO ============= -->
  <div class="modal-overlay" id="modal-manifesto-tce" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:9999; align-items:center; justify-content:center; padding:20px; box-sizing:border-box;">
    <div style="background:#0f172a; border:1px solid rgba(59,130,246,0.4); width:100%; max-width:850px; max-height:90vh; border-radius:16px; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(0,0,0,0.6); overflow:hidden;">
      
      <!-- Modal Header -->
      <div style="padding:20px 24px; background:linear-gradient(135deg,#1e293b,#0f172a); border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:24px;">📜</span>
          <div>
            <h3 style="margin:0; font-size:18px; color:#f8fafc; font-weight:800;">Manifestação Técnica & Relatório Sintético (TCE-RO)</h3>
            <p style="margin:2px 0 0 0; font-size:12px; color:#94a3b8;">Fundamentação Legal (CF Art. 205/211, LDB 9394/96, Fundeb 14113/20, Lei Est. 5735/24)</p>
          </div>
        </div>
        <button type="button" onclick="fecharModalManifestoTCE()" style="background:none; border:none; color:#94a3b8; font-size:24px; cursor:pointer;">&times;</button>
      </div>

      <!-- Modal Body (Preview) -->
      <div style="padding:24px; overflow-y:auto; flex:1; background:#0b1120;">
        <div id="manifesto-tce-texto-preview" style="white-space:pre-wrap; font-family:'Segoe UI', system-ui, sans-serif; font-size:13.5px; line-height:1.7; color:#e2e8f0; background:rgba(255,255,255,0.03); padding:24px; border-radius:12px; border:1px solid rgba(255,255,255,0.08); user-select:text;"></div>
      </div>

      <!-- Modal Footer -->
      <div style="padding:16px 24px; background:#0f172a; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
        <button type="button" onclick="fecharModalManifestoTCE()" class="btn btn-ghost" style="padding:10px 20px;">Fechar</button>
        <div style="display:flex; gap:12px;">
          <button type="button" onclick="copiarManifestoTCE()" style="background:rgba(255,255,255,0.08); color:#fff; border:1px solid rgba(255,255,255,0.15); font-weight:700; padding:10px 20px; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">📋 Copiar Texto</button>
          <button type="button" onclick="imprimirManifestoTCE()" style="background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; border:none; font-weight:700; padding:10px 24px; border-radius:8px; cursor:pointer; box-shadow:0 4px 14px rgba(59,130,246,0.4); display:inline-flex; align-items:center; gap:6px;">🖨️ Imprimir / Gerar PDF</button>
        </div>
      </div>

    </div>
  </div>
`;

if (!html.includes('id="modal-manifesto-tce"')) {
  html += '\n' + modalManifestoHtml;
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('index.html updated with TCE fields and Modal Manifesto TCE-RO.');
