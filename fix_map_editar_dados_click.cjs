const fs = require('fs');
const path = require('path');

// 1. Update js/escolas.js with robust abrirFormEscolaByInepOrId
const escolasPath = path.join(__dirname, 'js', 'escolas.js');
let escolasCode = fs.readFileSync(escolasPath, 'utf8');

const robustLookupFunc = `
function abrirFormEscolaByInepOrId(identifier) {
  if (!identifier) return;
  const targetStr = String(identifier).trim().toLowerCase();
  
  const pool = [
    ...(Array.isArray(_escolasCache) ? _escolasCache : []),
    ...(typeof _mapaCacheEscolas !== 'undefined' && Array.isArray(_mapaCacheEscolas) ? _mapaCacheEscolas : []),
    ...(typeof _mapaEscolasFiltradas !== 'undefined' && Array.isArray(_mapaEscolasFiltradas) ? _mapaEscolasFiltradas : [])
  ];

  let escola = pool.find(e => e && (
    String(e.id || '').trim().toLowerCase() === targetStr ||
    String(e.codigoInep || '').trim().toLowerCase() === targetStr
  ));

  if (!escola) {
    escola = pool.find(e => e && e.nome && e.nome.toLowerCase().trim() === targetStr);
  }

  if (!escola) {
    escola = pool.find(e => e && e.nome && e.nome.toLowerCase().includes(targetStr));
  }

  if (!escola) {
    if (typeof toast === 'function') toast('Escola não encontrada para edição', 'error');
    return;
  }

  // Garantir que _escolasCache contenha os dados se estava vazio
  if ((!_escolasCache || _escolasCache.length === 0) && pool.length > 0) {
    _escolasCache = [...pool];
  }

  _preencherFormEscolaPage(escola);
}
window.abrirFormEscolaByInepOrId = abrirFormEscolaByInepOrId;
window.abrirModalEditarEscolaById = abrirFormEscolaByInepOrId;
`;

if (!escolasCode.includes('function abrirFormEscolaByInepOrId')) {
  escolasCode += '\n' + robustLookupFunc;
} else {
  // Replace existing definition with robust version
  const startIdx = escolasCode.indexOf('function abrirFormEscolaByInepOrId');
  const endIdx = escolasCode.indexOf('window.abrirModalEditarEscolaById = abrirFormEscolaById;', startIdx);
  if (startIdx > -1) {
    const tail = endIdx > -1 ? endIdx + 'window.abrirModalEditarEscolaById = abrirFormEscolaById;'.length : startIdx + 500;
    escolasCode = escolasCode.substring(0, startIdx) + robustLookupFunc + escolasCode.substring(tail);
  }
}

fs.writeFileSync(escolasPath, escolasCode, 'utf8');
console.log('js/escolas.js updated with robust abrirFormEscolaByInepOrId function.');

// 2. Update js/mapa.js with direct button click binding in Leaflet marker
const mapaPath = path.join(__dirname, 'js', 'mapa.js');
let mapaCode = fs.readFileSync(mapaPath, 'utf8');

// Replace button HTML in popup
const oldBtnRegex = /<button onclick="if\(typeof abrirFormEscolaById.*?<\/button>/s;
const newBtnHtml = `<button type="button" class="btn-editar-mapa-escola" style="flex:1; display: flex; align-items: center; justify-content: center; gap: 4px; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; border: none; padding: 8px 6px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; box-shadow: 0 3px 8px rgba(139,92,246,0.3);">
            ✏️ Editar Dados
          </button>`;

if (oldBtnRegex.test(mapaCode)) {
  mapaCode = mapaCode.replace(oldBtnRegex, newBtnHtml);
}

// Add marker popupopen event listener
const oldMarkerCreation = `const marker = L.marker([lat, lng], { title: escola.nome || 'Escola' }).bindPopup(popupHtml);\n    _mapaMarkersGroup.addLayer(marker);`;
const newMarkerCreation = `const marker = L.marker([lat, lng], { title: escola.nome || 'Escola' }).bindPopup(popupHtml);
    const targetId = escola.id || escola.codigoInep || escola.nome || '';
    marker.on('popupopen', (e) => {
      setTimeout(() => {
        const popupEl = e.popup.getElement();
        if (popupEl) {
          const btn = popupEl.querySelector('.btn-editar-mapa-escola');
          if (btn) {
            btn.onclick = (evt) => {
              if (evt) evt.preventDefault();
              if (typeof window.abrirFormEscolaByInepOrId === 'function') {
                window.abrirFormEscolaByInepOrId(targetId);
              }
            };
          }
        }
      }, 50);
    });
    _mapaMarkersGroup.addLayer(marker);`;

if (mapaCode.includes(oldMarkerCreation)) {
  mapaCode = mapaCode.replace(oldMarkerCreation, newMarkerCreation);
}

fs.writeFileSync(mapaPath, mapaCode, 'utf8');
console.log('js/mapa.js updated with direct popupopen listener for Editar Dados button.');
