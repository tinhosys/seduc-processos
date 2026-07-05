const fs = require('fs');

function applyWidthChangesToPadrao() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // We only want to affect imprimirPadrao, so let's isolate that function's block
  const padraoStart = app.indexOf('window.imprimirPadrao = function() {');
  const analiseStart = app.indexOf('window.imprimirAnalise = function() {'); // this is after Padrao
  
  if (padraoStart !== -1 && analiseStart !== -1) {
    let padraoBlock = app.substring(padraoStart, analiseStart);
    
    // Replace colgroup
    padraoBlock = padraoBlock.replace('<col style="width: 5%;">', '<col style="width: 8%;">');
    padraoBlock = padraoBlock.replace('<col style="width: 31%;">', '<col style="width: 28%;">');
    
    // Replace TH widths
    padraoBlock = padraoBlock.replace('width:5%; font-size:12px; font-weight:bold;">PREF.</th>', 'width:8%; font-size:12px; font-weight:bold;">PREF.</th>');
    padraoBlock = padraoBlock.replace('width:31%; font-size:12px; font-weight:bold;">OBJETO / FINALIDADE</th>', 'width:28%; font-size:12px; font-weight:bold;">OBJETO / FINALIDADE</th>');
    
    // Replace TD widths
    padraoBlock = padraoBlock.replace('width:5%;">${p.prefixo || \'-\'}</td>', 'width:8%;">${p.prefixo || \'-\'}</td>');
    padraoBlock = padraoBlock.replace('width:31%;">${p.objeto || \'-\'}</td>', 'width:28%;">${p.objeto || \'-\'}</td>');
    
    app = app.substring(0, padraoStart) + padraoBlock + app.substring(analiseStart);
    
    fs.writeFileSync(appPath, app, 'utf8');
    fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');
    
    console.log('Widths changed in Padrao');
  } else {
    console.log('Could not find Padrao boundaries');
  }
}

applyWidthChangesToPadrao();
