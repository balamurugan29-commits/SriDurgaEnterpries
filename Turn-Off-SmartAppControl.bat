@echo off
title Sri Durga Enterprises - Turn Off Smart App Control
color 0A
echo ===============================================================================
echo     TURNING OFF WINDOWS 11 SMART APP CONTROL TO ALLOW SRI DURGA ENTERPRISES.EXE
echo ===============================================================================
echo.
echo Requesting Administrator permission to turn off Smart App Control...

powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -Command Set-ItemProperty -Path \"HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy\" -Name \"VerifiedAndReputablePolicyState\" -Value 0 -ErrorAction SilentlyContinue; Start-Process \"windowsdefender://smartappcontrol\"; Write-Host \"[OK] Smart App Control is turned OFF!\"; Start-Sleep -Seconds 3'"

echo.
echo ===============================================================================
echo  SUCCESS! SMART APP CONTROL IS NOW OFF. YOU CAN NOW DOUBLE-CLICK YOUR .EXE FILE!
echo ===============================================================================
timeout /t 3 >nul
exit /b 0
