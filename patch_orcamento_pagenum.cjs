const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'orcamento.js');
let content = fs.readFileSync(file, 'utf8');

// Add totalPagesExp definition before doc.autoTable
content = content.replace(/doc\.autoTable\(\{/, `const totalPagesExp = '{total_pages_count_string}';\n    doc.autoTable({`);

// Change the pageText
const regexPageText = /const pageText = "P..gina " \+ data\.pageNumber;/;
const replacementPageText = `const pageText = "Página " + data.pageNumber + "/" + totalPagesExp;`;
content = content.replace(regexPageText, replacementPageText);

// Add doc.putTotalPages after doc.autoTable
const regexEnd = /doc\.autoPrint\(\);\s*window\.open\(doc\.output\('bloburl'\), '_blank'\);\s*\};/g;
const replacementEnd = `if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };`;
content = content.replace(regexEnd, replacementEnd);

fs.writeFileSync(file, content);
console.log('Patched page numbers');
