const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Change badge text and add the new yellow boxes
const oldBadge = `<span id="contatos-badge-total" style="display:inline-flex;align-items:center;padding:8px 16px;border-radius:8px;font-size:15px;font-weight:700;background:rgba(139,92,246,0.15);color:#a78bfa;border:1px solid rgba(139,92,246,0.3);font-family:monospace;letter-spacing:0.5px;">👥 0 Contatos</span>`;

const newBadge = `<span id="contatos-badge-total" style="display:inline-flex;align-items:center;padding:8px 16px;border-radius:8px;font-size:15px;font-weight:700;background:rgba(139,92,246,0.15);color:#a78bfa;border:1px solid rgba(139,92,246,0.3);font-family:monospace;letter-spacing:0.5px;">👥 0 Municípios</span>
<span id="contatos-badge-escolas" style="display:inline-flex;align-items:center;padding:8px 16px;border-radius:8px;font-size:15px;font-weight:700;background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);font-family:monospace;letter-spacing:0.5px;margin-left:10px;">🏫 0 Escolas</span>
<span id="contatos-badge-alunos" style="display:inline-flex;align-items:center;padding:8px 16px;border-radius:8px;font-size:15px;font-weight:700;background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);font-family:monospace;letter-spacing:0.5px;margin-left:10px;">🎓 0 Alunos</span>`;

html = html.replace(oldBadge, newBadge);

// 2. Add print button next to "Acessar Planilha"
const oldPlanilhaBtn = `<a href="https://docs.google.com/spreadsheets/d/1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08/edit?gid=1855271818#gid=1855271818"
          target="_blank" rel="noopener" class="action-editor action-adm"
          style="background:linear-gradient(135deg,#10b981,#059669);border:none;color:white;padding:9px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:6px;text-decoration:none;box-shadow:0 4px 14px rgba(16,185,129,0.35);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Acessar Planilha
        </a>`;

const newPlanilhaBtn = `<button onclick="imprimirContatos()" style="background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.5);color:#60a5fa;padding:9px 16px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:100%;transition:background 0.2s;" onmouseover="this.style.background='rgba(59,130,246,0.3)'" onmouseout="this.style.background='rgba(59,130,246,0.15)'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Imprimir Governo + CAM
        </button>
        <a href="https://docs.google.com/spreadsheets/d/1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08/edit?gid=1855271818#gid=1855271818"
          target="_blank" rel="noopener" class="action-editor action-adm"
          style="background:linear-gradient(135deg,#10b981,#059669);border:none;color:white;padding:9px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:6px;height:100%;text-decoration:none;box-shadow:0 4px 14px rgba(16,185,129,0.35);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Acessar Planilha
        </a>`;

html = html.replace(oldPlanilhaBtn, newPlanilhaBtn);

// Ensure the parent container stretches the buttons to the same height.
const oldBtnContainer = `<div style="display:flex;align-items:center;gap:10px;">`;
const newBtnContainer = `<div style="display:flex;align-items:stretch;gap:10px;height:38px;">`;
html = html.replace(oldBtnContainer, newBtnContainer);

// 3. Update Table headers
// Old: <th style="min-width:120px;">Município</th> <th style="min-width:250px;">Prefeito(a)</th> <th style="min-width:250px;">Secretário(a)</th> <th style="min-width:120px;">E-mail</th> <th style="min-width:80px;text-align:center;">Escolas</th> <th style="min-width:80px;text-align:center;">Alunos</th> <th style="min-width:60px;text-align:center;" class="action-editor action-adm">Ações</th>
const oldThead = `<tr>
            <th style="min-width:120px;">Municpio</th>
            <th style="min-width:250px;">Prefeito(a)</th>
            <th style="min-width:250px;">Secretrio(a)</th>
            <th style="min-width:120px;">E-mail</th>
            <th style="min-width:80px;text-align:center;">Escolas</th>
            <th style="min-width:80px;text-align:center;">Alunos</th>
            <th style="min-width:60px;text-align:center;" class="action-editor action-adm">Aes</th>
          </tr>`;

const newThead = `<tr>
            <th style="width:15%;">Município</th>
            <th style="width:25%;">Prefeito(a)</th>
            <th style="width:25%;">Secretário(a)</th>
            <th style="width:23%;">E-mail</th>
            <th style="width:6%;text-align:center;">Escolas</th>
            <th style="width:6%;text-align:center;">Alunos</th>
          </tr>`;

html = html.replace(oldThead, newThead);
// Also deal with the loading text colspan
html = html.replace(`<td colspan="7" style="text-align:center;padding:48px;color:var(--text-muted);">Carregando...</td>`, `<td colspan="6" style="text-align:center;padding:48px;color:var(--text-muted);">Carregando...</td>`);

html = html.replace(/v1\.0\.88/g, 'v1.0.89');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated successfully');
