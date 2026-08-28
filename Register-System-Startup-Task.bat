@echo off
title Sri Durga Enterprises - Auto-Start & System Services Setup
color 0B

echo ===============================================================================
echo      SRI DURGA ENTERPRISES - COMPLETE SYSTEM AUTO-START REGISTRATION
echo ===============================================================================
echo.
echo Configuring auto-start for:
echo   1. Background Server (Spring Boot + Embedded Tomcat)
echo   2. Frontend Web Application (React 19 SPA)
echo   3. Embedded High-Performance Database (H2)
echo   4. Windows Defender Firewall (Port 8085 LAN Access)
echo   5. Automatic Daily Database Backup Task
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -Command & { Set-Location \"E:\office\SriDurgaEnterpries\"; powershell -ExecutionPolicy Bypass -File .\Enable-AutoStart.ps1; netsh advfirewall firewall delete rule name=\"Sri Durga Backend Server 8085\" >$null 2>&1; netsh advfirewall firewall add rule name=\"Sri Durga Backend Server 8085\" dir=in action=allow protocol=TCP localport=8085 profile=any enable=yes; Write-Host \"\"; Write-Host \"[SUCCESS] All System Services and Auto-Start tasks registered permanently!\" -ForegroundColor Green; Start-Sleep -Seconds 4 }'"

echo.
echo ===============================================================================
echo   Setup initiated. Please accept the Windows UAC Administrator prompt if shown.
echo ===============================================================================
timeout /t 3 >nul
exit /b 0
