# 🎯 Dashboard Económico v0.0.6

## Visión General

Dashboard interactivo para visualizar y calcular indicadores económicos de una empresa. Integrado con la API v0.0.5 (multi-tenant + autenticación robusta).

**Características:**
- ✅ Autenticación con JWT (incluye companyId y role)
- ✅ Formulario de datos económicos con validación
- ✅ Cálculo real contra POST /api/calculate
- ✅ Visualizaciones de gráficos (SVG nativo)
- ✅ Estado económico (Pérdida / Equilibrio / Excedente)
- ✅ Responsive y moderno
- ✅ TypeScript para seguridad de tipos

---

## 📁 Estructura de Ficheros

```
src/
├── components/
│   ├── EconomicForm.tsx              # Formulario de entrada
│   ├── CalculationDashboard.tsx      # Dashboard con resultados
│   ├── EconomicStatusCard.tsx        # Tarjeta estado económico
│   ├── BreakEvenChart.tsx            # Gráfico punto equilibrio
│   └── SurplusDistributionChart.tsx  # Gráfico distribución excedente
│
├── context/
│   └── AuthContext.tsx               # Context autenticación (actualizado)
│
├── hooks/
│   └── useEconomicCalculation.ts     # Hook lógica cálculo
│
├── services/
│   ├── auth.service.ts               # Autenticación (actualizado)
│   ├── calculation.service.ts        # Cliente económico
│   └── apiTypes.ts                   # Tipos (actualizado)
│
├── pages/
│   └── Calculadora/
│       └── EconomicCalculator.tsx    # Página principal
│
└── styles/
    ├── EconomicForm.module.css
    ├── CalculationDashboard.module.css
    ├── EconomicStatusCard.module.css
    ├── BreakEvenChart.module.css
    ├── SurplusDistributionChart.module.css
    └── EconomicCalculatorPage.module.css
```

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│ 1. Autenticación (AuthContext)                          │
│    Usuario → JWT token → localStorage                  │
│    Token incluye: sub, email, companyId, role          │
└───────────────┬─────────────────────────────────────────┘
                │
┌───────────────┴─────────────────────────────────────────┐
│ 2. Página EconomicCalculator                           │
│    - Renderiza EconomicForm                            │
│    - Escucha submit                                     │
└───────────────┬─────────────────────────────────────────┘
                │
┌───────────────┴─────────────────────────────────────────┐
│ 3. Hook useEconomicCalculation                         │
│    - Mapea datos del formulario                        │
│    - Llama calculationService.calculate()              │
│    - Maneja states: loading, error, result             │
└───────────────┬─────────────────────────────────────────┘
                │
┌───────────────┴─────────────────────────────────────────┐
│ 4. CalculationService                                  │
│    - POST /api/calculate                               │
│    - Interceptor axios agrega Authorization header     │
│    - Token automáticamente incluido en headers         │
└───────────────┬─────────────────────────────────────────┘
                │
┌───────────────┴─────────────────────────────────────────┐
│ 5. Backend (node.js/express)                           │
│    - Extrae companyId + role del JWT                   │
│    - Consolida datos de BD (solo companyId)            │
│    - Ejecuta motor de cálculo                          │
│    - Retorna CalculateResult                           │
└───────────────┬─────────────────────────────────────────┘
                │
┌───────────────┴─────────────────────────────────────────┐
│ 6. Frontend: CalculationDashboard                       │
│    - Recibe CalculateResult                            │
│    - Renderiza 3 secciones:                            │
│      a) EconomicStatusCard (estado + métricas)        │
│      b) BreakEvenChart (gráfico barras)               │
│      c) SurplusDistributionChart (gráfico pie)        │
│    - Muestra detalles e interpretación                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Componentes Clave

### 1. **EconomicForm**
**Responsabilidad:** Recolectar datos económicos

```typescript
interface EconomicFormData {
  sales: number;                   // Ingresos totales
  fixedCapitalCosts: number;       // Costos capital fijo
  fixedLaborCosts: number;         // Costos trabajo fijo
  profit: number;                  // Ganancia neta
  amortization?: number;           // Depreciación
  interests?: number;              // Intereses
}
```

**Validaciones:**
- Los números no pueden ser negativos
- Ventas >= Ganancias + Costos Fijos (invariante económica)
- Muestra resumen en tiempo real

---

### 2. **useEconomicCalculation Hook**
**Responsabilidad:** Lógica de negocio del cálculo

```typescript
function useEconomicCalculation() {
  const { result, loading, error, calculate, clearError } = ...
  return { result, loading, error, calculate, clearError }
}
```

**Flujo:**
1. `calculate(formData)` → mapea a `CalculateInput`
2. Llama `calculationService.calculate(input)`
3. Maneja loading, error, success
4. Retorna `CalculateResult`

**Garantías de seguridad:**
- No envía `userId` ni `companyId` en body (vienen del JWT)
- Token se incluye automáticamente en headers

---

### 3. **CalculationDashboard**
**Responsabilidad:** Visualizar resultados

Compuesto por 4 secciones:
1. **EconomicStatusCard** - Estado general con KPIs
2. **BreakEvenChart** - Comparación ingresos vs punto equilibrio
3. **SurplusDistributionChart** - Cómo se reparte el excedente
4. **Detalles** - Tablas con números completos

---

### 4. **Gráficos SVG (sin dependencias externas)**

Todos los gráficos usan **SVG nativo** mediante `<svg>` tags:
- BreakEvenChart: Barras simples + diferencia
- SurplusDistributionChart: Pie chart + barras

**Ventaja:** Sin recharts, sin node_modules extra, 100% controlable

---

## 🔐 Seguridad

### Autenticación
```typescript
// JWT contiene:
{
  sub: "userId",
  email: "usuario@empresa.com",
  companyId: "mongoId",
  role: "company" | "admin"
}
```

### Multi-Tenant
```typescript
// Frontend NUNCA envía companyId
const input: CalculateInput = {
  sales: 10000,
  fixedCapitalCosts: 2000,
  // ← NO incluir companyId
  // ← NO incluir userId
};

// Backend extrae del JWT
const { companyId, role } = req;
const result = await calculate(companyId, month, year);
```

### Isolamiento
- Si usuario "company" intenta datos de otra empresa → 404
- Si sin token → 401
- Si token inválido → 401

---

## 🚀 Uso

### 1. Instalar dependencias
```bash
cd client
npm install
```

### 2. Configurar .env
```env
VITE_API_URL=http://localhost:5000
```

### 3. Iniciar dev server
```bash
npm run dev
```

### 4. Usar el dashboard
1. Ir a `/calculadora/economico` (o ruta configurada)
2. Si no está autenticado → Ir a login
3. Cargar datos económicos
4. Clic "Calcular Excedente"
5. Ver resultados en dashboard

---

## 📊 Tipos TypeScript

### CalculateInput
```typescript
interface CalculateInput {
  sales: number;
  fixedCapitalCosts?: number;
  fixedLaborCosts?: number;
  profit?: number;
  amortization?: number;
  interests?: number;
  currency?: "USD" | "ARS" | "EUR";
  inflationIndex?: number;
  accountingCriteria?: "ACCRUAL" | "CASH";
  employees?: EmployeeInput[];
}
```

### CalculateResult
```typescript
interface CalculateResult {
  breakEven: number;              // Punto equilibrio
  totalRevenue: number;           // Ingresos totales
  totalCost: number;              // Costos totales
  surplus: number;                // Excedente (positivo/negativo)
  distribution: {
    capitalReturn: number;        // Para capital
    laborSurplusPool: number;     // Para trabajo
    weightCapital: number;        // % capital (0-1)
    weightLabor: number;          // % trabajo (0-1)
  };
  auditTrail: {
    status: "PASS" | "FAIL";
    certificate: unknown;
    calculatedAt: string;
    periodId: string | null;
  };
  input: { /* echo de los inputs */ }
}
```

---

## 🎨 Estilos

### Paleta de Colores
- **Primario:** #2196f3 (Azul - acciones, gráficas)
- **Éxito:** #4caf50 (Verde - encima equilibrio)
- **Warning:** #ff9800 (Naranja - punto equilibrio)
- **Error:** #d32f2f (Rojo - pérdida)

### Responsive
- **Desktop:** Layout 2 columnas (gráficos lado a lado)
- **Tablet:** Layout 1 columna adaptado
- **Mobile:** Stack vertical, touch-friendly

### Componentes Reutilizables
- CSS Modules para aislamiento
- SEM (single element model) para simpl icidad
- Grid + Flexbox para layouts

---

## 🐛 Debugging

### Error: "Usuario no autenticado"
- Verificar token en localStorage
- Verificar que token no ha expirado (7 días)
- Si en duda, logout + login

### Error: "Usuario no asignado a empresa"
- Backend debe asignar companyId al usuario durante registro
- Verificar que User model tiene companyId

### Error: "Ventas insuficientes"
- Validación económica: Sales >= Profit + Fixed Costs
- Revisar números ingresados

### Gráficos no se ven
- Revisar que CalculateResult viene del backend
- Revisar console.log(result) en DevTools

---

## 📈 Próximas Mejoras

- [ ] Guardar cálculos históricos (periods)
- [ ] Exportar PDF
- [ ] Compartir resultados
- [ ] Integrar recharts para gráficos avanzados
- [ ] Multi-idioma (ES/EN)
- [ ] Dark mode
- [ ] API GraphQL opcional

---

## 📝 Notas Arquitectónicas

### Por qué SVG sin librerías extra?
- **Ligereza:** Sin recharts, bundle más pequeño
- **Control:** 100% personalizable
- **Performance:** SVG es nativo en navegadores
- **Escalabilidad:** Fácil agregar más gráficos

### Por qué useEconomicCalculation hook?
- **Separación:** Lógica ≠ Visualización
- **Reusabilidad:** Reutilizar en múltiples componentes
- **Testeable:** Fácil mockear en tests
- **Mantenimiento:** Cambiar API sin tocar componentes

### Por qué no duplicar cálculos en frontend?
- **Control:** El motor está en backend (verdad única)
- **Seguridad:** Frontend no puede manipular resultados
- **Auditoría:** Todos los cálculos pasan por servidor
- **Escalabilidad:** Si cambia lógica, actualizar backend

---

**v0.0.6 - Dashboard Económico**  
*Limpio, Seguro, Escalable*
