$file = ".\js\escolas.js"
$content = Get-Content $file -Raw

# Replace in _escolasRenderTabela
$content = $content -replace "return '<tr style=`"cursor:pointer;`" onclick=`"abrirModalEscola\(' \+ gi \+ '\)`" ondblclick=`"abrirFormEscola\(' \+ gi \+ '\)`" title=`"Clique para ver detalhes \| Duplo clique para editar`"' \+", "const idKey = e.codigoInep ? e.codigoInep : (e.id || gi);`r`n    return '<tr style=`"cursor:pointer;`" onclick=`"abrirModalEscola(\'' + idKey + '\')`" ondblclick=`"abrirFormEscolaByInepOrId(\'' + idKey + '\')`" title=`"Clique para ver detalhes | Duplo clique para editar`"' +"

$content = $content -replace "<button onclick=`"abrirFormEscola\(' \+ gi \+ '\)`" title=`"Editar Dados da Escola`"", "<button onclick=`"abrirFormEscolaByInepOrId(\'' + idKey + '\')`" title=`"Editar Dados da Escola`""

# Replace in abrirModalEscola
$content = $content -replace "function abrirModalEscola\(idx\) \{`r`n  const escola = _escolasFiltradas\[idx\];`r`n  if \(\!escola\) return;", "function abrirModalEscola(idOrInep) {`r`n  let escola = _escolasCache.find(e => String(e.codigoInep) === String(idOrInep) || String(e.id) === String(idOrInep));`r`n  if (!escola) escola = _escolasFiltradas[idOrInep];`r`n  if (!escola) return;"

# Also fix the button inside abrirModalEscola that calls abrirFormEscolaById
$content = $content -replace "abrirFormEscolaById\(\\'\'' \+ \(escola.id \|\| ''\) \+ '\\'\)", "abrirFormEscolaByInepOrId(\'' + (escola.codigoInep || escola.id || '') + '\')"

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Replaced successfully"
