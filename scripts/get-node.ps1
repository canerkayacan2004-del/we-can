# We Can - Node.js'i bilgisayara KURMADAN, yalnizca bu klasore (.runtime\node) indirir.
# Kaynak: nodejs.org resmi sitesi. Indirilen dosya SHA256 ile dogrulanir.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root = Split-Path -Parent $PSScriptRoot
$runtime = Join-Path $root '.runtime'
$target = Join-Path $runtime 'node'
if (Test-Path (Join-Path $target 'node.exe')) { exit 0 }
New-Item -ItemType Directory -Force -Path $runtime | Out-Null

Write-Host 'Node.js surum listesi aliniyor (nodejs.org)...'
$index = Invoke-RestMethod -UseBasicParsing 'https://nodejs.org/dist/index.json'
$release = $index | Where-Object { $_.lts -and ($_.files -contains 'win-x64-zip') } | Select-Object -First 1
if (-not $release) { throw 'Uygun Node.js surumu bulunamadi.' }
$ver = $release.version
$name = "node-$ver-win-x64"
$zip = Join-Path $runtime "$name.zip"

Write-Host "Node.js $ver indiriliyor (yaklasik 30 MB)..."
Invoke-WebRequest -UseBasicParsing "https://nodejs.org/dist/$ver/$name.zip" -OutFile $zip

Write-Host 'Dosya dogrulaniyor (SHA256)...'
$sums = (Invoke-WebRequest -UseBasicParsing "https://nodejs.org/dist/$ver/SHASUMS256.txt").Content
if ($sums -is [byte[]]) { $sums = [System.Text.Encoding]::UTF8.GetString($sums) }
$line = ($sums -split "`n") | ForEach-Object { $_.Trim() } | Where-Object { $_ -match ("\s" + [regex]::Escape("$name.zip") + "$") } | Select-Object -First 1
if (-not $line) { throw 'Dogrulama bilgisi bulunamadi.' }
$expected = ($line -split '\s+')[0].ToLower()
$actual = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLower()
if ($expected -ne $actual) { Remove-Item $zip -Force; throw 'Indirilen dosya dogrulanamadi (SHA256 uyusmuyor).' }

Write-Host 'Aciliyor...'
$extracted = Join-Path $runtime $name
if (Test-Path $extracted) { Remove-Item $extracted -Recurse -Force }
Expand-Archive -Path $zip -DestinationPath $runtime -Force
if (Test-Path $target) { Remove-Item $target -Recurse -Force }
Rename-Item $extracted 'node'
Remove-Item $zip -Force
Write-Host "Node.js $ver hazir."
