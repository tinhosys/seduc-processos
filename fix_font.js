const fs = require('fs');

function standardizePrintFont() {
  const cssPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css';
  let css = fs.readFileSync(cssPath, 'utf8');

  // Find @media print and inject * { font-family: Arial, sans-serif !important; } right after it
  if (css.includes('@media print {')) {
    css = css.replace('@media print {', '@media print {\n  * { font-family: Arial, sans-serif !important; }\n');
    fs.writeFileSync(cssPath, css, 'utf8');
    fs.writeFileSync('c:/Users/Elton/SEDUC/css/style.css', css, 'utf8');
    console.log('Font standardization applied to style.css');
  } else {
    console.log('Could not find @media print');
  }
}

standardizePrintFont();
