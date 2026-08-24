const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Change `justify-content:flex-start` to `justify-content:space-between`
html = html.replace(/<span id="qtd-registros-filtrados" style="display:flex; align-items:center; justify-content:flex-start;/g, '<span id="qtd-registros-filtrados" style="display:flex; align-items:center; justify-content:space-between;');

// Also, the user wants font to be equal between values and processos. I made values font-size:17px; and processos font-size:15px; earlier. Let's make processos font-size:17px;
html = html.replace(/<span id="qtd-registros-filtrados" style="display:flex; align-items:center; justify-content:space-between; width:250px; padding:10px 16px; border-radius:8px; font-size:15px;/g, '<span id="qtd-registros-filtrados" style="display:flex; align-items:center; justify-content:space-between; width:250px; padding:10px 16px; border-radius:8px; font-size:17px;');

// Version bump
html = html.replace(/v1\.0\.96/g, 'v1.0.97');

fs.writeFileSync('index.html', html, 'utf8');
