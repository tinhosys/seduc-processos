const MUNICIPIOS_RO = [
  "Alta Floresta d'Oeste", "Alto Alegre dos Parecis", "Alto Paraíso", "Alvorada d'Oeste", "Ariquemes", 
  "Buritis", "Cabixi", "Cacaulândia", "Cacoal", "Campo Novo de Rondônia", "Candeias do Jamari", 
  "Castanheiras", "Cerejeiras", "Chupinguaia", "Colorado do Oeste", "Corumbiara", "Costa Marques", 
  "Cujubim", "Espigão d'Oeste", "Governador Jorge Teixeira", "Guajará-Mirim", "Itapuã do Oeste", 
  "Jaru", "Ji-Paraná", "Machadinho d'Oeste", "Ministro Andreazza", "Mirante da Serra", "Monte Negro", 
  "Nova Brasilândia d'Oeste", "Nova Mamoré", "Nova União", "Novo Horizonte do Oeste", "Ouro Preto do Oeste", 
  "Parecis", "Pimenta Bueno", "Pimenteiras do Oeste", "Porto Velho", "Presidente Médici", 
  "Primavera de Rondônia", "Rio Crespo", "Rolim de Moura", "Santa Luzia d'Oeste", "São Felipe d'Oeste", 
  "São Francisco do Guaporé", "São Miguel do Guaporé", "Seringueiras", "Teixeirópolis", "Theobroma", 
  "Urupá", "Vale do Anari", "Vale do Paraíso", "Vilhena"
];

function _parseGvizText(text) {
  try {
    const jsonStr = text.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, '');
    const data = JSON.parse(jsonStr);
    if (!data || !data.table || data.status === 'error') return null;
    if (!data.table.rows || data.table.rows.length === 0) return null;
    return data.table.rows;
  } catch(e) { return null; }
}

function _parseRowEstadual(row) {
  if (!row.c || row.c.length === 0) return null;
  const val = (idx) => (row.c[idx] && row.c[idx].v !== null) ? String(row.c[idx].v).trim() : '';
  if (val(0).toUpperCase() === 'CÓDIGO SUPER') return null;
  if (!val(4)) return null; 
  
  return {
    competencia: 'Estadual',
    super: val(1),
    municipio: val(2),
    inep: val(3),
    nome: val(4),
    localidade: val(5),
    endereco: val(6),
    complemento: val(7),
    bairro: val(8),
    cep: val(9),
    totalMatricula: parseInt(val(10)) || 0,
    alunos: parseInt(val(10)) || 0,
    salas: parseInt(val(11)) || 0,
    diretor: val(12),
    secretario: val(13),
    contatoDiretor: val(14),
    contatoSecretario: val(15),
    telefone: val(16),
    email: val(17),
    redesSociais: val(18),
    modalidade: '',
    modalidades: []
  };
}

function _parseRowMunicipal(row) {
  if (!row.c || row.c.length === 0) return null;
  const val = (idx) => (row.c[idx] && row.c[idx].v !== null) ? String(row.c[idx].v).trim() : '';
  if (val(0).toUpperCase() === 'MUNICÍPIO/DISTRITO' || val(0).toUpperCase() === 'MUNICÍPIO') return null;
  if (!val(1)) return null; 
  
  return {
    competencia: 'Municipal',
    municipio: val(0),
    nome: val(1),
    alunosModalidade: parseInt(val(2)) || 0,
    modalidadeStr: val(3),
    inep: val(4),
    endereco: val(5),
    bairro: val(6),
    complemento: val(7),
    cep: val(8),
    super: val(10),
    redesSociais: val(11),
    telefone: val(12),
    email: val(13),
    diretor: val(14),
    contatoDiretor: val(15),
    secretario: val(16),
    contatoSecretario: val(17),
    salas: parseInt(val(18)) || 0,
    localidade: val(26)
  };
}

async function testFetch() {
  let mergedSchools = [];
  try {
      const urlEstadual = 'https://docs.google.com/spreadsheets/d/1m5ft9l56LbdkBuIJp44H1YWKSevuZsP2ucIG7RQxz2E/gviz/tq?tqx=out:json&gid=220005692';
      const resEst = await fetch(urlEstadual);
      if (resEst.ok) {
        const textEst = await resEst.text();
        const rowsEst = _parseGvizText(textEst);
        if (rowsEst) {
          rowsEst.forEach(r => {
            const parsed = _parseRowEstadual(r);
            if (parsed) mergedSchools.push(parsed);
          });
        } else { console.log('Failed to parse Estadual text'); }
      }
      console.log('Estadual loaded:', mergedSchools.length);
  } catch(e) { console.error('Erro Estadual:', e); }
  
  let municipalMap = new Map();
  const TE_SHEET_ID = '1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08';
  const TE_BATCH_SIZE = 10;
  
  for (let batchStart = 0; batchStart < MUNICIPIOS_RO.length; batchStart += TE_BATCH_SIZE) {
      const batchMuns = MUNICIPIOS_RO.slice(batchStart, batchStart + TE_BATCH_SIZE);
      const results = await Promise.allSettled(
        batchMuns.map(mun => {
          const url = 'https://docs.google.com/spreadsheets/d/' + TE_SHEET_ID + '/gviz/tq?tqx=out:json&sheet=' + encodeURIComponent(mun);
          return fetch(url).then(r => r.ok ? r.text() : Promise.reject('HTTP ' + r.status));
        })
      );
      
      results.forEach((res, i) => {
        if (res.status === 'rejected') { console.log('Reject:', batchMuns[i], res.reason); return; }
        const text = res.value;
        const rows = _parseGvizText(text);
        if (!rows) return;
        
        rows.forEach(r => {
          const parsed = _parseRowMunicipal(r);
          if (!parsed) return;
          
          const key = (parsed.inep && parsed.inep.length > 3) ? parsed.inep.trim() : parsed.nome.trim().toUpperCase();
          if (!municipalMap.has(key)) {
             municipalMap.set(key, {
               competencia: 'Municipal',
               municipio: parsed.municipio || batchMuns[i],
               nome: parsed.nome,
               inep: parsed.inep,
               modalidades: [],
               totalMatricula: 0,
               alunos: 0
             });
          }
          const school = municipalMap.get(key);
          if (parsed.modalidadeStr) {
             school.modalidades.push({
               modalidade: parsed.modalidadeStr,
               alunos: parsed.alunosModalidade
             });
             school.totalMatricula += parsed.alunosModalidade;
             school.alunos += parsed.alunosModalidade;
          }
        });
      });
  }
  mergedSchools = mergedSchools.concat(Array.from(municipalMap.values()));
  console.log('Total:', mergedSchools.length);
}
testFetch().catch(console.error);
