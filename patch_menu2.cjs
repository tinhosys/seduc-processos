const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// The exact block for Processos submenu includes Diárias and PROALFA.
const targetSubProcessos = `
          <!-- Menu Processos -->
          <div class="nav-group">
            <a href="#" class="nav-item" onclick="toggleSubmenu('sub-processos', this)">
              <span class="nav-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></span>
              <span style="flex:1">Processos</span>
              <svg class="submenu-indicator" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </a>
            <div class="nav-submenu" id="sub-processos" style="display: none; padding-left: 20px;">
              <a href="#" class="nav-item sub-item" data-page="processos" onclick="navegar('processos')" style="font-size: 13px; padding: 10px 16px;"><span>Todos os Processos</span></a>
              <a href="#" class="nav-item sub-item" data-page="diarias" onclick="navegar('diarias')" style="font-size: 13px; padding: 10px 16px;"><span>Diárias</span></a>
              <a href="#" class="nav-item sub-item" data-page="proalfa" onclick="navegar('proalfa')" style="font-size: 13px; padding: 10px 16px;"><span>PROALFA</span></a>
              <a href="#" class="nav-item sub-item" data-page="repetidos" onclick="navegar('repetidos')" style="font-size: 13px; padding: 10px 16px;"><span>Processos Repetidos</span></a>
            </div>
          </div>
`;

// However, because of indentation/whitespace variations, a regex is safer.
content = content.replace(/<div class="nav-submenu" id="sub-processos"[\s\S]*?<\/div>/,
`<div class="nav-submenu" id="sub-processos" style="display: none; padding-left: 20px;">
              <a href="#" class="nav-item sub-item" data-page="processos" onclick="navegar('processos')" style="font-size: 13px; padding: 10px 16px;"><span>Todos os Processos</span></a>
              <a href="#" class="nav-item sub-item" data-page="repetidos" onclick="navegar('repetidos')" style="font-size: 13px; padding: 10px 16px;"><span>Processos Repetidos</span></a>
            </div>`);

// Replace Orçamento item with PROALFA and Orçamento group
const targetOrcamento = /<a href="#" class="nav-item( active)?" data-page="orcamento"[^>]*>[\s\S]*?<\/a>/;
const injectOrcamento = `
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
`;
content = content.replace(targetOrcamento, injectOrcamento);

fs.writeFileSync('index.html', content);
console.log('Menu successfully patched with proper regex order!');
