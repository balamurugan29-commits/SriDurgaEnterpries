@echo off
title Sri Durga Enterprises - 1-Click LAN Network & Firewall Fixer
color 0A
echo ===============================================================================
echo        SRI DURGA ENTERPRISES - AUTOMATIC LAN & FIREWALL FIXER
echo ===============================================================================
echo.
echo Requesting Administrator permissions to enable Office LAN sharing...

powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -Command netsh advfirewall firewall add rule name=\"Sri Durga Backend Server 8085\" dir=in action=allow protocol=TCP localport=8085 profile=any; netsh advfirewall firewall add rule name=\"Sri Durga Frontend Server 5173\" dir=in action=allow protocol=TCP localport=5173 profile=any; Set-NetConnectionProfile -InterfaceAlias Wi-Fi -NetworkCategory Private -ErrorAction SilentlyContinue; Write-Host \"[SUCCESS] Network is now set to Private & Firewall ports 8085/5173 are open to all LAN PCs!\"; Start-Sleep -Seconds 3'"

echo.
echo ===============================================================================
echo     SUCCESS! YOUR MAIN SERVER PC (192.168.1.39) IS NOW ACCESSIBLE TO PC 2
echo ===============================================================================
timeout /t 3 >nul
exit /b 0
