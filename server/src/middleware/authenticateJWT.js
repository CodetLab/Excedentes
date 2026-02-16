import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/auth.js";
import logger from "../utils/logger.js";

/**
 * 🔐 FASE 3: Middleware de autenticación JWT
 * Valida token, inyecta identidad en request
 * 
 * req.userId -> userId (string)
 * req.companyId -> companyId (string | null)
 * req.role -> role ('admin' | 'company')
 * req.email -> email (string)
 */
export const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[AUTH] Missing auth header");
      return res.status(401).json({
        success: false,
        error: "Missing or invalid authorization header",
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.slice(7); // Remove "Bearer "

    const decoded = jwt.verify(token, getJwtSecret());

    // Inyectar en request
    req.userId = decoded.sub;
    req.email = decoded.email;
    req.companyId = decoded.companyId || null;
    req.role = decoded.role || "company";

    // 🔴 DEBUG: Logear qué se está inyectando
    console.log("[AUTH] JWT validated", {
      userId: req.userId,
      email: req.email,
      companyId: req.companyId,
      role: req.role,
      tokenFirstChars: token.substring(0, 20),
    });

    logger.debug("AUTH", "JWT validated", {
      userId: req.userId,
      companyId: req.companyId,
      role: req.role,
    });

    next();
  } catch (error) {
    logger.warn("AUTH", "JWT validation failed", { error: error.message });
    
    console.error("[authenticateJWT ERROR]", {
      errorMessage: error.message,
      authHeader: req.headers.authorization ? req.headers.authorization.substring(0, 30) : "MISSING",
      timestamp: new Date().toISOString()
    });

    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * 🔐 FASE 4: Middleware de autorización por rol
 * Valida que el usuario tenga uno de los roles requeridos
 */
export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      logger.warn("AUTH", "Insufficient role", {
        userId: req.userId,
        requiredRoles: allowedRoles,
        actualRole: req.role,
      });

      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

/**
 * 🔐 FASE 3: Middleware de validación de companyId
 * Valida que el usuario tenga una compañía asignada
 */
export const requireCompanyId = (req, res, next) => {
  if (!req.companyId) {
    logger.warn("AUTH", "User without company assignment", {
      userId: req.userId,
    });

    return res.status(403).json({
      success: false,
      error: "User not assigned to any company",
      timestamp: new Date().toISOString(),
    });
  }

  next();
};
