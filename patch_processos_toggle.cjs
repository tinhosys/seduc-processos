const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'index.html');
let content = fs.readFileSync(file, 'utf8');

const regex = /<span id="qtd-registros-filtrados"([^>]*)>\s*0 Processos\s*<\/span>/;
const newSpan = `<div style="display:flex; align-items:center; gap:8px;">
              <span id="qtd-registros-filtrados"$1>
                0 Processos
              </span>
              <button type="button" onclick="toggleFiltros()" title="Mostrar/Ocultar Parâmetros" style="background:#1e293b; border:1px solid #334155; color:#94a3b8; border-radius:8px; width:40px; height:40px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#334155';this.style.color='#f8fafc'" onmouseout="this.style.background='#1e293b';this.style.color='#94a3b8'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 14 12 22 20 14"></polyline><polyline points="4 4 12 12 20 4"></polyline></svg>
              </button>
            </div>`;
content = content.replace(regex, newSpan);

fs.writeFileSync(file, content);
console.log('Processos toggle button added');
