function _mapaNormalizarStr(str) {
    if (!str) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
}

console.log('1.', _mapaNormalizarStr("Alta Floresta d'Oeste "));
console.log('2.', _mapaNormalizarStr("Alta Floresta D'Oeste"));
console.log('3.', _mapaNormalizarStr("Alta Floresta"));
console.log('4.', _mapaNormalizarStr("Alta floresta do oeste"));
