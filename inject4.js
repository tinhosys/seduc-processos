const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const pageProalfa = `
  <!-- ===================== PAGE PROALFA ===================== -->
  <section id="page-proalfa" class="page">
    <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;" id="proalfa-tabs"></div>
    <div class="filters-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
        <div style="display:flex; align-items:center; gap:10px; width:100%;">
          <input type="text" id="proalfa-busca" placeholder="Buscar por escola, município, inep..." style="flex:1; width:100%; padding:10px 16px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:var(--text-primary); font-size:14px; outline:none; transition:border-color 0.2s, box-shadow 0.2s;" onfocus="this.style.borderColor='var(--primary-color)'; this.style.boxShadow='0 0 0 3px rgba(99,102,241,0.2)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.boxShadow='none'">
        </div>
        <button class="action-editor action-adm" onclick="window.open('https://docs.google.com/spreadsheets/d/12w-tBU6lMlKR7mncvbfoKjKGcvCZftd12CFKxdtf7ac/edit?gid=392130906#gid=392130906', '_blank')" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.5); color: #10b981; padding: 0 16px; margin-left:10px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; height: 38px; transition: background 0.2s;" onmouseover="this.style.background='rgba(16, 185, 129, 0.3)'" onmouseout="this.style.background='rgba(16, 185, 129, 0.15)'" title="Acessar Planilha">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          PLANILHA
        </button>
      </div>
      <div class="filters-grid" style="grid-template-columns: repeat(7, 1fr);">
        <div class="filter-group"><label>ANO</label><select id="proalfa-ano" style="flex:1; min-width:150px; padding:10px 12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--text-primary); font-size:13px; cursor:pointer;" class="filter-select"><option value="2025">2025</option></select></div>
        <div class="filter-group"><label>SUPER</label><select id="proalfa-super" style="flex:1; min-width:150px; padding:10px 12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--text-primary); font-size:13px; cursor:pointer;" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>MUNICÍPIO</label><select id="proalfa-municipio" style="flex:1; min-width:150px; padding:10px 12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--text-primary); font-size:13px; cursor:pointer;" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>DISTRITO</label><select id="proalfa-distrito" style="flex:1; min-width:150px; padding:10px 12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--text-primary); font-size:13px; cursor:pointer;" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>COMPETÊNCIA</label><select id="proalfa-dep" style="flex:1; min-width:150px; padding:10px 12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--text-primary); font-size:13px; cursor:pointer;" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>DOCENTES</label><select id="proalfa-docentes" style="flex:1; min-width:150px; padding:10px 12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--text-primary); font-size:13px; cursor:pointer;" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>INEP</label><input type="text" id="proalfa-inep" class="search-input" placeholder="Código INEP..." style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px 12px; color: #fff; width:100%; height:36px; box-sizing:border-box;"></div>
      </div>
      <div style="margin-top: 15px;">
        <button onclick="limparFiltrosProalfa()" 
            onmouseover="this.style.background='rgba(250, 204, 21, 0.3)'" 
            onmouseout="this.style.background='rgba(250, 204, 21, 0.15)'"
            style="display:flex; align-items:center; justify-content:center; gap:8px; width:300px; padding:10px; border-radius:8px; background:rgba(250, 204, 21, 0.15); color:#facc15; border:1px solid #facc15; font-weight:800; font-size:13px; cursor:pointer; text-transform:uppercase; letter-spacing: 0.5px; transition: background 0.2s;">
          <span style="font-size:16px;">&times;</span> LIMPAR PARÂMETROS
        </button>
      </div>
    </div>
    <div class="table-wrap" style="margin-top: 20px;">
      <table id="table-proalfa" style="table-layout:fixed; width:100%; min-width:1100px; border-collapse:separate; border-spacing:0; font-size:13px;">
        <thead><tr id="proalfa-thead-tr"></tr></thead>
        <tbody id="proalfa-tbody"></tbody>
        <tfoot id="proalfa-tfoot"></tfoot>
      </table>
    </div>
  </section>
`;

if (!html.includes('id="page-proalfa"')) {
    html = html.replace('<!-- ============= MODAL FORMULÁRIO CONTATO ============= -->', pageProalfa + '\n\n  <!-- ============= MODAL FORMULÁRIO CONTATO ============= -->');
}
fs.writeFileSync('index.html', html, 'utf8');
console.log('Injected properly');
