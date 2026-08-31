const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regexMenu = /<a href="#" class="nav-item" data-page="dashboard"[\s\S]*?<!-- Menu Processos -->/m;

const dashboardHtml = `
          <a href="#" class="nav-item" data-page="dashboard" onclick="navegar('dashboard'); fecharSubmenus()">
            <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg></span>
            <span>Dashboard</span>
          </a>

          <a href="#" class="nav-item" data-page="proalfa" onclick="navegar('proalfa'); fecharSubmenus()">
            <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></span>
            <span>PROALFA</span>
          </a>

          <!-- Menu Orçamento -->
          <div class="nav-group">
            <a href="#" class="nav-item" onclick="toggleSubmenu('sub-orcamento', this)">
              <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></span>
              <span style="flex:1">Orçamento</span>
              <svg class="submenu-indicator" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </a>
            <div class="nav-submenu" id="sub-orcamento" style="display: none; padding-left: 20px;">
              <a href="#" class="nav-item sub-item" data-page="orcamento" onclick="navegar('orcamento')" style="font-size: 13px; padding: 10px 16px;"><span>Visão Geral</span></a>
              <a href="#" class="nav-item sub-item" data-page="diarias" onclick="navegar('diarias')" style="font-size: 13px; padding: 10px 16px;"><span>Diárias</span></a>
            </div>
          </div>

          <!-- Menu Processos -->`;

content = content.replace(regexMenu, dashboardHtml);

// Remove the old ones precisely
content = content.replace(/<a href="#" class="nav-item sub-item" data-page="diarias"[^>]*><span>Diǭrias<\/span><\/a>/, '');
content = content.replace(/<a href="#" class="nav-item sub-item" data-page="proalfa"[^>]*><span>PROALFA<\/span><\/a>/, '');
// Also without strange encoding just in case
content = content.replace(/<a href="#" class="nav-item sub-item" data-page="diarias"[\s\S]*?<\/a>/, '');
content = content.replace(/<a href="#" class="nav-item sub-item" data-page="proalfa"[\s\S]*?<\/a>/, '');

fs.writeFileSync('index.html', content);
console.log('Menu patched!');
