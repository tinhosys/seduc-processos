const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The button string to move
const oldBtnStr = `                  <button type="button" onclick="gerarRelatorioMonitoramento()" style="background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; border:none; font-size:12px; font-weight:700; padding:8px 16px; border-radius:6px; cursor:pointer; box-shadow:0 3px 10px rgba(59,130,246,0.35); display:inline-flex; align-items:center; gap:6px;">📊 GERAR RELATÓRIO</button>\n`;

// 1. Remove it from its original place
html = html.replace(oldBtnStr, '');

// 2. Prepare the new unified button HTML
// We will add it to the top row
const newBtnStr = `<button type="button" onclick="gerarRelatorioMonitoramento()" class="btn" style="background:linear-gradient(135deg,#3b82f6,#2563eb); color:#fff; border:none; box-shadow:0 3px 10px rgba(59,130,246,0.35); height: 42px; padding: 0 24px; font-size: 14px; font-weight: 700; border-radius: 8px;">📊 Gerar Relatório</button>`;

// 3. Update the existing top buttons to have matching height/padding
// The form-actions-top div
const oldFormActionsTop = `<div class="form-actions-top" style="display:flex; gap:8px; align-items:center;">
                <button type="button" class="btn btn-ghost" id="btn-cancelar-form">Cancelar</button>
                <button type="submit" class="btn btn-success">💾 Salvar Processo</button>
              </div>`;

const newFormActionsTop = `<div class="form-actions-top" style="display:flex; gap:8px; align-items:center;">
                ${newBtnStr}
                <button type="button" class="btn btn-ghost" id="btn-cancelar-form" style="height: 42px; padding: 0 24px; font-size: 14px; font-weight: 700; border-radius: 8px;">Cancelar</button>
                <button type="submit" class="btn btn-success" style="height: 42px; padding: 0 24px; font-size: 14px; font-weight: 700; border-radius: 8px;">💾 Salvar Processo</button>
              </div>`;

html = html.replace(oldFormActionsTop, newFormActionsTop);

// 4. Update the OBJETO and OBJETIVO tab buttons to also have height: 42px explicitly, just in case, though they had padding 10px 24px which makes them ~40px. Let's make sure they are exactly 42px height for perfect alignment.
html = html.replace(`font-size:14px; padding:10px 24px; border-radius:8px; cursor:pointer; box-shadow:0 4px 14px rgba(16,185,129,0.35); display:inline-flex; align-items:center; gap:8px; transition:all 0.2s;">🎯 OBJETO</button>`, 
                    `height: 42px; font-size:14px; padding:0 24px; border-radius:8px; cursor:pointer; box-shadow:0 4px 14px rgba(16,185,129,0.35); display:inline-flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s;">🎯 OBJETO</button>`);

html = html.replace(`font-size:14px; padding:10px 24px; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition:all 0.2s;">🎯 OBJETIVO</button>`, 
                    `height: 42px; font-size:14px; padding:0 24px; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s;">🎯 OBJETIVO</button>`);

// Also change the version to 1.0.2
html = html.replace('GBZ - v1.0.1', 'GBZ - v1.0.2');

fs.writeFileSync('index.html', html);
console.log("UI updated and version bumped to 1.0.2");
