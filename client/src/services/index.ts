// services/index.ts
// Índice central de todos los servicios del cliente

export { default as authService } from "./auth.service";
export { default as calculationService } from "./calculation.service";
export { default as capitalService } from "./capital.service";
export { default as personalService } from "./personal.service";
export { default as datosService } from "./datos.service";

// Re-exportar servicios específicos para acceso directo
export {
  tierrasService,
  inmueblesService,
  mueblesService,
  vehiculosService,
  herramientasService,
  stockService,
  getCapitalSummary,
} from "./capital.service";

export {
  personalPropioService,
  personalTercerosService,
  getPersonalSummary,
} from "./personal.service";

export {
  ventasService,
  gananciasService,
  extrasService,
  getDatosCargados,
} from "./datos.service";
