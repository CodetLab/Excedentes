/**
 * 🔐 FASE 3: Multi-Tenant Validation Helper
 * Centraliza la lógica de validación de pertenencia de recursos
 */

/**
 * Valida que un recurso pertenece a la company del usuario
 * @param {string} resourceCompanyId - companyId del recurso
 * @param {string} userCompanyId - companyId del usuario (de JWT)
 * @param {string} userRole - role del usuario (admin | company)
 * @returns {boolean}
 */
export const validateCompanyAccess = (
  resourceCompanyId,
  userCompanyId,
  userRole
) => {
  // El usuario admin puede acceder a recursos de cualquier empresa
  if (userRole === "admin") {
    return true;
  }

  // Usuario company solo puede acceder a su propia empresa
  if (userRole === "company") {
    return (
      resourceCompanyId && 
      userCompanyId && 
      resourceCompanyId.toString() === userCompanyId.toString()
    );
  }

  return false;
};

/**
 * Construye filtro de query automático basado en rol del usuario
 * @param {Object} user - { userId, companyId, role }
 * @returns {Object} - Filtro para MongoDB query
 */
export const buildCompanyFilter = (user) => {
  const { companyId, role } = user;

  // Admin: sin filtro (puede ver todo)
  if (role === "admin") {
    return {};
  }

  // Company: solo su compañía
  if (role === "company" && companyId) {
    return { companyId };
  }

  // Sin empresa asignada: bloquear con filtro imposible
  return { companyId: null }; // Nunca coincidirá con docs reales
};

/**
 * Valida que un usuario pueda acceder a un período y retorna 404 si no
 * Uso en controllers:
 * 
 * const canAccess = validatePeriodAccess(period.companyId, req.companyId, req.role);
 * if (!canAccess) return res.status(404).json({...})
 */
export const validatePeriodAccess = (
  periodCompanyId,
  userCompanyId,
  userRole
) => {
  return validateCompanyAccess(periodCompanyId, userCompanyId, userRole);
};

/**
 * Valida acceso a Capital item
 */
export const validateCapitalAccess = (
  capitalCompanyId,
  userCompanyId,
  userRole
) => {
  return validateCompanyAccess(capitalCompanyId, userCompanyId, userRole);
};

/**
 * Ensura que todas las queries filtren por companyId
 * Usage en servicios:
 * 
 * const filter = { ...otherFilters, ...enforceCompanyFilter(req.companyId, req.role) };
 */
export const enforceCompanyFilter = (userCompanyId, userRole) => {
  if (userRole === "admin") {
    return {}; // Admin sin restricción
  }

  if (userRole === "company" && userCompanyId) {
    return { companyId: userCompanyId };
  }

  // Seguridad por defecto: bloquear acceso
  return { companyId: null };
};
