const fs = require('fs');

function fixCss(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  const css = `
@media print {
  .watermark-print {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 9cm;
    opacity: 0.25;
    z-index: -100;
    pointer-events: none;
    display: block !important;
  }
}
@media screen {
  .watermark-print {
    display: none !important;
  }
}
`;

  if (!content.includes('.watermark-print')) {
    content += css;
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Fixed', filepath);
  }
}

fixCss('c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css');
fixCss('c:/Users/Elton/SEDUC/css/style.css');
