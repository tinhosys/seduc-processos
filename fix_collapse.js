const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// We need to fix the collapsed state CSS.
const newCss = `
    /* === SIDEBAR RETRATIL === */
    .sidebar { transition: width 0.3s ease; position: fixed; z-index: 100; }
    .sidebar.collapsed { width: 70px; }
    .sidebar.collapsed .sidebar-logo { padding: 10px 4px; margin: 16px 4px 24px; }
    .sidebar.collapsed .sidebar-logo div { font-size: 14px !important; }
    .sidebar.collapsed .sidebar-logo div:nth-child(2) { display: none; }
    .sidebar.collapsed .nav-section-label { display: none; }
    .sidebar.collapsed .nav-item { padding: 12px 0; justify-content: center; overflow: hidden; }
    .sidebar.collapsed .nav-item .nav-icon { margin-right: 0; }
    .sidebar.collapsed .nav-item span:not(.nav-icon) { display: none; }
    .sidebar.collapsed .sidebar-footer { display: none; }
    .sidebar.collapsed .submenu-indicator { display: none; }
    
    .main-content { transition: margin-left 0.3s ease; }
    .app-layout:has(.sidebar.collapsed) .main-content {
      margin-left: 70px !important;
    }
    .app-layout:has(.sidebar.collapsed) .topbar {
      left: 70px !important;
      width: calc(100% - 70px) !important;
    }
`;

// Replace the old bad CSS block I inserted
html = html.replace(/\/\* === SIDEBAR RETRATIL === \*\/[\s\S]*?\.app-layout\.sidebar-collapsed \{ grid-template-columns: 70px 1fr; \}/, newCss);

// Remove .app-layout.sidebar-collapsed from JS
html = html.replace("layout.classList.toggle('sidebar-collapsed');", "");

fs.writeFileSync('index.html', html, 'utf8');
console.log('Sidebar collapse CSS fixed');
