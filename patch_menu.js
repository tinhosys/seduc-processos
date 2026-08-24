const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newNav = `
      <nav class="sidebar-nav">
        <div class="nav-section-label">Menu Principal</div>

        <a href="#" class="nav-item" onclick="navegar('dashboard'); fecharSubmenus()">
          <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg></span>
          <span>Dashboard</span>
        </a>

        <a href="#" class="nav-item active" onclick="navegar('orcamento'); fecharSubmenus()">
          <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></span>
          <span>Orçamento</span>
        </a>

        <!-- Menu Processos -->
        <div class="nav-group">
          <a href="#" class="nav-item" onclick="toggleSubmenu('sub-processos', this)">
            <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></span>
            <span style="flex:1">Processos</span>
            <svg class="submenu-indicator" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </a>
          <div class="nav-submenu" id="sub-processos" style="display: none; padding-left: 20px;">
            <a href="#" class="nav-item sub-item" onclick="navegar('processos')" style="font-size: 13px; padding: 10px 16px;"><span>Todos os Processos</span></a>
            <a href="#" class="nav-item sub-item" onclick="navegar('proalfa')" style="font-size: 13px; padding: 10px 16px;"><span>PROALFA</span></a>
            <a href="#" class="nav-item sub-item" onclick="navegar('repetidos')" style="font-size: 13px; padding: 10px 16px;"><span>Processos Repetidos</span></a>
          </div>
        </div>

        <!-- Menu Escolas -->
        <div class="nav-group">
          <a href="#" class="nav-item" onclick="toggleSubmenu('sub-escolas', this)">
            <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span>
            <span style="flex:1">Escolas & Mapas</span>
            <svg class="submenu-indicator" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </a>
          <div class="nav-submenu" id="sub-escolas" style="display: none; padding-left: 20px;">
            <a href="#" class="nav-item sub-item" onclick="navegar('escolas')" style="font-size: 13px; padding: 10px 16px;"><span>Lista de Escolas</span></a>
            <a href="#" class="nav-item sub-item" onclick="navegar('mapa')" style="font-size: 13px; padding: 10px 16px;"><span>Mapa de Escolas</span></a>
            <a href="#" class="nav-item sub-item" onclick="navegar('municipios')" style="font-size: 13px; padding: 10px 16px;"><span>Municípios</span></a>
          </div>
        </div>

        <!-- Menu Configurações -->
        <div class="nav-group">
          <a href="#" class="nav-item" onclick="toggleSubmenu('sub-config', this)">
            <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span>
            <span style="flex:1">Configurações</span>
            <svg class="submenu-indicator" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </a>
          <div class="nav-submenu" id="sub-config" style="display: none; padding-left: 20px;">
            <a href="#" class="nav-item sub-item" onclick="navegar('acessos')" style="font-size: 13px; padding: 10px 16px;"><span>Gerenciar Acessos</span></a>
            <a href="#" class="nav-item sub-item" onclick="navegar('senha')" style="font-size: 13px; padding: 10px 16px;"><span>Trocar Senha</span></a>
          </div>
        </div>

      </nav>
`;

const startIndex = html.indexOf('<nav class="sidebar-nav">');
const endIndex = html.indexOf('</nav>', startIndex) + 6;

html = html.substring(0, startIndex) + newNav + html.substring(endIndex);

// Inject JS for submenu logic
const toggleSubmenuJs = `
    function toggleSubmenu(id, el) {
      // expand sidebar if collapsed
      const sidebar = document.getElementById('app-sidebar');
      if (sidebar && sidebar.classList.contains('collapsed')) {
        toggleDesktopSidebar();
      }

      const menu = document.getElementById(id);
      const indicator = el.querySelector('.submenu-indicator');
      if (menu.style.display === 'none') {
        menu.style.display = 'block';
        if (indicator) indicator.style.transform = 'rotate(180deg)';
        el.classList.add('open');
      } else {
        menu.style.display = 'none';
        if (indicator) indicator.style.transform = 'rotate(0deg)';
        el.classList.remove('open');
      }
    }
    
    function fecharSubmenus() {
      document.querySelectorAll('.nav-submenu').forEach(m => m.style.display = 'none');
      document.querySelectorAll('.submenu-indicator').forEach(i => i.style.transform = 'rotate(0deg)');
      document.querySelectorAll('.nav-group .nav-item').forEach(i => i.classList.remove('open'));
    }
    
    // Add transition to indicator
    document.head.insertAdjacentHTML('beforeend', '<style>.submenu-indicator { transition: transform 0.2s; }</style>');
`;

html = html.replace('function toggleDesktopSidebar() {', toggleSubmenuJs + '\n\n    function toggleDesktopSidebar() {');

// Fix active state logic: app.js `navegar()` does document.querySelectorAll('.nav-item')... but it might highlight the group header too!
// Wait, app.js `navegar` looks at href? No, `document.querySelectorAll('.sidebar-nav .nav-item').forEach...`
// I'll patch app.js in a separate step if needed.

fs.writeFileSync('index.html', html, 'utf8');
console.log('Accordion menu added');
