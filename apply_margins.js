const fs = require('fs');

function applyMargins() {
  const cssPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css';
  let css = fs.readFileSync(cssPath, 'utf8');

  // Adjust @page margins
  css = css.replace(/@page\s*\{\s*margin:\s*0;\s*\}/g, '@page { margin: 5mm 15mm; }');
  // Remove body { padding: 15mm; } inside @media print if it exists
  css = css.replace(/body\s*\{\s*padding:\s*15mm;\s*\}/g, 'body { padding: 0; }');

  // Change page counter logic to just show the page number, since total pages counter(pages) is not supported in Chrome HTML
  css = css.replace(/content:\s*"Páginas\s*"\s*counter\(page\)\s*"\/"\s*counter\(pages\);/g, 'content: "Página " counter(page);');

  // Make fixed footer height 15mm
  css = css.replace(/\.fixed-footer\s*\{[\s\S]*?\}/g, (match) => {
    return match.replace(/height:\s*10mm;/, 'height: 15mm;');
  });

  fs.writeFileSync(cssPath, css, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/css/style.css', css, 'utf8');

  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Adjust getCommonHeader height to 15mm
  app = app.replace(/<div style="height:10mm;/g, '<div style="height:15mm;');

  // Adjust injectFixedFooter height to 15mm and remove left/right padding since @page margin will handle it
  app = app.replace(/height:10mm;\s*width:100%;\s*box-sizing:border-box;\s*padding:\s*0\s*12mm;/g, 'height:15mm; width:100%; box-sizing:border-box; padding: 0;');

  // Adjust font size of tables to 8px for harmonization
  app = app.replace(/font-size:10px;/g, 'font-size:8px;');
  
  // Make column paddings a bit smaller to fit better
  app = app.replace(/padding:\s*5px;/g, 'padding: 3px 5px;');
  app = app.replace(/padding:\s*4px;/g, 'padding: 3px 4px;');

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('Margins and harmonization applied');
}

applyMargins();
