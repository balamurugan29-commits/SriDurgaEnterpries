$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Where-Object { $_.Subject -like "*Sri Durga Enterprises*" } | Select-Object -First 1
if (-not $cert) {
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=Sri Durga Enterprises, O=Sri Durga Enterprises, C=IN" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(10)
}

$exePath = "$PSScriptRoot\dist-desktop\Sri Durga Enterprises-win32-x64\Sri Durga Enterprises.exe"
if (Test-Path $exePath) {
    Set-AuthenticodeSignature -FilePath $exePath -Certificate $cert -HashAlgorithm SHA256
    Write-Host "Authenticode Signature applied to $exePath"
    Get-AuthenticodeSignature -FilePath $exePath | Format-List
} else {
    Write-Host "EXE not found at $exePath"
}
