@echo off
title Sri Durga Enterprises - Firewall Port Opener
echo ===============================================================================
echo       OPENING WINDOWS FIREWALL FOR MULTI-PC LAN SHARING (PORT 8085 & 5173)
echo ===============================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -Command netsh advfirewall firewall add rule name=\"Sri Durga Backend Server 8085\" dir=in action=allow protocol=TCP localport=8085; netsh advfirewall firewall add rule name=\"Sri Durga Frontend Server 5173\" dir=in action=allow protocol=TCP localport=5173; Write-Host \"Firewall ports 8085 & 5173 opened successfully!\"; Start-Sleep -Seconds 3'"

echo.
echo ===============================================================================
echo        FIREWALL RULES APPLIED! CLIENT PCs CAN NOW CONNECT SEAMLESSLY
echo ===============================================================================
timeout /t 3 >nul
exit /b 0
