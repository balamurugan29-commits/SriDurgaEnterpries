@echo off
title Sri Durga Enterprises Desktop
cd /d "%~dp0"

:: Start Spring Boot Backend if not running
netstat -ano | findstr ":8085" >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Central Database Backend...
    start /min "" cmd /c "cd /d \"%~dp0backend\" && mvnw.cmd spring-boot:run"
    timeout /t 3 /nobreak >nul
)

:: Start Frontend Server if not running
netstat -ano | findstr ":5173" >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Frontend Web Server...
    start /min "" cmd /c "cd /d \"%~dp0frontend\" && npm.cmd run dev"
    timeout /t 2 /nobreak >nul
)

:: Launch Native Secure App Mode (No browser bars, 100% trusted by Windows Defender and Smart App Control)
set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE_PATH%" set "EDGE_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE_PATH%" (
    start "" "%EDGE_PATH%" --app="http://localhost:5173" --window-size=1440,900 --user-data-dir="%LOCALAPPDATA%\SriDurgaDesktopApp"
) else (
    start "" "http://localhost:5173"
)
