$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Where-Object { $_.Subject -like "*Sri Durga Enterprises*" } | Select-Object -First 1
if (-not $cert) {
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=Sri Durga Enterprises, O=Sri Durga Enterprises, C=IN" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(10)
}
Export-Certificate -Cert $cert -FilePath "$PSScriptRoot\SriDurgaEnterprises.cer" -Force
Write-Host "SriDurgaEnterprises.cer exported successfully!"
