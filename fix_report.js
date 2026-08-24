const fs = require('fs');
let appJs = fs.readFileSync('js/app.js', 'utf8');

const newPrefixoFormatado = `
        const prefixoFormatado = \`
          <div style="font-family: Arial, sans-serif; font-size: 9px; line-height: 1.2;">
            <div style="font-weight: bold; margin-bottom: 2px;">\${p.prefixo || '-'}</div>
            <div style="display: flex; align-items: center; white-space: nowrap; gap: 3px; font-size: 8px;">
              <span>\${p.categoria || '-'}</span> <span style="color:#999;">|</span> 
              <span>\${p.tipo || '-'}</span> <span style="color:#999;">|</span> 
              <div style="display: flex; gap: 2px;">
                <span style="color: \${p.CAM === '1' ? '#10b981' : '#ef4444'};" title="CAM">&#9679;</span>
                <span style="color: \${p.GAB === '1' ? '#10b981' : '#ef4444'};" title="GABINETE">&#9679;</span>
                <span style="color: \${p.CC === '1' ? '#10b981' : '#ef4444'};" title="CASA CIVIL">&#9679;</span>
              </div>
            </div>
          </div>
        \`;`;

appJs = appJs.replace(/const prefixoFormatado = `[^`]+`;/g, newPrefixoFormatado);

fs.writeFileSync('js/app.js', appJs, 'utf8');
console.log('Fixed prefixoFormatado');
