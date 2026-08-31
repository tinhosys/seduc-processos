const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'escolas.js');
let content = fs.readFileSync(file, 'utf8');

const exactSheetNames = [
  "Porto Velho", "Ariquemes", "Alto Alegre dos Parecis", "Alta Floresta do Oeste", "Alto Paraíso", 
  "Alvorada do Oeste", "Buritis", "Cabixi", "Cacaulândia", "Cacoal", "Campo Novo de Rondônia", 
  "Candeias do Jamari", "Cerejeiras", "Castanheiras", "Chupinguaia", "Colorado do Oeste", 
  "Corumbiara", "Costa Marques", "Cujubim", "Espigão do Oeste", "Gov. Jorge Teixeira", 
  "Guajará Mirim", "Itapuã do Oeste", "Jarú", "Ministro Andreazza", "Ji Paraná", 
  "Machadinho do Oeste", "Mirante da Serra", "Monte Negro", "Nova Mamoré", 
  "Nova Brasilândia do Oeste", "Nova União", "Novo Horizonte do Oeste", "Ouro Preto do Oeste", 
  "Parecis", "Pimenta Bueno", "Pimenteiras do Oeste", "Primavera de Rondônia", 
  "Presidente Médici", "Rio  Crespo", "Rolim de Moura", "Santa Luzia do Oeste", 
  "São Felipe do Oeste", "São Francisco do Guaporé", "São Miguel do Guaporé", 
  "Seringueiras ", "Teixeirópolis", "Vale do Anari", "Theobroma", "Urupá", 
  "Vale do Paraíso", "Vilhena "
];

const regex = /const ABAS = \[[\s\S]*?\.\.\.MUNICIPIOS_RO\.map\(m => \(\{ sheet: m, competencia: 'Municipal' \}\)\)\s*\];/;

let newAbas = `const ABAS = [\n      { sheet: 'estadual', competencia: 'Estadual' },\n`;
for(let m of exactSheetNames) {
  newAbas += `      { sheet: '${m}', competencia: 'Municipal' },\n`;
}
newAbas += `    ];`;

content = content.replace(regex, newAbas);

// I must also make sure I didn't leave SHEET_ID as 1V28gIVd from my earlier patch.
content = content.replace(/1V28gIVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08/g, '1V28gTVd_7DmroxXR6fF0vfHSl5sRtt9L6fr6tVnuz08');

fs.writeFileSync(file, content);
console.log('Patched ABAS');
