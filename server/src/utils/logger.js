/**
 * Structured Logger - v0.0.4
 * Logger simple y estructurado sin dependencias pesadas
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

/**
 * Formatear timestamp ISO
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Formatear mensaje de log
 */
function formatMessage(level, context, message, data = null) {
  const logEntry = {
    timestamp: getTimestamp(),
    level,
    context,
    message,
  };

  if (data !== null && data !== undefined) {
    logEntry.data = data;
  }

  return logEntry;
}

/**
 * Logger principal
 */
export const logger = {
  /**
   * Log de error - siempre se muestra
   */
  error(context, message, data = null) {
    if (currentLevel >= LOG_LEVELS.ERROR) {
      const entry = formatMessage("ERROR", context, message, data);
      console.error(JSON.stringify(entry));
    }
  },

  /**
   * Log de advertencia
   */
  warn(context, message, data = null) {
    if (currentLevel >= LOG_LEVELS.WARN) {
      const entry = formatMessage("WARN", context, message, data);
      console.warn(JSON.stringify(entry));
    }
  },

  /**
   * Log de información
   */
  info(context, message, data = null) {
    if (currentLevel >= LOG_LEVELS.INFO) {
      const entry = formatMessage("INFO", context, message, data);
      console.log(JSON.stringify(entry));
    }
  },

  /**
   * Log de debug - solo en desarrollo
   */
  debug(context, message, data = null) {
    if (currentLevel >= LOG_LEVELS.DEBUG) {
      const entry = formatMessage("DEBUG", context, message, data);
      console.log(JSON.stringify(entry));
    }
  },

  /**
   * Log específico para cálculos económicos
   */
  calculation(companyId, periodInfo, result) {
    const entry = {
      timestamp: getTimestamp(),
      level: "INFO",
      context: "CALCULATION",
      event: "CALCULATION_EXECUTED",
      companyId,
      period: periodInfo,
      result: {
        surplus: result.surplus ?? result.distributableSurplus ?? 0,
        breakEven: result.breakEven ?? 0,
        auditStatus: result.auditTrail?.status ?? result.auditStatus ?? "UNKNOWN",
      },
    };
    console.log(JSON.stringify(entry));
  },

  /**
   * Log específico para errores económicos
   */
  economicError(context, errorType, message, details = null) {
    const entry = {
      timestamp: getTimestamp(),
      level: "WARN",
      context,
      event: "ECONOMIC_ERROR",
      errorType,
      message,
      details,
    };
    console.warn(JSON.stringify(entry));
  },
};

export default logger;
