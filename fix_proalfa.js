const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

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
    html = html.replace('<script src="js/dados.js', section + '\n\n<script src="js/dados.js');
    fs.writeFileSync('index.html', html);
    console.log('Section added!');
} else {
    console.log('Section already exists!');
}
