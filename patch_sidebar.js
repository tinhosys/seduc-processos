const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Add the collapse toggle button
const collapseBtnHtml = `
      <div style="position: absolute; top: 20px; right: -12px; z-index: 100;">
        <button onclick="toggleDesktopSidebar()" style="background: #1e293b; border: 1px solid #334155; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #94a3b8; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          <svg id="sidebar-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
      </div>
`;
// Insert into sidebar
html = html.replace('<aside class="sidebar">', '<aside class="sidebar" id="app-sidebar">\n' + collapseBtnHtml);

// Add CSS for collapsed state
const collapsedCss = `
    /* === SIDEBAR RETRATIL === */
    .sidebar { transition: width 0.3s ease; position: relative; }
    .sidebar.collapsed { width: 70px; }
    .sidebar.collapsed .sidebar-logo { padding: 10px 4px; margin: 16px 4px 24px; }
    .sidebar.collapsed .sidebar-logo div { font-size: 14px !important; }
    .sidebar.collapsed .sidebar-logo div:nth-child(2) { display: none; }
    .sidebar.collapsed .nav-section-label { display: none; }
    .sidebar.collapsed .nav-item { padding: 12px 0; justify-content: center; }
    .sidebar.collapsed .nav-item .nav-icon { margin-right: 0; }
    .sidebar.collapsed .nav-item { font-size: 0; } /* Hides text */
    .sidebar.collapsed .sidebar-footer { display: none; }
    
    .app-layout:has(.sidebar.collapsed) .page {
      margin-left: 0; /* Adjust if app-layout handles it, wait app-layout is grid */
    }
    
    /* Modify grid if sidebar is collapsed */
    .app-layout { transition: grid-template-columns 0.3s ease; }
    .app-layout.sidebar-collapsed { grid-template-columns: 70px 1fr; }
`;
html = html.replace('</style>', collapsedCss + '\n  </style>');

// Add JS for toggle
const toggleJs = `
    function toggleDesktopSidebar() {
      const sidebar = document.getElementById('app-sidebar');
      const layout = document.querySelector('.app-layout');
      const chevron = document.getElementById('sidebar-chevron');
      
      sidebar.classList.toggle('collapsed');
      layout.classList.toggle('sidebar-collapsed');
      
      if (sidebar.classList.contains('collapsed')) {
        chevron.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>'; // point right
      } else {
        chevron.innerHTML = '<polyline points="15 18 9 12 15 6"></polyline>'; // point left
      }
    }
`;
html = html.replace('// Toggle Sidebar no Mobile', toggleJs + '\n\n    // Toggle Sidebar no Mobile');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Sidebar toggle added');
