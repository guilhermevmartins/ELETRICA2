@echo off
setlocal
title Laboratorio Digital - servidor local

cd /d "%~dp0"

if not exist "%~dp0index.php" (
    echo Nao encontrei index.php na pasta deste arquivo:
    echo %~dp0
    echo Mantenha o BAT junto com index.php na pasta raiz do projeto.
    echo.
    pause
    exit /b 1
)

rem Permite informar manualmente o caminho do PHP antes de executar este BAT.
if defined PHP_EXE if exist "%PHP_EXE%" goto php_found

set "PHP_EXE="
if exist "%~dp0php\php.exe" set "PHP_EXE=%~dp0php\php.exe"
if not defined PHP_EXE if exist "%~dp0runtime\php\php.exe" set "PHP_EXE=%~dp0runtime\php\php.exe"
if not defined PHP_EXE if exist "%~dp0runtime\php.exe" set "PHP_EXE=%~dp0runtime\php.exe"
for /f "delims=" %%I in ('where.exe php.exe 2^>nul') do if not defined PHP_EXE set "PHP_EXE=%%I"

if not defined PHP_EXE if exist "%ProgramFiles%\PHP\php.exe" set "PHP_EXE=%ProgramFiles%\PHP\php.exe"
if not defined PHP_EXE if exist "%LOCALAPPDATA%\Programs\PHP\php.exe" set "PHP_EXE=%LOCALAPPDATA%\Programs\PHP\php.exe"
if not defined PHP_EXE if exist "C:\xampp\php\php.exe" set "PHP_EXE=C:\xampp\php\php.exe"
if not defined PHP_EXE if exist "C:\laragon\bin\php\php.exe" set "PHP_EXE=C:\laragon\bin\php\php.exe"

if not defined PHP_EXE for /d %%D in ("C:\laragon\bin\php\*") do if exist "%%~fD\php.exe" set "PHP_EXE=%%~fD\php.exe"

if not defined PHP_EXE (
    echo PHP nao foi encontrado. Baixando PHP 8.4 portatil para esta pasta...
    set "PHP_INSTALL_DIR=%~dp0runtime\php"
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $target=$env:PHP_INSTALL_DIR; $zip=Join-Path $env:TEMP ('php-' + [guid]::NewGuid().ToString('N') + '.zip'); try { New-Item -ItemType Directory -Path $target -Force | Out-Null; Invoke-WebRequest -UseBasicParsing -Uri 'https://downloads.php.net/~windows/releases/archives/php-8.4.26-nts-Win32-vs17-x64.zip' -OutFile $zip; $hash=(Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant(); if($hash -ne 'da68394f9193b7f6b89d0c76861a4034ae10efee7fd55a7255d8118c2acf70d7'){throw 'A verificacao SHA-256 do PHP falhou.'}; Expand-Archive -LiteralPath $zip -DestinationPath $target -Force } catch { Write-Error $_; exit 1 } finally { if(Test-Path -LiteralPath $zip){Remove-Item -LiteralPath $zip -Force -ErrorAction SilentlyContinue} }"
    if errorlevel 1 goto install_failed
    if not exist "%~dp0runtime\php\php.exe" goto install_failed
    set "PHP_EXE=%~dp0runtime\php\php.exe"
)

"%PHP_EXE%" -v >nul 2>&1
if errorlevel 1 goto install_failed

:php_found
echo Iniciando index.php em http://127.0.0.1:8000/index.php
echo Para encerrar o servidor, pressione Ctrl+C nesta janela.
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8000/index.php"
"%PHP_EXE%" -S 127.0.0.1:8000 -t "%~dp0"

endlocal
exit /b

:install_failed
echo.
echo Nao foi possivel instalar/iniciar o PHP automaticamente.
echo Verifique sua conexao com a internet e se o Windows possui o Microsoft Visual C++ Redistributable x64.
echo O download vem do site oficial do PHP e e validado por SHA-256 antes de extrair.
echo.
pause
endlocal
exit /b 1
