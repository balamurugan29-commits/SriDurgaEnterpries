@echo off
title Sri Durga Enterprises - Disable Auto-Start
color 0E

echo ===============================================================================
echo      SRI DURGA ENTERPRISES - REMOVE AUTO-START & BACKGROUND SERVICES
echo ===============================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "& {
    Write-Host '1. Removing Windows Registry Auto-Start...' -ForegroundColor Yellow
    Remove-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'SriDurgaERP' -ErrorAction SilentlyContinue
    Write-Host '   [OK] Registry entry removed.' -ForegroundColor Green

    Write-Host '2. Removing User Startup Folder shortcut...' -ForegroundColor Yellow
    $userStartup = [Environment]::GetFolderPath('Startup')
    $shortcut = Join-Path $userStartup 'SriDurgaERP-AutoStart.lnk'
    if (Test-Path $shortcut) { Remove-Item -Force $shortcut }
    Write-Host '   [OK] Startup folder shortcut removed.' -ForegroundColor Green

    Write-Host '3. Unregistering Scheduled Tasks...' -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName 'SriDurgaERP-Server' -Confirm:$false -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName 'SriDurgaERP-DailyBackup' -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host '   [OK] Scheduled Tasks unregistered.' -ForegroundColor Green

    Write-Host ''
    Write-Host '===============================================================================' -ForegroundColor Green
    Write-Host '   [SUCCESS] Auto-start on boot has been completely DISABLED!' -ForegroundColor Green
    Write-Host '===============================================================================' -ForegroundColor Green
    Start-Sleep -Seconds 3
}"

exit /b 0
