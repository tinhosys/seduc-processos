const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

const oldCss = /body\.print-mode-orcamento #page-orcamento \{/;
const newCss = `body.print-mode-orcamento #orc-print-header { display: block !important; color: #000; }
      body.print-mode-orcamento #page-orcamento {`;
if(!content.includes('body.print-mode-orcamento #orc-print-header')) {
  content = content.replace(oldCss, newCss);
  // ensure white background for print and dark elements converted, or keep them if they are images?
  // wait, the dark theme print might be okay since it uses exact colors. But if we want clear headers, let's keep it.
  fs.writeFileSync(file, content);
  console.log('index.html css patched');
}
