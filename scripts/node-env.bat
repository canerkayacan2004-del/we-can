@echo off
rem We Can - Node.js ortamini hazirlar. Diger .bat dosyalari tarafindan cagrilir.
rem Bilgisayarda Node.js 20 veya ustu varsa onu kullanir; yoksa klasore tasinabilir surum indirir.
set "NODE_DIR=%~dp0..\.runtime\node"
where node >nul 2>nul || goto portable
for /f "tokens=1 delims=." %%v in ('node -v') do set "WC_NODEV=%%v"
set "WC_NODEV=%WC_NODEV:v=%"
if %WC_NODEV% GEQ 20 exit /b 0
:portable
if exist "%NODE_DIR%\node.exe" goto useportable
echo.
echo We Can icin Node.js gerekiyor. Bilgisayara kurulmayacak; yalnizca bu klasore indirilecek.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0get-node.ps1"
if errorlevel 1 exit /b 1
:useportable
set "PATH=%NODE_DIR%;%PATH%"
exit /b 0
