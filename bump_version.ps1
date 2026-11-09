# bump_version.ps1 — Regra de versão SiSCAM
# Padrão: ∴ SiSCAM v1.XXX ∴ (incrementa +1 delta a cada mudança)
param(
    [string]$CurrentNum = "127",
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
    "cadastro.html",
    "planilha-google-form\public\index.html",
    "planilha-google-form\public\cadastro.html"
)

foreach ($rel in $targetFiles) {
    if (Test-Path $rel) {
        $content = [System.IO.File]::ReadAllText((Resolve-Path $rel), [System.Text.Encoding]::UTF8)
        $newContent = $content.Replace($oldTag, $newTag)
        # Também cobrir caso cadastro.html estivesse em v1.126
        $newContent = $newContent.Replace("∴ SiSCAM v1.126 ∴", $newTag)
        $newContent = $newContent.Replace("?v=$oldV", "?v=$newV")
        $newContent = $newContent.Replace("?v=1.126", "?v=$newV")
        $newContent = $newContent.Replace("?v=1.127", "?v=$newV")
        $newContent = $newContent.Replace("SEDUC-CLI [$oldV]", "SEDUC-CLI [$newV]")
        $newContent = $newContent.Replace("SEDUC-CLI [v1.126]", "SEDUC-CLI [$newV]")
        $newContent = $newContent.Replace(">v1.$CurrentNum<", ">v1.$NextNum<")
        $newContent = $newContent.Replace(">v1.126<", ">v1.$NextNum<")
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

