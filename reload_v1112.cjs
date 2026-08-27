/**
 * reload_v1112.cjs
 * Atualiza cache busters de todos os JS/CSS em index.html → v1.1.12
 */
const fs = require('fs');
const path = require('path');

const INDEX = path.join(__dirname, 'index.html');
const CHANGELOG = path.join(__dirname, 'CHANGELOG.md');
const VERSION = '1.1.12';
const ts = Date.now();

// ── 1. Atualizar index.html ──────────────────────────────────────────────────
let html = fs.readFileSync(INDEX, 'utf8');

const before = html;

// Bump todos os ?v= existentes nos scripts JS
html = html.replace(/(src="js\/dados\.js\?v=)[^"]+"/g,        `src="js/dados.js?v=${ts}"`);
html = html.replace(/(src="js\/app\.js\?v=)[^"]+"/g,          `src="js/app.js?v=${ts}"`);
html = html.replace(/(src="js\/auth-sap\.js\?v=)[^"]+"/g,     `src="js/auth-sap.js?v=${ts}"`);
html = html.replace(/(src="js\/escolas\.js\?v=)[^"]+"/g,      `src="js/escolas.js?v=${ts}"`);
html = html.replace(/(src="js\/mapa\.js\?v=)[^"]+"/g,         `src="js/mapa.js?v=${ts}"`);
html = html.replace(/(src="js\/multi-select\.js\?v=)[^"]+"/g, `src="js/multi-select.js?v=${ts}"`);
html = html.replace(/(src="js\/orcamento\.js\?v=)[^"]+"/g,    `src="js/orcamento.js?v=${ts}"`);

// Bump CSS
html = html.replace(/(href="css\/style\.css\?v=)[^"]+"/g,     `href="css/style.css?v=${ts}"`);

// Garantir que a versão no rodapé está correta
html = html.replace(/GBZ - v[\d.]+/g, `GBZ - v${VERSION}`);

fs.writeFileSync(INDEX, html, 'utf8');

// ── 2. Relatório ──────────────────────────────────────────────────────────────
const changed = [];
const patterns = [
  'dados.js', 'app.js', 'auth-sap.js', 'escolas.js',
  'mapa.js', 'multi-select.js', 'orcamento.js', 'style.css'
];

patterns.forEach(f => {
  const count = (before.match(new RegExp(f.replace('.', '\\.') + '\\?v=', 'g')) || []).length;
  if (count > 0) changed.push(`  ✔ ${f} (${count} ref)`);
});

console.log(`\n✅ Cache busters atualizados → v${VERSION} (ts=${ts})`);
console.log(changed.join('\n'));
console.log(`\n📄 Rodapés atualizados: GBZ - v${VERSION}`);
console.log('Done.\n');
