import Capital from "../../models/CapitalModel.js";
import Costo from "../../models/CostoModel.js";
import { runExcedentesEngine } from "../../../dist/core/orchestrator.js";
import { validateEconomicState } from "../../services/economic.validator.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import logger from "../../utils/logger.js";

/**
 * POST /api/excedentes/calc
 * Agrega inputs del usuario (costos, ventas, capital) y ejecuta runExcedentesEngine
 * Actualizado para v0.0.4 - Data Integrity & Economic Safety
 * 
 * Body opcional (para override manual):
 * {
 *   Sales: number,
 *   Profit: number, 
 *   FixedCapitalCosts: number,
 *   FixedLaborCosts: number,
 *   Amortization: number,
 *   Interests: number,
 *   Period: string,
 *   Currency: string,
 *   InflationIndex: number,
 *   AccountingCriteria: string,
 *   employees: [{ id, name }]
 * }
 */
export const calculate = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  
  // Obtener datos de la base de datos
  const capitalFilter = userId ? { userId, activo: true } : { activo: true };
  const costosFilter = userId ? { userId } : {};
  
  const [capitalItems, costosItems] = await Promise.all([
    Capital.find(capitalFilter),
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
  const sales = req.body.Sales ?? ventasFromDB;
  const profit = req.body.Profit ?? gananciasFromDB;
  const finalFixedCapitalCosts = req.body.FixedCapitalCosts ?? (fixedCapitalCosts + costosFijos);
  const finalFixedLaborCosts = req.body.FixedLaborCosts ?? fixedLaborCosts;
  
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
    Amortization: req.body.Amortization ?? 0,
    Interests: req.body.Interests ?? extrasFromDB,
    Period: req.body.Period ?? new Date().getFullYear().toString(),
    Currency: req.body.Currency ?? "USD",
    InflationIndex: req.body.InflationIndex ?? 1,
    AccountingCriteria: req.body.AccountingCriteria ?? "STANDARD",
    employees: req.body.employees ?? [],
  };
  
  // Ejecutar el engine
  const result = runExcedentesEngine(input);
  
  // Log del cálculo
  logger.calculation(
    userId || "anonymous",
    { name: input.Period },
    { surplus: result.distributableSurplus, breakEven: input.FixedCapitalCosts + input.FixedLaborCosts, auditStatus: result.auditStatus }
  );
  
  sendSuccess(res, {
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
  });
});
