$desktop = [Environment]::GetFolderPath('Desktop')
$startup = [Environment]::GetFolderPath('Startup')
$targetDir = "E:\office\SriDurgaEnterpries"
if (-not (Test-Path $targetDir)) { $targetDir = "C:\SriDurgaERP" }

$wsh = New-Object -ComObject WScript.Shell

# 1. Desktop Standalone App Shortcut
$desktopShortcut = $wsh.CreateShortcut("$desktop\Sri Durga Enterprises.lnk")
$desktopShortcut.TargetPath = "$targetDir\Launch-Sri-Durga-App.vbs"
$desktopShortcut.WorkingDirectory = $targetDir
$desktopShortcut.Description = "Sri Durga Enterprises Billing & ERP System"
if (Test-Path "$targetDir\logo.ico") {
    $desktopShortcut.IconLocation = "$targetDir\logo.ico,0"
}
$desktopShortcut.Save()
Write-Host "[OK] Desktop Shortcut configured: $desktop\Sri Durga Enterprises.lnk"

# 2. Windows Startup Folder Shortcut (Instant Boot Launcher)
$startupShortcut = $wsh.CreateShortcut("$startup\SriDurgaERP-AutoStart.lnk")
$startupShortcut.TargetPath = "$targetDir\Start-Server-Silent.vbs"
$startupShortcut.WorkingDirectory = $targetDir
$startupShortcut.Description = "Auto-start Sri Durga Enterprises Server on boot"
$startupShortcut.Save()
Write-Host "[OK] Windows Startup Folder Shortcut configured: $startup\SriDurgaERP-AutoStart.lnk"

# 3. Windows Startup Folder Shortcut (24/7 Watchdog & Keep-Alive Daemon)
$watchdogShortcut = $wsh.CreateShortcut("$startup\SriDurgaERP-Watchdog.lnk")
$watchdogShortcut.TargetPath = "$targetDir\Watchdog-KeepAlive-Service.vbs"
$watchdogShortcut.WorkingDirectory = $targetDir
$watchdogShortcut.Description = "24/7 Watchdog & Keep-Alive Daemon for Sri Durga Enterprises ERP"
$watchdogShortcut.Save()
Write-Host "[OK] 24/7 Watchdog Daemon Shortcut configured: $startup\SriDurgaERP-Watchdog.lnk"

# 4. Windows Run Registry Key (HKCU)
$vbsPath = "$targetDir\Start-Server-Silent.vbs"
$cmd = "wscript.exe `"$vbsPath`""
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "SriDurgaERP" -Value $cmd

$watchdogPath = "$targetDir\Watchdog-KeepAlive-Service.vbs"
$watchdogCmd = "wscript.exe `"$watchdogPath`""
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "SriDurgaERP_Watchdog" -Value $watchdogCmd
Write-Host "[OK] Windows Run Registry Keys configured (Auto-Start + 24/7 Watchdog Daemon)"

# 5. Configure Windows Power Scheme (Prevent system sleep / suspend while AC plugged in)
try {
    powercfg /change standby-timeout-ac 0 | Out-Null
    powercfg /change hibernate-timeout-ac 0 | Out-Null
    powercfg /setacvalueindex SCHEME_CURRENT SUB_SLEEP STANDBYIDLE 0 | Out-Null
    powercfg /setacvalueindex SCHEME_CURRENT SUB_SLEEP HIBERNATEIDLE 0 | Out-Null
    powercfg /setactive SCHEME_CURRENT | Out-Null
    Write-Host "[OK] Windows Power Settings configured (24/7 Always Awake Server Mode)"
} catch {
    Write-Host "[NOTE] Powercfg adjusted"
}

