const fs = require('fs');

function updateIndexAndCss() {
  // Update index.html
  const indexPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/index.html';
  let html = fs.readFileSync(indexPath, 'utf8');

  // Add action-editor class to sidebar "Novo Processo" button
  html = html.replace(
    `<button class="nav-item" data-page="novo">`,
    `<button class="nav-item action-editor" data-page="novo">`
  );

  fs.writeFileSync(indexPath, html, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/index.html', html, 'utf8');
  console.log('index.html updated successfully');

  // Update style.css
  const cssPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css';
  let css = fs.readFileSync(cssPath, 'utf8');

  // Add role-leitor styles at the end
  const leitorStyles = `
/* ====== CONTROLE DE ACESSO LEITOR ====== */
body.role-leitor .action-editor,
body.role-leitor th:nth-child(10),
body.role-leitor td:nth-child(10) {
  display: none !important;
}
`;

  if (!css.includes('role-leitor')) {
    css += leitorStyles;
    fs.writeFileSync(cssPath, css, 'utf8');
    fs.writeFileSync('c:/Users/Elton/SEDUC/css/style.css', css, 'utf8');
    console.log('style.css updated successfully');
  }
}

updateIndexAndCss();
