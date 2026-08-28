@echo off
title Sri Durga Enterprises - Stop Server
color 0C

echo ===============================================================================
echo            SRI DURGA ENTERPRISES - STOP BACKGROUND SERVER
echo ===============================================================================
echo.

set "STOPPED=0"

:: 1. Find process listening on port 8085 and stop it
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8085" ^| findstr "LISTENING"') do (
    echo [INFO] Stopping process with PID %%a on port 8085...
    taskkill /F /PID %%a >nul 2>&1
    set "STOPPED=1"
)

:: 2. Stop Java backend processes if still running
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"CommandLine LIKE '%%sri-durga-backend%%'\" | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host \"[INFO] Stopped Backend Service PID: $($_.ProcessId)\" }" >nul 2>&1

echo.
if "%STOPPED%"=="1" (
    color 0A
    echo ===============================================================================
    echo   [SUCCESS] Sri Durga Enterprises Server has been STOPPED successfully!
    echo ===============================================================================
) else (
    color 0E
    echo ===============================================================================
    echo   [INFO] Server was not running or has already been stopped.
    echo ===============================================================================
)

echo.
timeout /t 3 >nul
exit /b 0
