const fs = require('fs');
let js = fs.readFileSync('js/orcamento.js', 'utf8');

// =========================================================
// Fix the legend badges to act as filter buttons
// Replace the static HTML spans in the legend with clickable buttons
// that call filtrarOrcamentoPorNatureza(code)
// =========================================================

// Add a filter-by-natureza helper function and update renderOrcamentoTable
// to also update a "active badge" state.

// First, add the badge filter function near the top
const filterFn = `
// ---- Filtro rápido por Natureza (badges legend) ----
let _orcActiveBadge = null;

function filtrarOrcamentoPorNatureza(code) {
  const sel = document.getElementById('orc-filtro-despesa');
  if (!sel) return;

  if (_orcActiveBadge === code) {
    // Toggle off
    sel.value = '';
    _orcActiveBadge = null;
  } else {
    sel.value = code;
    _orcActiveBadge = code;
  }

  // Update badge UI
  document.querySelectorAll('.orc-badge-filter').forEach(el => {
    const isActive = el.dataset.code === _orcActiveBadge;
    el.style.opacity = isActive ? '1' : '0.5';
    el.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
    el.style.boxShadow = isActive ? '0 0 10px ' + (el.dataset.cor || '#60a5fa') + '66' : 'none';
  });

  filtrarOrcamento();
}
window.filtrarOrcamentoPorNatureza = filtrarOrcamentoPorNatureza;
`;

// Add before window.filtrarOrcamento
js = js.replace(
  'window.filtrarOrcamento       = filtrarOrcamento;',
  filterFn + '\nwindow.filtrarOrcamento       = filtrarOrcamento;'
);

fs.writeFileSync('js/orcamento.js', js, 'utf8');
console.log('orcamento.js updated with badge filter');
