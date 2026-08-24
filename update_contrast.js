const fs = require('fs');
let js = fs.readFileSync('js/proalfa.js', 'utf8');

const oldSelection = `function selecionarTabProalfa(tabId) {
  currentTabProalfa = tabId;
  document.querySelectorAll('.proalfa-tab-btn').forEach(b => {
    if(b.dataset.tab === tabId) {
       b.style.background = '#6366f1';
       b.style.borderColor = '#6366f1';
    } else {
       b.style.background = 'rgba(255,255,255,0.05)';
       b.style.borderColor = 'var(--border-color)';
    }
  });`;

const newSelection = `function selecionarTabProalfa(tabId) {
  currentTabProalfa = tabId;
  document.querySelectorAll('.proalfa-tab-btn').forEach(b => {
    const span = b.querySelector('span');
    if(b.dataset.tab === tabId) {
       b.style.background = '#6366f1';
       b.style.borderColor = '#6366f1';
       if(span) span.style.color = '#ffffff';
    } else {
       b.style.background = 'rgba(255,255,255,0.05)';
       b.style.borderColor = 'var(--border-color)';
       if(span) span.style.color = '#10b981';
    }
  });`;

js = js.replace(oldSelection, newSelection);

fs.writeFileSync('js/proalfa.js', js, 'utf8');
console.log('js/proalfa.js updated for contrast');

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/v1\.0\.86/g, 'v1.0.87');
fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html version bumped');

