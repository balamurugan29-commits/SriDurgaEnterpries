@echo off
title Sri Durga Enterprises - Client PC Application
color 0B
echo ===============================================================================
echo            SRI DURGA ENTERPRISES - CLIENT PC DESKTOP APP
echo ===============================================================================
echo.

set "MAIN_SERVER_IP=192.168.1.39"

echo Connecting to Main Central Server PC at: http://%MAIN_SERVER_IP%:8085 ...
echo.

:: Launch Native Desktop Window connected to Main Server PC
set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE_PATH%" set "EDGE_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE_PATH%" (
    start "" "%EDGE_PATH%" --app="http://%MAIN_SERVER_IP%:5173" --window-size=1440,900 --user-data-dir="%LOCALAPPDATA%\SriDurgaClientApp"
) else (
    start "" "http://%MAIN_SERVER_IP%:5173"
)

echo [OK] Client Desktop Application Launched!
timeout /t 3 >nul
exit /b 0
