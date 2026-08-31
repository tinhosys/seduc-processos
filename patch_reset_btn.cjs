const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regex = /<h3 style="margin-top:0; color:#e2e8f0; font-size:18px; display:flex; align-items:center; gap:8px;">[\s\S]*?preencha os dados do benefici.*?<\/p>/;

const replacement = `<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px;">
            <div>
              <h3 style="margin:0 0 4px 0; color:#e2e8f0; font-size:18px; display:flex; align-items:center; gap:8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                Regra de Fluxo: Emitir Nova Diária
              </h3>
              <p style="margin:0; font-size:12px; color:#94a3b8;">Selecione o empenho orçamentário válido e preencha os dados do beneficiário.</p>
            </div>
            <button type="button" class="btn btn-ghost" onclick="if(typeof limparFormNovaDiaria === 'function') limparFormNovaDiaria();" style="font-size:12px; padding:6px 12px; display:flex; align-items:center; gap:6px; border:1px solid rgba(255,255,255,0.1); color:#cbd5e1; background:rgba(255,255,255,0.05); border-radius:6px; cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Limpar Formulário
            </button>
          </div>`;

if(regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('index.html', content);
    console.log('HTML header replaced with flex and reset button!');
} else {
    console.log('Regex did not match HTML.');
}
