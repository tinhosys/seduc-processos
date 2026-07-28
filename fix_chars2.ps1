$files = @('index.html', 'js\app.js')

$brokenChar = [char]0xFFFD
$c = $brokenChar

$replacements = @{
    "MUNIC${c}PIOS" = "MUNICÍPIOS"
    "ARTICULA${c}O" = "ARTICULAÇÃO"
    "Munic${c}pio" = "Município"
    "Localiza${c}o" = "Localização"
    "Endere${c}o" = "Endereço"
    "C${c}d.Super" = "Cód.Super"
    "N${c} Processo" = "Nº Processo"
    "Matr${c}culas" = "Matrículas"
    "A${c}es" = "Ações"
    "observa${c}es" = "observações"
    "espec${c}ficas" = "específicas"
    "Exibindo `$"{inicio + 1}`}${c}`$"{Math" = "Exibindo `"{inicio + 1} a `"{Math"
    "${c}ltima" = "Última"
    "Pr${c}xima" = "Próxima"
    "Anterior" = "Anterior"
    "Usu${c}rio" = "Usuário"
    "P${c}gina" = "Página"
    "S${c}o" = "São"
    "N${c}o" = "Não"
    "exclu${c}-lo!" = "excluí-lo!"
    "ATEN${c}O" = "ATENÇÃO"
    " irrevers${c}vel" = "é irreversível"
    "10${c}50" = "10 a 50"
}

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        $original = $content

        foreach ($key in $replacements.Keys) {
            $content = $content.Replace($key, $replacements[$key])
        }

        # More robust replacements for pagination symbols if they got corrupted
        $content = $content -replace "õç\|", "&laquo;"
        $content = $content -replace "\|õç", "&raquo;"
        $content = $content -replace "$c$c$c\|", "&laquo;"
        $content = $content -replace "\|$c$c$c", "&raquo;"
        $content = $content -replace "${c}Y\?T${c}", "📊" # specific emoji fix

        if ($content -cne $original) {
            [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
            Write-Host "Fixed $file"
        } else {
            Write-Host "No changes for $file"
        }
    }
}
