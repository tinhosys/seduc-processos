const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

const replacement = `const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape');
  const totalPagesExp = '{total_pages_count_string}';`;

content = content.replace(/const { jsPDF } = window\.jspdf;\s*const doc = new jsPDF\('landscape'\);/, replacement);

fs.writeFileSync(file, content);
console.log('Fixed totalPagesExp in gerarRelatorioDespesas');
