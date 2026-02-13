# GUÍA: PREVENCIÓN DE ERRORES - DEFENSIVE PROGRAMMING

## 📋 Resumen Ejecutivo

Este documento describe las 3 capas de protección implementadas para prevenir crashes en la aplicación React, especialmente cuando el backend falla o devuelve datos incompletos.

## 🛡️ Las 3 Capas de Protección

### 1️⃣ CAPA 1: GlobalErrorBoundary
**Ubicación:** `client/src/components/GlobalErrorBoundary.tsx`  
**Propósito:** Captura errores no manejados en toda la aplicación

**Implementación en App.tsx:**
```tsx
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";

function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}
```

**Resultado:**
- ✅ App NUNCA se rompe completamente
- ✅ Usuario ve pantalla de error amigable con opción de volver al inicio
- ✅ Errores se loggean en consola para debugging

---

### 2️⃣ CAPA 2: Optional Chaining y Safe Guards
**Regla:** NUNCA asumir que los datos existen

#### ❌ INCORRECTO (causa crashes):
```tsx
// Asume que data.desglose existe
{data && (
  <div>{safeCurrency(data.desglose.gananciaCapital)}</div>
)}
```

#### ✅ CORRECTO (defensive):
```tsx
// Valida que data.desglose existe
{data?.desglose && (
  <div>{safeCurrency(data.desglose.gananciaCapital)}</div>
)}
```

**Reglas Obligatorias:**
1. Usar `data?.property` para propiedades opcionales
2. Usar `data?.nested?.property` para acceso a propiedades anidadas
3. Usar `data?.array?.length` para arrays
4. Usar guards separados para objetos anidados: `{data?.desglose && (...)}` 

**Ejemplos de uso correcto:**
```tsx
// ✅ Arrays
{items?.map(item => (...))}
{productos?.length > 0 && (...)}

// ✅ Objetos anidados
{data?.desglose?.gananciaCapital}
{user?.profile?.avatar || defaultAvatar}

// ✅ Funciones opcionales
{data?.callback?.()}
```

---

### 3️⃣ CAPA 3: Payload Normalization
**Ubicación:** `client/src/utils/payloadNormalizer.ts`  
**Propósito:** Asegurar que los datos enviados al backend tienen el formato correcto

#### Problema Resuelto:
Backend esperaba `nombre` pero frontend enviaba `concepto` → 400 Bad Request

#### Solución:
```tsx
import { normalizeExtrasPayload } from "../../utils/payloadNormalizer";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Normalizar payload antes de enviar
  const payload = normalizeExtrasPayload(form);
  
  await extrasService.create(payload);
};
```

---

## 📦 Utilidades Disponibles

### `payloadNormalizer.ts`

#### 1. `normalizeNumbers(obj, fields)`
Convierte strings a números en campos especificados
```ts
const form = { montoUSD: "100.50" };
const normalized = normalizeNumbers(form, ["montoUSD"]);
// Resultado: { montoUSD: 100.5 }
```

#### 2. `removeEmptyFields(obj)`
Remueve campos undefined/null/vacíos
```ts
const form = { nombre: "Test", notas: "", activo: undefined };
const cleaned = removeEmptyFields(form);
// Resultado: { nombre: "Test" }
```

#### 3. `normalizeExtrasPayload(form)`
Normaliza payload de Extras (mapea concepto → nombre)
```ts
const form = { concepto: "Impuesto", montoUSD: "100" };
const payload = normalizeExtrasPayload(form);
// Resultado: { concepto: "Impuesto", nombre: "Impuesto", montoUSD: 100 }
```

#### 4. `normalizeCapitalPayload(form, tipo)`
Normaliza payload de Capital (Tierras, Inmuebles, etc.)

#### 5. `normalizePersonalPayload(form)`
Normaliza payload de Personal (Propio/Terceros)

#### 6. `normalizeVentasPayload(form)`
Normaliza payload de Ventas

#### 7. `normalizeGananciasPayload(form)`
Normaliza payload de Ganancias

#### 8. `normalizePayload(payload, type, options)`
Wrapper genérico
```ts
const payload = normalizePayload(form, "extras");
const payload2 = normalizePayload(form, "capital", { tipo: "TIERRAS" });
```

---

## 🔧 Casos de Uso Comunes

### Caso 1: Backend devuelve data incompleta
**Síntoma:** App crashea al renderizar datos parciales

**Solución:**
```tsx
// ❌ ANTES
{data && <div>{data.desglose.gananciaCapital}</div>}

// ✅ DESPUÉS
{data?.desglose && <div>{data.desglose.gananciaCapital}</div>}
```

---

### Caso 2: Backend devuelve 400 Bad Request
**Síntoma:** POST/PUT falla con error de validación

**Solución:**
```tsx
// ❌ ANTES
await service.create(form);

// ✅ DESPUÉS
const payload = normalizeExtrasPayload(form);
await service.create(payload);
```

---

### Caso 3: Arrays pueden ser undefined
**Síntoma:** "Cannot read property 'map' of undefined"

**Solución:**
```tsx
// ❌ ANTES
{items.map(item => <div key={item.id}>{item.name}</div>)}

// ✅ DESPUÉS
{items?.map(item => <div key={item.id}>{item.name}</div>) || []}
```

---

### Caso 4: Números enviados como strings
**Síntoma:** Backend rechaza payload porque espera number pero recibe string

**Solución:**
```tsx
// ❌ ANTES
const form = { montoUSD: "100.50" }; // string del input
await service.create(form);

// ✅ DESPUÉS
const payload = normalizeNumbers(form, ["montoUSD"]);
await service.create(payload);
// O usar el normalizer específico:
const payload = normalizeExtrasPayload(form);
```

---

## 📚 Errores Resueltos

### ✅ Error 1: Ganancias.tsx crash
**Causa:** `data.desglose.gananciaCapital` sin validar que `desglose` existe  
**Fix:** Cambiado `{data && (...)}` a `{data?.desglose && (...)}`  
**Archivo:** [Ganancias.tsx](../client/src/pages/Ganancias/Ganancias.tsx)

### ✅ Error 2: POST /api/extras 400 Bad Request
**Causa:** Frontend enviaba `concepto` pero backend espera `nombre`  
**Fix:** Agregado mapeo en `handleSubmit`: `nombre: form.concepto`  
**Archivo:** [Extras.tsx](../client/src/pages/Extras/Extras.tsx)

### ✅ Error 3: VentasTable crash
**Status:** Ya estaba usando `safeNumber()` - no se encontró crash  
**Archivo:** [VentasTable.tsx](../client/src/pages/Ventas/components/VentasTable.tsx)

---

## 🚫 Reglas Prohibidas

### ❌ NUNCA hacer:
```tsx
// 1. Acceso directo sin guard
data.nested.property

// 2. Asumir que arrays existen
items.map(...)

// 3. Asumir que callbacks existen
props.onAction()

// 4. Enviar form data sin normalizar
await service.create(form)

// 5. Guards superficiales para nested properties
{data && <div>{data.nested.property}</div>}
```

### ✅ SIEMPRE hacer:
```tsx
// 1. Optional chaining
data?.nested?.property

// 2. Array guards
items?.map(...) || []

// 3. Callback guards
props.onAction?.()

// 4. Normalizar payloads
await service.create(normalizePayload(form, "extras"))

// 5. Guards específicos para nested
{data?.nested && <div>{data.nested.property}</div>}
```

---

## 🎯 Checklist de Defensive Coding

Al escribir o revisar código:

- [ ] ✅ Todos los accesos a propiedades usan optional chaining (`?.`)
- [ ] ✅ Todos los `.map()` tienen guard (`items?.map()`)
- [ ] ✅ Todos los POST/PUT normalizan payload antes de enviar
- [ ] ✅ Todos los componentes de tabla tienen `<TableErrorBoundary>`
- [ ] ✅ App.tsx tiene `<GlobalErrorBoundary>` como wrapper principal
- [ ] ✅ Formatters (safeCurrency, safeNumber, etc.) usados para todos los números
- [ ] ✅ Validación de `data?.nested` antes de renderizar objetos anidados
- [ ] ✅ Ningún acceso directo a `desglose`, `productos`, `items` sin `?.`

---

## 📖 Documentos Relacionados

- [DATATABLE_FORMATTERS_GUIDE.md](./DATATABLE_FORMATTERS_GUIDE.md) - Guía de formatters seguros
- [SOLUCION_CRASH_CRITICAL.md](./SOLUCION_CRASH_CRITICAL.md) - Solución del crash de toLocaleString

---

## 🔍 Debugging Tips

### Cuando algo no funciona:

1. **Verificar console.log del payload:**
   ```tsx
   const payload = normalizeExtrasPayload(form);
   console.log("Payload enviado:", payload);
   await service.create(payload);
   ```

2. **Verificar estructura de datos recibida:**
   ```tsx
   const data = await service.get();
   console.log("Data recibida:", data);
   console.log("Tiene desglose?", data?.desglose);
   ```

3. **Verificar errores en Network tab:**
   - Abrir DevTools → Network
   - Buscar request fallido (rojo)
   - Ver Preview tab para ver error del backend
   - Ver Payload tab para ver qué se envió

4. **Verificar tipos en TypeScript:**
   ```tsx
   // Si TypeScript marca error, probablemente el tipo no acepta undefined
   // Agregar ? al tipo:
   interface GananciasData {
     desglose?: {  // <-- Agregar ?
       gananciaCapital: number;
     }
   }
   ```

---

**Última actualización:** Diciembre 2024  
**Autor:** GitHub Copilot  
**Versión:** 1.0
