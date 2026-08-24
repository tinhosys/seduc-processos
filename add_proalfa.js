const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const btn = `
        <button class="nav-item" data-page="proalfa">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          </span>
          PROALFA
        </button>`;

html = html.replace('Contatos\n        </button>', 'Contatos\n        </button>\n' + btn);
// in case it didn't match:
if (!html.includes('data-page="proalfa"')) {
    html = html.replace('Contatos\r\n        </button>', 'Contatos\r\n        </button>\r\n' + btn);
}

const section = `
  <!-- ============= ABA PROALFA ============= -->
  <section class="page" id="page-proalfa">
    <div class="header-actions">
      <h2 style="display:flex; align-items:center; gap:12px; margin:0;">
        <span style="font-size:24px;">📚</span> PROALFA - Contagem de Alunos
      </h2>
      <div style="display:flex; gap:12px;">
        <button onclick="carregarProalfa()" class="btn-primary" style="background:var(--card-bg);border:1px solid var(--border-color);color:var(--text-color);">
          🔄 Recarregar
        </button>
      </div>
    </div>
    
    <div style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid var(--border-color); padding-bottom:10px; flex-wrap: wrap;" id="proalfa-tabs">
       <!-- Tabs will be rendered here -->
    </div>
    
    <div id="proalfa-content" style="overflow-x:auto; background:var(--card-bg); border-radius:12px; border:1px solid var(--border-color); padding:10px;">
      <!-- Table will be rendered here -->
    </div>
  </section>
`;

if (!html.includes('id="page-proalfa"')) {
    html = html.replace('<!-- ===================== MODAIS ===================== -->', section + '\n\n  <!-- ===================== MODAIS ===================== -->');
}

if (!html.includes('proalfa.js')) {
    html = html.replace('</body>', '<script src="js/proalfa.js"></script>\n</body>');
}

fs.writeFileSync('index.html', html);
console.log('UI updated');
