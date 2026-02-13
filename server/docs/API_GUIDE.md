# Guía del Backend - Excedentes v0.0.3

## Arquitectura

El backend sigue Clean Architecture con las siguientes capas:

```
server/
├── src/
│   ├── api/           # Capa de presentación (HTTP)
│   │   ├── controllers/  # Controladores REST
│   │   ├── middlewares/  # Auth, validation, error handling
│   │   └── routes/       # Definición de rutas
│   ├── config/        # Configuración (env, db, auth)
│   ├── core/          # Motor de cálculo económico
│   ├── models/        # Modelos Mongoose
│   ├── services/      # Lógica de negocio
│   └── utils/         # Utilidades compartidas
```

## Endpoints API

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login, retorna JWT |
| GET | `/api/auth/me` | Usuario actual |

### Capital (6 tipos)
Base: `/api/capital`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/tierras` | Listar tierras |
| POST | `/tierras` | Crear tierra |
| PUT | `/tierras/:id` | Actualizar |
| DELETE | `/tierras/:id` | Eliminar |

Lo mismo para: `/inmuebles`, `/muebles`, `/vehiculos`, `/herramientas`, `/stock`

### Personal (2 tipos)
Base: `/api/personal`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/propio` | Listar empleados propios |
| POST | `/propio` | Crear empleado |
| PUT | `/propio/:id` | Actualizar |
| DELETE | `/propio/:id` | Eliminar |

Lo mismo para: `/terceros`

### Ventas
Base: `/api/ventas`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar ventas |
| POST | `/` | Crear venta |
| GET | `/periodo/:periodo` | Ventas por período |

### Ganancias
Base: `/api/ganancias`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Obtener ganancias del período |
| POST | `/` | Guardar/actualizar ganancias |

### Extras (Costos Fijos/Variables adicionales)
Base: `/api/extras`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar gastos extras |
| POST | `/` | Crear gasto |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

### Cálculo Económico
Base: `/api/calculate`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/` | Ejecutar cálculo con datos |
| POST | `/preview` | Preview sin guardar |
| GET | `/status` | Ver estado de datos cargados |
| POST | `/period/:periodId` | Calcular para período específico |

## Modelos de Datos

### Company
```javascript
{
  name: String,
  cuit: String,
  address: String,
  category: String, // 'pequena', 'mediana', 'grande'
  createdBy: ObjectId // ref User
}
```

### Employee (Personal)
```javascript
{
  company: ObjectId,
  type: String, // 'propio', 'terceros'
  nombre: String,
  apellido: String,
  cargo: String,
  salarioMensualUSD: Number,
  cargosSocialesUSD: Number,
  costoTotalMensualUSD: Number,
  activo: Boolean
}
```

### Asset (Capital)
```javascript
{
  company: ObjectId,
  type: String, // 'tierra', 'inmueble', 'mueble', 'vehiculo', 'herramienta', 'stock'
  nombre: String,
  valorUSD: Number,
  depreciacionAnual: Number,
  // campos específicos según tipo...
}
```

### Period
```javascript
{
  company: ObjectId,
  mes: Number,
  anio: Number,
  estado: String, // 'borrador', 'calculado', 'cerrado'
  ventas: { productos, servicios, otros, total },
  ganancias: { gananciaCapital, gananciaPersonal, total },
  costosFijos: Number,
  costosVariables: Number,
  resultado: Object // resultado del motor de cálculo
}
```

## Motor de Cálculo (Core Engine)

El motor está en `server/src/core/` y es responsable del cálculo económico.

### Fórmula Principal (Regla 5)
```
Costos Variables = Ventas - Ganancias - Costos Fijos
```

### Archivos del Core
- `types.ts` - Tipos TypeScript
- `invariants.ts` - Validaciones de invariantes económicas
- `steps.ts` - Pasos del cálculo
- `orchestrator.ts` - Orquestador principal

### Uso
```typescript
import { runExcedentesEngine } from './core/orchestrator';

const input = {
  ventas: 100000,
  ganancias: { capital: 15000, personal: 10000 },
  costosFijos: 30000
};

const resultado = await runExcedentesEngine(input);
// resultado.costosVariables = 100000 - 25000 - 30000 = 45000
```

## Middlewares

### authMiddleware
Valida JWT y adjunta `req.user`

```javascript
// Uso en rutas
router.get('/protected', authMiddleware, controller.method);
```

### validateRequest
Valida body contra schema Joi/Zod

### errorHandler
Manejo centralizado de errores

## Variables de Entorno

```env
# Base de datos
MONGO_URI=mongodb://localhost:27017/excedentes

# JWT
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
```

## Flujo de Datos

```
1. Usuario carga datos (11 planillas) → Frontend
2. Frontend guarda vía services → API endpoints
3. API almacena en MongoDB → Models
4. Usuario solicita cálculo → POST /api/calculate
5. Backend recopila datos → Services
6. Core Engine ejecuta cálculo → orchestrator.ts
7. Resultado se guarda en Period → response al frontend
8. Dashboard muestra resultados → gráficos y punto de equilibrio
```

## Testing

```bash
# Ejecutar tests
npm test

# Tests del core engine
npm test -- --testPathPattern=core-engine
```

## Separación Capital vs Personal (Regla 8)

El sistema separa claramente:
- **Ganancia por Capital**: Retorno del capital invertido
- **Ganancia por Trabajo Personal**: Retribución del productor

Esto se refleja en:
- Modelo `Ganancias` con desglose
- Dashboard con gráficos separados
- Reportes individuales

## Próximos Pasos

1. Implementar tests de integración
2. Añadir validación de períodos
3. Implementar exportación a Excel
4. Añadir audit trail
5. Certificaciones y compliance (ver docs/legal-certification/)
