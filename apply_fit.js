const fs = require('fs');

function applyFit() {
  const appPath = 'c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js';
  let app = fs.readFileSync(appPath, 'utf8');

  // Fix cards in imprimirDetalhado
  app = app.replace(/<div style="flex:1; border:2px solid #000; background:#f8fafc; padding:12px; text-align:center;">/g, '<div style="flex:1; border:2px solid #000; background:#f8fafc; padding:6px; text-align:center; min-width:0;">');
  app = app.replace(/<div style="flex:1; border:2px solid #000; background:#f0fdf4; padding:12px; text-align:center;">/g, '<div style="flex:1; border:2px solid #000; background:#f0fdf4; padding:6px; text-align:center; min-width:0;">');
  app = app.replace(/<div style="flex:1; border:2px solid #000; background:#fef2f2; padding:12px; text-align:center;">/g, '<div style="flex:1; border:2px solid #000; background:#fef2f2; padding:6px; text-align:center; min-width:0;">');
  
  // Decrease fonts in cards
  app = app.replace(/font-size:24px;/g, 'font-size:14px;');
  app = app.replace(/font-size:20px;/g, 'font-size:14px;');

  // Now, update table layout to be fixed and specify column widths in Detalhado, Padrao, Analise.
  // The table is generated with `<table class="print-table-detalhado" style="width:100%; border-collapse:collapse; font-size:8px; font-family:Arial;">`
  app = app.replace(/<table class="print-table-detalhado" style="width:100%; border-collapse:collapse; font-size:8px; font-family:Arial;">/g, '<table class="print-table-detalhado" style="width:100%; table-layout:fixed; border-collapse:collapse; font-size:7px; font-family:Arial; word-wrap:break-word;">');
  
  // Let's replace the <th> definitions for all 3 reports (Detalhado, Analise, Padrao)
  // They all share similar th blocks. We can use regex to inject widths.
  // Replace <th style="border: 1px solid #ccc; padding: 3px 5px; text-align:left;">PREFIXO</th> with <th style="width:8%; ...">
  
  const thReplacements = {
    'Nº': 'width:3%;',
    'PREFIXO': 'width:10%;',
    'Nº PROCESSO': 'width:13%;',
    'INTERESSADO': 'width:20%;',
    'OBJETO': 'width:22%;',
    'OBJETO / FINALIDADE': 'width:22%;',
    'STATUS': 'width:9%;',
    'LOCALIZAÇÃO': 'width:8%;',
    'VALOR OFICIAL': 'width:9%;',
    'DATA': 'width:6%;'
  };

  Object.keys(thReplacements).forEach(key => {
    // Regex to find the TH tag containing the exact text `key`
    const regex = new RegExp(`(<th style="[^"]+)(">\\s*${key}\\s*<\\/th>)`, 'g');
    app = app.replace(regex, `$1; ${thReplacements[key]}$2`);
    
    // Also without text-align etc if different
    const regex2 = new RegExp(`(<th[^>]*)(>\\s*${key}\\s*<\\/th>)`, 'g');
    app = app.replace(regex2, (match, p1, p2) => {
      if (p1.includes('width:')) return match; // already applied
      if (p1.includes('style="')) {
        return p1.replace('style="', `style="${thReplacements[key]} `) + p2;
      }
      return `${p1} style="${thReplacements[key]}"${p2}`;
    });
  });
  
  // Also font-size:7px globally for print tables to ensure it fits
  app = app.replace(/font-size:8px;/g, 'font-size:7px;');
  
  // Decrease padding even further for td to 2px
  app = app.replace(/padding:\s*3px\s*5px;/g, 'padding: 2px;');
  app = app.replace(/padding:\s*3px\s*4px;/g, 'padding: 2px;');
  app = app.replace(/padding:\s*4px;/g, 'padding: 2px;');
  app = app.replace(/padding:\s*5px;/g, 'padding: 2px;');

  fs.writeFileSync(appPath, app, 'utf8');
  fs.writeFileSync('c:/Users/Elton/SEDUC/js/app.js', app, 'utf8');

  console.log('Fit applied');
}

applyFit();
