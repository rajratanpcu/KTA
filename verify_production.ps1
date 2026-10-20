# KTA ERP Production Automated Verification Script (PowerShell)
# Tests the live Render backend and Vercel frontend

param (
    [string]$BackendUrl = "https://kta-erp-backend-d7xj.onrender.com",
    [string]$FrontendUrl = "https://frontend-liard-delta-44.vercel.app",
    [string]$Username = "admin",
    [string]$Password = "AdminPassword123!"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       KTA ERP PRODUCTION DEPLOYMENT TEST SUITE            " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Backend:  $BackendUrl" -ForegroundColor White
Write-Host "Frontend: $FrontendUrl" -ForegroundColor White
Write-Host "User:     $Username" -ForegroundColor White
Write-Host "Time:     $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "----------------------------------------------------------"

$base64Auth = [Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes("${Username}:${Password}"))
$authHeaders = @{
    "Authorization" = "Basic $base64Auth"
    "Accept"        = "application/json"
}

$passCount = 0
$failCount = 0

function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [int]$TimeoutSec = 30,
        [bool]$ExpectAuth = $false
    )

    Write-Host -NoNewline "[TEST] $Name ... "
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $Headers -TimeoutSec $TimeoutSec -UseBasicParsing -ErrorAction Stop
        $sw.Stop()
        $status = $response.StatusCode
        $ms = $sw.ElapsedMilliseconds
        if ($status -ge 200 -and $status -lt 300) {
            Write-Host "PASS" -ForegroundColor Green -NoNewline
            Write-Host " ($status, ${ms}ms)" -ForegroundColor DarkGray
            $snippet = $response.Content
            if ($snippet.Length -gt 80) { $snippet = $snippet.Substring(0, 80) + "..." }
            Write-Host "       Data: $snippet" -ForegroundColor DarkCyan
            $script:passCount++
        } else {
            Write-Host "WARN" -ForegroundColor Yellow -NoNewline
            Write-Host " ($status, ${ms}ms)" -ForegroundColor DarkGray
            $script:failCount++
        }
    } catch {
        $sw.Stop()
        $ms = $sw.ElapsedMilliseconds
        $errStatus = $_.Exception.Response.StatusCode.value__
        if ($errStatus) {
            Write-Host "FAIL" -ForegroundColor Red -NoNewline
            Write-Host " (HTTP $errStatus, ${ms}ms)" -ForegroundColor DarkGray
            Write-Host "       Error: $($_.Exception.Message)" -ForegroundColor Red
        } else {
            Write-Host "FAIL" -ForegroundColor Red -NoNewline
            Write-Host " (${ms}ms)" -ForegroundColor DarkGray
            Write-Host "       Network/Timeout: $($_.Exception.Message)" -ForegroundColor Red
        }
        $script:failCount++
    }
}

Write-Host "`n--- Phase 1: Render Backend & Cold Start Wakeup ---" -ForegroundColor Yellow
Write-Host "(Waiting up to 90s in case Render service is spinning up from cold tier...)" -ForegroundColor Gray
Test-Endpoint -Name "1. Backend Actuator Health" -Url "$BackendUrl/actuator/health" -TimeoutSec 90

Write-Host "`n--- Phase 2: CORS Preflight Verification ---" -ForegroundColor Yellow
$corsHeaders = @{
    "Origin" = $FrontendUrl
    "Access-Control-Request-Method" = "GET"
    "Access-Control-Request-Headers" = "authorization,content-type"
}
Test-Endpoint -Name "2. CORS Preflight (/api/categories)" -Url "$BackendUrl/api/categories" -Method "OPTIONS" -Headers $corsHeaders -TimeoutSec 15

Write-Host "`n--- Phase 3: Authenticated ERP Core API Endpoints ---" -ForegroundColor Yellow
Test-Endpoint -Name "3. Categories API" -Url "$BackendUrl/api/categories" -Headers $authHeaders
Test-Endpoint -Name "4. Products API" -Url "$BackendUrl/api/products" -Headers $authHeaders
Test-Endpoint -Name "5. Godowns API (6 Warehouses)" -Url "$BackendUrl/api/godowns" -Headers $authHeaders
Test-Endpoint -Name "6. Stock Balances API" -Url "$BackendUrl/api/stock/balances" -Headers $authHeaders
Test-Endpoint -Name "7. Customers API" -Url "$BackendUrl/api/customers" -Headers $authHeaders
Test-Endpoint -Name "8. Suppliers API" -Url "$BackendUrl/api/suppliers" -Headers $authHeaders
Test-Endpoint -Name "9. Transporters API" -Url "$BackendUrl/api/transport/transporters" -Headers $authHeaders

Write-Host "`n--- Phase 4: Vercel Frontend Availability ---" -ForegroundColor Yellow
Test-Endpoint -Name "10. Vercel Frontend SPA Root" -Url "$FrontendUrl/" -TimeoutSec 20

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY: $passCount Passed, $failCount Failed" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host "==========================================================" -ForegroundColor Cyan

if ($failCount -gt 0) {
    Write-Host "`nAction items if failures were observed:" -ForegroundColor Yellow
    Write-Host "1. If Health failed: Check Render service logs at https://dashboard.render.com"
    Write-Host "2. If CORS failed: Ensure CORS_ALLOWED_ORIGINS in Render Environment includes $FrontendUrl"
    Write-Host "3. If Auth failed: Verify ADMIN_USERNAME=admin and ADMIN_PASSWORD=AdminPassword123! in Render"
}
