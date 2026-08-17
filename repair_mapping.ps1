$file = ".\js\escolas.js"
$content = Get-Content $file -Raw

$patternParse = "(?s)function _parseRowEstadual\(row\) \{.*?return \{.*?\};\s*\}"
$replacementParse = @"
function _parseRowEstadual(row) {
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
}
"@

$newContent = [regex]::Replace($content, $patternParse, $replacementParse)

# Fix encoding issues in the table rendering
$newContent = $newContent -replace "IndÃ­gena", "Indígena"
$newContent = $newContent -replace "âœ ï¸ ", "✏️"

# Fix page encoding issues if they got mangled (e.g., in paginacao, relatorio)
$newContent = $newContent -replace "ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦", "..."
$newContent = $newContent -replace "PAGINAÃ‡ÃƒO", "PAGINAÇÃO"
$newContent = $newContent -replace "NÃƒÂ£o informado", "Não informado"
$newContent = $newContent -replace "LocalizaÃƒÂ§ÃƒÂ£o", "Localização"
$newContent = $newContent -replace "CÃƒÂ³digo INEP", "Código INEP"
$newContent = $newContent -replace "MunicÃƒÂ­pio", "Município"
$newContent = $newContent -replace "CompetÃƒÂªncia", "Competência"
$newContent = $newContent -replace "RondÃƒÂ´nia", "Rondônia"
$newContent = $newContent -replace "MUNICÃƒÆ’Ã‚Â PIO", "MUNICÍPIO"
$newContent = $newContent -replace "ediÃƒÂ§ÃƒÂ£o", "edição"
$newContent = $newContent -replace "nÃƒÂ£o", "não"

Set-Content -Path $file -Value $newContent -Encoding UTF8
Write-Host "Replaced mapping and encodings successfully"
