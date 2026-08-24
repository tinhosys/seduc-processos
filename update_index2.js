const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Replace the badge string safely
html = html.replace(/<span id="contatos-badge-total"[^>]*>.*?<\/span>/, `<span id="contatos-badge-total" style="display:inline-flex;align-items:center;padding:8px 16px;border-radius:8px;font-size:15px;font-weight:700;background:rgba(139,92,246,0.15);color:#a78bfa;border:1px solid rgba(139,92,246,0.3);font-family:monospace;letter-spacing:0.5px;">?? 0 Municípios</span>
<span id="contatos-badge-escolas" style="display:inline-flex;align-items:center;padding:8px 16px;border-radius:8px;font-size:15px;font-weight:700;background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);font-family:monospace;letter-spacing:0.5px;margin-left:10px;">?? 0 Escolas</span>
<span id="contatos-badge-alunos" style="display:inline-flex;align-items:center;padding:8px 16px;border-radius:8px;font-size:15px;font-weight:700;background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);font-family:monospace;letter-spacing:0.5px;margin-left:10px;">?? 0 Alunos</span>`);

// 2. Add print button.
// The button container has the "Recarregar" and "Acessar Planilha" buttons.
const printBtnHtml = `<button onclick="imprimirContatos()" style="background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.5);color:#60a5fa;padding:9px 16px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:100%;transition:background 0.2s;" onmouseover="this.style.background='rgba(59,130,246,0.3)'" onmouseout="this.style.background='rgba(59,130,246,0.15)'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Governo + CAM
        </button>`;

// Let's find the Acessar Planilha button and prepend it.
html = html.replace(/(<a[^>]*href="https:\/\/docs\.google\.com\/spreadsheets\/d\/1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08[^>]*>)/, printBtnHtml + '\n        $1');

// Fix the height of the container to match
html = html.replace(/<div style="display:flex;align-items:center;gap:10px;">/g, (match, offset, str) => {
    // Only replace the one around Recarregar/Acessar Planilha. That's right after the badge container.
    // Let's be safer.
    return match; 
});
// Let's replace specifically the div that contains carregarContatos(true)
html = html.replace(/<div style="display:flex;align-items:center;gap:10px;">(\s*<button onclick="carregarContatos\(true\)")/, '<div style="display:flex;align-items:stretch;gap:10px;height:38px;">$1');

// Also make the "Acessar Planilha" anchor stretch vertically
html = html.replace(/(<a[^>]*href="https:\/\/docs\.google\.com\/spreadsheets\/d\/1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08[^>]*style="[^"]*)display:inline-flex;align-items:center;([^"]*")/, '$1display:inline-flex;align-items:center;height:100%;$2');


// 3. Update Table headers
const newThead = `<tr>
            <th style="width:15%;">Município</th>
            <th style="width:25%;">Prefeito(a)</th>
            <th style="width:25%;">Secretário(a)</th>
            <th style="width:23%;">E-mail</th>
            <th style="width:6%;text-align:center;">Escolas</th>
            <th style="width:6%;text-align:center;">Alunos</th>
          </tr>`;

// Replace everything between <thead> and </thead> inside the contatos-table
html = html.replace(/<table class="data-table" id="contatos-table">\s*<thead>[\s\S]*?<\/thead>/, `<table class="data-table" id="contatos-table">\n        <thead>\n          ${newThead}\n        </thead>`);

// Bump version
html = html.replace(/v1\.0\.89/g, 'v1.0.90');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated successfully via regex');
