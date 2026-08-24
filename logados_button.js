const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The button string we injected earlier:
// <button type="button" class="btn btn-ghost btn-sm" style="flex:1; max-width:180px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.02); color:#94a3b8; padding:10px 12px; height:40px; border-radius:8px; font-weight:700; font-size:13px; display:inline-flex; align-items:center; justify-content:center; gap:6px; cursor:default; text-transform:uppercase; letter-spacing:0.5px;" title="Usuário Logado">
// <span class="btn-text">ELTON (ADMIN)</span>

const oldBtnRegex = /<button type="button" class="btn btn-ghost btn-sm" style="flex:1; max-width:180px; border:1px solid rgba\(255,255,255,0\.1\); background:rgba\(255,255,255,0\.02\); color:#94a3b8; padding:10px 12px; height:40px; border-radius:8px; font-weight:700; font-size:13px; display:inline-flex; align-items:center; justify-content:center; gap:6px; cursor:default; text-transform:uppercase; letter-spacing:0\.5px;" title="Usuário Logado">[\s\S]*?<\/button>/;

const newBtn = `<button type="button" onclick="abrirLogados()" class="btn btn-ghost btn-sm" style="flex:1; max-width:180px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.02); color:#94a3b8; padding:10px 12px; height:40px; border-radius:8px; font-weight:700; font-size:13px; display:inline-flex; align-items:center; justify-content:center; gap:6px; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px; transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.02)'" title="Usuários Logados">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span class="btn-text">LOGADOS</span>
              </button>`;

html = html.replace(oldBtnRegex, newBtn);

// Inject modal at the bottom (before </body>)
const modalLogados = `
<!-- ============= MODAL: LOGADOS ============= -->
<div class="modal-overlay" id="modal-logados" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:9999; align-items:center; justify-content:center; padding:20px; box-sizing:border-box;">
  <div style="background:#0f172a; border:1px solid rgba(59,130,246,0.4); width:100%; max-width:600px; border-radius:16px; display:flex; flex-direction:column; box-shadow:0 20px 50px rgba(0,0,0,0.6); overflow:hidden;">
    <div style="padding:20px 24px; background:linear-gradient(135deg,#1e293b,#0f172a); border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
      <h3 style="margin:0; font-size:18px; color:#f8fafc; font-weight:800; display:flex; align-items:center; gap:8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        Usuários Logados (Sessões Ativas)
      </h3>
      <button type="button" onclick="fecharLogados()" style="background:none; border:none; color:#94a3b8; font-size:24px; cursor:pointer;">&times;</button>
    </div>
    <div style="padding:24px; color:#e2e8f0; font-size:14px; background:#0b1120;">
      <div class="table-wrap" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; overflow:hidden;">
        <table style="width:100%; border-collapse:collapse; text-align:left;">
          <thead style="background:rgba(255,255,255,0.05);">
            <tr>
              <th style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.1); font-weight:700; color:#94a3b8;">Login (Nome)</th>
              <th style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.1); font-weight:700; color:#94a3b8;">Data</th>
              <th style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.1); font-weight:700; color:#94a3b8;">Hora Início</th>
              <th style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.1); font-weight:700; color:#94a3b8;">Tempo Logado</th>
            </tr>
          </thead>
          <tbody id="tbody-logados">
            <!-- Populated via JS -->
          </tbody>
        </table>
      </div>
    </div>
    <div style="padding:16px 24px; background:#0f172a; border-top:1px solid rgba(255,255,255,0.1); text-align:right;">
      <button type="button" onclick="fecharLogados()" class="btn btn-ghost" style="padding:10px 20px;">Fechar</button>
    </div>
  </div>
</div>

<script>
function fecharLogados() {
  document.getElementById('modal-logados').style.display = 'none';
}

function abrirLogados() {
  let usuario = null;
  try {
    const raw = sessionStorage.getItem('sap_user_data') || localStorage.getItem('sap_user_data');
    if (raw) usuario = JSON.parse(raw);
  } catch(e) {}
  
  if (!usuario || (usuario.role && usuario.role.toLowerCase() !== 'administrador')) {
    alert("Acesso Negado: Apenas Administradores podem visualizar as sessões de usuários logados.");
    return;
  }
  
  // Simulando a listagem. Como não temos WebSocket real, 
  // mostramos a sessão atual e marcamos o tempo.
  const tbody = document.getElementById('tbody-logados');
  tbody.innerHTML = ''; // limpar
  
  // Vamos supor que a data de login foi gravada no localStorage, se não tiver, usamos o momento atual
  let loginTime = localStorage.getItem('sap_login_time');
  if (!loginTime) {
    loginTime = Date.now();
    localStorage.setItem('sap_login_time', loginTime);
  }
  
  const start = new Date(parseInt(loginTime));
  const now = new Date();
  
  const dataFormatada = start.toLocaleDateString('pt-BR');
  const horaFormatada = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  // Calcular tempo logado (hora atual - hora login)
  const diffMs = now.getTime() - start.getTime();
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSec = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  const tempoLogado = \`\${diffHoras.toString().padStart(2, '0')}:\${diffMin.toString().padStart(2, '0')}:\${diffSec.toString().padStart(2, '0')}\`;

  const tr = document.createElement('tr');
  tr.innerHTML = \`
    <td style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); color:#e2e8f0;">\${usuario.nome || 'Admin'}</td>
    <td style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); color:#e2e8f0;">\${dataFormatada}</td>
    <td style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); color:#e2e8f0;">\${horaFormatada}</td>
    <td style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); color:#34d399; font-weight:700;">\${tempoLogado}</td>
  \`;
  
  tbody.appendChild(tr);
  
  document.getElementById('modal-logados').style.display = 'flex';
}
</script>
`;

html = html.replace('</body>', modalLogados + '\n</body>');

// Version bump
html = html.replace(/v1\.0\.98/g, 'v1.0.99');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated with LOGADOS logic');
