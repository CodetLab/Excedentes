# 🔌 Guía de Integración: Dashboard Económico v0.0.6

## 📋 Checklist Pre-Integración

Antes de conectar el router, verifica que el backend esté listo:

### Backend (Node.js)

- [ ] User.js: Tiene `companyId` y `role`
- [ ] JWT incluye `companyId` y `role` en payload
- [ ] middleware/authenticateJWT.js existe con 3 funciones
- [ ] app.js protege rutas económicas (`/api/calculate`, etc.)
- [ ] POST /api/calculate acepta `CalculateInput` y retorna `CalculateResult`

**Verificar:**
```bash
# Terminal en server/
npm test auth.middleware   # Debe pasar autenticación
npm test calculate.api     # Debe retornar CalculateResult
```

---

## 🔗 Paso 1: Integrar en AppRouter

Actualiza tu `AppRouter.tsx` o `App.tsx` para incluir la nueva ruta:

### Localiza tu archivo de router
```
client/src/
└── App.tsx (o AppRouter.tsx, Router.tsx)
```

### Agrega la importación
```tsx
// En la sección de imports
import EconomicCalculator from './pages/Calculadora/EconomicCalculator';
import ProtectedRoute from './components/ProtectedRoute'; // (si tienes)
```

### Agrega la ruta
```tsx
// En tu Router.tsx o App.tsx, dentro de las rutas:

{
  path: '/calculadora/economico',
  element: <ProtectedRoute component={EconomicCalculator} />
}

// O si usas layout:
{
  path: '/calculadora',
  element: <LayoutCalculadora />,
  children: [
    {
      path: 'economico',
      element: <EconomicCalculator />
    }
  ]
}
```

### Ejemplo completo con React Router v7
```tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import EconomicCalculator from './pages/Calculadora/EconomicCalculator';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ component: Component }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Component /> : <Navigate to="/login" />;
}

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/calculadora/economico" 
          element={<ProtectedRoute component={EconomicCalculator} />} 
        />
        {/* Otras rutas */}
      </Routes>
    </Router>
  );
}
```

---

## 🧪 Paso 2: Verificar Autenticación End-to-End

### 2.1 Verifica localStorage después de login

```javascript
// En DevTools → Console (después de login)
console.log(localStorage.getItem('excedentes_auth'));
// Debe output:
// {"token":"eyJhbGc...","user":{"id":"..","email":"..","companyId":"..","role":"company"}}
```

### 2.2 Verifica que el token tiene companyId

```javascript
// Decodifica el JWT
const token = JSON.parse(localStorage.getItem('excedentes_auth')).token;
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
// Debe output:
// {sub: "userId", email: "...", companyId: "...", role: "company", iat: ..., exp: ...}
```

### 2.3 Verifica que axios agrega el header

```javascript
// En DevTools → Network → Cualquier request POST
// Headers → Authorization
// Debe ser: "Bearer eyJhbGc..."
```

**Esperado:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWY...
```

---

## 🎬 Paso 3: Flujo Completo Manual

### 3.1 Navega a la página
```
http://localhost:5173/calculadora/economico
```

### 3.2 Deberías ver
1. **Header** con nombre de usuario + botón logout
2. **Formulario** con estos campos:
   - Ventas (sales)
   - Costos Capital Fijo
   - Costos Trabajo Fijo
   - Ganancia
   - (Opcionales: Depreciación, Intereses)

### 3.3 Llena con datos de prueba
```
Ventas: 100000
Costos Capital: 30000
Costos Trabajo: 25000
Ganancia: 45000
```

### 3.4 Haz clic "Calcular Excedente"

**Observa en DevTools:**
1. **Network:** POST /api/calculate (200 OK)
2. **Response:** Debe tener esta estructura
   ```json
   {
     "breakEven": 55000,
     "totalRevenue": 100000,
     "totalCost": 55000,
     "surplus": 45000,
     "status": "EXCEDENTE",
     "distribution": {
       "capitalReturn": 22500,
       "laborSurplusPool": 22500,
       "weightCapital": 0.5,
       "weightLabor": 0.5
     }
   }
   ```

### 3.5 Deberías ver el Dashboard
1. **Tarjeta Estado:** "EXCEDENTE" en verde
2. **Gráfico Barras:** Línea de equilibrio vs ingresos
3. **Gráfico Pie:** Distribución capital/trabajo
4. **Detalle:** 4 tarjetas con métricas

---

## 🐛 Debugging por Errores

### Error: "Usuario no autenticado"

**Checklist:**
1. ¿Estás logueado? (Mira header con nombre usuario)
   - NO → Ir a `/login` primero
   - SÍ → Continuar
2. ¿Token en localStorage?
   ```javascript
   localStorage.getItem('excedentes_auth') // Debe retornar JSON
   ```
3. ¿Token válido?
   ```javascript
   const payload = JSON.parse(atob(token.split('.')[1]));
   const now = Math.floor(Date.now() / 1000);
   console.log(payload.exp > now); // TRUE = válido, FALSE = expirado
   ```

**Solución:** Login nuevamente

---

### Error: 401 "Invalid token"

**Causas:**
1. Token malformado
2. Token expirado
3. Secreto JWT no coincide entre frontend/backend

**Debug:**
```javascript
// En Network → Copiar Authorization header
const header = "Bearer eyJ..."
const [scheme, token] = header.split(' ');
console.log({ scheme, tokenLength: token.length });
```

**Solución:**
1. Verifica que `secret` en backend auth config coincide con el usado para firmar
2. Si token expirado: logout + login nuevamente

---

### Error: 404 "Company not found" o "No data for period"

**Causas:**
1. Backend no tiene datos en BD para esa empresa
2. companyId en JWT no existe en colección de empresas

**Debug:**
```javascript
// Verifica companyId
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('companyId:', payload.companyId);

// En backend: MongoDB
db.companies.findOne({_id: ObjectId("...")})
db.venta.find({companyId: ObjectId("...")})
```

**Solución:**
1. Implementa seed de datos de prueba
2. Crea una empresa antes de hacer cálculo
3. El usuario debe estar asignado a una empresa (usuario.companyId debe existir)

---

### Error: "Ventas insuficientes"

**Causa:** Business rule violation

La fórmula económica requiere:
```
Ventas >= Ganancia + Costos Fijos
```

**Ejemplo:**
```
Ventas: 50000
Ganancia: 30000
Costos: 30000
Total requerido: 60000
Resultado: 50000 < 60000 ✗ ERROR
```

**Solución:** Ajusta los números:
```
Ventas: 70000 ✓
Ganancia: 30000
Costos: 40000
Total: 70000 ✓
```

---

### Error: Gráficos no se muestran

**Debug:**
```javascript
// DevTools → Console
// En el componente CalculationDashboard, logea:
console.log('result:', result);
console.log('result.surplus:', result?.surplus);
console.log('result.distribution:', result?.distribution);
```

**Checklist:**
1. ¿CalculateResult completo?
   - Copia response del Network tab
   - Pégalo en [jsoncrack.com](https://jsoncrack.com) para ver estructura
2. ¿Los SVG se cargan?
   - DevTools → Elements
   - Busca `<svg>` element
   - Debe tener atributos `viewBox`, `width`, `height`
3. ¿CSS aplica?
   - DevTools → Elements → Inspeccionar elemento `<svg>`
   - Debe tener clase del módulo CSS

**Solución:**
1. Agrega console.log en BreakEvenChart.tsx antes del return
2. Verifica que props llegan correctamente
3. Valida CSS import

---

## 🔄 Paso 4: Integración Completa Backend

Cuando todo el frontend funcione, verifica backend:

### 4.1 Refactorizar servicios (TASK 1-5)
```bash
# Refactorizar según PARALLEL_TASKS.md
# capital.service.js → companyId como identificador
# personal.service.js → filtrar por companyId
# etc.
```

### 4.2 Actualizar controllers (TASK 6-11)
```bash
# Todos los controllers deben:
# 1. Extraer companyId de req.companyId (del JWT)
# 2. Validar propiedad del recurso
# 3. Retornar 404 (no 403) si recurso es de otra empresa
```

### 4.3 Tests multi-tenant (TASK 12)
```bash
npm test multi-tenant.spec.js
```

---

## ✅ Validación Final

Cuando completes integración, verifica:

### Checklist de Funcionalidad
- [ ] Puedo navegar a `/calculadora/economico` sin errores
- [ ] Ver formulario económico
- [ ] Completar datos y enviar
- [ ] Ver dashboard con gráficos
- [ ] Gráficos muestran datos correctos
- [ ] Puedo volver al formulario y recalcular
- [ ] Logout funciona y redirect a login
- [ ] Token expira después de 7 días

### Checklist de Seguridad
- [ ] Usuario A no puede ver datos de Usuario B
- [ ] Sin token = 401
- [ ] Token inválido = 401
- [ ] Token expirado = 401
- [ ] companyId en JWT coincide en BD
- [ ] No puedo acesar /api/calculate sin token

### Checklist de Performance
- [ ] Cálculo >= 200ms pero <= 5s
- [ ] No hay memory leaks (devTools → Memory)
- [ ] Componentes se desmuentan correctamente
- [ ] No hay console warnings de React

---

## 📚 Documentos Relacionados

- [Dashboard README](./README.md) - Arquitectura general
- [economicApi.types.ts](../services/economicApi.types.ts) - Tipos compartidos
- [PARALLEL_TASKS.md](../../server/PARALLEL_TASKS.md) - Backend pending tasks
- [MULTI_TENANT_IMPLEMENTATION.md](../../server/MULTI_TENANT_IMPLEMENTATION.md) - Backend implementation

---

## 🚀 Próximos Pasos Recomendados

1. **Paso 1** (Hoy): Router integración + verificar flujo
2. **Paso 2** (Hoy): Debugging si hay errores
3. **Paso 3** (Mañana): Refactorizar TASK 1-5
4. **Paso 4** (Mañana): Actualizar TASK 6-11
5. **Paso 5** (Día 3): Tests TASK 12
6. **Paso 6** (Día 3): Deploy a staging

---

**¿Necesitas ayuda?**

Comanda:
```bash
# Verificar logs backend
tail -f server/logs/app.log | grep -i "calculate"

# Verificar logs frontend (DevTools Console)
// Busca mensajes que empiecen con [EconomicCalculator]
```

**Notas finales:**
- Este documento asume React Router v7 (ajusta si usas otra)
- Si usas diferentes paths, actualiza URLs según tu estructura
- Paths de archivos asuming estructura estándar

Éxito 🚀
