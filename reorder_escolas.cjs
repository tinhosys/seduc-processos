const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regex = /<div class="nav-submenu" id="sub-escolas" style="display: none; padding-left: 20px;">([\s\S]*?)<\/div>/;
const match = content.match(regex);
if (match) {
    const innerHtml = match[1];
    
    // Extract the three anchors
    const listaRegex = /<a href="#" class="nav-item sub-item" data-page="escolas"[\s\S]*?<\/a>/;
    const mapaRegex = /<a href="#" class="nav-item sub-item" data-page="mapa-escolas"[\s\S]*?<\/a>/;
    const munRegex = /<a href="#" class="nav-item sub-item" data-page="contatos"[\s\S]*?<\/a>/;
    
    const listaStr = innerHtml.match(listaRegex)[0];
    const mapaStr = innerHtml.match(mapaRegex)[0];
    const munStr = innerHtml.match(munRegex)[0];
    
    const newInner = `\n            ${munStr}\n            ${listaStr}\n            ${mapaStr}\n          `;
    
    content = content.replace(regex, `<div class="nav-submenu" id="sub-escolas" style="display: none; padding-left: 20px;">${newInner}</div>`);
    fs.writeFileSync('index.html', content);
    console.log('Reordered Escolas submenu!');
} else {
    console.log('Not found');
}
