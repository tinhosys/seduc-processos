// ============================================================
// SEDUC — Módulo do Mapa Interativo de Escolas de Rondônia (v3.1)
// ============================================================

var _mapaInstancia = null;
var _mapaMarkersGroup = null;
var _mapaCacheEscolas = [];
var _mapaEscolasFiltradas = [];

// Calibração de coordenadas exatas por INEP da escola
const ESCOLAS_EXACT_COORDS = {
  "11002000": [-8.7490, -63.8745], // EEEF PROF ELOISA BENTES RAMOS (Rua Coimbra, Flodoaldo Pontes Pinto, Porto Velho)
  "11000317": [-8.7495, -63.8730], // EEEFM DR JOSE OTINO DE FREITAS (Flodoaldo Pontes Pinto)
  "11000678": [-8.7450, -63.8820], // EEEMTI BRASILIA (Embratel)
  "11000970": [-8.7540, -63.9080], // EEEFM DUQUE DE CAXIAS (Arigolândia)
  "11001046": [-8.7750, -63.8850], // EEEFM ESTUDO E TRABALHO (Areal)
  "11001119": [-8.7650, -63.8750], // EEEFM GOV ARAUJO LIMA (Nova Porto Velho)
  "11000023": [-8.7600, -63.8450], // EEEE ABNAEL MACHADO DE LIMA (Tiradentes)
  "11000260": [-8.7450, -63.8900], // CTPM I (Industrial)
  "11000376": [-8.7500, -63.8960], // 21 DE ABRIL (Liberdade)
  "11000384": [-8.7380, -63.8600], // 4 DE JANEIRO (Aponiã)
  "11000597": [-8.7850, -63.8650], // BELA VISTA (Conceição)
  "11000708": [-8.7900, -63.8750], // CAP CLAUDIO MANOEL DA COSTA (Cidade do Lobo)
  "11000848": [-8.7950, -63.8650], // DOM PEDRO I (Castanheira)
  "11000856": [-8.7750, -63.8350], // DANIEL NERI DA SILVA (Juscelino Kubitschek)
  "11000937": [-8.7300, -63.9000], // DR OSWALDO PIANNA (Nacional)
  "11001097": [-8.7800, -63.9080]  // FRANKLIN DELANO ROOSEVELT (Triângulo)
};

// Calibração geográfica por bairros — coordenadas obtidas via Google Maps / GeoPortal PVH
// Porto Velho: todos os bairros verificados individualmente
const BAIRROS_RO_COORDS = {
  "portovelho": {
    // Zona Central
    "centro":                       [-8.7542, -63.8985],
    "caiari":                       [-8.7600, -63.9038],
    "panair":                       [-8.7490, -63.9120],
    "pedrinhas":                    [-8.7448, -63.9058],
    "sao joao bosco":               [-8.7626, -63.8960],
    "liberdade":                    [-8.7535, -63.8950],
    "olaria":                       [-8.7800, -63.8981],
    "arigolandia":                  [-8.7580, -63.9050],
    // Zona Leste
    "flodoaldo pontes pinto":       [-8.7490, -63.8745],
    "embratel":                     [-8.7440, -63.8820],
    "sao cristovao":                [-8.7510, -63.8860],
    "igarape":                      [-8.7435, -63.8650],
    "igarapé":                      [-8.7435, -63.8650],
    "jardim santana":               [-8.7540, -63.8180],
    "tiradentes":                   [-8.7605, -63.8460],
    "socialista":                   [-8.7598, -63.8312],
    "cunia":                        [-8.7548, -63.8548],
    // Zona Norte
    "nacional":                     [-8.7310, -63.9010],
    "aponia":                       [-8.7380, -63.8590],
    "aponã":                        [-8.7380, -63.8590],
    "nova porto velho":             [-8.7658, -63.8748],
    "agenor de carvalho":           [-8.7631, -63.8670],
    "agenor martins de carvalho":   [-8.7631, -63.8670],
    "mato grosso":                  [-8.7670, -63.8842],
    "nossa senhora das gracas":     [-8.7600, -63.8896],
    "nossa senhora das graças":     [-8.7600, -63.8896],
    "ulisses guimaraes":            [-8.7584, -63.8750],
    "ulisses guimarães":            [-8.7584, -63.8750],
    "mariana":                      [-8.7779, -63.8200],
    "ronaldo aragao":               [-8.7817, -63.7993],
    "ronaldo aragão":               [-8.7817, -63.7993],
    "eldorado":                     [-8.7875, -63.8624],
    "nova floresta":                [-8.7820, -63.8200],
    "cidade jardim":                [-8.7740, -63.8650],
    "floresta":                     [-8.7700, -63.8800],
    // Zona Sul
    "areal":                        [-8.7749, -63.8853],
    "tancredo neves":               [-8.7982, -63.8825],
    "caladinho":                    [-8.8004, -63.8837],
    "juscelino kubitschek":         [-8.7748, -63.8352],
    "tres marias":                  [-8.7810, -63.8490],
    "sao francisco":                [-8.7856, -63.8349],
    "são francisco":                [-8.7856, -63.8349],
    "conceicao":                    [-8.7855, -63.8655],
    "conceição":                    [-8.7855, -63.8655],
    "cidade do lobo":               [-8.7900, -63.8755],
    "castanheira":                  [-8.7946, -63.8644],
    // Zona Oeste / Industrial
    "triangulo":                    [-8.7798, -63.9085],
    "triângulo":                     [-8.7798, -63.9085],
    "baixa uniao":                  [-8.7750, -63.9050],
    "baixa união":                  [-8.7750, -63.9050],
    "santa barbara":                [-8.7645, -63.8950],
    "santa bárbara":                [-8.7645, -63.8950],
    "eletronorte":                  [-8.7899, -63.8705],
    "tupy":                         [-8.7720, -63.8930],
    "lagoa":                        [-8.7700, -63.8648],
    // Outros
    "sao sebastiao":                [-8.7302, -63.8870],
    "são sebastião":               [-8.7302, -63.8870],
    "esperanca da comunidade":      [-8.8100, -63.8500],
    "esperança da comunidade":      [-8.8100, -63.8500],
    "km 1":                         [-8.7640, -63.9120],
    "industrial":                   [-8.7550, -63.9120],
    "area rural de porto velho":    [-8.8200, -63.8500],
    "área rural de porto velho":    [-8.8200, -63.8500]
  },
  "ariquemes": {
    "setor institucional":  [-9.9100, -63.0350],
    "setor 01":             [-9.9120, -63.0410],
    "setor 02":             [-9.9150, -63.0430],
    "setor 03":             [-9.9180, -63.0450],
    "setor 04":             [-9.9200, -63.0400],
    "setor 05":             [-9.9140, -63.0320],
    "setor 06":             [-9.9100, -63.0250],
    "setor 09":             [-9.9250, -63.0300],
    "bnh":                  [-9.9050, -63.0450],
    "setor 08":             [-9.9220, -63.0380],
    "setor 12":             [-9.9050, -63.0200],
    "setor industrial":     [-9.9300, -63.0350]
  },
  "jiparana": {
    "central":              [-10.8780, -61.9510],
    "setor 01":             [-10.8820, -61.9500],
    "jardim das oliveiras": [-10.8850, -61.9600],
    "urupá":                [-10.8720, -61.9440]
  },
  "cacoal": {
    "centro":               [-11.4380, -61.4460],
    "josiane":              [-11.4440, -61.4400],
    "incra":                [-11.4480, -61.4500]
  },
  "vilhena": {
    "centro":               [-12.7400, -60.1450],
    "canaã":                [-12.7460, -60.1380],
    "setor 01":             [-12.7350, -60.1500]
  }
};

// Coordenadas geográficas de todos os 52 municípios de Rondônia (Lat, Lng)
// Nomes no formato exato retornado pela API (D'Oeste com D maiúsculo)
const MUNICIPIOS_RO_COORDS = {
  // Porto Velho: centro urbano — área do Bairro São Cristóvão / Caiari (evita o Igarapé do Tanque)
  "Porto Velho": [-8.7540, -63.8860],
  "Ji-Paraná": [-10.8828, -61.9519],
  "Ariquemes": [-9.9133, -63.0408],
  "Cacoal": [-11.4386, -61.4472],
  "Vilhena": [-12.7406, -60.1458],
  "Jaru": [-10.4389, -62.4664],
  "Rolim de Moura": [-11.7275, -61.7714],
  "Pimenta Bueno": [-11.6725, -61.1936],
  "Guajará-Mirim": [-10.7839, -65.3314],
  "Ouro Preto do Oeste": [-10.7481, -62.2561],
  "Buritis": [-10.2117, -63.8314],
  "Machadinho D'Oeste": [-9.4439, -61.9819],
  "Espigão D'Oeste": [-11.5269, -61.0089],
  "Alta Floresta D'Oeste": [-11.9797, -61.9953],
  "Nova Mamoré": [-10.4078, -65.3347],
  "Candeias do Jamari": [-8.8058, -63.7028],
  "São Miguel do Guaporé": [-11.6933, -62.7147],
  "Presidente Médici": [-11.1753, -61.9014],
  "São Francisco do Guaporé": [-12.0525, -62.0358],
  "Costa Marques": [-12.4431, -64.2319],
  "Cerejeiras": [-13.1892, -60.8189],
  "Colorado do Oeste": [-13.1206, -60.5439],
  "Monte Negro": [-10.2522, -63.2961],
  "Alto Paraíso": [-9.7144, -63.3189],
  "Campo Novo de Rondônia": [-10.5756, -63.6264],
  "Cujubim": [-9.3639, -62.5861],
  "Governador Jorge Teixeira": [-10.6111, -62.7417],
  "Mirante da Serra": [-11.0289, -62.6714],
  "Urupá": [-11.1408, -62.3364],
  "Vale do Anari": [-9.8653, -62.1764],
  "Theobroma": [-10.2389, -62.3489],
  "Alvorada D'Oeste": [-11.3469, -62.2858],
  "Nova Brasilândia D'Oeste": [-11.7219, -62.3153],
  "Teixeirópolis": [-10.9064, -62.2536],
  "Castanheiras": [-11.4178, -61.9514],
  "Ministro Andreazza": [-11.1969, -61.5186],
  "Parecis": [-12.1644, -61.6014],
  "Pimenteiras do Oeste": [-13.4822, -61.0475],
  "Chupinguaia": [-12.5583, -60.8986],
  "Cabixi": [-13.4989, -60.5439],
  "Corumbiara": [-12.9567, -60.8889],
  "Seringueiras": [-11.7961, -63.0275],
  "Alto Alegre dos Parecis": [-12.1319, -61.8544],
  "Rio Crespo": [-9.6978, -62.8989],
  "Itapuã do Oeste": [-9.2008, -63.1814],
  "Novo Horizonte do Oeste": [-11.6961, -61.9939],
  "Santa Luzia D'Oeste": [-11.9056, -61.7778],
  "Cacaulândia": [-9.8903, -62.9000],
  "Nova União": [-10.9061, -62.5564],
  "Primavera de Rondônia": [-11.8289, -61.3175],
  "São Felipe D'Oeste": [-11.9022, -61.5019],
  "Vale do Paraíso": [-10.4439, -62.1339]
};

const CENTER_RO = [-10.83, -62.90];

function _mapaNormalizarStr(str) {
  if (!str) return '';
  // Normaliza acentos, maiúsculas, espaços e apóstrofos (curvo/reto)
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u0060]/g, "'")
    .trim();
}

function criarBotaoWhatsApp(telefoneStr) {
  if (!telefoneStr) return '';
  const num = String(telefoneStr).replace(/\D/g, '');
  if (num.length < 8) return '';

  let formatted = num;
  // Garante prefixo DDI Brasil +55
  if (!formatted.startsWith('55') && (formatted.length === 10 || formatted.length === 11)) {
    formatted = '55' + formatted;
  }

  // wa.me é a URL canônica oficial do WhatsApp — abre direto no app/web já logado
  // target="whatsapp" reutiliza a MESMA aba em vez de abrir uma nova a cada clique
  const url = `https://wa.me/${formatted}`;
  return `<a href="${url}" target="whatsapp" rel="noopener" title="Abrir no WhatsApp (reutiliza a aba aberta)" style="display:inline-flex;align-items:center;gap:4px;background:#25D366;color:#ffffff;text-decoration:none;padding:3px 10px;border-radius:20px;font-weight:700;font-size:11px;box-shadow:0 2px 6px rgba(37,211,102,0.4);margin-left:6px;">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.2.321-1.155 4.218 4.319-1.133.379.261z"/></svg>
    WhatsApp
  </a>`;
}

function getCoordsParaMunicipio(nomeMun) {
  if (!nomeMun) return MUNICIPIOS_RO_COORDS["Porto Velho"];
  if (MUNICIPIOS_RO_COORDS[nomeMun]) return MUNICIPIOS_RO_COORDS[nomeMun];
  
  const normTarget = _mapaNormalizarStr(nomeMun);
  for (const [key, coords] of Object.entries(MUNICIPIOS_RO_COORDS)) {
    if (_mapaNormalizarStr(key) === normTarget) {
      return coords;
    }
  }
  return MUNICIPIOS_RO_COORDS["Porto Velho"];
}

function getCoordsParaEscola(escola) {
  if (!escola) return MUNICIPIOS_RO_COORDS["Porto Velho"];

  // 1. Busca por INEP exato
  if (escola.codigoInep && ESCOLAS_EXACT_COORDS[String(escola.codigoInep).trim()]) {
    return ESCOLAS_EXACT_COORDS[String(escola.codigoInep).trim()];
  }

  // 2. Busca por Bairro calibrado no município
  const munNorm = _mapaNormalizarStr(escola.municipio);
  const bairroNorm = _mapaNormalizarStr(escola.bairro);
  if (munNorm && bairroNorm && BAIRROS_RO_COORDS[munNorm] && BAIRROS_RO_COORDS[munNorm][bairroNorm]) {
    return BAIRROS_RO_COORDS[munNorm][bairroNorm];
  }

  // 3. Fallback: Coordenada do município
  return getCoordsParaMunicipio(escola.municipio);
}

function iniciarMapaEscolas() {
  // 1. Aguardar Leaflet carregar
  if (typeof L === 'undefined') {
    console.warn('[Mapa] Aguardando carregamento do Leaflet...');
    setTimeout(iniciarMapaEscolas, 300);
    return;
  }

  const container = document.getElementById('mapa-container');
  if (!container) {
    console.warn('[Mapa] Container mapa-container não encontrado');
    return;
  }

  // 2. Criar instância do mapa (apenas uma vez)
  if (!_mapaInstancia) {
    try {
      _mapaInstancia = L.map('mapa-container', {
        center: CENTER_RO,
        zoom: 7,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · SEDUC-RO'
      }).addTo(_mapaInstancia);

      _mapaMarkersGroup = L.layerGroup().addTo(_mapaInstancia);
      console.log('[Mapa] Instância Leaflet criada com sucesso');
    } catch (err) {
      console.error('[Mapa] Erro ao criar instância:', err);
      return;
    }
  }

  // 3. invalidateSize em múltiplos momentos para garantir renderização
  [50, 200, 500, 1000, 2000].forEach(delay => {
    setTimeout(() => {
      if (_mapaInstancia) _mapaInstancia.invalidateSize(true);
    }, delay);
  });

  // 4. Carregar dados das escolas
  if (typeof _escolasCache !== 'undefined' && Array.isArray(_escolasCache) && _escolasCache.length > 0) {
    _mapaCacheEscolas = [..._escolasCache];
    _mapaEscolasFiltradas = [..._mapaCacheEscolas];
    _mapaPopularFiltros();
    _mapaRenderizarPinos();
    console.log('[Mapa] Dados carregados do cache: ' + _mapaCacheEscolas.length + ' escolas');
  } else if (_mapaCacheEscolas.length > 0) {
    // Já tem dados carregados anteriormente
    _mapaRenderizarPinos();
  } else {
    // Buscar da API
    carregarMapaEscolasAPI();
  }
}

async function carregarMapaEscolasAPI() {
  const badgeEl = document.getElementById('mapa-escolas-badge');
  if (badgeEl && _mapaCacheEscolas.length === 0) badgeEl.textContent = '🗺️ Carregando mapa...';

  try {
    const token = (typeof getSessionToken === 'function') ? getSessionToken() : sessionStorage.getItem('sap_session_token');
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    const base = (window.location.protocol === 'file:') ? 'http://localhost:3001' : '';

    const res = await fetch(base + '/api/escolas', { headers });
    if (!res.ok) throw new Error('Erro HTTP ' + res.status);
    const data = await res.json();
    if (data.rows && data.rows.length > 0) {
      _mapaCacheEscolas = data.rows;
      _mapaEscolasFiltradas = [..._mapaCacheEscolas];
      _mapaPopularFiltros();
      _mapaRenderizarPinos();
    }
  } catch (err) {
    console.error('[Mapa Error]', err);
    if (typeof _escolasCache !== 'undefined' && Array.isArray(_escolasCache) && _escolasCache.length > 0) {
      _mapaCacheEscolas = [..._escolasCache];
      _mapaEscolasFiltradas = [..._mapaCacheEscolas];
      _mapaPopularFiltros();
      _mapaRenderizarPinos();
    } else if (badgeEl) {
      badgeEl.textContent = '🗺️ Erro ao carregar mapa';
    }
  }
}

function _mapaPopularFiltros() {
  const selMun = document.getElementById('mapa-filtro-municipio');
  const selSup = document.getElementById('mapa-filtro-super');

  if (selMun) {
    const municipios = [...new Set(_mapaCacheEscolas.map(e => e.municipio).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'pt-BR'));
    selMun.innerHTML = '<option value="">Todos os Municípios</option>' + municipios.map(m => '<option value="' + m + '">' + m + '</option>').join('');
  }

  if (selSup) {
    const superSet = new Set();
    _mapaCacheEscolas.forEach(e => {
      const val = (e.super || e.codigoSuper || '').toString().trim();
      if (val) superSet.add(val);
    });
    const supers = [...superSet].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
    selSup.innerHTML = '<option value="">Todas as SUPER\'s</option>' + supers.map(s => {
      const label = s.toUpperCase().startsWith('SUPER') ? s : 'SUPER ' + s;
      return '<option value="' + s + '">' + label + '</option>';
    }).join('');
  }

  const badgeEl = document.getElementById('mapa-escolas-badge');
  if (badgeEl && _mapaEscolasFiltradas.length > 0) {
    badgeEl.textContent = '🏫 ' + _mapaEscolasFiltradas.length.toLocaleString('pt-BR') + ' Escolas no Mapa';
  }
}

function filtrarMapaEscolas() {
  const mun = (document.getElementById('mapa-filtro-municipio') || {}).value || '';
  const sup = (document.getElementById('mapa-filtro-super') || {}).value || '';
  const busca = _mapaNormalizarStr((document.getElementById('mapa-busca') || {}).value || '');

  _mapaEscolasFiltradas = _mapaCacheEscolas.filter(e => {
    if (mun && e.municipio !== mun) return false;
    if (sup) {
      const eSup = (e.super || e.codigoSuper || '').toString().trim();
      if (eSup !== sup) return false;
    }
    if (busca) {
      const texto = _mapaNormalizarStr([e.nome, e.municipio, e.codigoInep, e.bairro, e.super, e.codigoSuper, e.diretor].join(' '));
      if (!texto.includes(busca)) return false;
    }
    return true;
  });

  _mapaRenderizarPinos();
}

function limparFiltrosMapa() {
  ['mapa-filtro-municipio', 'mapa-filtro-super', 'mapa-busca'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  _mapaEscolasFiltradas = [..._mapaCacheEscolas];
  _mapaRenderizarPinos();
}

function _mapaRenderizarPinos() {
  const badgeEl = document.getElementById('mapa-escolas-badge');
  if (badgeEl) badgeEl.textContent = '🏫 ' + _mapaEscolasFiltradas.length.toLocaleString('pt-BR') + ' Escolas no Mapa';

  if (!_mapaMarkersGroup || !_mapaInstancia) return;
  _mapaMarkersGroup.clearLayers();

  // Agrupa escolas pela coordenada-base para calcular deslocamento espiral por grupo
  // Isso garante que escolas de bairros diferentes não compartilhem o mesmo contador
  const groupCounts = {};

  _mapaEscolasFiltradas.forEach((escola) => {
    const coordsBase = getCoordsParaEscola(escola);

    // Chave do grupo: coordenada arredondada a 3 casas (raio ~100m)
    const groupKey = coordsBase[0].toFixed(3) + ',' + coordsBase[1].toFixed(3);
    groupCounts[groupKey] = (groupCounts[groupKey] || 0) + 1;
    const count = groupCounts[groupKey];

    // Dispersão espiral áurea (ângulo ~137.5° = golden angle) — pequena e controlada
    // Passo: ~70m | Máximo: ~550m — evita que pinos caiam em rios ou áreas não-urbanas
    const angle  = (count * 137.508) * (Math.PI / 180);
    const radius = Math.min(0.0006 * Math.sqrt(count), 0.005);
    const lat = coordsBase[0] + (radius * Math.cos(angle));
    const lng = coordsBase[1] + (radius * Math.sin(angle));

    const gmapsQuery = encodeURIComponent(`${escola.nome || ''} ${escola.municipio || ''} Rondônia`);
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${gmapsQuery}`;

    const superLabel = escola.super ? (escola.super.toUpperCase().startsWith('SUPER') ? escola.super : 'SUPER ' + escola.super) : 'SEDUC - RO';
    const diretor = escola.diretor || 'Não informado';
    const contatoStr = escola.contatoDiretor || escola.telefone || 'Não informado';
    const btnWa = criarBotaoWhatsApp(escola.contatoDiretor || escola.telefone);

    const endPartes = [escola.endereco, escola.complemento].filter(Boolean).join(', ');
    const bairroPartes = [escola.bairro, escola.cep ? 'CEP ' + escola.cep : null].filter(Boolean).join(' - ');
    const enderecoCompleto = [endPartes, bairroPartes].filter(Boolean).join(' | ') || 'Endereço não cadastrado';

    const mat = escola.totalMatricula > 0 ? Number(escola.totalMatricula).toLocaleString('pt-BR') : '—';
    const sal = escola.salas > 0 ? escola.salas : '—';

    const locBadge = escola.localizacao
      ? `<span style="padding:2px 7px; border-radius:4px; font-size:10px; font-weight:700; background:rgba(6,182,212,0.12); color:#0891b2; border:1px solid rgba(6,182,212,0.25);">${escola.localizacao}</span>`
      : '';

    const popupHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 285px; max-width: 320px; padding: 2px; color: #1e293b;">
        <!-- Header / Badge SUPER -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
          <span style="font-size: 10px; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #6366f1); color: #ffffff; padding: 3px 8px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(124,58,237,0.2);">
            ${superLabel}
          </span>
          ${locBadge}
        </div>

        <!-- Nome da Escola -->
        <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px; line-height: 1.35; letter-spacing: -0.2px;">
          ${escola.nome || 'Escola Estadual'}
        </div>

        <!-- Badges INEP & Município -->
        <div style="display:flex; flex-wrap:wrap; gap:6px; font-size: 11px; margin-bottom: 10px;">
          <span style="background:#f1f5f9; color:#334155; padding: 2px 8px; border-radius: 6px; font-weight: 600;">
            📍 ${escola.municipio || 'Rondônia'}
          </span>
          ${escola.codigoInep ? `<span style="background:#eff6ff; color:#2563eb; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-family: monospace;">INEP: ${escola.codigoInep}</span>` : ''}
        </div>

        <!-- Divisor sutil -->
        <div style="height: 1px; background: #e2e8f0; margin: 8px 0;"></div>

        <!-- Dados do Gestor & Contato -->
        <div style="font-size: 12px; color: #475569; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
          <span style="font-size:14px;">👤</span>
          <div><strong>Diretor(a):</strong> ${diretor}</div>
        </div>

        <div style="font-size: 12px; color: #475569; margin-bottom: 8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:4px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:14px;">📞</span>
            <span><strong>Contato:</strong> ${contatoStr}</span>
          </div>
          ${btnWa}
        </div>

        <!-- Endereço Completo -->
        <div style="font-size: 11px; color: #64748b; background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 10px; line-height: 1.4;">
          <strong>🏠 Endereço:</strong> ${enderecoCompleto}
        </div>

        <!-- Mini Cards: Matrículas e Salas -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px;">
          <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); padding: 6px 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 10px; font-weight: 700; color: #059669; text-transform: uppercase;">🎓 Alunos</div>
            <div style="font-size: 13px; font-weight: 800; color: #047857;">${mat}</div>
          </div>
          <div style="background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); padding: 6px 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 10px; font-weight: 700; color: #2563eb; text-transform: uppercase;">🚪 Salas</div>
            <div style="font-size: 13px; font-weight: 800; color: #1d4ed8;">${sal}</div>
          </div>
        </div>

        <!-- Botões de Ação -->
        <div style="display:flex; gap:6px;">
          <a href="${gmapsUrl}" target="_blank" rel="noopener" style="flex:1; display: flex; align-items: center; justify-content: center; gap: 4px; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 8px 6px; border-radius: 8px; font-size: 11px; font-weight: 700; box-shadow: 0 3px 8px rgba(16,185,129,0.3);">
            📍 Google Maps
          </a>
          <button onclick="if(typeof abrirFormEscolaById==='function'){ abrirFormEscolaById('${escola.id}'); } else if(typeof abrirModalEditarEscolaById==='function'){ abrirModalEditarEscolaById('${escola.id}'); }" style="flex:1; display: flex; align-items: center; justify-content: center; gap: 4px; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; border: none; padding: 8px 6px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; box-shadow: 0 3px 8px rgba(139,92,246,0.3);">
            ✏️ Editar Dados
          </button>
        </div>
      </div>
    `;

    const marker = L.marker([lat, lng], { title: escola.nome || 'Escola' }).bindPopup(popupHtml);
    _mapaMarkersGroup.addLayer(marker);
  });
}

window.iniciarMapaEscolas   = iniciarMapaEscolas;
window.filtrarMapaEscolas   = filtrarMapaEscolas;
window.aplicarFiltrosMapa   = filtrarMapaEscolas;
window.limparFiltrosMapa    = limparFiltrosMapa;
