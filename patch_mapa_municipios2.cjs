const fs = require('fs');
let content = fs.readFileSync('js/mapa.js', 'utf8');

const target = '"Porto Velho": [-8.7540, -63.8860],';
const inject = `"Porto Velho": [-8.7540, -63.8860],
    "Alta Floresta do Oeste": [-11.9797, -61.9953],
    "Espigão do Oeste": [-11.5269, -61.0089],
    "Machadinho do Oeste": [-9.4439, -61.9819],
    "Nova Brasilândia do Oeste": [-11.7247, -62.3169],
    "Santa Luzia do Oeste": [-11.9022, -61.7825],
    "Alvorada do Oeste": [-11.3417, -62.2747],
    "Novo Horizonte do Oeste": [-11.7042, -61.9961],
    "São Felipe do Oeste": [-11.9028, -61.5033],
    "Guajará Mirim": [-10.7839, -65.3314],
    "Ji Paraná": [-10.8828, -61.9519],
    "Vilhena ": [-12.7406, -60.1458],
    "Seringueiras ": [-11.7703, -63.0286],
    "Rio  Crespo": [-9.7044, -62.9011],`;

if (content.includes(target)) {
  content = content.replace(target, inject);
  fs.writeFileSync('js/mapa.js', content);
  console.log('Aliases injected successfully!');
} else {
  console.log('Target not found!');
}
