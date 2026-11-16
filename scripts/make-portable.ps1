# We Can - Paylasilabilir (tasinabilir) Windows surumu olusturur.
# Internet GEREKMEZ: bu bilgisayardaki Electron ve derlenmis arayuz kullanilir.
# Cikti: release\We-Can-<surum>-Windows.zip  (icinde "We Can.exe")
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$root = Split-Path -Parent $PSScriptRoot
$pkg = Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json
$ver = $pkg.version

$electronDist = Join-Path $root 'node_modules\electron\dist'
if (-not (Test-Path (Join-Path $electronDist 'electron.exe'))) {
  throw 'Electron bulunamadi. Once We-Can-Baslat.bat dosyasini bir kez calistirin.'
}
if (-not (Test-Path (Join-Path $root 'apps\desktop\dist\index.html'))) {
  throw 'Arayuz derlenmemis. Once We-Can-Baslat.bat dosyasini bir kez calistirin.'
}

$outRoot = Join-Path $root 'release'
$name = "We-Can-$ver-Windows"
$out = Join-Path $outRoot $name
$zip = Join-Path $outRoot "$name.zip"
New-Item -ItemType Directory -Force -Path $outRoot | Out-Null
if (Test-Path $out) { Remove-Item $out -Recurse -Force }
if (Test-Path $zip) { Remove-Item $zip -Force }

Write-Host '1/4  Uygulama motoru kopyalaniyor...'
New-Item -ItemType Directory -Force -Path $out | Out-Null
Copy-Item (Join-Path $electronDist '*') $out -Recurse -Force
Rename-Item (Join-Path $out 'electron.exe') 'We Can.exe'
Copy-Item (Join-Path $root 'apps\desktop\build\icon.ico') (Join-Path $out 'We Can.ico') -Force

Write-Host '2/4  We Can dosyalari ekleniyor...'
$res = Join-Path $out 'resources'
Remove-Item (Join-Path $res 'default_app.asar') -Force -ErrorAction SilentlyContinue
$app = Join-Path $res 'app'
$desk = Join-Path $app 'apps\desktop'
New-Item -ItemType Directory -Force -Path (Join-Path $desk 'build') | Out-Null
Copy-Item (Join-Path $root 'apps\desktop\electron') (Join-Path $desk 'electron') -Recurse -Force
Copy-Item (Join-Path $root 'apps\desktop\dist') (Join-Path $desk 'dist') -Recurse -Force
Copy-Item (Join-Path $root 'apps\desktop\build\icon.png') (Join-Path $desk 'build\icon.png') -Force
$appPkg = [ordered]@{
  name    = 'we-can'
  version = $ver
  description = 'We Can - Ingilizce ogrenme uygulamasi'
  main    = 'apps/desktop/electron/main.cjs'
}
($appPkg | ConvertTo-Json) | Set-Content -Encoding ASCII (Join-Path $app 'package.json')

Write-Host '3/4  Kullanim notu yaziliyor...'
$note = @"
WE CAN $ver - NASIL ACILIR?

1) Bu klasoru zip'ten CIKARIN (zip'e sag tik > Tumunu ayikla).
   Zip'in icinden dogrudan calistirmayin.
2) "We Can.exe" dosyasina cift tiklayin.
3) Windows "Windows kisisel bilgisayarinizi korudu" uyarisi verirse:
   "Ek bilgi" > "Yine de calistir". (Uygulama henuz dijital imzali degil.)

Internet veya ek kurulum gerekmez. Hesabiniz ve ilerlemeniz bu bilgisayarda saklanir.
Kolay erisim icin "We Can.exe" uzerine sag tik > Gonder > Masaustu (kisayol olustur).
"@
Set-Content -Encoding UTF8 (Join-Path $out 'NASIL-ACILIR.txt') $note

Write-Host '4/4  Zip olusturuluyor (1-2 dakika surebilir)...'
Compress-Archive -Path $out -DestinationPath $zip -CompressionLevel Optimal
$mb = [math]::Round((Get-Item $zip).Length / 1MB)
Write-Host ''
Write-Host "Hazir: $zip  ($mb MB)"
