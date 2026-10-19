# Creates a release keystore for Google Play (keep the file + passwords safe offline).
# Usage (from repo root):
#   powershell -ExecutionPolicy Bypass -File scripts\create-android-keystore.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$keystore = Join-Path $root 'mobile-release.keystore'
$props = Join-Path $root 'android\keystore.properties'

if (Test-Path $keystore) {
  Write-Host "Keystore already exists: $keystore"
  exit 0
}

$keytool = Get-Command keytool -ErrorAction SilentlyContinue
if (-not $keytool) {
  Write-Host "keytool not found. Install Android Studio / JDK and reopen the terminal."
  exit 1
}

$storePass = Read-Host 'Store password (min 6 chars)'
$keyPass = Read-Host 'Key password (min 6 chars, can match store)'
$cn = Read-Host 'Your name / company (CN)'
if (-not $cn) { $cn = 'Quang Thanh Solar' }

& keytool -genkeypair -v `
  -keystore $keystore `
  -alias qtsolar `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -storepass $storePass `
  -keypass $keyPass `
  -dname "CN=$cn, OU=ERP, O=Quang Thanh Solar, L=Ho Chi Minh, ST=HCM, C=VN"

@"
storeFile=../mobile-release.keystore
storePassword=$storePass
keyAlias=qtsolar
keyPassword=$keyPass
"@ | Set-Content -Path $props -Encoding UTF8

Write-Host ""
Write-Host "Created:"
Write-Host "  $keystore"
Write-Host "  $props"
Write-Host "Back up the keystore + passwords. Losing them blocks Play updates."
