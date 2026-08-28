const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

const regex = /const lines = csv\.split\('\\n'\);[\s\S]*?renderizarDiarias\(\);/;

const replacement = `
    // Proper CSV Parsing handling quoted newlines
    const parseCSV = (str) => {
      let result = [];
      let row = [];
      let inQuotes = false;
      let val = '';
      for (let i = 0; i < str.length; i++) {
        let char = str[i];
        if (inQuotes) {
          if (char === '"') {
            if (i + 1 < str.length && str[i + 1] === '"') {
              val += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            val += char;
          }
        } else {
          if (char === '"') {
            inQuotes = true;
          } else if (char === ',') {
            row.push(val);
            val = '';
          } else if (char === '\\n' || char === '\\r') {
            if (char === '\\r' && i + 1 < str.length && str[i + 1] === '\\n') i++;
            row.push(val);
            result.push(row);
            row = [];
            val = '';
          } else {
            val += char;
          }
        }
      }
      if (val || row.length > 0) {
        row.push(val);
        result.push(row);
      }
      return result;
    };

    const rows = parseCSV(csv);
    DIARIAS_DATA = [];
    
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      let cols = rows[i];
      if (!cols || cols.length < 12) continue;
      
      const status = cols[0] ? cols[0].trim() : '';
      const processo = cols[2] ? cols[2].trim() : '';
      const dataInicio = cols[3] ? cols[3].trim() : '';
      const setor = cols[5] ? cols[5].trim() : '';
      const motivo = cols[6] ? cols[6].trim().replace(/\\n/g, ' ') : '';
      const valorStr = cols[11] || '0';
      const valor = parseFloat(valorStr.replace(/R\\$|\\s/g, '').replace(/\\./g, '').replace(',', '.')) || 0;
      
      DIARIAS_DATA.push({
        status: status,
        processo: processo,
        data: dataInicio,
        nome: setor, // using Setor/Processo as identifier since there is no 'Beneficiario'
        motivo: motivo,
        valor: valor
      });
    }
    
    renderizarDiarias();`;
    
content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('diarias.js csv parser patched');
