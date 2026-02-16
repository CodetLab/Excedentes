# 🏗️ EXCEDENTES - ARCHITECTURE & PATTERNS

## Propósito

Documento de referencia para mantener consistencia en:
- ✅ Validación de contexto (companyId, userId)
- ✅ Error handling centralizado
- ✅ Logging estructurado
- ✅ Type safety en servicios

---

## 🎯 ESTRUCTURA ACTUAL

```
src/
├── api/
│   ├── controllers/     ← HTTP handlers
│   └── routes/          ← Route definitions
├── middleware/          ← Auth, logging, etc
├── services/            ← Business logic
├── models/              ← Database models
├── repositories/        ← Data access
├── utils/               ← Helpers
└── config/              ← Configuration
```

---

## 🔐 PATRÓN 1: VALIDACIÓN CENTRALIZADA DE CONTEXTO

### ❌ ANTES (Problema: Se olvida en algunos controllers)

```javascript
// capital.controller.js
const getAll = (req, res) => {
  const companyId = req.companyId;
  
  // Validación inline - fácil de olvidar
  if (!companyId) {
    return res.status(403).json({error: "..."}); 
  }
  
  // ... rest
};

// dashboard.controller.js
const getPeriodSummary = (req, res) => {
  // ⚠️ ¿Y si se olvida la validación aquí?
  const result = service.query(req.companyId); // ← puede ser null
};
```

### ✅ DESPUÉS (Solución: Middleware centralizado)

**Crear: middleware/requireCompanyContext.js**

```javascript
/**
 * Middleware que valida que request tenga contexto multi-tenant
 * Debe ejecutarse DESPUÉS de authenticateJWT
 */
export const requireCompanyContext = (req, res, next) => {
  if (!req.companyId) {
    return res.status(403).json({
      success: false,
      error: "COMPANY_CONTEXT_REQUIRED",
      message: "User not assigned to any company",
      details: {
        userId: req.userId,
        companyId: req.companyId
      }
    });
  }

  // ✅ Pasar al siguiente
  next();
};

/**
 * Middleware alternativo: 403 si algún requerimiento falla
 */
export const validateMultiTenantContext = (required = ["companyId"]) => {
  return (req, res, next) => {
    const missing = required.filter(field => !req[field]);
    
    if (missing.length > 0) {
      return res.status(403).json({
        success: false,
        error: "CONTEXT_VALIDATION_FAILED",
        missing,
        available: {
          userId: req.userId,
          companyId: req.companyId,
          role: req.role
        }
      });
    }
    
    next();
  };
};
```

**Uso en routes:**

```javascript
// routes/capital.js
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { requireCompanyContext } from "../middleware/requireCompanyContext.js";

router.get(
  "/stock",
  authenticateJWT,       // ← 1. Valida JWT
  requireCompanyContext, // ← 2. Valida contexto
  capital.getAll         // ← 3. Handler
);

router.get(
  "/detail/:id",
  authenticateJWT,
  requireCompanyContext,
  capital.getDetail
);
```

**Ventaja:**
- ✅ Validación declarativa
- ✅ Un lugar para cambios futuros
- ✅ Consistencia garantizada
- ✅ No se olvida en nuevos controllers

---

## 🚨 PATRÓN 2: ERROR HANDLING CENTRALIZADO

### ❌ ANTES (Problema: Inconsistencia en errores)

```javascript
// capital.controller.js
if (!companyId) {
  return res.status(403).json({error: "..."});
}

// dashboard.controller.js
if (!companyId) {
  return sendError(res, 403, "...");  // ← Diferente función
}

// personal.controller.js
if (!companyId) {
  throw new ValidationError("...");  // ← ¿Se atrapa?
}
```

### ✅ DESPUÉS (Solución: Error handler centralizado)

**Crear: utils/errors.js**

```javascript
/**
 * Clases de error personalizadas
 */
export class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, "VALIDATION_ERROR");
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message, resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 403, "UNAUTHORIZED");
  }
}

export class ConflictError extends AppError {
  constructor(message, conflictingField) {
    super(message, 409, "CONFLICT");
    this.conflictingField = conflictingField;
  }
}

/**
 * Función helper para respuestas JSON consistentes
 */
export const sendError = (res, error) => {
  const statusCode = error.statusCode || 500;
  
  return res.status(statusCode).json({
    success: false,
    error: error.errorCode || "INTERNAL_ERROR",
    message: error.message,
    ...(error.details && { details: error.details }),
    ...(error.conflictingField && { conflictingField: error.conflictingField }),
    timestamp: error.timestamp
  });
};

export const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  });
};
```

**Crear: middleware/errorHandler.js**

```javascript
/**
 * Middleware global que atrapa TODOS los errores
 * Debe ir al FINAL de app.use()
 */
export const errorHandler = (err, req, res, next) => {
  console.error("[ERROR_HANDLER]", {
    errorCode: err.errorCode || "UNKNOWN",
    message: err.message,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    userId: req.userId,
    companyId: req.companyId,
    timestamp: new Date().toISOString()
  });

  // Si es AppError, responde según el error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.errorCode,
      message: err.message,
      ...(err.details && { details: err.details }),
      timestamp: err.timestamp
    });
  }

  // Error desconocido → 500
  return res.status(500).json({
    success: false,
    error: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    ...(process.env.NODE_ENV === "development" && { 
      debugError: err.message 
    })
  });
};
```

**Uso en controllers:**

```javascript
// capital.controller.js
export const getAll = async (req, res, next) => {
  try {
    // ✅ Throw en lugar de return res.status()
    if (!req.companyId) {
      throw new UnauthorizedError("User not assigned to any company");
    }

    const items = await capitalService.getAll(req.companyId);
    
    // ✅ Respuesta consistente
    return sendSuccess(res, items);
    
  } catch (error) {
    // ✅ El errorHandler atrapa TODO
    next(error);
  }
};

// En app.js (al final)
import { errorHandler } from "./middleware/errorHandler.js";

app.use(errorHandler);
```

**Ventaja:**
- ✅ Un lugar para manejo de errores
- ✅ Logging centralizado
- ✅ Respuestas JSON consistentes
- ✅ Debugging más fácil

---

## 📊 PATRÓN 3: LOGGING ESTRUCTURADO

### ❌ ANTES

```javascript
console.log("query executed");
console.error("error happened");
console.log(result); // ← Objeto enorme sin estructura
```

### ✅ DESPUÉS

**Crear: utils/logger.js**

```javascript
/**
 * Logger con niveles y contexto
 */
const LOG_LEVELS = {
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARN: "WARN",
  ERROR: "ERROR",
  DEBUG: "DEBUG"
};

const log = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...context
  };
  
  // Colorear por ambiente
  if (process.env.NODE_ENV === "development") {
    const colors = {
      INFO: "\x1b[36m",    // Cyan
      SUCCESS: "\x1b[32m", // Green
      WARN: "\x1b[33m",    // Yellow
      ERROR: "\x1b[31m",   // Red
      DEBUG: "\x1b[35m"    // Magenta
    };
    const reset = "\x1b[0m";
    console.log(`${colors[level]}[${level}]${reset}`, JSON.stringify(logEntry, null, 2));
  } else {
    console.log(JSON.stringify(logEntry));
  }
};

export const logger = {
  info: (msg, ctx) => log(LOG_LEVELS.INFO, msg, ctx),
  success: (msg, ctx) => log(LOG_LEVELS.SUCCESS, msg, ctx),
  warn: (msg, ctx) => log(LOG_LEVELS.WARN, msg, ctx),
  error: (msg, ctx) => log(LOG_LEVELS.ERROR, msg, ctx),
  debug: (msg, ctx) => log(LOG_LEVELS.DEBUG, msg, ctx)
};
```

**Uso en controllers:**

```javascript
export const getAll = async (req, res, next) => {
  try {
    logger.info("[CAPITAL.getAll] START", {
      companyId: req.companyId,
      userId: req.userId,
      role: req.role
    });

    const items = await capitalService.getAll(req.companyId);
    
    logger.success("[CAPITAL.getAll] SUCCESS", {
      companyId: req.companyId,
      itemsCount: items.length
    });
    
    return sendSuccess(res, items);
    
  } catch (error) {
    logger.error("[CAPITAL.getAll] FAILED", {
      companyId: req.companyId,
      errorMessage: error.message
    });
    next(error);
  }
};
```

**Ventaja:**
- ✅ Logs parseables en producción
- ✅ Contexto consistente
- ✅ Colores en desarrollo
- ✅ Facilita ELK/DataDog integration

---

## 🧪 PATRÓN 4: TYPE SAFETY EN SERVICIOS

### ❌ ANTES

```javascript
// capital.service.js
export const getAll = (companyId) => {
  // ¿companyId puede ser null? undefined? string?
  return db.collection("capitals").find({companyId});
};

// Uso sin validación
const items = await capitalService.getAll(req.companyId); // ← puede ser null
```

### ✅ DESPUÉS (Con validación en servicios)

**Crear: utils/validation.js**

```javascript
/**
 * Validadores reutilizables
 */
export const validators = {
  objectId: (value) => {
    if (!value || typeof value !== "object" || !value.toString().match(/^[0-9a-f]{24}$/i)) {
      throw new ValidationError("Invalid ObjectId format");
    }
    return value;
  },
  
  string: (value, minLength = 1) => {
    if (typeof value !== "string" || value.trim().length < minLength) {
      throw new ValidationError(`String must be at least ${minLength} character(s)`);
    }
    return value.trim();
  },
  
  number: (value, min, max) => {
    const num = Number(value);
    if (isNaN(num) || (min !== undefined && num < min) || (max !== undefined && num > max)) {
      throw new ValidationError(`Number must be between ${min} and ${max}`);
    }
    return num;
  },
  
  date: (value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError("Invalid date format");
    }
    return date;
  },
  
  enum: (value, allowedValues) => {
    if (!allowedValues.includes(value)) {
      throw new ValidationError(`Must be one of: ${allowedValues.join(", ")}`);
    }
    return value;
  }
};
```

**Usar en servicios:**

```javascript
// capital.service.js
import { validators } from "../utils/validation.js";

export const getAll = (companyId) => {
  // ✅ Validar ANTES de usar
  companyId = validators.objectId(companyId);
  
  return db.collection("capitals").find({companyId});
};

export const getById = (companyId, capitalId) => {
  companyId = validators.objectId(companyId);
  capitalId = validators.objectId(capitalId);
  
  return db.collection("capitals").findOne({_id: capitalId, companyId});
};

export const create = (companyId, data) => {
  companyId = validators.objectId(companyId);
  data.name = validators.string(data.name, 3);
  data.amount = validators.number(data.amount, 0);
  
  return db.collection("capitals").insertOne({companyId, ...data});
};
```

**Ventaja:**
- ✅ Validación en una sola lugar
- ✅ Mensajes de error claros
- ✅ No se pasa null a queries
- ✅ Type-safe

---

## 🔀 FLUJO COMPLETO (Con todos los patrones)

```
REQUEST
   ↓
[authenticateJWT] ← Valida token, inyecta userId, companyId
   ↓
[requireCompanyContext] ← ✅ PATRÓN 1: Valida companyId exists
   ↓
CONTROLLER.action()
   ├─ logger.info("[ACTION] START")  ← PATRÓN 3
   ├─ service.operation(companyId)
   │  ├─ validators.objectId(companyId)  ← PATRÓN 4
   │  ├─ db.find({companyId})
   │  └─ return results
   ├─ logger.success("[ACTION] SUCCESS")
   └─ sendSuccess(res, data)  ← ✅ PATRÓN 2: Respuesta consistente
       ↓
    RESPONSE 200 OK

SI ERROR EN CUALQUIER PASO:
   └─ throw new AppError(...)
       ↓
   [errorHandler] atrapa  ← ✅ PATRÓN 2: Centralizado
       ├─ logger.error(...)
       └─ sendError(res, error)
           ↓
        RESPONSE 400/403/500 con formato consistente
```

---

## 📋 CHECKLIST PARA NUEVOS ENDPOINTS

Cuando crees un **nuevo endpoint**:

- [ ] **Route:** Agregué `requireCompanyContext` middleware
- [ ] **Controller:** Usé `sendSuccess()` y `sendError()`
- [ ] **Controller:** Agregué `logger.info()` y `logger.success()`
- [ ] **Service:** Validé parámetros con `validators.objectId()`
- [ ] **Service:** No lancé excepciones directas, usé `AppError` subclases
- [ ] **Tests:** Probé con y sin companyId
- [ ] **Tests:** Probé con parámetros inválidos

---

## 🚀 IMPLEMENTACIÓN GRADUAL

No necesitas cambiar TODO ahora. Puedes aplicar gradualmente:

### Fase 1 (YA HECHO)
- ✅ requireCompanyContext middleware
- ✅ Logging en controllers clave

### Fase 2 (PRÓXIMO)
- [ ] Crear error handler centralizado
- [ ] Refactorizar controllers a usar `throw`
- [ ] Apoyar validators reutilizables

### Fase 3 (FUTURO)
- [ ] Logger en todos los servicios
- [ ] TypeScript (opcional pero recomendado)
- [ ] OpenAPI/Swagger docs

---

## 📖 REFERENCIAS

- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [Node.js Error Classes](https://nodejs.org/api/errors.html#errors_class_error)
- [Logging Best Practices](https://12factor.net/logs)

---

**Última actualización:** 2025-02-16  
**Responsable:** Excedentes Backend Team

