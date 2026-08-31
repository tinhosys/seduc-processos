const fs = require('fs');
const est = fs.readFileSync('test_diarias_est.txt', 'utf8').split('\n')[0];
console.log('Estadual:', est.replace(/"/g, '').split(',').join(' | '));
