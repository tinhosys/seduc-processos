const fs = require('fs');
let appJs = fs.readFileSync('js/app.js', 'utf8');

const searchStr = '<td class="col-prefixo" title="${p.prefixo}">';
const replaceStr = '<td onclick="event.stopPropagation()" style="text-align: center;"><input type="checkbox" class="check-processo" value="${p.id}" style="cursor:pointer; transform: scale(1.2);"></td>\n      <td class="col-prefixo" title="${p.prefixo}">';

if (appJs.includes(searchStr)) {
    appJs = appJs.replace(searchStr, replaceStr);
    fs.writeFileSync('js/app.js', appJs, 'utf8');
    console.log('Successfully fixed app.js');
} else {
    console.log('searchStr not found in app.js!');
}

let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/v1\.1\.\d+/g, 'v1.1.21');
const now = Date.now();
indexHtml = indexHtml.replace(/app\.js\?v=\d+/, 'app.js?v=' + now);
indexHtml = indexHtml.replace(/escolas\.js\?v=\d+/, 'escolas.js?v=' + now);
indexHtml = indexHtml.replace(/style\.css\?v=\d+/, 'style.css?v=' + now);
fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('Version bumped to v1.1.21');

