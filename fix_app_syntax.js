const fs = require('fs');
let app = fs.readFileSync('c:\\Users\\Elton\\SEDUC\\js\\app.js', 'utf8');

const normalizedApp = app.replace(/\r\n/g, '\n');

const errorStartStr = '              }\n            }\n          }\n        borderSkipped: false,';
const idxStart = normalizedApp.indexOf(errorStartStr);
if (idxStart !== -1) {
  const getFiltradosStr = '// ---- LISTA DE PROCESSOS ----\nfunction getFiltrados() {';
  const idxEnd = normalizedApp.indexOf(getFiltradosStr, idxStart);
  if (idxEnd !== -1) {
    const toReplace = normalizedApp.substring(idxStart, idxEnd);
    const replacement = '              }\n            }\n          }\n        }\n      });\n    }\n\n  } catch (err) {\n    console.error(\'[ACESSOS] Erro:\', err);\n  }\n}\n\n';
    
    const newApp = normalizedApp.replace(toReplace, replacement);
    fs.writeFileSync('c:\\Users\\Elton\\SEDUC\\js\\app.js', newApp, 'utf8');
    fs.writeFileSync('c:\\Users\\Elton\\SEDUC\\planilha-google-form\\public\\js\\app.js', newApp, 'utf8');
    console.log('app.js fixed');
  } else {
    console.log('Could not find getFiltradosStr');
  }
} else {
  console.log('Could not find errorStartStr');
}
