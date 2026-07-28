const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The `OBJETO` button currently has `padding:10px 24px;` - we want it to be 42px height, padding 0 24px.
html = html.replace(/<button id="btn-guia-objeto"[^>]*>([^<]*)<\/button>/, (match, text) => {
    return `<button id="btn-guia-objeto" type="button" onclick="alternarGuiaFormulario('objeto')" style="background:linear-gradient(135deg,#10b981,#059669); color:#ffffff; border:1px solid #34d399; font-weight:800; height: 42px; font-size:14px; padding:0 24px; border-radius:8px; cursor:pointer; box-shadow:0 4px 14px rgba(16,185,129,0.35); display:inline-flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s;">${text}</button>`;
});

// The `form-actions-top` div - we will inject Gerar Relatório and update the other buttons
html = html.replace(/<div class="form-actions-top"[^>]*>[\s\S]*?<\/div>/, () => {
    return `<div class="form-actions-top" style="display:flex; gap:8px; align-items:center;">
                <button type="button" onclick="gerarRelatorioMonitoramento()" class="btn" style="background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; border:none; box-shadow:0 3px 10px rgba(59,130,246,0.35); height: 42px; padding: 0 24px; font-size: 14px; font-weight: 700; border-radius: 8px; display:inline-flex; align-items:center; justify-content:center; gap:6px;">📊 Gerar Relatório</button>
                <button type="button" class="btn btn-ghost" id="btn-cancelar-form" style="height: 42px; padding: 0 24px; font-size: 14px; font-weight: 700; border-radius: 8px; display:inline-flex; align-items:center; justify-content:center;">Cancelar</button>
                <button type="submit" class="btn btn-success" style="height: 42px; padding: 0 24px; font-size: 14px; font-weight: 700; border-radius: 8px; display:inline-flex; align-items:center; justify-content:center;">💾 Salvar Processo</button>
              </div>`;
});

// Also replace version 1.0.2 to 1.0.3
html = html.replace('GBZ - v1.0.2', 'GBZ - v1.0.3');

fs.writeFileSync('index.html', html);
console.log("Restored Gerar Relatorio and fixed sizing.");
