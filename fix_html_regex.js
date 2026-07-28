const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<label[^>]*>[^<]*BANHEIROS<\/label>\s*<input[^>]*id="form-banheiros"[^>]*>\s*<\/div>(.*?)<label[^>]*>\s*<span[^>]*>[^<]*<\/span>\s*<span>Detalhamento dos Itens & Quantidades Pedidas/s;

const match = html.match(regex);
if (match) {
    const replacement = `
              </div>

              <!-- SEÇÃO: DETALHAMENTO DO PEDIDO & MONITORAMENTO -->
              <div style="margin-top:24px; padding:20px; background:linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05)); border:1px solid rgba(59,130,246,0.3); border-radius:12px; margin-bottom:20px;">
                <div style="font-size:13px; font-weight:800; color:#60a5fa; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span>📊</span> <span>Detalhamento do Pedido - Relatório de Monitoramento</span>
                  </div>
                  <button type="button" onclick="gerarRelatorioMonitoramento()" style="background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; border:none; font-size:12px; font-weight:700; padding:8px 16px; border-radius:6px; cursor:pointer; box-shadow:0 3px 10px rgba(59,130,246,0.35); display:inline-flex; align-items:center; gap:6px;">📊 GERAR RELATÓRIO</button>
                </div>

                <div class="form-group" style="margin-bottom:14px;">
                  <label style="color:#f0f4ff; font-weight:600; font-size:13px;">📐 Metragem m² (Obras / Ampliação / Reforma)</label>
                  <input type="text" id="form-metragemM2" class="form-control" placeholder="Ex: 450 m²" style="border-color:rgba(59,130,246,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">
                </div>

                <div class="form-group">
                  <label style="color:#f0f4ff; font-weight:700; font-size:13px; display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                    <span>📦</span> <span>Detalhamento dos Itens & Quantidades Pedidas`;
    
    html = html.replace(regex, `<label style="color:#f0f4ff; font-weight:600; font-size:13px;">🚻 BANHEIROS</label>\n                  <input type="text" id="form-banheiros" class="form-control" placeholder="Ex: Masc / Fem / Acessível" style="border-color:rgba(16,185,129,0.4); background:rgba(0,0,0,0.3); color:#fff; font-weight:600; padding:10px 12px;">\n                </div>` + replacement);
    fs.writeFileSync('index.html', html);
    console.log("Restored successfully via regex");
} else {
    console.log("Regex not matched!");
}
