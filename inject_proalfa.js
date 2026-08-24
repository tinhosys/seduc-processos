const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const pageProalfa = `
  <!-- ===================== PAGE PROALFA ===================== -->
  <div id="page-proalfa" class="page" style="display: none;">
    <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;" id="proalfa-tabs"></div>
    <div class="filters-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
        <div style="display:flex; align-items:center; gap:10px; width:100%;">
          <input type="text" id="proalfa-busca" class="search-input" placeholder="Buscar por escola, município, inep..." style="flex:1;">
        </div>
        <a href="https://docs.google.com/spreadsheets/d/12w-tBU6lMlKR7mncvbfoKjKGcvCZftd12CFKxdtf7ac/edit?gid=392130906#gid=392130906" target="_blank" class="btn action-adm" style="background:#10b981; color:#fff; border:none; padding:10px 16px; margin-left:10px; border-radius:6px; display:flex; align-items:center; gap:6px; font-weight:bold; white-space:nowrap; text-decoration:none;">
          📊 ACESSAR PLANILHA
        </a>
      </div>
      <div class="filters-grid" style="grid-template-columns: repeat(5, 1fr);">
        <div class="filter-group"><label>SUPER</label><select id="proalfa-super" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>MUNICÍPIO</label><select id="proalfa-municipio" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>DISTRITO</label><select id="proalfa-distrito" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>COMPETÊNCIA</label><select id="proalfa-dep" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>INEP</label><input type="text" id="proalfa-inep" class="search-input" placeholder="Código INEP..." style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px 12px; color: #fff; width:100%; height:36px; box-sizing:border-box;"></div>
      </div>
      <div style="margin-top: 15px;">
        <button class="btn btn-danger" onclick="limparFiltrosProalfa()" style="display:flex; align-items:center; gap:6px;">✖ LIMPAR PARÂMETROS</button>
      </div>
    </div>
    <div class="table-wrap" style="margin-top: 20px;">
      <table id="table-proalfa">
        <thead><tr id="proalfa-thead-tr"></tr></thead>
        <tbody id="proalfa-tbody"></tbody>
        <tfoot id="proalfa-tfoot"></tfoot>
      </table>
    </div>
  </div>
`;

if (!html.includes('id="page-proalfa"')) {
    html = html.replace('</main>', pageProalfa + '\n  </main>');
}

if (!html.includes('data-page="proalfa"')) {
    html = html.replace('<button class="nav-item" data-page="contatos">', '<button class="nav-item" data-page="proalfa"><span class="nav-icon">📖</span>PROALFA</button>\n        <button class="nav-item" data-page="contatos">');
}

if (!html.includes('<script src="js/proalfa.js"></script>')) {
    html = html.replace('</body>', '  <script src="js/proalfa.js"></script>\n</body>');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Injected Proalfa HTML successfully');
