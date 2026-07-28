const fs = require('fs');

function replaceAll(str, mapObj){
    let re = new RegExp(Object.keys(mapObj).join("|"),"gi");
    return str.replace(re, function(matched){
        return mapObj[matched] !== undefined ? mapObj[matched] : matched; // use mapObj[matched] or keep original
    });
}

const fixAppJs = () => {
    let app = fs.readFileSync('js/app.js', 'utf8');
    
    // Fix UTF-8 encoding strings
    app = app.replace(/LocalizaÃ§Ã£o/g, 'Localização');
    app = app.replace(/MunicÃ­pio/g, 'Município');
    app = app.replace(/NÂº Processo/g, 'Nº Processo');
    app = app.replace(/AÃ§Ãµes/g, 'Ações');
    app = app.replace(/â€“/g, ' a ');
    app = app.replace(/3Âº/g, '3º');

    // Remove the Excluir button from table row
    // Original: <button class="btn btn-ghost btn-sm" onclick="confirmarExcluir('${p.id}')" title="Excluir" style="color: var(--red); margin-left: 4px;">ðŸ—‘ï¸ </button>
    app = app.replace(/<button class="btn btn-ghost btn-sm" onclick="confirmarExcluir\('\${p\.id}'\)" title="Excluir" style="color: var\(--red\); margin-left: 4px;">.*?<\/button>/g, '');

    fs.writeFileSync('js/app.js', app, 'utf8');
    console.log("Fixed js/app.js");
};

const fixIndexHtml = () => {
    let html = fs.readFileSync('index.html', 'utf8');
    
    // Fix section-header alignment
    html = html.replace(
        /<div class="section-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 12px;">/,
        '<div class="section-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap: wrap; gap: 12px;">'
    );
    
    // Also the left side container
    html = html.replace(
        /<div style="flex: 1; display: flex; align-items: center; gap: 8px; min-width: 250px; flex-wrap: wrap;">/,
        '<div style="flex: 1; display: flex; align-items: stretch; gap: 8px; min-width: 250px; flex-wrap: wrap;">'
    );
    
    // And header-buttons
    html = html.replace(
        /<div class="header-buttons" style="display:flex;align-items:center;gap:12px; flex: 2; min-width: 300px;">/,
        '<div class="header-buttons" style="display:flex;align-items:stretch;gap:12px; flex: 2; min-width: 300px;">'
    );
    
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Fixed index.html");
};

fixAppJs();
fixIndexHtml();
