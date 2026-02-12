// utils/payloadNormalizer.ts
/**
 * Utilidades para normalizar payloads antes de enviarlos al backend
 * Previene errores 400 por tipos de datos incorrectos
 */

/**
 * Convierte strings a números en los campos especificados
 */
export const normalizeNumbers = <T extends Record<string, any>>(
  obj: T,
  numberFields: string[]
): T => {
  const normalized = { ...obj } as any;
  
  numberFields.forEach((field) => {
    if (field in normalized) {
      const value = normalized[field];
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        normalized[field] = isNaN(parsed) ? 0 : parsed;
      } else if (value === null || value === undefined) {
        normalized[field] = 0;
      }
    }
  });
  
  return normalized as T;
};

/**
 * Remueve campos undefined y opcionales vacíos
 */
export const removeEmptyFields = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const cleaned: Record<string, any> = {};
  
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
  });
  
  return cleaned as Partial<T>;
};

/**
 * Normaliza payload de Extras para compatibilidad con backend
 * Backend espera "nombre" en lugar de "concepto"
 */
export const normalizeExtrasPayload = (form: any) => {
  const numberFields = ["montoUSD", "montoMensualUSD"];
  const normalized = normalizeNumbers(form, numberFields);
  
  return {
    ...normalized,
    nombre: normalized.concepto, // Backend espera "nombre"
    esCostoFijo: normalized.esCostoFijo !== false,
    activo: normalized.activo !== false,
  };
};

/**
 * Normaliza payload de Capital (Tierras, Inmuebles, etc.)
 */
export const normalizeCapitalPayload = (form: any, tipo: string) => {
  const numberFields = [
    "valorUSD",
    "superficie",
    "superficieTotal",
    "costoAnualUSD",
    "cantidadHa",
    "valorPorHa",
  ];
  const normalized = normalizeNumbers(form, numberFields);
  
  return {
    ...normalized,
    tipo,
    activo: normalized.activo !== false,
  };
};

/**
 * Normaliza payload de Personal (Propio/Terceros)
 */
export const normalizePersonalPayload = (form: any) => {
  const numberFields = [
    "salarioMensualUSD",
    "cargosSocialesUSD",
    "costoTotalMensualUSD",
    "cantidadPersonas",
    "costoMensualUSD",
  ];
  const normalized = normalizeNumbers(form, numberFields);
  
  return {
    ...normalized,
    activo: normalized.activo !== false,
  };
};

/**
 * Normaliza payload de Ventas
 */
export const normalizeVentasPayload = (form: any) => {
  const numberFields = [
    "ventasTotalesUSD",
    "productos",
    "servicios",
    "otros",
  ];
  const normalized = normalizeNumbers(form, numberFields);
  
  return {
    ...normalized,
    desglose: {
      productos: normalized.desglose?.productos || 0,
      servicios: normalized.desglose?.servicios || 0,
      otros: normalized.desglose?.otros || 0,
    },
  };
};

/**
 * Normaliza payload de Ganancias
 */
export const normalizeGananciasPayload = (form: any) => {
  const numberFields = [
    "gananciaUSD",
    "gananciaCapital",
    "gananciaPersonal",
  ];
  const normalized = normalizeNumbers(form, numberFields);
  
  return {
    ...normalized,
    desglose: {
      gananciaCapital: normalized.desglose?.gananciaCapital || 0,
      gananciaPersonal: normalized.desglose?.gananciaPersonal || 0,
    },
  };
};

/**
 * Wrapper genérico para normalizar antes de enviar al backend
 */
export const normalizePayload = <T extends Record<string, any>>(
  payload: T,
  type: "extras" | "capital" | "personal" | "ventas" | "ganancias",
  options?: { tipo?: string }
): T => {
  switch (type) {
    case "extras":
      return normalizeExtrasPayload(payload) as T;
    case "capital":
      return normalizeCapitalPayload(payload, options?.tipo || "CAPITAL") as T;
    case "personal":
      return normalizePersonalPayload(payload) as T;
    case "ventas":
      return normalizeVentasPayload(payload) as T;
    case "ganancias":
      return normalizeGananciasPayload(payload) as T;
    default:
      return payload;
  }
};
