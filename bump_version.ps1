# bump_version.ps1 — Regra de versão SiSCAM
# Padrão: .: SiSCAM v1.XXX :. (incrementa +1 delta a cada mudança)
param(
    [string]$CurrentNum = "124",
    [string]$NextNum = ""
)

if (-not $NextNum) {
    $NextNum = [string]([int]$CurrentNum + 1)
}

$oldTag = "∴ SiSCAM v1.$CurrentNum ∴"
$newTag = "∴ SiSCAM v1.$NextNum ∴"
$oldV = "v1.$CurrentNum"
$newV = "v1.$NextNum"

Write-Host "Atualizando versao de $oldTag para $newTag ..."

$targetFiles = @(
    "index.html",
    "planilha-google-form\public\index.html"
)

foreach ($rel in $targetFiles) {
    if (Test-Path $rel) {
        $content = [System.IO.File]::ReadAllText((Resolve-Path $rel), [System.Text.Encoding]::UTF8)
        $newContent = $content.Replace($oldTag, $newTag)
        $newContent = $newContent.Replace("?v=$oldV", "?v=$newV")
        $newContent = $newContent.Replace("SEDUC-CLI [$oldV]", "SEDUC-CLI [$newV]")
        [System.IO.File]::WriteAllText((Resolve-Path $rel), $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "OK $rel"
    }
}

$pkgPath = "planilha-google-form\package.json"
if (Test-Path $pkgPath) {
    $pkg = [System.IO.File]::ReadAllText((Resolve-Path $pkgPath), [System.Text.Encoding]::UTF8)
    $pkg = $pkg -replace '"version":\s*"1\.\d+"', "`"version`": `"1.$NextNum`""
    [System.IO.File]::WriteAllText((Resolve-Path $pkgPath), $pkg, [System.Text.Encoding]::UTF8)
    Write-Host "OK $pkgPath"
}

Write-Host "Versao atualizada com sucesso para $newTag"
