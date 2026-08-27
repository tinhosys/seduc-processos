const fs = require('fs');
let file = fs.readFileSync('js/escolas.js', 'utf8');

const search = `plusCode: [val(19), val(20), val(21), val(22), val(23), val(24), val(25), val(27), val(28), val(29), val(30)].find(v => v && v.includes('+') && v.length >= 8) || '',`;

const replace = `plusCode: (() => {
      const p = [val(19), val(20), val(21), val(22), val(23), val(24), val(25), val(27), val(28), val(29), val(30), val(31), val(32)].find(v => v && v.includes('+') && v.length >= 6);
      if(!p) return '';
      const m = p.match(/([2-9C-F]{2,8}\\+[2-9C-F]{2,3})/i);
      return m ? m[1].toUpperCase() : '';
    })(),`;

file = file.replace(search, replace);
fs.writeFileSync('js/escolas.js', file, 'utf8');
console.log('Improved plusCode extraction');
