const fs = require('fs');
let content = fs.readFileSync('js/mapa.js', 'utf8');

content = content.replace(
  /_geocCache\[key\] = coord;\n\s*_geocSave\(\);\n\s*onDone\(coord\);\n\s*\} else \{\n\s*onDone\(null\);/g,
  `_geocCache[key] = coord;
            _geocSave();
            onDone(coord);
          } else {
            _geocCache[key] = 'NOT_FOUND';
            _geocSave();
            onDone(null);`
);

content = content.replace(
  /if \(_geocCache\[key\]\) \{ onDone\(_geocCache\[key\]\);/g,
  `if (_geocCache[key]) { onDone(_geocCache[key] === 'NOT_FOUND' ? null : _geocCache[key]);`
);

fs.writeFileSync('js/mapa.js', content);
console.log('Geocoder patched!');
