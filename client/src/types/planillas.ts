// types/planillas.ts
// Tipos para las 11 planillas de carga del sistema

// ========================================
// CAPITAL - 6 planillas
// ========================================

// 1. Tierras
export interface TierraItem {
  id?: string;
  nombre: string;
  ubicacion: string;
  superficieHa: number;
  valorUSD: number;
  costoMantenimientoAnual: number;
  tipoUso: "AGRICOLA" | "GANADERO" | "MIXTO" | "OTRO";
  notas?: string;
}

// 2. Inmuebles
export interface InmuebleItem {
  id?: string;
  nombre: string;
  direccion: string;
  superficieM2: number;
  valorUSD: number;
  costoMantenimientoAnual: number;
  depreciacionAnual: number;
  tipo: "GALPON" | "OFICINA" | "DEPOSITO" | "VIVIENDA" | "OTRO";
  notas?: string;
}

// 3. Muebles
export interface MuebleItem {
  id?: string;
  nombre: string;
  descripcion: string;
  cantidad: number;
  valorUnitarioUSD: number;
  valorTotalUSD: number;
  depreciacionAnual: number;
  ubicacion?: string;
  notas?: string;
}

// 4. Vehículos
export interface VehiculoItem {
  id?: string;
  tipo: "AUTO" | "CAMION" | "TRACTOR" | "MOTO" | "OTRO";
  marca: string;
  modelo: string;
  anio: number;
  patente?: string;
  valorUSD: number;
  costoMantenimientoAnual: number;
  depreciacionAnual: number;
  kmActuales?: number;
  notas?: string;
}

// 5. Herramientas
export interface HerramientaItem {
  id?: string;
  nombre: string;
  categoria: "MANUAL" | "ELECTRICA" | "NEUMATICA" | "AGRICOLA" | "OTRO";
  cantidad: number;
  valorUnitarioUSD: number;
  valorTotalUSD: number;
  depreciacionAnual: number;
  estado: "BUENO" | "REGULAR" | "MALO";
  notas?: string;
}

// 6. Stock
export interface StockItem {
  id?: string;
  nombre: string;
  categoria: "MATERIA_PRIMA" | "INSUMO" | "INSUMOS" | "MATERIALES" | "REPUESTOS" | "PRODUCTOS" | "PRODUCTO_TERMINADO" | "REPUESTO" | "OTRO";
  unidad: string;
  cantidadActual: number;
  costoUnitarioUSD: number;
  valorTotalUSD: number;
  stockMinimo: number;
  notas?: string;
}

// ========================================
// PERSONAL - 2 planillas
// ========================================

// 7. Personal Propio
export interface PersonalPropioItem {
  id?: string;
  nombre: string;
  apellido: string;
  documento?: string;
  cargo: string;
  departamento?: string;
  salarioMensualUSD: number;
  cargosSocialesUSD: number;
  costoTotalMensualUSD: number;
  fechaIngreso: string;
  activo: boolean;
  notas?: string;
}

// 8. Personal de Terceros
export interface PersonalTercerosItem {
  id?: string;
  proveedor: string;
  servicio: string;
  cantidadPersonas: number;
  costoMensualUSD: number;
  tipoContrato: "EVENTUAL" | "PERMANENTE" | "POR_PROYECTO" | "TEMPORARIO" | "POR_OBRA" | "ZAFRA";
  fechaInicio: string;
  fechaFin?: string;
  activo: boolean;
  notas?: string;
}

// ========================================
// OTRAS PLANILLAS - 3 planillas
// ========================================

// 9. Ventas (totales, no unitarias)
export interface VentasData {
  id?: string;
  periodo: string;
  mes: number;
  anio: number;
  ventasTotalesUSD: number;
  desglose: {
    productos: number;
    servicios: number;
    otros: number;
  };
  fechaRegistro?: string;
  notas?: string;
}

// 10. Ganancias
export interface GananciasData {
  id?: string;
  periodo: string;
  mes: number;
  anio: number;
  gananciaUSD: number;
  desglose: {
    gananciaCapital: number;
    gananciaPersonal: number;
  };
  fechaRegistro?: string;
  notas?: string;
}

// 11. Extras (costos fijos adicionales)
export interface ExtrasItem {
  id?: string;
  concepto: string;
  categoria: "IMPUESTO" | "IMPUESTOS" | "SEGURO" | "SEGUROS" | "SERVICIO" | "SERVICIOS" | "MANTENIMIENTO" | "ADMINISTRATIVO" | "FINANCIERO" | "OTRO";
  montoUSD: number;
  frecuencia: "MENSUAL" | "BIMESTRAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";
  montoMensualUSD: number;
  esCostoFijo: boolean;
  notas?: string;
}

// ========================================
// TIPOS AGREGADOS
// ========================================

export type CapitalType = "tierras" | "inmuebles" | "muebles" | "vehiculos" | "herramientas" | "stock";
export type PersonalType = "propio" | "terceros";

export interface CapitalSummary {
  tierras: { count: number; valorTotal: number; costoAnual: number };
  inmuebles: { count: number; valorTotal: number; costoAnual: number };
  muebles: { count: number; valorTotal: number; costoAnual: number };
  vehiculos: { count: number; valorTotal: number; costoAnual: number };
  herramientas: { count: number; valorTotal: number; costoAnual: number };
  stock: { count: number; valorTotal: number };
  total: { valorTotal: number; costoFijoAnual: number };
}

export interface PersonalSummary {
  propio: { count: number; costoMensual: number; costoAnual: number };
  terceros: { count: number; costoMensual: number; costoAnual: number };
  total: { count: number; costoFijoAnual: number };
}

export interface DatosCargados {
  capital: CapitalSummary;
  personal: PersonalSummary;
  ventas: VentasData | null;
  ganancias: GananciasData | null;
  extras: ExtrasItem[];
  costosFijosTotal: number;
  // Costos variables = Ventas - Ganancias - Costos Fijos (calculado por el motor)
}
