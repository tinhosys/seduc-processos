const fs = require('fs');
const line = fs.readFileSync('test_diarias_est.txt', 'utf8').split('\n')[0];
console.log('Estadual:', line);
