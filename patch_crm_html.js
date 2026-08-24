const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Insert the CRM container at the end of the orcamento page, before </section>
const crmSection = `
    <!-- CRM DE PROCESSOS SEI -->
    <div style="margin-top: 30px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #f8fafc; display:flex; align-items:center; gap:8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Acompanhamento CRM (Processos)
        </h3>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Rastreamento e execucao de processos via SEI agrupados por coordenadoria</p>
      </div>
    </div>
    
    <div id="orc-crm-container" style="margin-bottom: 30px;">
      <!-- Preenchido via JS -->
    </div>
`;

html = html.replace('  </section>\n\n  <!-- ============= MODAL: LOGADOS =============', crmSection + '  </section>\n\n  <!-- ============= MODAL: LOGADOS =============');

// Bump version
html = html.replace(/v1\.1\.05/g, 'v1.1.06');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated with CRM container');
