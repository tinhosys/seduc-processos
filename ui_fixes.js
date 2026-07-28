const fs = require('fs');

const fixAppJs = () => {
    let app = fs.readFileSync('js/app.js', 'utf8');
    app = app.replace(/<button class="btn btn-ghost btn-sm" onclick="confirmarExcluir\('\${p\.id}'\)" title="Excluir" style="color: var\(--red\); margin-left: 4px;">.*?<\/button>/g, '');
    fs.writeFileSync('js/app.js', app, 'utf8');
};

const fixIndexHtml = () => {
    let html = fs.readFileSync('index.html', 'utf8');
    html = html.replace(
        /<div class="section-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 12px;">/,
        '<div class="section-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap: wrap; gap: 12px;">'
    );
    html = html.replace(
        /<div style="flex: 1; display: flex; align-items: center; gap: 8px; min-width: 250px; flex-wrap: wrap;">/,
        '<div style="flex: 1; display: flex; align-items: stretch; gap: 8px; min-width: 250px; flex-wrap: wrap;">'
    );
    html = html.replace(
        /<div class="header-buttons" style="display:flex;align-items:center;gap:12px; flex: 2; min-width: 300px;">/,
        '<div class="header-buttons" style="display:flex;align-items:stretch;gap:12px; flex: 2; min-width: 300px;">'
    );
    fs.writeFileSync('index.html', html, 'utf8');
};

fixAppJs();
fixIndexHtml();
