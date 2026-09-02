const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regex = /<div class="card action-adm" id="card-padronizacao-dados"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const replacement = `<div class="card action-adm" id="card-padronizacao-dados" style="margin-top: 24px; padding: 20px; border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.02);">
            <h3 style="font-size: 14px; margin-bottom: 12px; color: #34d399; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
              ✅ Corretor Ortográfico & Padronizador
            </h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
              Esta ferramenta busca divergências de formatação (espaços extras, letras minúsculas) em <strong>Status</strong> e <strong>Localização</strong>. Nenhuma alteração é feita sem sua autorização.
            </p>
            <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
              <button type="button" class="btn" id="btn-verificar-padronizacao" onclick="verificarInconsistenciasPlanilha()" style="background:#3b82f6; border:none; padding:10px 16px; border-radius:6px; font-weight:600; color:#fff; cursor:pointer; height: 40px; display: flex; align-items: center; gap: 6px;">
                🔍 Buscar Divergências
              </button>
              <button type="button" class="btn" id="btn-executar-padronizacao" onclick="executarPadronizacaoPlanilha()" style="background:#10b981; border:none; padding:10px 16px; border-radius:6px; font-weight:600; color:#fff; cursor:pointer; height: 40px; display: flex; align-items: center; gap: 6px; display: none;">
                ✓ Autorizar e Corrigir
              </button>
            </div>
            <div id="status-padronizacao-container" style="margin-top: 16px; font-size: 13px; display: none;">
              <div style="font-weight: 600; margin-bottom: 8px;" id="label-status-padronizacao"></div>
              <div id="log-status-padronizacao" style="max-height: 250px; overflow-y: auto; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #cbd5e1; text-align: left;"></div>
            </div>
          </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('index.html', content);
console.log('patched index padronizacao');
