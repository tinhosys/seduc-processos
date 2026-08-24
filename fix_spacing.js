const fs = require('fs');
let appJs = fs.readFileSync('js/app.js', 'utf8');

const newPrefixoFormatado = `
        const prefixoFormatado = \`
          <div style="font-family: Arial, sans-serif; font-size: 9px; line-height: 1.2;">
            <div style="font-weight: bold; margin-bottom: 2px;">\${p.prefixo || '-'}</div>
            <div style="display: flex; align-items: center; white-space: nowrap; gap: 2px; font-size: 8px;">
              <span>\${p.categoria || '-'}</span><span style="color:#999;">|</span><span>\${p.tipo || '-'}</span><span style="color:#999;">|</span>
              <div style="display: flex; font-size: 15px; line-height: 1; color: #000; align-items: center; margin-left: 1px;">
                <span title="CAM">\${p.CAM === '1' ? '&#9679;' : '&#9675;'}</span>
                <span title="GABINETE" style="margin-left: -2px;">\${p.GAB === '1' ? '&#9679;' : '&#9675;'}</span>
                <span title="CASA CIVIL" style="margin-left: -2px;">\${p.CC === '1' ? '&#9679;' : '&#9675;'}</span>
              </div>
            </div>
          </div>
        \`;`;

appJs = appJs.replace(/const prefixoFormatado = `[\s\S]*?`;/g, newPrefixoFormatado);

fs.writeFileSync('js/app.js', appJs, 'utf8');
console.log('Fixed prefixo spacing');
