const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The Escolas section contains the incorrect print button:
const badPrintBtnRegex = /<button onclick="imprimirContatos\(\)"[^>]*>[\s\S]*?<\/button>\s*<a href="https:\/\/docs\.google\.com\/spreadsheets\/d\/1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08\/edit"[^>]*class="action-editor action-adm"[^>]*>/;

html = html.replace(/<button onclick="imprimirContatos\(\)" style="background:rgba\(59,130,246,0\.15\);.*?<\/button>\s*(<a href="https:\/\/docs\.google\.com\/spreadsheets\/d\/1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08\/edit")/s, '$1');

html = html.replace(/(<a href="https:\/\/docs\.google\.com\/spreadsheets\/d\/1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08\/edit"[\s\S]*?style="[^"]*?)height:100%;/s, '$1');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed Escolas page');
