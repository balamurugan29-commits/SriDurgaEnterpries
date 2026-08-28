$loginBody = @{ userId = 'admin'; password = 'admin123' } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri 'http://localhost:8085/api/auth/login' -Method Post -Body $loginBody -ContentType 'application/json'
$token = $loginRes.token
Write-Host "Admin Login Token: $token"

$headers = @{ Authorization = "Bearer $token" }

# 1. Summary
$summary = Invoke-RestMethod -Uri 'http://localhost:8085/api/database/summary' -Method Get -Headers $headers
Write-Host "Database Summary:" ($summary | ConvertTo-Json)

# 2. Download backup
$backup = Invoke-RestMethod -Uri 'http://localhost:8085/api/database/download' -Method Get -Headers $headers
Write-Host "Backup App: $($backup.app), Version: $($backup.version)"
Write-Host "Export Counts:" ($backup.counts | ConvertTo-Json)

# 3. Restore backup
$backupJson = $backup | ConvertTo-Json -Depth 20
$restoreRes = Invoke-RestMethod -Uri 'http://localhost:8085/api/database/restore' -Method Post -Body $backupJson -ContentType 'application/json' -Headers $headers
Write-Host "Restore Result:" ($restoreRes | ConvertTo-Json)
