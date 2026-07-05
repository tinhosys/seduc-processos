const fs = require('fs');

function removeWatermark(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  content = content.replace(/<img src="img\/logo-seduc\.png" class="watermark-print">/g, '');
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Removed watermark from', filepath);
}

removeWatermark('c:/Users/Elton/SEDUC/planilha-google-form/public/index.html');
removeWatermark('c:/Users/Elton/SEDUC/index.html');
