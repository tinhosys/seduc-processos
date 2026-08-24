const fs = require('fs');
let js = fs.readFileSync('js/print-proalfa.js', 'utf8');

// I need to remove the image logo only from imprimirContatos.
// Looking at what I injected:
// <div style="text-align:center; margin-bottom:15px;"><img src="img/logos_proalfa.png" style="max-height: 60px;" /></div>
// And also "Governo + CAM" from the header text right of the logo:
// <span style="font-size:16px;">Governo + CAM</span>

// Wait, I want to remove the logo from the Contatos report.
const printContatosFuncRegex = /function imprimirContatos\(\) \{[\s\S]*?openPrintWindow\(content, 'Relatório Governo \+ CAM'\);\s*\}/;

const match = js.match(printContatosFuncRegex);
if (match) {
   let modified = match[0].replace(/<div style="text-align:center; margin-bottom:15px;"><img src="img\/logos_proalfa\.png" style="max-height: 60px;" \/><\/div>\s*/, '');
   modified = modified.replace(/<span style="font-size:16px;">Governo \+ CAM<\/span>\s*/, '');
   js = js.replace(match[0], modified);
   fs.writeFileSync('js/print-proalfa.js', js, 'utf8');
   console.log('js/print-proalfa.js modified');
} else {
   console.log('Regex failed to find imprimirContatos');
}

