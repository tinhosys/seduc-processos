$file = ".\js\escolas.js"
$content = Get-Content $file -Raw

$content = $content -replace "colo      'Indígena'", "color: '#22d3ee', border: 'rgba(6,182,212,0.3)' },`r`n      'Rural':  { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },`r`n      'Indígena'"
$content = $content -replace "</td>' \+play:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba\(139,92,246,0\.3\);`">âœ ï¸  Editar</button>' \+`r`n        '</div>' \+`r`n      '</td>' \+", ""

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "Replaced successfully"
