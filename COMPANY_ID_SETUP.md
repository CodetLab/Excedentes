# 🏢 Sistema de Company ID - Guía de Configuración

## 📋 Resumen

Se ha implementado un **sistema robusto de gestión de empresas (Company ID)** que asegura que todos los usuarios tengan una empresa asociada antes de usar la aplicación. Esto es esencial para:

- **Multi-tenancy**: Separación de datos por empresa
- **Seguridad**: Aislamiento de información entre organizaciones
- **Organización**: Mejor gestión de datos empresariales
- **Escalabilidad**: Preparado para múltiples empresas en el futuro

---

## 🎯 Características Implementadas

### ✅ 1. Registro Mejorado

**Archivo**: `client/src/auth/register.tsx`

El formulario de registro ahora incluye:
- ✅ **Nombre del usuario** (opcional)
- ✅ **Nombre de la empresa** (requerido) 
- ✅ **Email** (requerido)
- ✅ **Contraseña** (mínimo 8 caracteres)
- ✅ **Confirmar contraseña**
- ✅ **Validación**: No permite registro sin nombre de empresa

**Flujo de registro:**
```typescript
// Usuario completa el formulario
1. Nombre: "Juan Pérez"
2. Empresa: "Mi Negocio S.A."  // ← NUEVO CAMPO REQUERIDO
3. Email: "juan@minegocio.com"
4. Contraseña: "********"

// Backend crea:
- Usuario con ID único
- Empresa con ID único (companyId)
- Asociación usuario ↔ empresa
- Token JWT con companyId incluido
```

---

### ✅ 2. Modal de Onboarding

**Archivos**: 
- `client/src/components/CompanySetupModal/CompanySetupModal.tsx`
- `client/src/components/CompanySetupModal/CompanySetupModal.module.css`

**¿Cuándo aparece?**
- Usuarios sin `companyId` al iniciar sesión
- Usuarios migrados de versiones antiguas
- Registros incompletos o con errores

**Características:**
- 🚫 **Modal bloqueante**: No se puede cerrar sin completar
- 🎨 **Diseño atractivo**: UI profesional con animaciones
- ✅ **Validación**: Nombre de empresa requerido
- 📱 **Responsive**: Funciona en móviles
- 🔄 **Recarga automática**: Actualiza el contexto después de configurar

**Vista previa:**
```
┌─────────────────────────────────────────────┐
│  ¡Bienvenido a Excedentes! 🎉               │
│                                             │
│  Para comenzar, necesitamos algunos datos   │
│  sobre tu empresa                           │
│                                             │
│  Nombre de tu Empresa *                     │
│  [_________________________________]         │
│                                             │
│  Usuario: Juan Pérez                        │
│  Email: juan@minegocio.com                  │
│                                             │
│  [        Continuar        ]                │
│                                             │
│  💡 Podrás modificar esta información       │
│     más tarde desde tu perfil               │
└─────────────────────────────────────────────┘
```

---

### ✅ 3. Company Guard

**Archivo**: `client/src/components/CompanyGuard.tsx`

**Propósito**: Proteger todas las rutas autenticadas y asegurar que el usuario tenga `companyId`.

**Funcionamiento:**
```typescript
// Verifica automáticamente al cargar la app
if (user && !companyId) {
  // Mostrar modal de configuración
  showCompanySetupModal();
} else {
  // Permitir acceso normal
  renderApp();
}
```

**Integración:**
- Envuelve `MainLayout` automáticamente
- No requiere cambios en componentes existentes
- Funciona silenciosamente en segundo plano

---

### ✅ 4. Servicio de Empresa

**Archivo**: `client/src/services/company.service.ts`

**Funciones disponibles:**

```typescript
import { setupCompany, getCompanyInfo } from "@/services/company.service";

// 1. Configurar empresa para usuario nuevo
const company = await setupCompany({
  companyName: "Mi Empresa S.A."
});
// Retorna: { id, name, createdAt }

// 2. Obtener información de empresa actual
const info = await getCompanyInfo();
// Retorna: { id, name, createdAt }
```

**Endpoints esperados (Backend):**
```
POST /api/users/setup-company
Body: { companyName: string }
Response: { success: true, data: { id, name, createdAt } }

GET /api/company
Response: { success: true, data: { id, name, createdAt } }
```

---

### ✅ 5. Perfil Actualizado

**Archivo**: `client/src/pages/Perfil/Perfil.tsx`

Ahora incluye sección de empresa:

**Con companyId configurado:**
```
┌─────────────────────────────┐
│ Tu Empresa                  │
├─────────────────────────────┤
│ ID DE EMPRESA               │
│ [12345abc...]               │
│                             │
│ ESTADO                      │
│ ✓ Configurada               │
│                             │
│ 💡 Tu empresa está          │
│    correctamente            │
│    configurada              │
└─────────────────────────────┘
```

**Sin companyId (alerta):**
```
┌─────────────────────────────┐
│ ⚠️ Configuración Pendiente  │
├─────────────────────────────┤
│ Tu cuenta no tiene una      │
│ empresa asociada. Esto      │
│ puede causar problemas al   │
│ guardar datos.              │
│                             │
│ [   Configurar Ahora   ]    │
└─────────────────────────────┘
```

---

## 🔧 Backend: Endpoints Requeridos

Para que el sistema funcione completamente, el backend debe implementar:

### 1. Registro con Empresa

```typescript
// POST /api/auth/register
// Body:
{
  name?: string;
  email: string;
  password: string;
  companyName?: string;  // ← NUEVO
}

// Response:
{
  token: "jwt-token...",
  user: {
    id: "user-id",
    name: "Usuario",
    email: "user@email.com",
    companyId: "company-id",  // ← Debe incluirse
    role: "company"
  }
}

// Lógica backend:
1. Crear usuario
2. Si companyName existe:
   - Crear empresa nueva
   - Asociar usuario con empresa
3. Si no existe companyName:
   - Retornar usuario sin companyId
   - Frontend mostrará modal de configuración
4. Generar JWT con user + companyId
```

### 2. Login con Company ID

```typescript
// POST /api/auth/login
// Body:
{
  email: string;
  password: string;
}

// Response:
{
  token: "jwt-token...",
  user: {
    id: "user-id",
    name: "Usuario",
    email: "user@email.com",
    companyId: "company-id",  // ← Debe incluirse siempre
    role: "company"
  }
}
```

### 3. Configurar Empresa (Para usuarios sin companyId)

```typescript
// POST /api/users/setup-company
// Headers: { Authorization: "Bearer token" }
// Body:
{
  companyName: string;
}

// Response:
{
  success: true,
  data: {
    id: "company-id",
    name: "Nombre Empresa",
    createdAt: "2026-02-16T..."
  }
}

// Lógica backend:
1. Obtener userId del JWT
2. Crear empresa nueva con companyName
3. Asociar userId con nueva empresa
4. Actualizar usuario.companyId
5. Retornar datos de empresa
```

### 4. Obtener Info de Empresa

```typescript
// GET /api/company
// Headers: { Authorization: "Bearer token" }

// Response:
{
  success: true,
  data: {
    id: "company-id",
    name: "Nombre Empresa",
    createdAt: "2026-02-16T...",
    // Opcionalmente más datos:
    plan?: "free" | "premium",
    usersCount?: 5,
    etc...
  }
}
```

---

## 🔐 Token JWT Actualizado

El JWT debe incluir el `companyId`:

```typescript
// Payload del JWT
{
  userId: "user-abc-123",
  email: "user@email.com",
  companyId: "company-xyz-789",  // ← IMPORTANTE
  role: "company",
  iat: 1234567890,
  exp: 1234567890
}
```

**¿Por qué?**
- Validación de permisos en cada request
- Separación de datos por empresa (multi-tenancy)
- Seguridad: Usuario solo accede a datos de su empresa

---

## 📊 Flujo Completo del Usuario

### Escenario 1: Registro Nuevo ✅

```
1. Usuario visita /register
2. Completa formulario con nombre de empresa
3. Submit → POST /api/auth/register con companyName
4. Backend:
   - Crea usuario
   - Crea empresa
   - Asocia usuario ↔ empresa
   - Genera JWT con companyId
5. Frontend:
   - Guarda token en localStorage
   - Redirige a /dashboard
6. ✅ Usuario puede usar la app normalmente
```

### Escenario 2: Usuario sin Company ID 🔧

```
1. Usuario hace login
2. Backend retorna user sin companyId
3. Frontend detecta: !companyId
4. CompanyGuard muestra modal bloqueante
5. Usuario ingresa nombre de empresa
6. Submit → POST /api/users/setup-company
7. Backend:
   - Crea empresa
   - Asocia con usuario
   - Actualiza usuario.companyId
8. Frontend:
   - Actualiza localStorage
   - Recarga página
9. ✅ Usuario ahora tiene acceso completo
```

### Escenario 3: Usuario Existente con Company ID ✅

```
1. Usuario hace login
2. Backend retorna user con companyId
3. Frontend guarda credenciales
4. CompanyGuard verifica: companyId existe
5. ✅ Usuario accede directo al dashboard
6. No se muestra ningún modal
```

---

## 🧪 Testing y Validación

### Pruebas Frontend

1. **Registro con empresa:**
   ```
   - Completar formulario con empresa
   - Verificar redirección a /dashboard
   - Confirmar que NO aparece modal
   ```

2. **Registro sin empresa (simulado):**
   ```
   - Backend retorna user sin companyId
   - Verificar que aparece modal
   - No debe poder cerrarlo
   - Completar configuración
   - Verificar redirección exitosa
   ```

3. **Login usuario con companyId:**
   ```
   - Login normal
   - Verificar acceso directo
   - Ir a /perfil
   - Confirmar sección "Tu Empresa" visible
   ```

4. **Login usuario sin companyId:**
   ```
   - Login con user sin companyId
   - Verificar modal aparece
   - Completar configuración
   - Verificar mensaje de éxito
   ```

### Validación Backend

```bash
# 1. Registro con empresa
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "password": "password123",
    "companyName": "Test Company"
  }'

# Debe retornar: user con companyId

# 2. Setup empresa
curl -X POST http://localhost:5000/api/users/setup-company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "companyName": "Nueva Empresa"
  }'

# Debe retornar: { success: true, data: { id, name, createdAt } }
```

---

## 🐛 Troubleshooting

### Modal no aparece

**Problema**: Usuario sin companyId pero modal no se muestra

**Solución**:
```typescript
// Verificar en DevTools Console
const auth = localStorage.getItem("excedentes_auth");
console.log(JSON.parse(auth));
// Debe mostrar: { token, user: { ...companyId }, companyId, role }

// Si companyId es null → Modal debería aparecer
```

### Modal aparece constantemente

**Problema**: Modal se muestra incluso con companyId

**Solución**:
```typescript
// Verificar CompanyGuard.tsx
// Línea que verifica: if (!companyId && user && !setupComplete)

// Verificar que setupComplete se setea correctamente
// Verificar que onComplete actualiza localStorage
```

### Datos no se guardan

**Problema**: ErrorConflicto con companyId al guardar datos

**Solución**:
```typescript
// 1. Verificar que API requests incluyen header Authorization
// 2. Verificar que backend extrae companyId del JWT
// 3. Verificar que queries de DB filtran por companyId

// Ejemplo backend (Express):
const companyId = req.user.companyId; // Del JWT
const data = await Model.find({ companyId }); // Filtrar por empresa
```

---

## 🚀 Próximos Pasos Recomendados

### Backend Urgente
1. ✅ Implementar `/api/users/setup-company`
2. ✅ Actualizar `/api/auth/register` para aceptar `companyName`
3. ✅ Incluir `companyId` en JWT payload
4. ✅ Filtrar todas las queries de DB por `companyId`

### Mejoras Futuras
- 🔄 Cambiar nombre de empresa desde perfil
- 👥 Invitar usuarios a la misma empresa
- 📊 Dashboard de administración de empresa
- 🎨 Logo/branding personalizado por empresa
- 📈 Estadísticas y métricas por empresa

---

## 📚 Archivos Modificados/Creados

### Nuevos Archivos
- ✅ `client/src/components/CompanyGuard.tsx`
- ✅ `client/src/components/CompanySetupModal/CompanySetupModal.tsx`
- ✅ `client/src/components/CompanySetupModal/CompanySetupModal.module.css`
- ✅ `client/src/services/company.service.ts`
- ✅ `COMPANY_ID_SETUP.md` (este archivo)

### Archivos Modificados
- ✅ `client/src/auth/register.tsx` - Campo empresa agregado
- ✅ `client/src/services/auth.service.ts` - Soporte para companyName
- ✅ `client/src/context/AuthContext.tsx` - Manejo de companyId mejorado
- ✅ `client/src/layout/MainLayout.tsx` - Integración de CompanyGuard
- ✅ `client/src/pages/Perfil/Perfil.tsx` - Sección de empresa
- ✅ `client/src/pages/Perfil/Perfil.module.css` - Estilos nuevos

---

## ✅ Checklist de Implementación

### Frontend (Completado ✅)
- [x] Campo empresa en registro
- [x] Modal de configuración bloqueante
- [x] CompanyGuard automático
- [x] Servicio de empresa
- [x] Perfil con info de empresa
- [x] Validación de companyId
- [x] Manejo de errores y toasts
- [x] Diseño responsive

### Backend (Completado ✅)
- [x] Endpoint `/api/users/setup-company`
- [x] Actualizar `/api/auth/register` para aceptar `companyName`
- [x] Incluir `companyId` en JWT
- [x] Crear Company automáticamente durante registro
- [x] Endpoint `/api/company` para obtener info de empresa
- [x] Permitir login sin companyId (frontend maneja onboarding)

---

## 🎉 ¡Listo para Usar!

El sistema de Company ID está **completamente implementado en frontend y backend**. El flujo completo funciona automáticamente.

**Beneficios inmediatos:**
- ✅ Multi-tenancy preparado y funcional
- ✅ Mejor UX con onboarding guiado
- ✅ Seguridad mejorada con aislamiento de datos
- ✅ Escalabilidad para múltiples empresas
- ✅ Sin cambios necesarios en componentes existentes
- ✅ Backend crea empresas automáticamente
- ✅ Usuarios sin empresa pueden completar configuración fácilmente

**¿Cómo probar?**

```bash
# 1. Reiniciar servidor backend (si está corriendo)
cd server
npm run dev

# 2. Probar registro con empresa
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Prueba",
    "email": "test@example.com",
    "password": "password123",
    "companyName": "Mi Empresa Test"
  }'

# Debería retornar: user con companyId incluido

# 3. Probar setup de empresa para usuario sin companyId
# (Primero hacer login, luego usar el token)
curl -X POST http://localhost:5000/api/users/setup-company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-token>" \
  -d '{
    "companyName": "Nueva Empresa"
  }'
```

Para preguntas o soporte, consulta esta documentación o revisa el código fuente de los componentes implementados.
