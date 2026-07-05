const fs = require('fs');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Regex to match from '<div class="detail-header">' down to '</div>\n    </div>\n\n    <div class="info-grid">'
  // We'll replace the entire detail-header structure.
  
  const headerMatch = /<div class="detail-header">([\s\S]*?)<\/div>\s*<\/div>\s*<div class="info-grid">/;
  
  const replacement = `<div class="detail-header" style="display:flex; flex-direction:column; gap:20px;">
      <div style="display:flex; gap:12px; width:100%;">
        \${p.numero ? \`
        <button class="btn btn-ghost" style="flex:1; padding:12px; font-size:16px; display:flex; align-items:center; justify-content:center; gap:8px; border:1px solid var(--border); border-radius:6px;" onclick="copiarProcessoSelecionado()" title="Copiar Número">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copiar
        </button>
        <a href="https://sei.sistemas.ro.gov.br/sip/login.php?sigla_orgao_sistema=RO&sigla_sistema=SEI" target="_blank" class="btn btn-ghost" style="flex:1; padding:12px; display:flex; align-items:center; justify-content:center; background:white; border:1px solid var(--border); border-radius:6px;" title="Acessar SEI">
          <img src="img/logo-sei.png" style="height:24px; object-fit:contain" alt="SEI">
        </a>
        \` : ''}
        <button class="btn btn-ghost" style="flex:1; padding:12px; font-size:16px; display:flex; align-items:center; justify-content:center; gap:8px; border:1px solid var(--border); border-radius:6px;" onclick="editarProcesso('\${p.id}');fecharModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Editar
        </button>
      </div>
      <div>
        \${p.prefixo ? \`<div style="margin-bottom:8px"><span class="badge-prefixo">\${p.prefixo}</span></div>\` : ''}
        <div class="detail-numero" style="margin-bottom:12px">
          \${(() => {
            const numerosLista = p.numero ? p.numero.split(',').map(n => n.trim()).filter(Boolean) : [];
            if (numerosLista.length > 0) {
              return \`<div style="display:flex; flex-direction:column; gap:8px;">
                \${numerosLista.map((num, idx) => \`
                  <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:20px; font-weight:600;">
                    <input type="radio" name="modal_processo_radio" value="\${num}" \${idx === 0 ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;">
                    \${num}
                  </label>
                \`).join('')}
              </div>\`;
            }
            return '<span style="font-size:20px;font-weight:600">Sem número</span>';
          })()}
        </div>
        <div class="detail-nome" style="font-size:18px; margin-bottom:8px;">\${p.interessado || '—'}</div>
        <div>
          <span class="badge \${getStatusBadgeClass(p.status)}">\${p.status || '—'}</span>
        </div>
      </div>
    </div>
    <div class="info-grid">`;

  if (headerMatch.test(content)) {
    content = content.replace(headerMatch, replacement);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Fixed', filepath);
  } else {
    console.log('Regex did not match in', filepath);
  }
}

fixFile('c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js');
fixFile('c:/Users/Elton/SEDUC/js/app.js');
