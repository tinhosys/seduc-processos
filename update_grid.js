const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldGrid = `<div class="filters-grid" style="grid-template-columns: repeat(5, 1fr);">
        <div class="filter-group"><label>SUPER</label><select id="proalfa-super" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>MUNICÍPIO</label><select id="proalfa-municipio" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>DISTRITO</label><select id="proalfa-distrito" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>COMPETÊNCIA</label><select id="proalfa-dep" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>INEP</label><input type="text" id="proalfa-inep" class="search-input" placeholder="Código INEP..." style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px 12px; color: #fff; width:100%; height:36px; box-sizing:border-box;"></div>
      </div>`;

const newGrid = `<div class="filters-grid" style="grid-template-columns: repeat(7, 1fr);">
        <div class="filter-group"><label>ANO</label><select id="proalfa-ano" class="filter-select"><option value="2025">2025</option></select></div>
        <div class="filter-group"><label>SUPER</label><select id="proalfa-super" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>MUNICÍPIO</label><select id="proalfa-municipio" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>DISTRITO</label><select id="proalfa-distrito" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>COMPETÊNCIA</label><select id="proalfa-dep" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>DOCENTES</label><select id="proalfa-docentes" class="filter-select"><option value="">Todos</option></select></div>
        <div class="filter-group"><label>INEP</label><input type="text" id="proalfa-inep" class="search-input" placeholder="Código INEP..." style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px 12px; color: #fff; width:100%; height:36px; box-sizing:border-box;"></div>
      </div>`;

html = html.replace(oldGrid, newGrid);
fs.writeFileSync('index.html', html, 'utf8');
console.log('Added Ano and Docentes combos');
