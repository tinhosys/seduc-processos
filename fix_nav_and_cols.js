const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// =========================================================
// 1. REBUILD SIDEBAR NAV IN CORRECT ORDER
// =========================================================
const oldNav = html.match(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/)?.[0];

const newNav = `<nav class="sidebar-nav">
        <div class="nav-section-label">Menu Principal</div>

        <button class="nav-item active" data-page="dashboard">
          <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg></span>
          Dashboard
        </button>

        <button class="nav-item" data-page="orcamento">
          <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>
          Orçamento
        </button>

        <button class="nav-item" data-page="processos">
          <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></span>
          Processos
        </button>

        <button class="nav-item" data-page="proalfa">
          <span class="nav-icon">📖</span>
          PROALFA
        </button>

        <button class="nav-item" data-page="escolas">
          <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
          Escolas
        </button>

        <button class="nav-item" data-page="mapa-escolas">
          <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg></span>
          Mapa de Escolas
        </button>

        <button class="nav-item" data-page="contatos">
          <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></span>
          Municípios
        </button>

        <button class="nav-item action-adm" data-page="acessos">
          <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg></span>
          Gerenciar Acessos
        </button>

        <button class="nav-item" data-page="senha">
          <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span>
          Trocar Senha
        </button>

        <button class="nav-item action-adm" data-page="repetidos">
          <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg></span>
          Processos Repetidos
        </button>

      </nav>`;

if (oldNav) {
  html = html.replace(oldNav, newNav);
  console.log('Sidebar rebuilt');
} else {
  console.log('ERROR: Could not find sidebar nav');
}

// =========================================================
// 2. FIX TABLE COLUMN WIDTHS – make PA and Fonte wrap nicely
// =========================================================
// Find the table header TH for PA and change min-width, white-space, etc.
// These are inline in the <th> inside <section id="page-orcamento">
// The PA td has: style="padding:10px 12px; font-size:12px; font-weight:700; color:#60a5fa; white-space:nowrap;"
html = html.replace(
  /style="padding:10px 12px; font-size:12px; font-weight:700; color:#60a5fa; white-space:nowrap;"/g,
  'style="padding:10px 12px; font-size:12px; font-weight:700; color:#60a5fa; white-space:normal; min-width:130px; max-width:160px;"'
);
// Fonte td: style="padding:10px 12px; font-size:11px; color:#94a3b8; white-space:nowrap;"
html = html.replace(
  /style="padding:10px 12px; font-size:11px; color:#94a3b8; white-space:nowrap;"/g,
  'style="padding:10px 12px; font-size:11px; color:#94a3b8; white-space:normal; min-width:120px; max-width:150px; word-break:break-word;"'
);

// Version bump
html = html.replace(/v1\.1\.02/g, 'v1.1.03');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated');
