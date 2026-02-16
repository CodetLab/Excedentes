# 📁 PROJECT STRUCTURE & CONVENTIONS

## 📂 Estructura Recomendada

```
excedentes/
├── server/
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/      # HTTP request handlers
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── capital.controller.js
│   │   │   │   ├── dashboard.controller.js
│   │   │   │   └── personal.controller.js
│   │   │   ├── routes/           # Route definitions
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── capital.routes.js
│   │   │   │   └── index.js
│   │   │   └── middleware/       # Route-specific middleware
│   │   ├── middleware/           # Global middleware
│   │   │   ├── authenticateJWT.js
│   │   │   ├── requireCompanyContext.js ← NEW
│   │   │   └── errorHandler.js   ← NEW
│   │   ├── services/             # Business logic
│   │   │   ├── capital.service.js
│   │   │   ├── dashboard.service.js
│   │   │   └── personal.service.js
│   │   ├── models/               # Database models (Mongoose)
│   │   ├── repositories/         # Data access layer
│   │   ├── utils/                # Helpers & utilities
│   │   │   ├── errors.js         ← NEW
│   │   │   ├── logger.js         ← NEW
│   │   │   ├── validation.js     ← NEW
│   │   │   └── helpers.js
│   │   ├── config/               # Configuration
│   │   ├── app.js                # Express app setup
│   │   └── ARCHITECTURE.md       ← NEW (patterns & conventions)
│   ├── SETUP.md                  ← NEW (single source of truth)
│   ├── QUICK_FIX_SNIPPETS.md     ← (reference only)
│   ├── package.json
│   └── README.md
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── context/
│   │   └── styles/
│   └── package.json
└── README.md (root)
```

---

## 📝 CONVENCIONES POR CARPETA

### ✅ `/controllers`

**Responsabilidad:** HTTP layer - parsear request, llamar service, responder

**Estructura:**

```javascript
// ✅ PATRÓN RECOMENDADO
import { logger } from "../utils/logger.js";
import { sendSuccess, sendError } from "../utils/errors.js";
import { UnauthorizedError, ValidationError } from "../utils/errors.js";
import { capitalService } from "../services/capital.service.js";

export const getAll = async (req, res, next) => {
  try {
    // 1. Log entrada
    logger.info("[CAPITAL.getAll] START", {
      companyId: req.companyId,
      userId: req.userId
    });

    // 2. Parar al servicio (NO validar aquí si la middleware ya lo hizo)
    const items = await capitalService.getAll(req.companyId);

    // 3. Log éxito
    logger.success("[CAPITAL.getAll] SUCCESS", {
      itemsCount: items.length
    });

    // 4. Responder
    return sendSuccess(res, items);

  } catch (error) {
    logger.error("[CAPITAL.getAll] FAILED", {
      message: error.message
    });
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    logger.info("[CAPITAL.getById] START", {
      companyId: req.companyId,
      capitalId: id
    });

    const item = await capitalService.getById(req.companyId, id);
    
    if (!item) {
      throw new ValidationError("Capital item not found", {id});
    }

    logger.success("[CAPITAL.getById] SUCCESS");
    return sendSuccess(res, item);

  } catch (error) {
    next(error);
  }
};
```

**Lo QUE NO debes hacer:**
- ❌ Validar companyId (middleware ya lo hizo)
- ❌ Hacer queries directamente a DB
- ❌ `res.status().json()` directo (usa sendSuccess/sendError)
- ❌ console.log sin estructura (usa logger)

---

### ✅ `/services`

**Responsabilidad:** Business logic - validar datos, llamar repositories, aplicar reglas

**Estructura:**

```javascript
// ✅ PATRÓN RECOMENDADO
import { validators } from "../utils/validation.js";
import { ValidationError } from "../utils/errors.js";
import { Capital } from "../models/Capital.js";

export const capitalService = {
  
  /**
   * Obtener todos los items de una compañía
   * @param {ObjectId} companyId - Validado por middleware
   * @returns {Promise<Array>}
   */
  getAll: async (companyId) => {
    // 1. Validar entrada (por seguridad, aunque middleware ya lo hizo)
    companyId = validators.objectId(companyId);
    
    // 2. Query a DB
    const items = await Capital.find({companyId});
    
    // 3. Retornar (controller maneja logging y respuesta)
    return items;
  },

  /**
   * Obtener un item específico
   */
  getById: async (companyId, capitalId) => {
    companyId = validators.objectId(companyId);
    capitalId = validators.objectId(capitalId);
    
    const item = await Capital.findOne({
      _id: capitalId,
      companyId  // ← Siempre filtrar por companyId (seguridad)
    });
    
    return item;
  },

  /**
   * Crear nuevo item
   */
  create: async (companyId, data) => {
    companyId = validators.objectId(companyId);
    
    // Validar datos de entrada
    const validData = {
      name: validators.string(data.name, 3),
      amount: validators.number(data.amount, 0),
      date: validators.date(data.date),
      companyId
    };

    // Chequear duplicados
    const exists = await Capital.findOne({
      companyId,
      name: validData.name,
      date: validData.date
    });
    
    if (exists) {
      throw new ValidationError("Duplicate entry for this date", {
        conflictingField: "name"
      });
    }

    // Crear
    const item = new Capital(validData);
    await item.save();
    
    return item;
  },

  /**
   * Actualizar
   */
  update: async (companyId, capitalId, updates) => {
    companyId = validators.objectId(companyId);
    capitalId = validators.objectId(capitalId);
    
    // Validar que el item pertenece a la compañía
    const item = await Capital.findOne({
      _id: capitalId,
      companyId
    });
    
    if (!item) {
      throw new ValidationError("Capital item not found");
    }

    // Validar updates
    if (updates.amount !== undefined) {
      updates.amount = validators.number(updates.amount, 0);
    }
    if (updates.name !== undefined) {
      updates.name = validators.string(updates.name, 3);
    }

    // Actualizar
    Object.assign(item, updates);
    await item.save();
    
    return item;
  },

  /**
   * Eliminar
   */
  delete: async (companyId, capitalId) => {
    companyId = validators.objectId(companyId);
    capitalId = validators.objectId(capitalId);
    
    const result = await Capital.deleteOne({
      _id: capitalId,
      companyId
    });

    if (result.deletedCount === 0) {
      throw new ValidationError("Capital item not found");
    }

    return { success: true };
  }
};
```

**Lo QUE NO debes hacer:**
- ❌ Trusts que companyId es válido (siempre validar)
- ❌ Queries sin companyId filter (data leak!)
- ❌ Responder HTTP (eso es del controller)
- ❌ Acceso directo a models (usa repositories si hay lógica compleja)

---

### ✅ `/routes`

**Responsabilidad:** Mapear URLs a controllers, aplicar middleware

**Estructura:**

```javascript
// ✅ PATRÓN RECOMENDADO
import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { requireCompanyContext } from "../middleware/requireCompanyContext.js";
import * as controllers from "../api/controllers";

const router = express.Router();

// Todos los endpoints necesitan autenticación + contexto
router.use(authenticateJWT);
router.use(requireCompanyContext);

// GET endpoints
router.get("/stock", controllers.capital.getAll);
router.get("/detail/:id", controllers.capital.getById);

// POST endpoints
router.post("/", controllers.capital.create);

// PUT endpoints
router.put("/:id", controllers.capital.update);

// DELETE endpoints
router.delete("/:id", controllers.capital.delete);

export default router;
```

**Lo QUE NO debes hacer:**
- ❌ Validar en routes (eso es middleware/controller/service)
- ❌ Lógica de negocio
- ❌ Queries direc a DB

---

### ✅ `/models`

**Responsabilidad:** Definir schema de MongoDB

**Estructura:**

```javascript
// ✅ PATRÓN RECOMENDADO
import mongoose from "mongoose";

const CapitalSchema = new mongoose.Schema({
  // ← Siempre incluir companyId
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true  // ← Index para queries frecuentes
  },
  
  name: {
    type: String,
    required: true,
    minlength: 3
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ← Índice compuesto para queries multi-tenants
CapitalSchema.index({companyId: 1, date: -1});

export const Capital = mongoose.model("Capital", CapitalSchema);
```

**Lo QUE NO debes hacer:**
- ❌ Permitir companyId undefined o null (required: true)
- ❌ Omitir índices (slow queries)
- ❌ Validación de negocio (eso va en servicios)

---

## 🔄 FLUJO DE UN REQUEST

```
CLIENT REQUEST
    ↓
[Route Definition]
    ├─ authenticateJWT ← Valida token, inyecta userId, companyId
    ├─ requireCompanyContext ← [NEW] Valida companyId exists
    ↓
[Controller]
    └─ logger.info() ← [NEW] Log entrada
    ├─ service.operation()
    │   ├─ validators.* ← [NEW] Validar entrada
    │   ├─ Model.find() ← Query DB
    │   └─ return results
    └─ sendSuccess(res, data) ← [NEW] Responder
         ↓
    RESPONSE 200 OK

SI ERROR:
    ├─ throw AppError() ← [NEW]
    └─ [errorHandler] ← [NEW] Atrapa y responde
         ├─ logger.error()
         └─ sendError(res, error)
              ↓
    RESPONSE 400/403/500
```

---

## 📊 TABLA DE RESPONSABILIDADES

| Capa | Qué hace | Qué NO hace |
|------|----------|------------|
| **Route** | Mapear URL → Controller, aplicar middleware | Validación, lógica |
| **Middleware** | Autenticación, autorización, contexto | Llamar servicios |
| **Controller** | Parsear request, llamar service, responder | Validación, queries |
| **Service** | Lógica de negocio, validación, queries | HTTP, respuestas |
| **Model** | Schema de DB, índices | Lógica de negocio |

---

## ✨ RESUMEN DE CAMBIOS

### Archivos NUEVOS a crear (Fase 2):
- ✅ `middleware/requireCompanyContext.js`
- ✅ `middleware/errorHandler.js`
- ✅ `utils/errors.js`
- ✅ `utils/logger.js`
- ✅ `utils/validation.js`
- ✅ `src/ARCHITECTURE.md` (este)

### Archivos a REFACTORIZAR (Fase 2):
- `api/controllers/*` → usar sendSuccess/sendError, logger
- `services/*` → agregar validators
- `app.js` → usar errorHandler middleware

### Archivos DOCUMENTACION:
- ✅ `SETUP.md` (único punto de referencia)
- ✅ `README.md` (project overview)
- ✅ `ARCHITECTURE.md` (patterns & conventions)

---

## 🚀 PRÓXIMOS PASOS

1. **Ahora:** Revisar y entender los patrones en ARCHITECTURE.md
2. **Fase 1:** Mantener estructura actual (ya está funcionando)
3. **Fase 2:** Implementar gradualmente nuevos patrones
4. **Fase 3:** Refactorizar controllers existentes
5. **Fase 4:** Agregar TypeScript (opcional)

---

**Última actualización:** 2025-02-16

