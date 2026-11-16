@echo off
setlocal
title We Can
cd /d "%~dp0"

if exist "%~dp0scripts\node-env.bat" goto envok
echo.
echo [HATA] Dosyalar eksik. Zip'i once disari cikarin: zip'e sag tik ^> Tumunu ayikla.
echo Sonra cikan klasordeki We-Can-Baslat.bat dosyasini calistirin.
pause
exit /b 1
:envok

call "%~dp0scripts\node-env.bat"
if errorlevel 1 goto fail

if exist "node_modules\electron\dist\electron.exe" goto build
echo.
echo Ilk kurulum: gerekli paketler indiriliyor, yaklasik 150 MB.
echo Internet hizina gore birkac dakika surebilir. Lutfen pencereyi kapatma.
echo.
call npm install --no-audit --no-fund
if errorlevel 1 goto fail

:build
echo.
echo We Can hazirlaniyor...
call node scripts\build.mjs --prod
if errorlevel 1 goto fail
start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0."
exit /b 0

:fail
echo.
echo [HATA] We Can baslatilamadi. Yukaridaki mesaji Claude'a iletin.
pause
exit /b 1
