# ==============================================================================
# SRI DURGA ENTERPRISES ERP - AUTOMATED TEST SUITE
# ==============================================================================

$baseUrl = "http://localhost:8085"
$passed = 0
$failed = 0
$total = 0

function Assert-Test($testName, $condition, $details = "") {
    $global:total++
    if ($condition) {
        $global:passed++
        Write-Host "  [PASS] $testName" -ForegroundColor Green
    } else {
        $global:failed++
        Write-Host "  [FAIL] $testName - $details" -ForegroundColor Red
    }
}

Write-Host "==============================================================================="
Write-Host "        RUNNING COMPREHENSIVE END-TO-END TEST SUITE FOR SRI DURGA ERP         "
Write-Host "==============================================================================="
Write-Host "Target Server: $baseUrl"
Write-Host ""

# ------------------------------------------------------------------------------
# 1. SERVER HEALTH & STATIC ASSETS
# ------------------------------------------------------------------------------
Write-Host "--- MODULE 1: Health & Static Assets ---" -ForegroundColor Cyan
try {
    $ping = Invoke-RestMethod -Uri "$baseUrl/api/auth/ping"
    Assert-Test "API Health Check (/api/auth/ping)" ($ping.status -eq "UP") "Status: $($ping.status)"
} catch {
    Assert-Test "API Health Check (/api/auth/ping)" $false $_.Exception.Message
}

try {
    $resHtml = Invoke-WebRequest -Uri "$baseUrl/" -UseBasicParsing
    Assert-Test "Frontend SPA Root (GET /)" ($resHtml.StatusCode -eq 200 -and $resHtml.Content.Contains("root"))
} catch {
    Assert-Test "Frontend SPA Root (GET /)" $false $_.Exception.Message
}

try {
    $resIco = Invoke-WebRequest -Uri "$baseUrl/favicon.ico" -UseBasicParsing
    Assert-Test "Favicon Icon (GET /favicon.ico)" ($resIco.StatusCode -eq 200 -and $resIco.RawContentLength -gt 0)
} catch {
    Assert-Test "Favicon Icon (GET /favicon.ico)" $false $_.Exception.Message
}

try {
    $resLogo = Invoke-WebRequest -Uri "$baseUrl/logo.jpg" -UseBasicParsing
    Assert-Test "Brand Logo (GET /logo.jpg)" ($resLogo.StatusCode -eq 200 -and $resLogo.RawContentLength -gt 0)
} catch {
    Assert-Test "Brand Logo (GET /logo.jpg)" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# 2. AUTHENTICATION & SECURITY
# ------------------------------------------------------------------------------
Write-Host "`n--- MODULE 2: Authentication & Security ---" -ForegroundColor Cyan
$adminToken = ""
$staffToken = ""

# Test Admin Login
try {
    $body = @{ userId = "admin"; password = "admin123" } | ConvertTo-Json
    $adminAuth = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    $adminToken = $adminAuth.token
    Assert-Test "Admin Login (admin / admin123)" ($adminAuth.role -eq "ADMIN" -and $adminToken.Length -gt 20) "Role: $($adminAuth.role)"
} catch {
    Assert-Test "Admin Login (admin / admin123)" $false $_.Exception.Message
}

# Test Staff Login
try {
    $body = @{ userId = "staff"; password = "staff123" } | ConvertTo-Json
    $staffAuth = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    $staffToken = $staffAuth.token
    Assert-Test "Staff Login (staff / staff123)" ($staffAuth.role -eq "STAFF" -and $staffToken.Length -gt 20) "Role: $($staffAuth.role)"
} catch {
    Assert-Test "Staff Login (staff / staff123)" $false $_.Exception.Message
}

# Test Invalid Credentials Rejection
try {
    $body = @{ userId = "admin"; password = "wrong_password" } | ConvertTo-Json
    $failAuth = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    Assert-Test "Invalid Password Rejection" $false "Should have failed with 401"
} catch {
    Assert-Test "Invalid Password Rejection" ($_.Exception.Message.Contains("401") -or $_.Exception.Message.Contains("Unauthorized"))
}

# Test Unauthorized Access Without Token
try {
    $unauth = Invoke-RestMethod -Uri "$baseUrl/api/items"
    Assert-Test "Unauthenticated Request Blocked" $false "Should have failed with 401/403"
} catch {
    Assert-Test "Unauthenticated Request Blocked" ($_.Exception.Message.Contains("403") -or $_.Exception.Message.Contains("401"))
}

$adminHeaders = @{ 
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

# ------------------------------------------------------------------------------
# 3. CUSTOMER MASTER CRUD
# ------------------------------------------------------------------------------
Write-Host "`n--- MODULE 3: Customer Master CRUD ---" -ForegroundColor Cyan
$testCustId = $null
try {
    $custs = Invoke-RestMethod -Uri "$baseUrl/api/customers" -Headers $adminHeaders
    Assert-Test "Fetch Customer Catalog" ($custs -ne $null) "Count: $($custs.Count)"
    
    # Create Test Customer
    $newCustBody = @{
        serialNumber = 99
        customerName = "Automated Test Client Ltd"
        gstin = "34AAACT0000A1Z5"
        pan = "AAACT0000A"
        stateCode = "PUDUCHERRY (34)"
        phone = "9876543210"
        address = "123 Industrial Area, Karaikal"
    } | ConvertTo-Json
    
    $createdCust = Invoke-RestMethod -Uri "$baseUrl/api/customers" -Method Post -Headers $adminHeaders -Body $newCustBody
    $testCustId = $createdCust.id
    Assert-Test "Create Customer Master" ($createdCust.customerName -eq "Automated Test Client Ltd" -and $testCustId -gt 0) "ID: $testCustId"
    
    # Update Customer
    $updCustBody = @{
        serialNumber = 99
        customerName = "Automated Test Client Ltd (Updated)"
        gstin = "34AAACT0000A1Z5"
        pan = "AAACT0000A"
        stateCode = "PUDUCHERRY (34)"
        phone = "9876543210"
        address = "123 Industrial Area, Karaikal"
    } | ConvertTo-Json
    $updatedCust = Invoke-RestMethod -Uri "$baseUrl/api/customers/$testCustId" -Method Put -Headers $adminHeaders -Body $updCustBody
    Assert-Test "Update Customer Master" ($updatedCust.customerName.Contains("Updated"))
    
    # Clean up test customer
    Invoke-RestMethod -Uri "$baseUrl/api/customers/$testCustId" -Method Delete -Headers $adminHeaders | Out-Null
    Assert-Test "Delete Test Customer" $true
} catch {
    Assert-Test "Customer Master Operations" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# 3B. COMPANY DETAILS MASTER PROFILE
# ------------------------------------------------------------------------------
Write-Host "`n--- MODULE 3B: Company Details Master ---" -ForegroundColor Cyan
try {
    $comp = Invoke-RestMethod -Uri "$baseUrl/api/company-details" -Method Get -Headers $adminHeaders
    Assert-Test "Fetch Company Details Profile" ($comp.companyName -ne $null -and $comp.gstin -ne $null) "Company: $($comp.companyName) | GST: $($comp.gstin)"

    $saveCompBody = @{
        companyName = "SRI DURGA ENTERPRISES"
        address = "No. 10 V.G. Nagar, Kovilpathu, Karaikal - 609 602"
        phone = "9842492946"
        email = "sridurgaenterprises@yahoo.com"
        gstin = "34ABDFS4476N1ZN"
        pan = "ABDFS4476N"
        state = "Puducherry (34)"
        epfCode = "PC 1758"
        esiCode = "55000426770000602"
        bankName = "Indian Overseas Bank"
        branch = "Karaikal Main Branch"
        accountNumber = "015402000001234"
        ifscCode = "IOBA0000154"
    } | ConvertTo-Json

    $savedComp = Invoke-RestMethod -Uri "$baseUrl/api/company-details" -Method Post -Headers $adminHeaders -Body $saveCompBody
    Assert-Test "Save and Update Company Details" ($savedComp.bankName -eq "Indian Overseas Bank" -and $savedComp.accountNumber -eq "015402000001234") "Bank: $($savedComp.bankName) | A/C: $($savedComp.accountNumber)"
} catch {
    Assert-Test "Company Details Master Operations" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# 3C. TOTAL DATABASE BACKUP & RESTORE
# ------------------------------------------------------------------------------
Write-Host "`n--- MODULE 3C: Database Backup & Restore ---" -ForegroundColor Cyan
try {
    # 1. Download Backup
    $backupData = Invoke-RestMethod -Uri "$baseUrl/api/database/download" -Method Get -Headers $adminHeaders
    Assert-Test "Download Total Database Backup" ($backupData.app -ne $null -and $backupData.counts -ne $null) "App: $($backupData.app) | Version: $($backupData.version)"

    # 2. Restore Database via JSON Payload
    $restoreJsonRes = Invoke-RestMethod -Uri "$baseUrl/api/database/restore" -Method Post -Headers $adminHeaders -Body ($backupData | ConvertTo-Json -Depth 10) -ContentType "application/json"
    Assert-Test "Restore Database via JSON Payload" ($restoreJsonRes.success -eq $true) "$($restoreJsonRes.message)"

    # 3. Restore Database via Multipart File Upload
    $tmpFile = [System.IO.Path]::GetTempFileName() + ".json"
    $backupData | ConvertTo-Json -Depth 10 | Set-Content -Path $tmpFile
    $tmpBytes = [System.IO.File]::ReadAllBytes($tmpFile)
    $boundaryStr = [System.Guid]::NewGuid().ToString()
    $crlf = "`r`n"
    $multipartBody = (
        "--$boundaryStr",
        "Content-Disposition: form-data; name=`"file`"; filename=`"test_backup.json`"",
        "Content-Type: application/json$crlf",
        [System.Text.Encoding]::UTF8.GetString($tmpBytes),
        "--$boundaryStr--$crlf"
    ) -join $crlf
    $uploadRestoreRes = Invoke-RestMethod -Uri "$baseUrl/api/database/upload-restore" -Method Post -Headers @{ Authorization = "Bearer $($adminAuth.token)" } -ContentType "multipart/form-data; boundary=$boundaryStr" -Body $multipartBody
    Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue
    Assert-Test "Upload & Restore Database via File Upload" ($uploadRestoreRes.success -eq $true) "$($uploadRestoreRes.message)"
} catch {
    Assert-Test "Database Backup & Restore Operations" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# 4. ITEM MASTER CRUD & AUTO-CALCULATIONS
# ------------------------------------------------------------------------------
Write-Host "`n--- MODULE 4: Item Master & Auto-Calculations ---" -ForegroundColor Cyan
$testItemId = $null
$testItem1Id = $null
$testItem2Id = $null
try {
    $newItemBody = @{
        serialNumber = 101
        itemCode = "TEST-101"
        description = "Test 3-Phase Contactor 45A"
        quantity = 5.0
        unit = "Nos"
        rate = 2500.00
        serviceCharge = 500.00
        folderName = "General"
    } | ConvertTo-Json
    
    $createdItem = Invoke-RestMethod -Uri "$baseUrl/api/items" -Method Post -Headers $adminHeaders -Body $newItemBody
    $testItemId = $createdItem.id
    # Amount is (rate + serviceCharge) * quantity = (2500 + 500) * 5 = 15000.00
    $expectedAmount = 15000.00
    Assert-Test "Create Item & Auto-Calculate Amount" ($createdItem.amount -eq $expectedAmount -and $testItemId -gt 0) "Calculated Amount: $($createdItem.amount)"
    
    # Test Folder-Scoped Duplicate Rule: Same code 'TEST-FOLDER-1' in 'General' and 'RC4'
    $item1Body = @{
        serialNumber = 102
        itemCode = "TEST-FOLDER-1"
        description = "Item in General folder"
        quantity = 1.0
        unit = "No"
        rate = 100.00
        serviceCharge = 0.00
        folderName = "General"
    } | ConvertTo-Json
    $item1 = Invoke-RestMethod -Uri "$baseUrl/api/items" -Method Post -Headers $adminHeaders -Body $item1Body
    $testItem1Id = $item1.id

    $item2Body = @{
        serialNumber = 103
        itemCode = "TEST-FOLDER-1"
        description = "Item with same code in RC4 folder"
        quantity = 2.0
        unit = "No"
        rate = 200.00
        serviceCharge = 0.00
        folderName = "RC4"
    } | ConvertTo-Json
    $item2 = Invoke-RestMethod -Uri "$baseUrl/api/items" -Method Post -Headers $adminHeaders -Body $item2Body
    $testItem2Id = $item2.id

    Assert-Test "Same Item Code in Different Folders Allowed" ($testItem1Id -gt 0 -and $testItem2Id -gt 0) "General ID: $testItem1Id, RC4 ID: $testItem2Id"

    # Clean up test items
    if ($testItemId) { Invoke-RestMethod -Uri "$baseUrl/api/items/$testItemId" -Method Delete -Headers $adminHeaders | Out-Null }
    if ($testItem1Id) { Invoke-RestMethod -Uri "$baseUrl/api/items/$testItem1Id" -Method Delete -Headers $adminHeaders | Out-Null }
    if ($testItem2Id) { Invoke-RestMethod -Uri "$baseUrl/api/items/$testItem2Id" -Method Delete -Headers $adminHeaders | Out-Null }
    Assert-Test "Delete Test Items" $true
} catch {
    Assert-Test "Item Master Operations" $false $_.Exception.Message
    if ($testItemId) { try { Invoke-RestMethod -Uri "$baseUrl/api/items/$testItemId" -Method Delete -Headers $adminHeaders | Out-Null } catch {} }
    if ($testItem1Id) { try { Invoke-RestMethod -Uri "$baseUrl/api/items/$testItem1Id" -Method Delete -Headers $adminHeaders | Out-Null } catch {} }
    if ($testItem2Id) { try { Invoke-RestMethod -Uri "$baseUrl/api/items/$testItem2Id" -Method Delete -Headers $adminHeaders | Out-Null } catch {} }
}

# ------------------------------------------------------------------------------
# 5. DELIVERY CHALLAN / TAX INVOICE
# ------------------------------------------------------------------------------
Write-Host "`n--- MODULE 5: Delivery Challan / Tax Invoicing ---" -ForegroundColor Cyan
$testDcId = $null
try {
    $newDcBody = @{
        challanNumber = "DC-TEST-901"
        challanDate = "2026-08-28"
        customerName = "M/s Ocean Sparkle Ltd"
        deliveryAddress = "Karaikal Port"
        items = @(
            @{
                serialNumber = 1
                itemCode = "DC-ITEM-1"
                description = "Rewinding of 15HP Motor"
                quantity = 1
                unit = "Job"
                rate = 7500.00
                serviceCharge = 0.00
                amount = 7500.00
            }
        )
    } | ConvertTo-Json -Depth 5
    
    $createdDc = Invoke-RestMethod -Uri "$baseUrl/api/challans" -Method Post -Headers $adminHeaders -Body $newDcBody
    $testDcId = $createdDc.id
    Assert-Test "Create Delivery Challan (Tax Invoice)" ($createdDc.challanNumber -eq "DC-TEST-901" -and $testDcId -gt 0) "ID: $testDcId"
    
    # Clean up
    Invoke-RestMethod -Uri "$baseUrl/api/challans/$testDcId" -Method Delete -Headers $adminHeaders | Out-Null
    Assert-Test "Delete Test Delivery Challan" $true
} catch {
    Assert-Test "Delivery Challan Operations" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# 6. PROFORMA INVOICE
# ------------------------------------------------------------------------------
Write-Host "`n--- MODULE 6: Proforma Invoice ---" -ForegroundColor Cyan
$testPiId = $null
try {
    $newPiBody = @{
        proformaNumber = "PI-TEST-801"
        proformaDate = "2026-08-28"
        customerName = "M/s Ocean Sparkle Ltd"
        items = @(
            @{
                serialNumber = 1
                itemCode = "PI-ITEM-1"
                description = "Supply & Installation of LED Floodlights 150W"
                quantity = 4
                unit = "No"
                rate = 3200.00
                amount = 12800.00
            }
        )
    } | ConvertTo-Json -Depth 5
    
    $createdPi = Invoke-RestMethod -Uri "$baseUrl/api/proforma-invoices" -Method Post -Headers $adminHeaders -Body $newPiBody
    $testPiId = $createdPi.id
    Assert-Test "Create Proforma Invoice" ($createdPi.proformaNumber -eq "PI-TEST-801" -and $testPiId -gt 0) "ID: $testPiId"
    
    # Clean up
    Invoke-RestMethod -Uri "$baseUrl/api/proforma-invoices/$testPiId" -Method Delete -Headers $adminHeaders | Out-Null
    Assert-Test "Delete Test Proforma Invoice" $true
} catch {
    Assert-Test "Proforma Invoice Operations" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# 7. JOB CARD MODULE
# ------------------------------------------------------------------------------
Write-Host "`n--- MODULE 7: Job Card Workflow ---" -ForegroundColor Cyan
$testJcId = $null
try {
    $newJcBody = @{
        jobNo = "JC-TEST-701"
        jobDate = "2026-08-28"
        customerName = "M/s Ocean Sparkle Ltd"
        equipment = "Induction Motor 30HP"
        make = "Siemens"
        slNo = "SIM-998822"
        volt = "415V"
        current = "42A"
    } | ConvertTo-Json
    
    $createdJc = Invoke-RestMethod -Uri "$baseUrl/api/job-cards" -Method Post -Headers $adminHeaders -Body $newJcBody
    $testJcId = $createdJc.id
    Assert-Test "Create Job Card" ($createdJc.jobNo -eq "JC-TEST-701" -and $testJcId -gt 0) "ID: $testJcId"
    
    # Clean up
    Invoke-RestMethod -Uri "$baseUrl/api/job-cards/$testJcId" -Method Delete -Headers $adminHeaders | Out-Null
    Assert-Test "Delete Test Job Card" $true
} catch {
    Assert-Test "Job Card Operations" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# 8. GATE PASS MODULE
# ------------------------------------------------------------------------------
Write-Host "`n--- MODULE 8: Gate Pass Workflow ---" -ForegroundColor Cyan
$testGpId = $null
try {
    $newGpBody = @{
        gatePassNo = "GP-TEST-601"
        gatePassDate = "2026-08-28"
        receiverName = "Karaikal Port Gate Security"
        siteName = "Karaikal Port Jetty"
        passType = "OUT"
        items = @()
    } | ConvertTo-Json
    
    $createdGp = Invoke-RestMethod -Uri "$baseUrl/api/gate-passes" -Method Post -Headers $adminHeaders -Body $newGpBody
    $testGpId = $createdGp.id
    Assert-Test "Create Gate Pass" ($createdGp.gatePassNo -eq "GP-TEST-601" -and $testGpId -gt 0) "ID: $testGpId"
    
    # Clean up
    Invoke-RestMethod -Uri "$baseUrl/api/gate-passes/$testGpId" -Method Delete -Headers $adminHeaders | Out-Null
    Assert-Test "Delete Test Gate Pass" $true
} catch {
    Assert-Test "Gate Pass Operations" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# 9. WORK COMPLETION CERTIFICATE
# ------------------------------------------------------------------------------
Write-Host "`n--- MODULE 9: Work Completion Certificate ---" -ForegroundColor Cyan
$testWcId = $null
try {
    $newWcBody = @{
        certificateNo = "WCC-TEST-501"
        completionDate = "2026-08-28"
        customerName = "M/s Ocean Sparkle Ltd"
        workDescription = "Complete Rewinding, Varnish baking, and Dynamic Balancing of 30HP Motor"
        contractNo = "PO/OSL/2026/88"
    } | ConvertTo-Json
    
    $createdWc = Invoke-RestMethod -Uri "$baseUrl/api/work-completion-certificates" -Method Post -Headers $adminHeaders -Body $newWcBody
    $testWcId = $createdWc.id
    Assert-Test "Create Work Completion Certificate" ($createdWc.certificateNo -eq "WCC-TEST-501" -and $testWcId -gt 0) "ID: $testWcId"
    
    # Clean up
    Invoke-RestMethod -Uri "$baseUrl/api/work-completion-certificates/$testWcId" -Method Delete -Headers $adminHeaders | Out-Null
    Assert-Test "Delete Test Work Completion Certificate" $true
} catch {
    Assert-Test "Work Completion Operations" $false $_.Exception.Message
}

# ------------------------------------------------------------------------------
# 10. SYSTEM CONFIGURATION & AUTO-START VERIFICATION
# ------------------------------------------------------------------------------
Write-Host "`n--- MODULE 10: Auto-Start & Launcher Verification ---" -ForegroundColor Cyan

# Test 1: Windows Registry Run Key
$reg = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "SriDurgaERP" -ErrorAction SilentlyContinue
Assert-Test "Windows Auto-Start Registry Key (HKCU\Run)" ($reg.SriDurgaERP -ne $null -and $reg.SriDurgaERP.Contains("Start-Server-Silent.vbs"))

# Test 2: Windows Startup Folder Shortcut
$startupFolder = [Environment]::GetFolderPath('Startup')
$startupShortcut = Get-ChildItem -Path $startupFolder -Filter "*SriDurga*" -ErrorAction SilentlyContinue
Assert-Test "Windows Startup Folder Shortcut ($startupFolder)" ($startupShortcut -ne $null)

# Test 3: Portable Java 17 Runtime
$javaExists = (Test-Path "E:\office\jdk-17\bin\java.exe") -or (Test-Path "C:\SriDurgaERP\jdk-17\bin\java.exe")
$javawExists = (Test-Path "E:\office\jdk-17\bin\javaw.exe") -or (Test-Path "C:\SriDurgaERP\jdk-17\bin\javaw.exe")
Assert-Test "Bundled Portable Java 17 Runtime (java.exe & javaw.exe)" ($javaExists -and $javawExists)

# Test 4: Production Packaged Executable JAR
$jarExists = (Test-Path "E:\office\SriDurgaEnterpries\backend\target\sri-durga-backend-1.0.0.jar") -or (Test-Path "C:\SriDurgaERP\backend\target\sri-durga-backend-1.0.0.jar")
Assert-Test "Production Executable JAR (sri-durga-backend-1.0.0.jar)" $jarExists

# Test 5: Desktop Application Launch Shortcut
$desktop = [Environment]::GetFolderPath('Desktop')
$desktopShortcutExists = (Test-Path "$desktop\Sri Durga Enterprises.lnk") -or (Test-Path ([Environment]::GetFolderPath('UserProfile') + "\Desktop\Sri Durga Enterprises.lnk")) -or (Test-Path "C:\Users\Admin\OneDrive\Desktop\Sri Durga Enterprises.lnk")
Assert-Test "Desktop Application Shortcut (Sri Durga Enterprises.lnk)" $desktopShortcutExists

# Test 6: Silent Background Launcher VBS Script
$vbsScript = Test-Path "E:\office\SriDurgaEnterpries\Start-Server-Silent.vbs"
Assert-Test "Silent VBS Background Launcher (Start-Server-Silent.vbs)" $vbsScript

# Test 7: Desktop Windowed App Launcher BAT Script
$batScript = Test-Path "E:\office\SriDurgaEnterpries\Sri-Durga-Enterprises-App.bat"
Assert-Test "Native Desktop App Wrapper (Sri-Durga-Enterprises-App.bat)" $batScript

# Test 8: Auto-Start Re-arm Script
$enableScript = Test-Path "E:\office\SriDurgaEnterpries\Enable-AutoStart.ps1"
Assert-Test "Auto-Start Setup & Re-arm Script (Enable-AutoStart.ps1)" $enableScript

# Test 9: 24/7 Watchdog Keep-Alive Daemon Script
$watchdogScript = Test-Path "E:\office\SriDurgaEnterpries\Watchdog-KeepAlive-Service.vbs"
Assert-Test "24/7 Watchdog Keep-Alive Daemon Script (Watchdog-KeepAlive-Service.vbs)" $watchdogScript

# Test 10: Watchdog Windows Registry Key
$watchdogReg = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "SriDurgaERP_Watchdog" -ErrorAction SilentlyContinue
Assert-Test "Watchdog Registry Key (HKCU\Run\SriDurgaERP_Watchdog)" ($watchdogReg.SriDurgaERP_Watchdog -ne $null)


# ==============================================================================
# SUMMARY REPORT
# ==============================================================================
Write-Host "`n==============================================================================="
Write-Host "                             TEST RESULTS SUMMARY                              "
Write-Host "==============================================================================="
$failColor = if ($global:failed -eq 0) { "Green" } else { "Red" }
Write-Host "Total Tests Run : $global:total"
Write-Host "Passed          : $global:passed" -ForegroundColor Green
Write-Host "Failed          : $global:failed" -ForegroundColor $failColor
Write-Host "Pass Rate       : $([math]::Round(($global:passed / $global:total) * 100, 2))%"
Write-Host "==============================================================================="
