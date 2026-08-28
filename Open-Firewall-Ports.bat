@echo off
title Sri Durga Enterprises - Firewall Rule and Port Configuration
echo ===============================================================================
echo      WHITELISTING JAVA AND OPENING FIREWALL PORTS (PORT 8085, 5173)
echo ===============================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -Command & { Write-Host \"Configuring Windows Defender Firewall rules for Sri Durga ERP...\"; netsh advfirewall firewall delete rule name=\"Sri Durga ERP Java Server\" >$null 2>&1; netsh advfirewall firewall delete rule name=\"Sri Durga Backend Server 8085\" >$null 2>&1; netsh advfirewall firewall delete rule name=\"Sri Durga Frontend Server 5173\" >$null 2>&1; netsh advfirewall firewall add rule name=\"Sri Durga Backend Server 8085\" dir=in action=allow protocol=TCP localport=8085 profile=any enable=yes; netsh advfirewall firewall add rule name=\"Sri Durga Frontend Server 5173\" dir=in action=allow protocol=TCP localport=5173 profile=any enable=yes; if (Test-Path \"E:\office\jdk-17\bin\java.exe\") { netsh advfirewall firewall add rule name=\"Sri Durga ERP Java Server (E:)\" dir=in action=allow program=\"E:\office\jdk-17\bin\java.exe\" enable=yes profile=any }; if (Test-Path \"E:\office\jdk-17\bin\javaw.exe\") { netsh advfirewall firewall add rule name=\"Sri Durga ERP JavaW Server (E:)\" dir=in action=allow program=\"E:\office\jdk-17\bin\javaw.exe\" enable=yes profile=any }; if (Test-Path \"C:\SriDurgaERP\jdk-17\bin\java.exe\") { netsh advfirewall firewall add rule name=\"Sri Durga ERP Java Server (C:)\" dir=in action=allow program=\"C:\SriDurgaERP\jdk-17\bin\java.exe\" enable=yes profile=any }; Write-Host \"[SUCCESS] All Firewall and Java rules applied permanently! Windows will no longer ask for permission on restart.\"; Start-Sleep -Seconds 3 }'"

echo.
echo ===============================================================================
echo        FIREWALL RULES APPLIED! CLIENT PCs CAN NOW CONNECT SEAMLESSLY
echo ===============================================================================
timeout /t 3 >nul
exit /b 0

