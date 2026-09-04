const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The field is currently right after Agrupamento. Let's see if there's any problem.
const idx = html.indexOf('form-digito');
if (idx !== -1) {
  console.log('form-digito found at ' + idx);
} else {
  console.log('form-digito NOT FOUND!');
}
