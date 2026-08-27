const fs = require('fs');
let file = fs.readFileSync('js/dados.js', 'utf8');
file = file.replace(/Munic\uFFFDpio/g, 'Município');
file = file.replace(/N\uFFFD Processo/g, 'Nº Processo');
file = file.replace(/Diferen\uFFFDa/g, 'Diferença');
file = file.replace(/Localiza\uFFFD\uFFFDo/g, 'Localização');
file = file.replace(/Anota\uFFFD\uFFFDo/g, 'Anotação');
file = file.replace(/\uFFFDsltima edi\uFFFD\uFFFDo/g, 'Última edição');
file = file.replace(/\uFFFDsLTIMA EDI\uFFFD\uFFFDO/g, 'ÚLTIMA EDIÇÃO');
file = file.replace(/data\/hora edi\uFFFD\uFFFDo/g, 'data/hora edição');
file = file.replace(/DATA\/HORA EDI\uFFFD\uFFFDO/g, 'DATA/HORA EDIÇÃO');
file = file.replace(/Conclu\uFFFDo/g, 'Conclusão');
file = file.replace(/Atribui\uFFFD\uFFFDo/g, 'Atribuição');
file = file.replace(/Revis\uFFFDo/g, 'Revisão');
file = file.replace(/Avalia\uFFFD\uFFFDo/g, 'Avaliação');

const agrupamentos = `AGRUPAMENTOS_REGIONAIS = {
  "Rolim de Moura": "Zona da Mata",
  "Alta Floresta D'Oeste": "Zona da Mata",
  "Alto Alegre dos Parecis": "Zona da Mata",
  "Castanheiras": "Zona da Mata",
  "Nova Brasilândia D'Oeste": "Zona da Mata",
  "Novo Horizonte do Oeste": "Zona da Mata",
  "Santa Luzia D'Oeste": "Zona da Mata",
  "São Miguel do Guaporé": "Região da 429",
  "Alvorada D'Oeste": "Região da 429",
  "Seringueiras": "Região da 429",
  "São Francisco do Guaporé": "Região da 429",
  "Costa Marques": "Região da 429",
  "Cacoal": "Região do Café",
  "Espigão D'Oeste": "Região do Café",
  "Ministro Andreazza": "Região do Café",
  "Pimenta Bueno": "Região do Café",
  "Primavera de Rondônia": "Região do Café",
  "Jaru": "Bacia Leiteira",
  "Governador Jorge Teixeira": "Bacia Leiteira",
  "Machadinho D'Oeste": "Bacia Leiteira",
  "Theobroma": "Bacia Leiteira",
  "Vale do Anari": "Bacia Leiteira",
  "Ariquemes": "Vale do Jamari",
  "Alto Paraíso": "Vale do Jamari",
  "Buritis": "Vale do Jamari",
  "Cacaulândia": "Vale do Jamari",
  "Campo Novo de Rondônia": "Vale do Jamari",
  "Cujubim": "Vale do Jamari",
  "Monte Negro": "Vale do Jamari",
  "Rio Crespo": "Vale do Jamari",
  "Guajará-Mirim": "Pérola do Mamoré",
  "Nova Mamoré": "Pérola do Mamoré"
};`;

file = file.replace(/AGRUPAMENTOS_REGIONAIS = \{[\s\S]*?\};/g, agrupamentos);

fs.writeFileSync('js/dados.js', file, 'utf8');
console.log('Fixed js/dados.js');
