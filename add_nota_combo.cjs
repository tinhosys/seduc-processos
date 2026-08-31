const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const target = `<div style="flex:1; min-width:150px;">
              <label style="font-size:10px; color:#94a3b8; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px; margin-bottom:5px; display:block;">Setor</label>
              <select id="diaria-filtro-setor" onchange="renderizarDiarias()" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#1e293b; color:#f8fafc; outline:none;">
                <option value="Todos">Todos</option>
              </select>
            </div>`;
const inject = `
            <div style="flex:1; min-width:150px;">
              <label style="font-size:10px; color:#94a3b8; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px; margin-bottom:5px; display:block;">Nota Empenho</label>
              <select id="diaria-filtro-nota" onchange="renderizarDiarias()" style="width:100%; padding:10px; border-radius:6px; border:1px solid #334155; background:#1e293b; color:#f8fafc; outline:none;">
                <option value="Todos">Todos</option>
              </select>
            </div>
`;

if (content.includes(target)) {
  content = content.replace(target, target + inject);
  fs.writeFileSync('index.html', content);
  console.log('Added diaria-filtro-nota');
} else {
  // Let's try matching a shorter portion
  const fallback = 'id="diaria-filtro-setor"';
  if (content.includes(fallback)) {
      console.log('Found set, trying regex');
      content = content.replace(/(<select id="diaria-filtro-setor"[\s\S]*?<\/div>)/, "$1" + inject);
      fs.writeFileSync('index.html', content);
  } else {
      console.log('Not found');
  }
}
