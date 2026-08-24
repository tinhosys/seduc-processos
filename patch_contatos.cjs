const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'contatos.js');
let code = fs.readFileSync(filePath, 'utf8');

const regex = /async function carregarContatos\([\s\S]*?\{\s*const badgeStatus[\s\S]*?\}\s*\}/;

const replacement = \sync function carregarContatos(force = false) {
  const badgeStatus = document.getElementById('contatos-badge-status');
  if (badgeStatus) {
    badgeStatus.innerHTML = '⏳ Carregando...';
    badgeStatus.style.background = 'rgba(251,191,36,0.12)';
    badgeStatus.style.color = '#fbbf24';
  }
  
  try {
    const sheetId = '1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08';
    const gid = '1855271818';
    const url = \\\https://docs.google.com/spreadsheets/d/\\\/gviz/tq?tqx=out:json&gid=\\\&nocache=\\\\\\;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao carregar planilha");
    const text = await res.text();
    
    // Parse the GViz JSON
    const jsonStr = text.replace(/^[^(]+\\\(/, '').replace(/\\\);?\\s*$/, '');
    const data = JSON.parse(jsonStr);
    
    if (!data || !data.table || data.status === 'error' || !data.table.rows) {
      throw new Error("Formato de dados invalido");
    }
    
    contatosData = data.table.rows.map(row => {
      const c = row.c;
      if (!c || c.length === 0) return null;
      const val = (idx) => (c[idx] && c[idx].v !== null) ? String(c[idx].v).trim() : '';
      if (!val(0) || val(0).toUpperCase() === 'MUNICIPIO') return null; // Header
      
      return {
        id: val(0), // Using municipio as ID
        municipio: val(0),
        nomePrefeito: val(1),
        celularPrefeito: val(2),
        nomeSecretario: val(3),
        celularSecretario: val(4),
        email: val(5),
        observacoes: val(6),
        qtdeEscolas: val(7) ? parseInt(val(7), 10) : 0,
        qtdeAlunos: val(8) ? parseInt(val(8), 10) : 0
      };
    }).filter(x => x !== null);
    
    // Sort A-Z by municipio
    contatosData.sort((a, b) => (a.municipio || "").localeCompare(b.municipio || ""));
    
    contatosDataFiltrados = [...contatosData];
    renderContatos();
    
    if (badgeStatus) {
      badgeStatus.innerHTML = '✅ Sincronizado';
      badgeStatus.style.background = 'rgba(16,185,129,0.15)';
      badgeStatus.style.color = '#34d399';
    }
    const badgeTotal = document.getElementById('contatos-badge-total');
    if (badgeTotal) badgeTotal.innerHTML = \\\👥 \\\ Contatos\\\;
    
  } catch (err) {
    console.error(err);
    if (badgeStatus) {
      badgeStatus.innerHTML = '❌ Erro';
      badgeStatus.style.background = 'rgba(239,68,68,0.15)';
      badgeStatus.style.color = '#ef4444';
    }
  }
}\;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log("Contatos.js updated successfully.");
} else {
    console.log("Could not match the function.");
}
