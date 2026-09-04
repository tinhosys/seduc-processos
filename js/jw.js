function jaroWinkler(s1, s2) {
    var m = 0;
    if (!s1 || !s2 || s1.length === 0 || s2.length === 0) return 0;
    if (s1 === s2) return 1;
    var range = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1;
    var s1Matches = new Array(s1.length);
    var s2Matches = new Array(s2.length);
    for (var i = 0; i < s1.length; i++) {
        var low  = (i >= range) ? i - range : 0;
        var high = (i + range <= s2.length - 1) ? (i + range) : (s2.length - 1);
        for (var j = low; j <= high; j++) {
            if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
                ++m; s1Matches[i] = s2Matches[j] = true; break;
            }
        }
    }
    if (m === 0) return 0;
    var k = 0, numTrans = 0;
    for (var i = 0; i < s1.length; i++) {
        if (s1Matches[i] === true) {
            for (var j = k; j < s2.length; j++) {
                if (s2Matches[j] === true) { k = j + 1; break; }
            }
            if (s1[i] !== s2[j]) ++numTrans;
        }
    }
    var weight = (m / s1.length + m / s2.length + (m - (numTrans / 2)) / m) / 3;
    var l = 0, p = 0.1;
    if (weight > 0.7) {
        while (s1[l] === s2[l] && l < 4) ++l;
        weight = weight + l * p * (1 - weight);
    }
    return weight;
}

function encontrarEscolaSemelhante(nomeDigitado) {
    const escolas = (typeof _escolasCache !== 'undefined' && Array.isArray(_escolasCache) && _escolasCache.length > 0) ? _escolasCache : ((typeof _mapaCacheEscolas !== 'undefined' && Array.isArray(_mapaCacheEscolas)) ? _mapaCacheEscolas : []);
    if (escolas.length === 0) return null;
    let melhorMatch = null;
    let melhorScore = 0;
    const digitadoNormal = nomeDigitado.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, '');
    for (let e of escolas) {
        if (!e.nome) continue;
        const nomeEsc = e.nome.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, '');
        const score = jaroWinkler(digitadoNormal, nomeEsc);
        if (score > melhorScore) {
            melhorScore = score;
            melhorMatch = e.nome;
        }
    }
    return (melhorScore >= 0.90 && melhorScore < 1.0) ? melhorMatch : null;
}
