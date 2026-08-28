@echo off
title Sri Durga Enterprises - Ultra-Lightweight Production Server
color 0A

echo ===============================================================================
echo            SRI DURGA ENTERPRISES - CENTRAL PRODUCTION SERVER
echo                   (Ultra-Low Memory Mode: 250MB RAM)
echo ===============================================================================
echo.

:: Get Local IPv4 Address
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0.*0.0.0.0 ^| findstr /v "Default"') do set "LOCAL_IP=%%a" & goto :found_ip
:found_ip

echo [STATUS] Main Server is starting...
echo          ============================================================
echo          LOCAL SERVER URL  : http://localhost:8085
echo          STAFF LAN ACCESS  : http://%LOCAL_IP%:8085
echo          EMBEDDED DATABASE : Active (High-Performance H2 File DB)
echo          ============================================================
echo.
echo Staff members on the office Wi-Fi can open: http://%LOCAL_IP%:8085
echo.

:: Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH! Please install Java 17.
    pause
    exit /b 1
)

:: Launch JAR with constrained memory
cd /d "%~dp0backend"
if exist "target\sri-durga-backend-1.0.0.jar" (
    java -Xms64m -Xmx256m -XX:+UseSerialGC -jar target\sri-durga-backend-1.0.0.jar
) else (
    echo [ERROR] Application JAR not found in backend\target!
    echo Please run Build-Production-App.bat first.
    pause
)
