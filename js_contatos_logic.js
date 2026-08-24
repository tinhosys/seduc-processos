const fs = require('fs');
let js = fs.readFileSync('js/contatos.js', 'utf8');

const newLogic = `
let contatosAllMunicipios = [];
let contatosSelectedMunicipios = new Set();

function contatosPopulateMunicipioCombo() {
  const muns = new Set();
  contatosData.forEach(c => {
    if (c.municipio) muns.add(c.municipio.trim());
  });
  contatosAllMunicipios = Array.from(muns).sort();
  contatosSelectedMunicipios = new Set(contatosAllMunicipios);
  contatosRenderMunicipioList(contatosAllMunicipios);
  contatosUpdateMunicipioLabel();
}

function contatosRenderMunicipioList(list) {
  const container = document.getElementById('contatos-municipio-list');
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = '<div style="padding:8px 12px;color:#64748b;font-size:12px;">Nenhum município</div>';
    return;
  }
  container.innerHTML = list.map(m => {
    const isChecked = contatosSelectedMunicipios.has(m) ? 'checked' : '';
    return \`
      <label style="display:flex;align-items:center;padding:6px 12px;cursor:pointer;font-size:13px;color:var(--text-secondary);">
        <input type="checkbox" \${isChecked} value="\${m}" onchange="contatosToggleMunicipio(this.value, this.checked)" style="margin-right:8px;cursor:pointer;">
        \${m}
      </label>
    \`;
  }).join('');
}

function contatosToggleMunicipio(val, isChecked) {
  if (isChecked) {
    contatosSelectedMunicipios.add(val);
  } else {
    contatosSelectedMunicipios.delete(val);
  }
  contatosUpdateMunicipioLabel();
  filtrarContatos();
}

function contatosFiltrarComboMunicipio(query) {
  const q = query.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');
  const filtered = contatosAllMunicipios.filter(m => {
    return m.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').includes(q);
  });
  contatosRenderMunicipioList(filtered);
}

function contatosToggleTodosMunicipios(checkAll) {
  if (checkAll) {
    contatosSelectedMunicipios = new Set(contatosAllMunicipios);
  } else {
    contatosSelectedMunicipios.clear();
  }
  // Re-render list to update checkboxes
  const q = document.querySelector('#contatos-municipio-dropdown input[type="text"]').value;
  contatosFiltrarComboMunicipio(q);
  contatosUpdateMunicipioLabel();
  filtrarContatos();
}

function contatosUpdateMunicipioLabel() {
  const lbl = document.getElementById('contatos-municipio-label');
  if (!lbl) return;
  if (contatosSelectedMunicipios.size === contatosAllMunicipios.length) {
    lbl.textContent = 'MUNICÍPIO (Todos)';
  } else if (contatosSelectedMunicipios.size === 0) {
    lbl.textContent = 'MUNICÍPIO (Nenhum)';
  } else {
    lbl.textContent = 'MUNICÍPIO (' + contatosSelectedMunicipios.size + ')';
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const drop = document.getElementById('contatos-municipio-dropdown');
  const btn = drop ? drop.previousElementSibling : null;
  if (drop && drop.style.display !== 'none') {
    if (!drop.contains(e.target) && !btn.contains(e.target)) {
      drop.style.display = 'none';
    }
  }
});
`;

// Append logic to end of contatos.js
js += '\n' + newLogic;

// Modify carregarContatos to call contatosPopulateMunicipioCombo() at the end
js = js.replace(/contatosDataFiltrados = \[\.\.\.contatosData\];\s*renderContatos\(\);/g, `contatosDataFiltrados = [...contatosData];\n    contatosPopulateMunicipioCombo();\n    renderContatos();`);

// Modify filtrarContatos() to check contatosSelectedMunicipios
const oldFiltrar = `function filtrarContatos() {
  const q = (document.getElementById('contatos-busca').value || "").toLowerCase();
  if (!q) {
    contatosDataFiltrados = [...contatosData];
  } else {
    contatosDataFiltrados = contatosData.filter(c => {
      return (c.municipio || "").toLowerCase().includes(q) ||
             (c.nomePrefeito || "").toLowerCase().includes(q) ||
             (c.nomeSecretario || "").toLowerCase().includes(q) ||
             (c.email || "").toLowerCase().includes(q);
    });
  }
  renderContatos();
}`;

const newFiltrar = `function filtrarContatos() {
  const q = (document.getElementById('contatos-busca').value || "").toLowerCase();
  
  contatosDataFiltrados = contatosData.filter(c => {
    // Check combo
    if (!contatosSelectedMunicipios.has(c.municipio)) {
      return false;
    }
    
    // Check search
    if (q) {
      return (c.municipio || "").toLowerCase().includes(q) ||
             (c.nomePrefeito || "").toLowerCase().includes(q) ||
             (c.nomeSecretario || "").toLowerCase().includes(q) ||
             (c.email || "").toLowerCase().includes(q);
    }
    return true;
  });
  
  renderContatos();
}`;

js = js.replace(oldFiltrar, newFiltrar);

fs.writeFileSync('js/contatos.js', js, 'utf8');
console.log('js/contatos.js logic updated');
