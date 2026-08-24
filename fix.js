const fs = require('fs');

let appJs = fs.readFileSync('js/app.js', 'utf8');
// DATA cell center
appJs = appJs.replace(
  /<td>\$\{formatDate\(p\.data\)\}<\/td>/g,
  '<td style="text-align: center;">${formatDate(p.data)}</td>'
);
// STATUS cell center
appJs = appJs.replace(
  /<td><span class="badge \$\{getStatusBadgeClass\(p\.status\)\}">\$\{p\.status \|\| '—'\}<\/span><\/td>/g,
  '<td style="text-align: center;"><span class="badge ${getStatusBadgeClass(p.status)}">${p.status || \'—\'}</span></td>'
);

// LOCALIZACAO cell center and break slash
appJs = appJs.replace(
  /<td>\$\{p\.localizacao \|\| '—'\}<\/td>/g,
  '<td style="text-align: center;">${p.localizacao ? p.localizacao.replace(/\\//g, \'/<wbr>\') : \'—\'}</td>'
);

fs.writeFileSync('js/app.js', appJs, 'utf8');
console.log('Fixed js');
