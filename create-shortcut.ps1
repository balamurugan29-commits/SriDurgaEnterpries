$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath 'Sri Durga Enterprises.lnk'
$targetExe = "$PSScriptRoot\Launch-Sri-Durga-App.vbs"
$workingDir = "$PSScriptRoot"

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetExe
$shortcut.WorkingDirectory = $workingDir
$shortcut.Description = "Sri Durga Enterprises Billing & ERP System"
$shortcut.IconLocation = "$PSScriptRoot\frontend\public\logo.jpg"
$shortcut.Save()

Write-Host "Desktop shortcut created at: $shortcutPath"
