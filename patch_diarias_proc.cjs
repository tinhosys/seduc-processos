const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'diarias.js');
let content = fs.readFileSync(file, 'utf8');

const regex = /<td style="padding:12px 16px; font-size:12px; font-weight:bold; color:#e2e8f0;">\$\{d\.nome\}\$\{infoExtra\}<br><span style="color:#64748b; font-weight:normal; font-size:10px;">Proc: \$\{d\.processo\}<\/span><\/td>/;

const replacement = `<td style="padding:12px 16px; font-size:12px; font-weight:bold; color:#e2e8f0;">
          \${d.nome}\${infoExtra}<br>
          <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
            <span style="color:#a3e635; font-weight:bold; font-size:11px;">\${d.processo}</span>
            <button onclick="navigator.clipboard.writeText('\${d.processo}'); typeof showToast === 'function' ? showToast('Processo copiado!', 'success') : alert('Copiado');" style="padding:4px 8px; font-size:10px; display:flex; align-items:center; justify-content:center; gap:4px; border:none; border-radius:4px; background:#3b82f6; color:#ffffff; cursor:pointer;" title="Copiar Número">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar
            </button>
            <a href="https://sei.sistemas.ro.gov.br/sip/login.php?sigla_orgao_sistema=RO&sigla_sistema=SEI" target="_blank" style="padding:2px 8px; height:20px; display:flex; align-items:center; justify-content:center; background:white; border-radius:4px; text-decoration:none;" title="Acessar SEI">
              <img src="img/logo-sei.png" style="height:14px; object-fit:contain" alt="SEI">
            </a>
          </div>
        </td>`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
console.log('Patched diarias.js');
