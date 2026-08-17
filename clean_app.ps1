$lines = Get-Content -Path .\js\app.js -Encoding UTF8
$newLines = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($i -ge 3509 -and $i -le 3654) {
        continue
    }
    $newLines += $lines[$i]
}
$newLines | Set-Content -Path .\js\app.js -Encoding UTF8
