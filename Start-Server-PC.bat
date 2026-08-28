@echo off
title Sri Durga Enterprises - Central Server PC Launcher
color 0A
echo ===============================================================================
echo                 SRI DURGA ENTERPRISES - CENTRAL SERVER PC
echo ===============================================================================
echo.
echo [1/3] Detecting Local Network IP Address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set "LOCAL_IP=%%a"
    goto :found_ip
)
:found_ip
set "LOCAL_IP=%LOCAL_IP: =%"
echo       Server Local IP : http://%LOCAL_IP%:8085
echo.
echo [2/3] Preparing Central Backend Service and Database...
echo       Central Database: Microsoft SQL Server / Local Embedded DB
echo       Central Port    : 8085
echo.
echo [3/3] Launching Sri Durga Server Service...
echo.
echo ===============================================================================
echo   SHARE THIS ADDRESS WITH CLIENT COMPUTERS (PC2, PC3, PC4...):
echo   http://%LOCAL_IP%:8085/api
echo ===============================================================================
echo.
cd /d "%~dp0backend"
if exist ".\mvnw.cmd" (
    call .\mvnw.cmd spring-boot:run
) else (
    echo [ERROR] Maven wrapper not found!
    pause
)
