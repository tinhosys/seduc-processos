const fs = require('fs');
let mapa = fs.readFileSync('js/mapa.js', 'utf8');

const search = `  // 2. Lookup manual INEP (hardcoded para escolas conhecidas)
  if (inep && ESCOLAS_EXACT_COORDS[inep]) return ESCOLAS_EXACT_COORDS[inep];`;

const replacement = `  // 2. Lookup manual INEP (hardcoded para escolas conhecidas)
  if (inep && ESCOLAS_EXACT_COORDS[inep]) return ESCOLAS_EXACT_COORDS[inep];

  // 2.5 Decode Plus Code
  const pCode = escola.plusCode || escola.codigoPlus || escola.plus_code;
  if (pCode && typeof OpenLocationCode !== 'undefined') {
    try {
      const olc = new OpenLocationCode();
      const munCoords = getCoordsParaMunicipio(escola.municipio) || [-8.7540, -63.8860];
      let fullCode = pCode;
      if (olc.isShort(pCode)) {
        fullCode = olc.recoverNearest(pCode, munCoords[0], munCoords[1]);
      }
      if (olc.isFull(fullCode)) {
        const decoded = olc.decode(fullCode);
        return [decoded.latitudeCenter, decoded.longitudeCenter];
      }
    } catch(e) {
      console.warn('Erro ao decodificar Plus Code:', pCode, e);
    }
  }`;

mapa = mapa.replace(search, replacement);
fs.writeFileSync('js/mapa.js', mapa, 'utf8');
console.log('Modified js/mapa.js to use Plus Code');
