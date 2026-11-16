@echo off
setlocal
title We Can - Kurulum dosyasi olusturuluyor
cd /d "%~dp0"

call "%~dp0scripts\node-env.bat"
if errorlevel 1 goto fail

if exist "node_modules\electron\dist\electron.exe" goto dist
call npm install --no-audit --no-fund
if errorlevel 1 goto fail

:dist
echo.
echo Windows kurulum dosyasi .exe olusturuluyor. Bu islem birkac dakika surebilir...
echo.
call npm run dist
if errorlevel 1 goto fail
echo.
echo Tamamlandi. Kurulum dosyasi "release" klasorunde: We Can Setup ... .exe
echo Bu dosyayi baskalariyla paylasabilirsiniz.
explorer "%~dp0release"
pause
exit /b 0

:fail
echo.
echo [HATA] Kurulum dosyasi olusturulamadi. Yukaridaki mesaji Claude'a iletin.
pause
exit /b 1
