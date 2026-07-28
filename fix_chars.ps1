$files = @('index.html', 'js\app.js')

$replacements = @{
    'MUNIC?PIOS' = 'MUNICÍPIOS'
    'ARTICULAǟO' = 'ARTICULAÇÃO'
    'Municpio' = 'Município'
    'Cd.Super' = 'Cód.Super'
    'N Processo' = 'Nº Processo'
    'Localizao' = 'Localização'
    'Localizaǜo' = 'Localização'
    'Endereo' = 'Endereço'
    'Matrculas' = 'Matrículas'
    'Aes' = 'Ações'
    'observaes' = 'observações'
    'especficas' = 'específicas'
    'Y?T?' = '📊'
}

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        $original = $content

        # Since PowerShell reads the broken UTF8 replacement char U+FFFD as , we use  in our map
        foreach ($key in $replacements.Keys) {
            $content = $content.Replace($key, $replacements[$key])
        }

        # Fix the pagination manually because the chars were super messed up
        $content = $content -replace 'Exibindo \$\{inicio \+ 1\}\$\{Math', 'Exibindo ${inicio + 1} a ${Math'
        $content = $content -replace '1050', '10 a 50'
        $content = $content -replace '\|', '&laquo;'
        $content = $content -replace '\|', '&raquo;'

        if ($content -cne $original) {
            [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
            Write-Host "Fixed $file"
        } else {
            Write-Host "No changes for $file"
        }
    }
}
