@echo off
title Sri Durga Enterprises Desktop
cd /d "%~dp0"

:: Start frontend dev/preview server if not running
set "PORT_CHECK="
netstat -ano | findstr ":5173" >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Sri Durga Enterprises local server...
    start /min "" cmd /c "cd /d \"%~dp0frontend\" && npm.cmd run dev"
    timeout /t 2 /nobreak >nul
)

:: Launch Native Windows Desktop App Window (No browser bars, full desktop app mode)
set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE_PATH%" set "EDGE_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE_PATH%" (
    start "" "%EDGE_PATH%" --app="http://localhost:5173" --window-size=1440,900 --user-data-dir="%LOCALAPPDATA%\SriDurgaDesktopApp"
) else (
    start "" "http://localhost:5173"
)
