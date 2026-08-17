$lines = Get-Content -Path .\js\escolas.js -Encoding UTF8

$lines[45] = "    if (typeof toast === 'function') toast('Escola não encontrada para edição', 'error');"
$lines[275] = "  `"Cujubim`", `"Espigão d'Oeste`", `"Governador Jorge Teixeira`", `"Guajará-Mirim`", `"Itapuã do Oeste`", "
$lines[277] = "  `"Nova Brasilândia d'Oeste`", `"Nova Mamoré`", `"Nova União`", `"Novo Horizonte do Oeste`", `"Ouro Preto do Oeste`", "
$lines[279] = "  `"Primavera de Rondônia`", `"Rio Crespo`", `"Rolim de Moura`", `"Santa Luzia d'Oeste`", `"São Felipe d'Oeste`", "
$lines[280] = "  `"São Francisco do Guaporé`", `"São Miguel do Guaporé`", `"Seringueiras`", `"Teixeirópolis`", `"Theobroma`", "

$lines[718] = "    toast('Escola não encontrada para edição', 'error');"
$lines[760] = "  if (titulo) titulo.innerHTML = '✏️ Editar Dados da Escola';"
$lines[766] = "  if (btn) btn.textContent = '💾 Salvar Alterações';"
$lines[841] = "    if (btn) { btn.disabled = false; btn.textContent = '💾 Salvar Alterações'; }"
$lines[846] = "  if (!confirm('Tem certeza que deseja excluir esta escola? Esta ação não pode ser desfeita.')) return;"
$lines[853] = "    toast('Escola excluída com sucesso!', 'success');"
$lines[905] = "    if (typeof toast === 'function') toast('Escola não encontrada para edição', 'error');"
$lines[937] = "    h += '<h2>Relatório de Escolas - SEDUC/RO (CAM)</h2>';"
$lines[948] = "    h += '<th class=`"num`">Nº</th>';"
$lines[949] = "    h += '<th>Competência</th>';"
$lines[951] = "    h += '<th>Município</th>';"
$lines[953] = "    h += '<th class=`"center`">Localização</th>';"
$lines[955] = "    h += '<th class=`"right`">Matrículas</th>';"
$lines[1004] = "    alert('Erro ao gerar relatório: ' + err.message);"

$lines | Set-Content -Path .\js\escolas.js -Encoding UTF8
