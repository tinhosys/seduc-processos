const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'css', 'style.css');
let content = fs.readFileSync(file, 'utf8');

const filterRule = `
  body.print-mode-orcamento canvas {
    filter: invert(1) hue-rotate(180deg) brightness(1.2);
  }
`;

content = content.replace(/body\.print-mode-orcamento \.orc-filters select,/, filterRule + '\n  body.print-mode-orcamento .orc-filters select,');

fs.writeFileSync(file, content);
console.log('Appended canvas filter');
