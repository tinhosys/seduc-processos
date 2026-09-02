const fs = require('fs');
let content = fs.readFileSync('js/app.js', 'utf8');

const regex = /(var vl = valorOf \|\| valorPlan;\s+if \(vl\) \{\s+h \+= '<strong>' \+ vl \+ '<\/strong>';\s+\} else \{\s+h \+= '&mdash;';\s+\})/m;
const replacement = `$1\n  h += '</td></tr></table>';`;

content = content.replace(regex, replacement);
fs.writeFileSync('js/app.js', content);
console.log('patched app.js missing table tags');
