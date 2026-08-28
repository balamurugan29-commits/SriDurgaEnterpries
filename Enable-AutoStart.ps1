$desktop = [Environment]::GetFolderPath('Desktop')
$startup = [Environment]::GetFolderPath('Startup')
$targetDir = "E:\office\SriDurgaEnterpries"
if (-not (Test-Path $targetDir)) { $targetDir = "C:\SriDurgaERP" }

$wsh = New-Object -ComObject WScript.Shell

# 1. Desktop Shortcut
$desktopShortcut = $wsh.CreateShortcut("$desktop\Sri Durga ERP.lnk")
$desktopShortcut.TargetPath = "$targetDir\Start-Server-Silent.vbs"
$desktopShortcut.WorkingDirectory = $targetDir
$desktopShortcut.Description = "Sri Durga Enterprises ERP Server"
if (Test-Path "$targetDir\frontend\dist\assets\logo-CaCO9L5J.jpg") {
    $desktopShortcut.IconLocation = "$targetDir\frontend\dist\assets\logo-CaCO9L5J.jpg"
}
$desktopShortcut.Save()
Write-Host "Created Desktop Shortcut: $desktop\Sri Durga ERP.lnk"

# 2. Windows Startup Auto-Start
$startupShortcut = $wsh.CreateShortcut("$startup\SriDurgaERP-AutoStart.lnk")
$startupShortcut.TargetPath = "$targetDir\Start-Server-Silent.vbs"
$startupShortcut.WorkingDirectory = $targetDir
$startupShortcut.Description = "Auto-start Sri Durga Enterprises Server on boot"
$startupShortcut.Save()
Write-Host "Created Auto-Start Shortcut in Windows Startup: $startup\SriDurgaERP-AutoStart.lnk"
