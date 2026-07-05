const fs = require('fs');

function fixCss(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Change page-number-css to include 1/1 and the date
  // Since we joined them in HTML: <span class="page-number-css"></span> - <span class="print-date-time-rodape"></span>
  const oldPageCss = /\.page-number-css::after \{\s*counter-increment: page;\s*content: "Página " counter\(page\);\s*\}/;
  const newPageCss = `.page-number-css::after {
    counter-increment: page;
    content: "Páginas " counter(page) "/1";
  }`;
  
  if (content.match(oldPageCss)) {
    content = content.replace(oldPageCss, newPageCss);
  } else {
    console.log("Could not find old page css in", filepath);
  }

  // Force portrait mode
  if (!content.includes('size: A4 portrait;')) {
    content = content.replace(/@media print \{/, '@media print {\n  @page { size: A4 portrait; }\n');
  }

  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Fixed', filepath);
}

fixCss('c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css');
fixCss('c:/Users/Elton/SEDUC/css/style.css');
