# 🔄 Sincronización de Tipos: Backend ↔ Frontend

## 📍 Ubicaciones Canónicas

### Frontend
```
client/src/services/apiTypes.ts    ← ÚNICO archivo de tipos
```

### Backend
```
server/src/api/types/               ← (Crear si no existe)
├── economic.types.ts
├── auth.types.ts
└── index.ts
```

---

## ⚠️ Regla de Oro

**AMBOS LADOS DEBEN TENER LOS MISMOS TIPOS**

Si cambias algo en el backend, actualiza el frontend y viceversa.

```
Backend CalculateResult shape
         ↓
Frontend CalculateResult interface (must match exactly)
```

---

## 📝 Checklist: Qué debe coincidir

| Tipo | Frontend | Backend | ¿Coincidir? |
|------|----------|---------|-----------|
| CalculateInput | `apiTypes.ts` | `economic.types.ts` | ✅ EXACTO |
| CalculateResult | `apiTypes.ts` | `economic.types.ts` | ✅ EXACTO |
| CalculateDistribution | `apiTypes.ts` | `economic.types.ts` | ✅ EXACTO |
| JWTPayload | `apiTypes.ts` | `auth.types.ts` | ✅ EXACTO |
| ApiResponse<T> | `apiTypes.ts` | `types.ts` | ✅ EXACTO |
| EconomicStatus | `apiTypes.ts` | Cualquier lugar | ✅ EXACTO |

---

## 🔄 Cómo Sincronizar

### Opción 1: Frontend Primero (Recomendado)
1. Define tipos en `client/src/services/apiTypes.ts`
2. Implementa frontend
3. Genera backend según tipos definidos
4. Verifica que la respuesta coincide

### Opción 2: Backend Primero
1. Define tipos en `server/src/api/types/`
2. Exporta tipos desde backend si es necesario
3. Copia tipos a frontend `apiTypes.ts`
4. Asegúrate que coincidan exactamente

### Opción 3: Generación Desde Schema (Avanzado)
```bash
# Usar herramientas como openapi-generator o tRPC
# para generar tipos automáticamente desde especificación

npm install @openapi-generator-cli
openapi-generator-cli generate -i api-spec.yaml -g typescript-axios
```

---

## 🧪 Testing de Sincronización

### Frontend: Valida que la respuesta API coincide
```typescript
// En useEconomicCalculation.ts
const result: CalculateResult = await calculationService.calculate(input);

// TypeScript automáticamente validará que result coincide con interface
// Si backend retorna extra campos → Error TS
// Si backend falta campos → Error TS
```

### Backend: Tipo seguro en respuesta
```typescript
// En calculate.controller.js
const result: CalculateResult = await calculateByPeriod(companyId, month, year);
res.json({ success: true, data: result });

// Si usas TypeScript en backend, mismo chequeo automático
```

### Manual: Compara con JSON Schema
```bash
# 1. Ejecuta cálculo en backend
POST /api/calculate
{...}

# 2. Copia response JSON
{
  "breakEven": 55000,
  "totalRevenue": 100000,
  ...
}

# 3. Valida contra `CalculateResult` interface
# Debe tener TODOS los campos requeridos
# No puede tener campos extra que frontend no espera
```

---

## 🚨 Errores Comunes

### ❌ Error 1: Frontend espera pero backend no retorna

```typescript
// Frontend
export interface CalculateResult {
  breakEven: number;
  status: "PERDIDA" | "EQUILIBRIO" | "EXCEDENTE";  // ← EXPECT THIS
}

// Backend JSON
{
  "breakEven": 55000,
  "status": undefined  // ← OOPS!, not present
}

// Result: TypeScript error o runtime undefined error
```

**Solución:**
Backend DEBE incluir `status` en respuesta:
```javascript
const status = surplus < 0 ? "PERDIDA" : surplus === 0 ? "EQUILIBRIO" : "EXCEDENTE";
res.json({ ..., status });
```

---

### ❌ Error 2: Cambio de tipo sin actualizar ambos lados

```typescript
// Backend cambió pero frontend no
// Backend: distribution.weightCapital = 0.5 (number)
// Frontend: distribution.weightCapital: number

// Si backend ahora retorna string: "50%"
// Frontend: type mismatch! Undefined variable error
```

**Solución:**
Antes de hacer cambios, actualiza AMBOS tipos:
1. Actualiza `server/src/api/types/economic.types.ts`
2. Actualiza `client/src/services/apiTypes.ts`
3. Reconstruye ambos
4. Verifica que tests pasan

---

### ❌ Error 3: Campos opcionales no están claros

```typescript
// Ambigüedad: ¿Este campo es requerido o no?
interface CalculateResult {
  breakEven: number;           // ← Requerido
  interpretation?: string;     // ← Opcional
  status: EconomicStatus;      // ← Requerido
}
```

**Solución:**
Documenta claramente en comentarios:
```typescript
interface CalculateResult {
  breakEven: number;           // REQUIRED: Punto equilibrio calculado
  interpretation?: {           // OPTIONAL: Interpretación en texto (puede ser null)
    summary?: string;
    nextSteps?: string[];
  };
  status: EconomicStatus;      // REQUIRED: PERDIDA | EQUILIBRIO | EXCEDENTE
}
```

---

## ✅ Checklist: Antes de Deploy

- [ ] Tipos en `client/src/services/apiTypes.ts` están documentados
- [ ] Backend retorna JSON que coincide con CalculateResult
- [ ] Frontend compila sin errores TS
- [ ] Backend compila sin errores TS (si usas TS)
- [ ] Tests pasan (si tienes)
- [ ] Response real válida contra interface (test manual)
- [ ] Campos opcionales claramente marcados con `?`
- [ ] Sin campos undefined en respuesta si son requeridos

---

## 📚 Referencias

**Frontend:** [apiTypes.ts](./apiTypes.ts)
**Backend:** [PARALLEL_TASKS.md](../../server/PARALLEL_TASKS.md) - TASK 6 (Controllers)
**Integration:** [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Paso 2

---

## 🎯 Cuando Agregar Nuevos Tipos

1. **Define el tipo** en `apiTypes.ts` (con muy buena documentación)
2. **Implementa backend** para retornar ese tipo
3. **Actualiza frontend** para consumirlo
4. **Test manual**: Verifica JSON response en DevTools
5. **Commit ambos**: Backend + Frontend en mismo PR/commit

---

**Pro Tip:** Usa TypeScript en ambos lados para validación automática en compile-time, no en runtime.
