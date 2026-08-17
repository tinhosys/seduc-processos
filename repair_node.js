const fs = require('fs');

let content = fs.readFileSync('./js/escolas.js', 'utf8');

const replacements = [
  ["Escola nÃ£o encontrada para ediÃ§Ã£o", "Escola não encontrada para edição"],
  ["âœ✨ Nova Escola", "✨ Nova Escola"],
  ["âœ¨ Nova Escola", "✨ Nova Escola"],
  ["ðŸ’¾ Salvar Nova Escola", "💾 Salvar Nova Escola"],
  ["âœ ï¸  Editar Cadastro da Escola", "✏️ Editar Cadastro da Escola"],
  ["ðŸ’¾ Salvar AlteraÃ§Ãµes", "💾 Salvar Alterações"],
  ["Alto ParaÃ­so", "Alto Paraíso"],
  ["CacaulÃ¢ndia", "Cacaulândia"],
  ["Campo Novo de RondÃ´nia", "Campo Novo de Rondônia"],
  ["EspigÃ£o d'Oeste", "Espigão d'Oeste"],
  ["GuajarÃ¡-Mirim", "Guajará-Mirim"],
  ["ItapuÃ£ do Oeste", "Itapuã do Oeste"],
  ["Ji-ParanÃ¡", "Ji-Paraná"],
  ["Nova BrasilÃ¢ndia d'Oeste", "Nova Brasilândia d'Oeste"],
  ["Nova MamorÃ©", "Nova Mamoré"],
  ["Nova UniÃ£o", "Nova União"],
  ["Presidente MÃ©dici", "Presidente Médici"],
  ["Primavera de RondÃ´nia", "Primavera de Rondônia"],
  ["SÃ£o Felipe d'Oeste", "São Felipe d'Oeste"],
  ["SÃ£o Francisco do GuaporÃ©", "São Francisco do Guaporé"],
  ["SÃ£o Miguel do GuaporÃ©", "São Miguel do Guaporé"],
  ["TeixeirÃ³polis", "Teixeirópolis"],
  ["UrupÃ¡", "Urupá"],
  ["Vale do ParaÃ­so", "Vale do Paraíso"],
  ["MUNICÃ PIO", "MUNICÍPIO"],
  ["MUNICÃ\x8dPIO", "MUNICÍPIO"],
  ["MUNIC?PIO", "MUNICÍPIO"],
  ["MUNICÃ?PIO", "MUNICÍPIO"],
  ["â ³ Carregando...", "⏳ Carregando..."],
  ["â ³ Carregando Estadual...", "⏳ Carregando Estadual..."],
  ["â ³ Carregando Municipal", "⏳ Carregando Municipal"],
  ["â Œ Erro ao carregar escolas", "❌ Erro ao carregar escolas"],
  ["ðŸ «", "🏫"],
  ["ðŸŽ“", "🎓"],
  ["ðŸ“š", "📚"],
  ["IndÃ­gena", "Indígena"],
  ["âœ ï¸  Editar", "✏️ Editar"],
  ["PAGINAÃ‡ÃƒO", "PAGINAÇÃO"],
  ["â–¶", "▶"],
  ["â—€", "◀"],
  ["✏️ Editar Dados da Escola", "✏️ Editar Dados da Escola"],
  ["Esta aÃ§Ã£o nÃ£o pode ser desfeita", "Esta ação não pode ser desfeita"],
  ["Escola excluÃ­da com sucesso!", "Escola excluída com sucesso!"],
  ["RelatÃ³rio de Escolas", "Relatório de Escolas"],
  ["CompetÃªncia", "Competência"],
  ["MunicÃ­pio", "Município"],
  ["LocalizaÃ§Ã£o", "Localização"],
  ["MatrÃ­culas", "Matrículas"],
  ["NÂº", "Nº"],
  ["Escola n\u01fco encontrada para edi\u01fco", "Escola não encontrada para edição"],
  ["Escola exclu\u00edda com sucesso!", "Escola excluída com sucesso!"]
];

for (const [oldStr, newStr] of replacements) {
  content = content.split(oldStr).join(newStr);
}

fs.writeFileSync('./js/escolas.js', content, 'utf8');
console.log("Done replacing strings in escolas.js");
