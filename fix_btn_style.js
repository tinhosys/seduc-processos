const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldLink = `<a href="https://docs.google.com/spreadsheets/d/12w-tBU6lMlKR7mncvbfoKjKGcvCZftd12CFKxdtf7ac/edit?gid=392130906#gid=392130906" target="_blank" class="btn action-adm" style="background:#10b981; color:#fff; border:none; padding:10px 16px; margin-left:10px; border-radius:6px; display:flex; align-items:center; gap:6px; font-weight:bold; white-space:nowrap; text-decoration:none;">
          📊 ACESSAR PLANILHA
        </a>`;

const newLink = `<button class="action-editor action-adm" onclick="window.open('https://docs.google.com/spreadsheets/d/12w-tBU6lMlKR7mncvbfoKjKGcvCZftd12CFKxdtf7ac/edit?gid=392130906#gid=392130906', '_blank')" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.5); color: #10b981; padding: 0 16px; margin-left:10px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; height: 38px; transition: background 0.2s;" onmouseover="this.style.background='rgba(16, 185, 129, 0.3)'" onmouseout="this.style.background='rgba(16, 185, 129, 0.15)'" title="Acessar Planilha">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              PLANILHA
            </button>`;

html = html.replace(oldLink, newLink);

const oldBtn = `<button class="btn btn-danger" onclick="limparFiltrosProalfa()" style="display:flex; align-items:center; gap:6px;">✖ LIMPAR PARÂMETROS</button>`;

const newBtn = `<button onclick="limparFiltrosProalfa()" 
                    onmouseover="this.style.background='rgba(250, 204, 21, 0.3)'" 
                    onmouseout="this.style.background='rgba(250, 204, 21, 0.15)'"
                    style="display:flex; align-items:center; justify-content:center; gap:8px; width:300px; padding:10px; border-radius:8px; background:rgba(250, 204, 21, 0.15); color:#facc15; border:1px solid #facc15; font-weight:800; font-size:13px; cursor:pointer; text-transform:uppercase; letter-spacing: 0.5px; transition: background 0.2s;">
              <span style="font-size:16px;">&times;</span> LIMPAR PARÂMETROS
            </button>`;

html = html.replace(oldBtn, newBtn);

// Also make search input match the styling of other pages
html = html.replace('<input type="text" id="proalfa-busca" class="search-input" placeholder="Buscar por escola, município, inep..." style="flex:1;">', '<input type="text" id="proalfa-busca" placeholder="Buscar por escola, município, inep..." style="flex:1; width:100%; padding:10px 16px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:var(--text-primary); font-size:14px; outline:none; transition:border-color 0.2s, box-shadow 0.2s;" onfocus="this.style.borderColor=\'var(--primary-color)\'; this.style.boxShadow=\'0 0 0 3px rgba(99,102,241,0.2)\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.1)\'; this.style.boxShadow=\'none\'">');

// Style selects
html = html.replace(/class="filter-select"/g, 'style="flex:1; min-width:150px; padding:10px 12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--text-primary); font-size:13px; cursor:pointer;"');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed button styles');
