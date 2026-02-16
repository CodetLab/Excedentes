# ════════════════════════════════════════════════════════════════════════════
# TEST COMMANDS - Windows PowerShell Version
# Ejecuta desde: PowerShell en c:\Users\yo\Documents\GitHub\Excedentes\server
# ════════════════════════════════════════════════════════════════════════════

$SERVER_URL = "http://localhost:5000"
$EMAIL = "jordan@example.com"
$PASSWORD = "123456"

# ════════════════════════════════════════════════════════════════════════════
# 1️⃣ TEST 1: LOGIN - Obtener token (DEBE TENER companyId)
# ════════════════════════════════════════════════════════════════════════════
Write-Host "====== TEST 1: LOGIN ======" -ForegroundColor Cyan

$loginBody = @{
    email = $EMAIL
    password = $PASSWORD
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$SERVER_URL/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $loginBody

Write-Host "Response Status: $($loginResponse.StatusCode)"
$loginData = $loginResponse.Content | ConvertFrom-Json
Write-Host "Response Body: $($loginData | ConvertTo-Json)"

# Extraer token
$TOKEN = $loginData.token

if (-not $TOKEN) {
    Write-Host "❌ ERROR: No token received!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Token extracted: $($TOKEN.Substring(0, 30))..." -ForegroundColor Green

# ════════════════════════════════════════════════════════════════════════════
# 2️⃣ TEST 2: GET /api/capital/stock (DEBE SER 200)
# ════════════════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "====== TEST 2: GET /api/capital/stock ======" -ForegroundColor Cyan

try {
    $capitalResponse = Invoke-WebRequest -Uri "$SERVER_URL/api/capital/stock" `
      -Method GET `
      -Headers @{
          "Authorization" = "Bearer $TOKEN"
          "Content-Type" = "application/json"
      }
    
    Write-Host "✅ Status: $($capitalResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($capitalResponse.Content | ConvertFrom-Json | ConvertTo-Json | Out-String)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)"
}

# ════════════════════════════════════════════════════════════════════════════
# 3️⃣ TEST 3: GET /api/dashboard/period-summary (DEBE SER 200)
# ════════════════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "====== TEST 3: GET /api/dashboard/period-summary?month=2&year=2026 ======" -ForegroundColor Cyan

try {
    $dashboardResponse = Invoke-WebRequest -Uri "$SERVER_URL/api/dashboard/period-summary?month=2&year=2026" `
      -Method GET `
      -Headers @{
          "Authorization" = "Bearer $TOKEN"
          "Content-Type" = "application/json"
      }
    
    Write-Host "✅ Status: $($dashboardResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($dashboardResponse.Content | ConvertFrom-Json | ConvertTo-Json | Out-String)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)"
}

# ════════════════════════════════════════════════════════════════════════════
# 4️⃣ TEST 4: GET /api/personal/propio (DEBE SER 200)
# ════════════════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "====== TEST 4: GET /api/personal/propio ======" -ForegroundColor Cyan

try {
    $personalResponse = Invoke-WebRequest -Uri "$SERVER_URL/api/personal/propio" `
      -Method GET `
      -Headers @{
          "Authorization" = "Bearer $TOKEN"
          "Content-Type" = "application/json"
      }
    
    Write-Host "✅ Status: $($personalResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($personalResponse.Content | ConvertFrom-Json | ConvertTo-Json | Out-String)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "✅ All tests complete!" -ForegroundColor Green
