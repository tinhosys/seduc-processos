const fs = require('fs');
let mapa = fs.readFileSync('js/mapa.js', 'utf8');

const search = `    // --- Geocodificação assíncrona: quando Nominatim retornar, move o marcador ---
    _geocEnqueue(escola, (realCoord) => {`;

const replacement = `    // Se tiver Plus Code decodificado, ou for coord exata do INEP, não precisa chamar Nominatim
    const inep = escola.codigoInep ? String(escola.codigoInep).trim() : null;
    const pCode = escola.plusCode || escola.codigoPlus || escola.plus_code;
    const temPlusCode = pCode && typeof OpenLocationCode !== 'undefined';
    const temExact = inep && ESCOLAS_EXACT_COORDS[inep];
    if (temPlusCode || temExact) {
       // Já usamos a coordenada exata
       return;
    }

    // --- Geocodificação assíncrona: quando Nominatim retornar, move o marcador ---
    _geocEnqueue(escola, (realCoord) => {`;

mapa = mapa.replace(search, replacement);
fs.writeFileSync('js/mapa.js', mapa, 'utf8');
console.log('Patched geocEnqueue in mapa.js');
