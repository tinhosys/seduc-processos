import os
import re

file_path = './js/escolas.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the parsing function
parse_pattern = re.compile(r'function _parseRowEstadual\(row\) \{.*?return \{.*?\};\s*\}', re.DOTALL)
parse_replacement = """function _parseRowEstadual(row) {
  if (!row.c || row.c.length === 0) return null;
  const val = (idx) => (row.c[idx] && row.c[idx].v !== null) ? String(row.c[idx].v).trim() : '';
  if (val(0).toUpperCase() === 'MUNICÍPIO/DISTRITO' || val(0).toUpperCase() === 'MUNICÍPIO') return null;
  if (!val(1)) return null; 
  
  return {
    id: 'est_' + Math.random().toString(36).substr(2,9),
    competencia: 'Estadual',
    codigoSuper: val(10),
    super: val(10),
    municipio: val(0),
    codigoInep: val(4),
    nome: val(1),
    localidade: val(26),
    localizacao: val(26),
    endereco: val(5),
    complemento: val(7),
    bairro: val(6),
    cep: val(8),
    totalMatricula: parseInt(val(2)) || 0,
    alunos: parseInt(val(2)) || 0,
    salas: parseInt(val(18)) || 0,
    diretor: val(14),
    secretario: val(16),
    contatoDiretor: val(15),
    contatoSecretario: val(17),
    telefone: val(12),
    email: val(13),
    redesSociais: val(11),
    modalidade: '',
    modalidades: []
  };
}"""

content = parse_pattern.sub(parse_replacement, content)

fix_map = {
  "IndÃ­gena": "Indígena",
  "âœ ï¸ ": "✏️",
  "ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦": "...",
  "PAGINAÃ‡ÃƒO": "PAGINAÇÃO",
  "NÃƒÂ£o informado": "Não informado",
  "LocalizaÃƒÂ§ÃƒÂ£o": "Localização",
  "CÃƒÂ³digo INEP": "Código INEP",
  "MunicÃƒÂ­pio": "Município",
  "CompetÃƒÂªncia": "Competência",
  "RondÃƒÂ´nia": "Rondônia",
  "MUNICÃƒÆ’Ã‚Â PIO": "MUNICÍPIO",
  "MUNICÃƒÆ’Ã¢â‚¬Å“PIO": "MUNICÍPIO",
  "CÃƒÆ’Ã¢â‚¬Å“DIGO SUPER": "CÓDIGO SUPER",
  "ediÃƒÂ§ÃƒÂ£o": "edição",
  "nÃƒÂ£o": "não",
  "AÃƒÂ§ÃƒÂµes": "Ações",
  "ÃƒÂ°Ã…Â¸Ã‚Â Ã‚Â«": "🏫",
  "Ã°Å¸â€œÂ": "📍",
  "RelatÃƒÂ³rio": "Relatório",
  "Relatǟrio": "Relatório",
  "ediǟǟo": "edição",
  "nǟo": "não",
  "Aǟǟes": "Ações",
  "PAGINAǟǟO": "PAGINAÇÃO",
  "?": "📋"
}

for bad, good in fix_map.items():
    content = content.replace(bad, good)

# In case some mapping wasn't complete
content = content.replace('Ã§Ã£', 'çã').replace('Ãµ', 'õ').replace('Ã³', 'ó').replace('Ã­', 'í')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed successfully via Python")
