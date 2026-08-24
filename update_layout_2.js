const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The entire section-header of page-processos
const headerRegex = /<div class="section-header" style="display:flex; flex-direction:column; gap:12px;">[\s\S]*?<div class="filters-bar">/;

const newHeader = `<div class="section-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap: wrap; gap:16px;">
          <!-- Left Badges -->
          <div style="display:flex; flex-direction:column; align-items:flex-start; gap:8px; min-width:250px;">
            <span id="valor-filtrado" style="display:flex; justify-content:space-between; align-items:center; width:250px; padding:10px 16px; border-radius:8px; font-size:17px; font-weight:700; background:rgba(16, 185, 129, 0.15); color:#34d399; border:1px solid rgba(16, 185, 129, 0.3); font-family:monospace; letter-spacing:0.5px;">
              <span>R$</span> <span>Carregando...</span>
            </span>
            <span id="qtd-registros-filtrados" style="display:flex; align-items:center; justify-content:flex-start; width:250px; padding:10px 16px; border-radius:8px; font-size:15px; font-weight:700; background:rgba(59, 130, 246, 0.15); color:#60a5fa; border:1px solid rgba(59, 130, 246, 0.3); white-space:nowrap; font-family:monospace;">
              0 Processos
            </span>
          </div>

          <!-- Right Action Buttons -->
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex:1;">
            
            <!-- Row 1: Reports -->
            <div class="header-buttons" style="display:flex; align-items:stretch; justify-content:flex-end; gap:10px; flex-wrap:wrap; width:100%;">
              <button class="btn action-adm" onclick="imprimirAnalise()" style="flex:1; max-width:180px; padding:10px 12px; height:40px; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; border:none; border-radius:8px; background:#9333ea; color:white; cursor:pointer; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; transition:background 0.2s;" onmouseover="this.style.background='#7e22ce'" onmouseout="this.style.background='#9333ea'" title="Análise Gerencial">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> <span class="btn-text">ANÁLISE</span>
              </button>
              <button class="btn action-adm" onclick="imprimirDetalhado()" style="flex:1; max-width:180px; padding:10px 12px; height:40px; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; border:none; border-radius:8px; background:#2563eb; color:white; cursor:pointer; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; transition:background 0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'" title="Relatório Detalhado">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> <span class="btn-text">DETALHADO</span>
              </button>
              <button class="btn action-adm" onclick="imprimirPadrao()" style="flex:1; max-width:180px; padding:10px 12px; height:40px; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; border:none; border-radius:8px; background:#475569; color:white; cursor:pointer; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; transition:background 0.2s;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='#475569'" title="Imprimir Lista Atual">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> <span class="btn-text">PADRÃO</span>
              </button>
              <button class="btn action-adm" onclick="exportarExcel()" style="flex:1; max-width:180px; padding:10px 12px; height:40px; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; border:none; border-radius:8px; background:#16a34a; color:white; cursor:pointer; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; transition:background 0.2s;" onmouseover="this.style.background='#15803d'" onmouseout="this.style.background='#16a34a'" title="Exportar para Excel">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 3v5h5M8 13l4 4M12 17l4-4M12 11v6"/></svg> <span class="btn-text">EXCEL</span>
              </button>
            </div>

            <!-- Row 2: Controls -->
            <div style="display:flex; align-items:stretch; justify-content:flex-end; gap:10px; flex-wrap:wrap; width:100%;">
              <button type="button" id="btn-toggle-filtros" onclick="toggleFiltros()" class="btn btn-ghost btn-sm" style="flex:1; max-width:180px; border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.05); color:var(--text-primary); padding:10px 12px; height:40px; border-radius:8px; font-weight:700; font-size:13px; display:inline-flex; align-items:center; justify-content:center; gap:6px; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px; transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'" title="Mostrar/Ocultar Filtros">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                <span class="btn-text">OCULTAR FILTROS</span>
              </button>
              <button class="action-editor action-adm" onclick="window.open('https://docs.google.com/spreadsheets/d/1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E/edit?gid=0#gid=0', '_blank')" style="flex:1; max-width:180px; background:rgba(16, 185, 129, 0.15); border:1px solid rgba(16, 185, 129, 0.5); color:#10b981; padding:10px 12px; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; height:40px; text-transform:uppercase; letter-spacing:0.5px; transition:background 0.2s;" onmouseover="this.style.background='rgba(16, 185, 129, 0.3)'" onmouseout="this.style.background='rgba(16, 185, 129, 0.15)'" title="Acessar Planilha">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                PLANILHA
              </button>
              <button id="btn-limpar-filtros" onmouseover="this.style.background='rgba(250, 204, 21, 0.3)'" onmouseout="this.style.background='rgba(250, 204, 21, 0.15)'" style="flex:1; max-width:180px; display:flex; align-items:center; justify-content:center; gap:6px; height:40px; padding:10px 12px; border-radius:8px; background:rgba(250, 204, 21, 0.15); color:#facc15; border:1px solid #facc15; font-weight:700; font-size:13px; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px; transition:background 0.2s;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                LIMPAR PARÂMETROS
              </button>
            </div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="filters-bar">`;

html = html.replace(headerRegex, newHeader);

// Responsiveness:
// `.table-wrap` for processes needs `overflow-x: auto; -webkit-overflow-scrolling: touch;`. It's already there in CSS or inline usually.
// Let's check `<div class="table-wrap">` in Processos page.
// The user says "as vezes no celular e nao estao rodando a tela, corrija isso para uso no celular tb"
// We can add overflow-x: auto to all table-wrap classes or ensure table is responsive.
const tableWrapRegex = /<div class="table-wrap">/g;
html = html.replace(tableWrapRegex, '<div class="table-wrap" style="overflow-x:auto; -webkit-overflow-scrolling:touch; width:100%;">');

// Modal responsivo:
// <div class="modal-content">
// Let's ensure modal-content has max-width and max-height constraints.
// They might be in style.css or embedded. I will check style blocks for .modal-content or add inline styles.
// A common inline style for modal-content is `style="background: #1a1f35..."`. I will add a `<style>` block at the end of `<head>` to enforce mobile rules.

const mobileStyles = `
  <style>
    @media (max-width: 768px) {
      .modal-content {
        width: 95% !important;
        max-width: 95% !important;
        max-height: 90vh !important;
        overflow-y: auto !important;
        padding: 16px !important;
        margin: 10px auto !important;
      }
      .section-header {
        flex-direction: column !important;
      }
      .section-header > div {
        align-items: center !important;
        justify-content: center !important;
      }
      .section-header .header-buttons, .section-header > div > div {
        justify-content: center !important;
      }
      .filters-bar select, .filters-bar input {
        width: 100% !important;
      }
    }
  </style>
</head>`;
html = html.replace(/<\/head>/i, mobileStyles);

// Version bump
html = html.replace(/v1\.0\.94/g, 'v1.0.95');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated with flex rows and mobile fixes');
