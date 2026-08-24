const a = "Alta Floresta d'Oeste".normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/d'oeste/ig, "do oeste").replace(/['\\\-]/g, "").replace(/\s+/g, "").toLowerCase();
const b = "ALTA FLORESTA DO OESTE".normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/d'oeste/ig, "do oeste").replace(/['\\\-]/g, "").replace(/\s+/g, "").toLowerCase();
console.log(a === b, a, b);
