const fs = require('fs');

function fixAppJs(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // 1. Remove "E CRUZAMENTO DE DADOS" from header
  // Currently: getCommonHeader('ANÁLISE GERENCIAL E CRUZAMENTO DE DADOS')
  content = content.replace(/getCommonHeader\('ANÁLISE GERENCIAL E CRUZAMENTO DE DADOS'\)/g, "getCommonHeader('ANÁLISE GERENCIAL')");

  // 2. Remove words from Síntese Analítica
  // Currently: por status oficial, cruzando com a localização física atual dos autos,
  content = content.replace(/status oficial/g, "status");
  content = content.replace(/localização física atual dos autos/g, "localização");

  // 3. Add Date/Time to header below the subtitle in getCommonHeader
  // The header subtitle is rendered in getCommonHeader function.
  // We can add `<div class="print-date-time-rodape" style="font-size:10px; font-weight:normal; color:#555; margin-top:2px;"></div>` 
  // right under the subtitle div.
  const oldHeader = /<div style="font-size:11px; color:#000; font-weight:bold;">\$\{\s*subtitle\.toUpperCase\(\)\s*\}<\/div>/;
  const newHeader = `<div style="font-size:11px; color:#000; font-weight:bold;">${"${subtitle.toUpperCase()}"}</div>
        <div class="print-date-time-rodape" style="font-size:10px; font-weight:normal; color:#555; margin-top:2px;"></div>`;
  if (content.match(oldHeader)) {
    content = content.replace(oldHeader, newHeader);
  }

  // 4. Zebra striping the blocks in imprimirAnalise
  // In the loop: arrStatus.forEach(st => {
  // We need the index to alternate background.
  const oldLoopStart = /arrStatus\.forEach\(st => \{/;
  const newLoopStart = `arrStatus.forEach((st, idx) => {
    const bgColor = (idx % 2 === 0) ? '#f2f2f2' : '#ffffff'; // Cinza 15% (f2f2f2) and white zebrado`;
  
  if (content.match(oldLoopStart)) {
    content = content.replace(oldLoopStart, newLoopStart);
    
    // Now replace the hardcoded background:#f8fafc with ${bgColor}
    // We match: <div style="border-left:4px solid #000; padding-left:10px; margin-bottom:15px; background:#f8fafc; padding:10px;">
    const oldBlockCss = /<div style="border-left:4px solid #000; padding-left:10px; margin-bottom:15px; background:#f8fafc; padding:10px;">/;
    const newBlockCss = `<div style="border-left:4px solid #000; padding-left:10px; margin-bottom:15px; background:${"${bgColor}"}; padding:10px;">`;
    content = content.replace(oldBlockCss, newBlockCss);
  }

  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Fixed', filepath);
}

fixAppJs('c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js');
fixAppJs('c:/Users/Elton/SEDUC/js/app.js');
