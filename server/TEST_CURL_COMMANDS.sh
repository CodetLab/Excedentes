#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════
# TEST COMMANDS - Execute después de FIX
# ════════════════════════════════════════════════════════════════════════════

SERVER_URL="http://localhost:5000"
EMAIL="jordan@example.com"
PASSWORD="12345678"

# ════════════════════════════════════════════════════════════════════════════
# 1️⃣ TEST 1: LOGIN - Obtener token (DEBE TENER companyId)
# ════════════════════════════════════════════════════════════════════════════
echo "====== TEST 1: LOGIN ======"
login_response=$(curl -s -X POST "$SERVER_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Response: $login_response"

# Extraer token (depende del jq o parsear manualmente)
TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ ERROR: No token received!"
  echo "Full response: $login_response"
  exit 1
fi

echo "✅ Token extracted: ${TOKEN:0:30}..."

# ════════════════════════════════════════════════════════════════════════════
# 2️⃣ TEST 2: GET /api/capital/stock (DEBE SER 200)
# ════════════════════════════════════════════════════════════════════════════
echo ""
echo "====== TEST 2: GET /api/capital/stock ======"
curl -v -X GET "$SERVER_URL/api/capital/stock" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# ════════════════════════════════════════════════════════════════════════════
# 3️⃣ TEST 3: GET /api/dashboard/period-summary (DEBE SER 200)
# ════════════════════════════════════════════════════════════════════════════
echo ""
echo "====== TEST 3: GET /api/dashboard/period-summary?month=2&year=2026 ======"
curl -v -X GET "$SERVER_URL/api/dashboard/period-summary?month=2&year=2026" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# ════════════════════════════════════════════════════════════════════════════
# 4️⃣ TEST 4: GET /api/personal/propio (DEBE SER 200)
# ════════════════════════════════════════════════════════════════════════════
echo ""
echo "====== TEST 4: GET /api/personal/propio ======"
curl -v -X GET "$SERVER_URL/api/personal/propio" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo "✅ All tests complete!"
