const fs = require('fs');

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  
  // FIX TABLE BUG
  const badTableMatch = /<td class=\"col-interessado\" title=\"\$\{p\.interessado\}\">.*?<div class=\"empty-icon\">🔍<\/div>/s;
  
  if (badTableMatch.test(content)) {
    const replacement = `<td class="col-interessado" title="\${p.interessado}">\${hl(p.interessado, busca) || '—'}</td>
      <td class="col-objeto" title="\${p.objeto}">\${p.objeto || '—'}</td>
      <td><span class="badge \${getStatusBadgeClass(p.status)}">\${p.status || '—'}</span></td>
      <td>\${p.localizacao || '—'}</td>
      <td class="col-valor">\${formatCurrency(p.valorOf)}</td>
      <td>\${formatDate(p.data)}</td>
      <td onclick="event.stopPropagation()" style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" onclick="editarProcesso('\${p.id}')">✏️</button>
      </td>
    </tr>
  \`).join('') || \`
    <tr><td colspan="9">
      <div class="empty-state">
        <div class="empty-icon">🔍</div>`;
    content = content.replace(badTableMatch, replacement);
  }

  // REMOVE EXCLUIR BUTTONS IF THEY ARE STILL THERE
  content = content.replace(/<button class="btn btn-danger btn-sm" onclick="confirmarExcluir\('\$\{p\.id\}'\);fecharModal\(\)">🗑️ Excluir<\/button>/g, '');
  content = content.replace(/<button class="btn btn-ghost btn-sm" onclick="confirmarExcluir\('\$\{p\.id\}'\)" style="margin-left:4px">🗑️<\/button>/g, '');

  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Fixed', filepath);
}

fixFile('c:/Users/Elton/SEDUC/planilha-google-form/public/js/app.js');
fixFile('c:/Users/Elton/SEDUC/js/app.js');
