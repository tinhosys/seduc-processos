const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The section header in page-contatos
const headerRegex = /<div class="section-header" style="flex-wrap:wrap;gap:16px;">[\s\S]*?<div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">/s;

const newHeader = `<div class="section-header" style="flex-wrap:wrap;gap:16px; justify-content: space-between;">
      
      <!-- Left side: Municipio Combo -->
      <div style="display:flex; align-items:stretch; position:relative; min-width:240px; z-index:90;">
        <button type="button" onclick="document.getElementById('contatos-municipio-dropdown').style.display = document.getElementById('contatos-municipio-dropdown').style.display==='none'?'block':'none'"
          style="width:100%; display:flex; align-items:center; justify-content:space-between; gap:6px; padding:9px 12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--text-primary); font-size:13px; cursor:pointer; font-weight:600; text-align:left;">
          <span id="contatos-municipio-label">MUNICÍPIO (Todos)</span>
          <span style="font-size:10px;opacity:0.6;">▼</span>
        </button>
        <div id="contatos-municipio-dropdown" style="display:none; position:absolute; top:calc(100% + 4px); left:0; min-width:260px; background:#1a1f35; border:1px solid rgba(255,255,255,0.15); border-radius:10px; box-shadow:0 8px 32px rgba(0,0,0,0.5); padding:8px 0; max-height:300px; overflow-y:auto; z-index:9999;">
          <div style="padding:6px 12px 10px 12px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:8px;">
            <input type="text" placeholder="Buscar município..." oninput="contatosFiltrarComboMunicipio(this.value)"
              style="width:100%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:6px 8px; color:#f0f4ff; font-size:12px; outline:none; box-sizing:border-box;">
            <div style="display:flex; gap:6px;">
              <button onclick="contatosToggleTodosMunicipios(true)" style="flex:1; background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); padding:4px 0; border-radius:4px; font-size:11px; font-weight:600; cursor:pointer;">Todos</button>
              <button onclick="contatosToggleTodosMunicipios(false)" style="flex:1; background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3); padding:4px 0; border-radius:4px; font-size:11px; font-weight:600; cursor:pointer;">Nenhum</button>
            </div>
          </div>
          <div id="contatos-municipio-list" style="padding:4px 0;"></div>
        </div>
      </div>

      <!-- Right side: Badges and Actions -->
      <div style="display:flex;align-items:stretch;gap:16px;flex-wrap:wrap;margin-left:auto;">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span id="contatos-badge-total" style="display:inline-flex;align-items:center;padding:8px 16px;border-radius:8px;font-size:15px;font-weight:700;background:rgba(139,92,246,0.15);color:#a78bfa;border:1px solid rgba(139,92,246,0.3);font-family:monospace;letter-spacing:0.5px;">👥 0 Municípios</span>
          <span id="contatos-badge-escolas" style="display:inline-flex;align-items:center;padding:8px 16px;border-radius:8px;font-size:15px;font-weight:700;background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);font-family:monospace;letter-spacing:0.5px;">🏫 0 Escolas</span>
          <span id="contatos-badge-alunos" style="display:inline-flex;align-items:center;padding:8px 16px;border-radius:8px;font-size:15px;font-weight:700;background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);font-family:monospace;letter-spacing:0.5px;">🎓 0 Alunos</span>
        </div>
        <div style="display:flex;align-items:stretch;gap:10px;height:38px;">
          <button onclick="imprimirContatos()" style="background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.5);color:#60a5fa;padding:9px 16px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:100%;transition:background 0.2s;" onmouseover="this.style.background='rgba(59,130,246,0.3)'" onmouseout="this.style.background='rgba(59,130,246,0.15)'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Impressão
          </button>
          <a href="https://docs.google.com/spreadsheets/d/1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08/edit?gid=1855271818#gid=1855271818"
            target="_blank" rel="noopener" class="action-editor action-adm"
            style="background:linear-gradient(135deg,#10b981,#059669);border:none;color:white;padding:9px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;display:inline-flex;align-items:center;height:100%;gap:6px;text-decoration:none;box-shadow:0 4px 14px rgba(16,185,129,0.35);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Acessar Planilha
          </a>
        </div>
      </div>
    </div>
    
    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">`;

html = html.replace(headerRegex, newHeader);

// Version bump
html = html.replace(/v1\.0\.92/g, 'v1.0.93');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html modified for new combo and badge right alignment');
