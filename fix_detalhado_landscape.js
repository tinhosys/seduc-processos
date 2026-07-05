const fs = require('fs');

function applyDetalhadoAndFooter() {
  const cssPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/css/style.css';
  let css = fs.readFileSync(cssPath, 'utf8');
  // Change to landscape
  css = css.replace(/@page \{ size: A4 portrait; \}/g, '@page { size: A4 landscape; }');
  fs.writeFileSync(cssPath, css, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/css/style.css', css, 'utf8');

  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Change title
  app = app.replace(/'RELATÓRIO CONSOLIDADO DE PROCESSOS'/g, "'RELATÓRIO DETALHADO DE PROCESSOS'");

  // Isolate Detalhado block to change widths
  const detalhadoStart = app.indexOf('window.imprimirDetalhado = function() {');
  const analiseStart = app.indexOf('window.imprimirPadrao = function() {'); // Padrao comes after Detalhado in my previous search?
  // Actually, wait, let's just do targeted replaces inside Detalhado.
  // The table header inside Detalhado has: `<table class="print-table-detalhado"`
  // Let's replace the colgroup in Detalhado.
  // Previous colgroup in Detalhado: `<col style="width: 5%;">` and `<col style="width: 31%;">`
  // Let's just find the exact block if possible, or use a regex for all 5% -> 8% and 31% -> 28% inside Detalhado.
  
  if (detalhadoStart !== -1) {
    let before = app.substring(0, detalhadoStart);
    let after = app.substring(detalhadoStart);
    
    // We only want to replace inside 'after' up to the next function.
    let nextFunc = after.indexOf('window.imprimirPadrao = function() {');
    if (nextFunc === -1) nextFunc = after.indexOf('window.imprimirAnalise = function() {');
    
    let detalhadoBlock = after.substring(0, nextFunc);
    let restOfApp = after.substring(nextFunc);
    
    // Replace colgroup
    detalhadoBlock = detalhadoBlock.replace('<col style="width: 5%;">', '<col style="width: 8%;">');
    detalhadoBlock = detalhadoBlock.replace('<col style="width: 31%;">', '<col style="width: 28%;">');
    
    // Replace TH widths
    detalhadoBlock = detalhadoBlock.replace('width:5%; font-size:12px; font-weight:bold;">PREF.</th>', 'width:8%; font-size:12px; font-weight:bold;">PREFIXO</th>');
    detalhadoBlock = detalhadoBlock.replace('width:5%; font-size:12px; font-weight:bold;">PREFIXO</th>', 'width:8%; font-size:12px; font-weight:bold;">PREFIXO</th>'); // if already changed
    detalhadoBlock = detalhadoBlock.replace('width:31%; font-size:12px; font-weight:bold;">OBJETO / FINALIDADE</th>', 'width:28%; font-size:12px; font-weight:bold;">OBJETO / FINALIDADE</th>');
    
    // Replace TD widths
    detalhadoBlock = detalhadoBlock.replace('width:5%;">${p.prefixo || \'-\'}</td>', 'width:8%;">${p.prefixo || \'-\'}</td>');
    detalhadoBlock = detalhadoBlock.replace('width:31%;">${p.objeto || \'-\'}</td>', 'width:28%;">${p.objeto || \'-\'}</td>');
    
    app = before + detalhadoBlock + restOfApp;
  }

  // Footer italic (font-style: italic;)
  const oldFooterRegex = /<div style="display:flex; justify-content:space-between; align-items:center; font-size:7px; font-weight:normal; color:#000;/g;
  const newFooterStyle = '<div style="display:flex; justify-content:space-between; align-items:center; font-size:7px; font-weight:normal; font-style:italic; color:#000;';
  app = app.replace(oldFooterRegex, newFooterStyle);

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('Detalhado and footer updated');
}

applyDetalhadoAndFooter();
