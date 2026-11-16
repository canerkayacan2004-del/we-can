@echo off
setlocal
title We Can - Paylasim paketi olusturuluyor
cd /d "%~dp0"

call "%~dp0scripts\node-env.bat"
if errorlevel 1 goto fail

if exist "node_modules\electron\dist\electron.exe" goto build
call npm install --no-audit --no-fund
if errorlevel 1 goto fail

:build
echo.
echo Arayuz derleniyor...
call node scripts\build.mjs --prod
if errorlevel 1 goto fail

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\make-portable.ps1"
if errorlevel 1 goto fail
echo.
echo Bu zip dosyasini arkadaslariniza gonderebilirsiniz. Acmak icin hicbir kurulum gerekmez.
explorer "%~dp0release"
pause
exit /b 0

:fail
echo.
echo [HATA] Paylasim paketi olusturulamadi. Yukaridaki mesaji Claude'a iletin.
pause
exit /b 1
