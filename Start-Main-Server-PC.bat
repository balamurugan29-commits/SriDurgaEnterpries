@echo off
title Sri Durga Enterprises - Main Server PC Launcher
color 0A
echo ===============================================================================
echo            SRI DURGA ENTERPRISES - CENTRAL MAIN SERVER PC
echo ===============================================================================
echo.

:: Get Local IPv4 Address
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0.*0.0.0.0 ^| findstr /v "Default"') do set "LOCAL_IP=%%a" & goto :found_ip
:found_ip

echo [STATUS] Main Central Server is running on:
echo          ==================================================
echo          SERVER IP ADDRESS : 192.168.1.39 (or %LOCAL_IP%)
echo          BACKEND API PORT  : 8085
echo          FRONTEND WEB PORT : 5173
echo          ==================================================
echo.

:: Start Spring Boot Backend if not running
netstat -ano | findstr ":8085" >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Central Backend Database Server...
    start /min "" cmd /c "cd /d \"%~dp0backend\" && mvnw.cmd spring-boot:run"
) else (
    echo [OK] Central Backend Database is ACTIVE on Port 8085.
)

:: Start Frontend LAN Dev Server if not running
netstat -ano | findstr ":5173" >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Frontend Network Server...
    start /min "" cmd /c "cd /d \"%~dp0frontend\" && npm.cmd run dev"
) else (
    echo [OK] Frontend Network Server is ACTIVE on Port 5173.
)

echo.
echo Launching Main Server Desktop Application...
start "" "%~dp0Launch-Sri-Durga-App.vbs"

echo.
echo ===============================================================================
echo   MAIN SERVER IS READY! CLIENT PCs CAN NOW CONNECT TO: http://192.168.1.39:8085
echo ===============================================================================
pause
