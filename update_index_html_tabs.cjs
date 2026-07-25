const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Check if tabs already present
if (!html.includes('id="btn-guia-objeto"')) {
  const pageNovoIdx = html.indexOf('<section class="page action-adm" id="page-novo">');
  const formIdx = html.indexOf('<form id="form-processo"', pageNovoIdx);

  if (pageNovoIdx > -1 && formIdx > pageNovoIdx) {
    const tabsHtml = `
      <!-- GUIAS DO FORMULÁRIO (OBJETO / OBJETIVO) -->
      <div style="display:flex; gap:10px; margin-bottom:20px; border-bottom:2px solid rgba(255,255,255,0.08); padding-bottom:12px;">
        <button id="btn-guia-objeto" type="button" onclick="alternarGuiaFormulario('objeto')" style="background:linear-gradient(135deg,#10b981,#059669); color:#ffffff; border:1px solid #34d399; font-weight:800; font-size:14px; padding:10px 24px; border-radius:8px; cursor:pointer; box-shadow:0 3px 12px rgba(16,185,129,0.3); display:inline-flex; align-items:center; gap:8px; transition:all 0.2s;">📦 OBJETO</button>
        <button id="btn-guia-objetivo" type="button" onclick="alternarGuiaFormulario('objetivo')" style="background:none; color:var(--text-secondary); border:1px solid transparent; font-weight:700; font-size:14px; padding:10px 24px; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition:all 0.2s;">🎯 OBJETIVO</button>
      </div>
    `;

    html = html.substring(0, formIdx) + tabsHtml + html.substring(formIdx);

    // Now wrap inside form-processo
    const formStart = html.indexOf('<form id="form-processo"', pageNovoIdx);
    const formTagEnd = html.indexOf('>', formStart) + 1;
    const formClose = html.indexOf('</form>', formStart);

    const oldFormInner = html.substring(formTagEnd, formClose);

    const newFormInner = `
        <!-- GUIA 1: OBJETO (CAMPOS PRINCIPAIS DO PROCESSO) -->
        <div id="tab-content-objeto">
          ${oldFormInner}
        </div>

        <!-- GUIA 2: OBJETIVO (INFRAESTRUTURA & DEMAIS OBSERVAÇÕES) -->
        <div id="tab-content-objetivo" style="display:none; padding:24px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:14px; margin-bottom:24px; box-shadow:0 8px 24px rgba(0,0,0,0.3);">
          
          <div style="font-size:13px; font-weight:800; color:#34d399; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:18px; display:flex; align-items:center; gap:8px;">
            <span>🏫</span> <span>Dados de Infraestrutura & Estrutura Física (Aba Objetivo)</span>
          </div>

          <!-- Grid de Infraestrutura -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:18px; margin-bottom:20px;">
            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">🚪 QTDE SALA</label>
              <input type="text" id="form-qtdeSala" class="form-control" placeholder="Ex: 10" style="border-color:rgba(16,185,129,0.3); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
            </div>

            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">📐 TIPO SALA</label>
              <input type="text" id="form-tipoSala" class="form-control" placeholder="Ex: Convencional / Climatizada" style="border-color:rgba(16,185,129,0.3); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
            </div>

            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">🎭 AUDITÓRIO</label>
              <input type="text" id="form-auditorio" class="form-control" placeholder="Ex: Sim / Não" style="border-color:rgba(16,185,129,0.3); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
            </div>

            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">📋 TIPO AUDITÓRIO</label>
              <input type="text" id="form-tipoAuditorio" class="form-control" placeholder="Ex: Climatizado / Com Palco" style="border-color:rgba(16,185,129,0.3); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
            </div>

            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">🏀 QUADRA</label>
              <input type="text" id="form-quadra" class="form-control" placeholder="Ex: Coberta / Poliesportiva" style="border-color:rgba(16,185,129,0.3); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
            </div>

            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">🌳 PÁTIO</label>
              <input type="text" id="form-patio" class="form-control" placeholder="Ex: Coberto / Descoberto" style="border-color:rgba(16,185,129,0.3); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
            </div>

            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">🍽️ REFEITÓRIO</label>
              <input type="text" id="form-refeitorio" class="form-control" placeholder="Ex: Completo / Cozinha" style="border-color:rgba(16,185,129,0.3); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
            </div>

            <div class="form-group">
              <label style="color:#f0f4ff; font-weight:600; font-size:13px;">🚻 BANHEIROS</label>
              <input type="text" id="form-banheiros" class="form-control" placeholder="Ex: Masc / Fem / Acessível" style="border-color:rgba(16,185,129,0.3); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
            </div>
          </div>

          <!-- DEMAIS OBSERVAÇÕES -->
          <div class="form-group">
            <label style="color:#f0f4ff; font-weight:700; font-size:14px; display:flex; align-items:center; gap:6px; margin-bottom:8px;">
              <span>📝</span> <span>DEMAIS OBSERVAÇÕES</span>
            </label>
            <textarea id="form-demaisObservacoes" class="form-control" rows="4" placeholder="Digite aqui demais observações específicas sobre a infraestrutura e objetivo desta unidade..." style="width:100%; border-color:rgba(16,185,129,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:500; padding:12px; border-radius:8px; line-height:1.5; box-sizing:border-box;"></textarea>
          </div>

        </div>
    `;

    html = html.substring(0, formTagEnd) + newFormInner + html.substring(formClose);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('index.html page-novo tabs (OBJETO / OBJETIVO) updated successfully.');
  }
} else {
  console.log('Tabs already present in index.html');
}
