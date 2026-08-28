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

# 2. Windows Startup Folder Shortcut
$startupShortcut = $wsh.CreateShortcut("$startup\SriDurgaERP-AutoStart.lnk")
$startupShortcut.TargetPath = "$targetDir\Start-Server-Silent.vbs"
$startupShortcut.WorkingDirectory = $targetDir
$startupShortcut.Description = "Auto-start Sri Durga Enterprises Server on boot"
$startupShortcut.Save()
Write-Host "[OK] Windows Startup Folder Shortcut configured: $startup\SriDurgaERP-AutoStart.lnk"

# 3. Windows Run Registry
$vbsPath = "$targetDir\Start-Server-Silent.vbs"
$cmd = "wscript.exe `"$vbsPath`""
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "SriDurgaERP" -Value $cmd
Write-Host "[OK] Windows Run Registry Key configured: HKCU\...\Run\SriDurgaERP"

# 4. Windows Task Scheduler (Guaranteed trigger on login)
$taskCmd = "wscript.exe `"$targetDir\Start-Server-Silent.vbs`""
$schRes = schtasks /create /tn "SriDurgaERP_AutoStart" /tr $taskCmd /sc onlogon /f 2>&1
Write-Host "[OK] Windows Task Scheduler Task configured: SriDurgaERP_AutoStart"
