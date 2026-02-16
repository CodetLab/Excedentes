import capitalRepository from "../repositories/capital.repository.js";
import Costo from "../models/CostoModel.js";
import { runExcedentesEngine } from "../../dist/core/orchestrator.js";
import { validateEconomicState } from "./economic.validator.js";
import logger from "../utils/logger.js";

/**
 * ExcedentesService - Lógica de negocio para cálculo de excedentes
 * Orquesta los datos de múltiples fuentes y ejecuta el motor de cálculo
 */
class ExcedentesService {
  /**
   * Calcular excedentes
   * @param {Object} overrides - Valores opcionales para sobrescribir los de la DB
   * @param {string} companyId - ID de la empresa
   */
  async calculate(overrides = {}, companyId = null) {
    // Obtener datos de la base de datos
    const capitalFilter = companyId ? { companyId, activo: true } : { activo: true };
    const costosFilter = companyId ? { companyId } : {};
    
    const [capitalItems, costosItems] = await Promise.all([
      capitalRepository.find(capitalFilter),
      Costo.find(costosFilter)
    ]);
    
    // Calcular costos fijos desde la DB
    const costosFijos = costosItems
      .filter(c => c.tipo === "FIJO")
      .reduce((sum, c) => sum + (c.monto || 0), 0);
    
    // Calcular capital por tipo
    const capitalByTipo = capitalItems.reduce((acc, item) => {
      acc[item.tipo] = (acc[item.tipo] || 0) + (item.costoUSD || item.valorUSD || 0);
      return acc;
    }, {});
    
    // Costos de personal (capital fijo de labor)
    const personalPropio = capitalByTipo["PERSONAL_PROPIO"] || 0;
    const personalTerceros = capitalByTipo["PERSONAL_TERCEROS"] || 0;
    const fixedLaborCosts = personalPropio + personalTerceros;
    
    // Costos de capital fijo (tierras, muebles, vehículos, herramientas, stock)
    const fixedCapitalCosts = 
      (capitalByTipo["TIERRAS"] || 0) +
      (capitalByTipo["MUEBLES"] || 0) +
      (capitalByTipo["VEHICULOS"] || 0) +
      (capitalByTipo["HERRAMIENTAS"] || 0) +
      (capitalByTipo["STOCK"] || 0);
    
    // Ventas y ganancias desde capital entries
    const ventasFromDB = capitalByTipo["VENTAS"] || 0;
    const gananciasFromDB = capitalByTipo["GANANCIAS"] || 0;
    const extrasFromDB = capitalByTipo["EXTRAS"] || 0;
    
    // Valores finales (permite override desde body)
    const sales = overrides.Sales ?? ventasFromDB;
    const profit = overrides.Profit ?? gananciasFromDB;
    const finalFixedCapitalCosts = overrides.FixedCapitalCosts ?? (fixedCapitalCosts + costosFijos);
    const finalFixedLaborCosts = overrides.FixedLaborCosts ?? fixedLaborCosts;
    
    // Validar estado económico ANTES de calcular
    validateEconomicState({
      sales,
      fixedCapitalCosts: finalFixedCapitalCosts,
      fixedLaborCosts: finalFixedLaborCosts,
      profit,
    });
    
    // Construir input para el engine
    const input = {
      Sales: sales,
      Profit: profit,
      FixedCapitalCosts: finalFixedCapitalCosts,
      FixedLaborCosts: finalFixedLaborCosts,
      Amortization: overrides.Amortization ?? 0,
      Interests: overrides.Interests ?? extrasFromDB,
      Period: overrides.Period ?? new Date().getFullYear().toString(),
      Currency: overrides.Currency ?? "USD",
      InflationIndex: overrides.InflationIndex ?? 1,
      AccountingCriteria: overrides.AccountingCriteria ?? "STANDARD",
      employees: overrides.employees ?? [],
    };
    
    // Ejecutar el engine
    const result = runExcedentesEngine(input);
    
    // Log del cálculo
    logger.calculation(
      companyId || "anonymous",
      { name: input.Period },
      { 
        surplus: result.distributableSurplus, 
        breakEven: input.FixedCapitalCosts + input.FixedLaborCosts, 
        auditStatus: result.auditStatus 
      }
    );
    
    return {
      input,
      result: {
        auditStatus: result.auditStatus,
        certificate: result.certificate,
        capitalReturn: result.capitalReturn,
        laborSurplusPool: result.laborSurplusPool,
        distributableSurplus: result.distributableSurplus,
        employeeSurplusLedger: result.employeeSurplusLedger,
        weightCapital: result.weightCapital,
        weightLabor: result.weightLabor,
      },
      meta: {
        capitalByTipo,
        costosFijosDB: costosFijos,
      }
    };
  }
}

export default new ExcedentesService();
