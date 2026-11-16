# We Can - Bu bilgisayara program olarak kurar (yonetici izni gerekmez).
# release\We-Can-<surum>-Windows klasorunu %LOCALAPPDATA%\Programs\We Can icine kopyalar,
# Masaustu ve Baslat menusu kisayollarini olusturur.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$ver = (Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json).version
$src = Join-Path $root "release\We-Can-$ver-Windows"
if (-not (Test-Path (Join-Path $src 'We Can.exe'))) { throw 'Hazir surum bulunamadi. Once paylasim paketi olusturulmali.' }

$target = Join-Path $env:LOCALAPPDATA 'Programs\We Can'
Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path -like "$target*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500
if (Test-Path $target) { Remove-Item $target -Recurse -Force }
New-Item -ItemType Directory -Force -Path $target | Out-Null
Write-Host 'Program dosyalari kopyalaniyor...'
Copy-Item (Join-Path $src '*') $target -Recurse -Force

$exe = Join-Path $target 'We Can.exe'
$ico = Join-Path $target 'We Can.ico'
$shell = New-Object -ComObject WScript.Shell
$places = @(
  [Environment]::GetFolderPath('Desktop'),
  [Environment]::GetFolderPath('Programs')
)
foreach ($dir in $places) {
  $lnk = $shell.CreateShortcut((Join-Path $dir 'We Can.lnk'))
  $lnk.TargetPath = $exe
  $lnk.WorkingDirectory = $target
  if (Test-Path $ico) { $lnk.IconLocation = $ico }
  $lnk.Description = 'We Can - Ingilizce ogren'
  $lnk.Save()
}
Write-Host ''
Write-Host "Kuruldu: $target"
Write-Host 'Masaustundeki "We Can" kisayoluyla acabilirsin.'
Start-Process $exe
