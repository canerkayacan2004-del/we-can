@echo off
setlocal
title We Can - Kurulum
cd /d "%~dp0"
if exist "%~dp0scripts\node-env.bat" goto envok
echo [HATA] Zip'i once disari cikarin: zip'e sag tik ^> Tumunu ayikla.
pause
exit /b 1
:envok
call "%~dp0scripts\node-env.bat"
if errorlevel 1 goto fail
if exist "node_modules\electron\dist\electron.exe" goto build
echo Ilk kurulum: gerekli paketler indiriliyor, lutfen bekleyin...
call npm install --no-audit --no-fund
if errorlevel 1 goto fail
:build
echo We Can hazirlaniyor...
call node scripts\build.mjs --prod
if errorlevel 1 goto fail
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\make-portable.ps1"
if errorlevel 1 goto fail
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\install-local.ps1"
if errorlevel 1 goto fail
echo.
echo Tamamlandi. Masaustundeki "We Can" simgesiyle acabilirsin.
timeout /t 6 >nul
exit /b 0
:fail
echo.
echo [HATA] Kurulum tamamlanamadi. Yukaridaki mesaji Claude'a iletin.
pause
exit /b 1
