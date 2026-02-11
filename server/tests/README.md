1️⃣ Tests de caja negra (black-box)

No testees funciones internas

Testeá escenarios económicos

Ejemplos:

Empresa sin ganancia

Empresa con ganancia mínima

Capital dominante

Trabajo dominante

Datos inválidos

📌 Input → Output, sin saber cómo.

2️⃣ Tests de invariantes (CRÍTICOS)

Cada test debe verificar:

Ningún valor negativo

Sumas correctas

Pesos = 1

Sin PASS → sin certificado

Estos tests no cambian nunca, aunque refactores.

3️⃣ Tests de borde (edge cases)

Sales = BreakEven

FixedCosts = 0 (bloqueo)

Profit negativo

Inflación extrema