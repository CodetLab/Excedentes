import capitalRepository from "../repositories/capital.repository.js";
import Costo from "../models/CostoModel.js";
import { runExcedentesEngine } from "../../dist/core/orchestrator.js";
import logger from "../utils/logger.js";

/**
 * DashboardService - Lógica de negocio para Dashboard
 * Agrega datos de múltiples fuentes y ejecuta cálculos para visualización
 */
class DashboardService {
  /**
   * Obtener resumen completo para dashboard
   */
  async getSummary(userId = null) {
    const capitalFilter = userId ? { userId, activo: true } : { activo: true };
    const costosFilter = userId ? { userId } : {};
    
    const [capitalItems, costosItems] = await Promise.all([
      capitalRepository.find(capitalFilter),
      Costo.find(costosFilter)
    ]);
    
    // Agregar capital por tipo
    const capitalByTipo = {};
    let totalCapital = 0;
    
    for (const item of capitalItems) {
      const valor = item.costoUSD || item.valorUSD || 0;
      capitalByTipo[item.tipo] = (capitalByTipo[item.tipo] || 0) + valor;
      totalCapital += valor;
    }
    
    // Agregar costos
    const costosFijos = costosItems
      .filter(c => c.tipo === "FIJO")
      .reduce((sum, c) => sum + (c.monto || 0), 0);
    
    const costosVariables = costosItems
      .filter(c => c.tipo === "VARIABLE")
      .reduce((sum, c) => sum + (c.monto || 0), 0);
    
    // Calcular datos para el engine
    const fixedLaborCosts = 
      (capitalByTipo["PERSONAL_PROPIO"] || 0) + 
      (capitalByTipo["PERSONAL_TERCEROS"] || 0);
    
    const fixedCapitalCosts = 
      (capitalByTipo["TIERRAS"] || 0) +
      (capitalByTipo["MUEBLES"] || 0) +
      (capitalByTipo["VEHICULOS"] || 0) +
      (capitalByTipo["HERRAMIENTAS"] || 0) +
      (capitalByTipo["STOCK"] || 0);
    
    const ventas = capitalByTipo["VENTAS"] || 0;
    const ganancias = capitalByTipo["GANANCIAS"] || 0;
    const extras = capitalByTipo["EXTRAS"] || 0;
    
    // Input para el engine
    const engineInput = {
      Sales: ventas,
      Profit: ganancias,
      FixedCapitalCosts: fixedCapitalCosts + costosFijos,
      FixedLaborCosts: fixedLaborCosts,
      Amortization: 0,
      Interests: extras,
      Period: new Date().getFullYear().toString(),
      Currency: "USD",
      InflationIndex: 1,
      AccountingCriteria: "STANDARD",
      employees: [],
    };
    
    // Ejecutar cálculo
    const engineResult = runExcedentesEngine(engineInput);
    
    // Datos para gráficos
    const chartData = {
      // Distribución de capital por tipo (pie chart)
      capitalDistribution: Object.entries(capitalByTipo).map(([tipo, valor]) => ({
        tipo,
        valor,
        porcentaje: totalCapital > 0 ? ((valor / totalCapital) * 100).toFixed(2) : 0,
      })),
      
      // Balance general (bar chart)
      balanceGeneral: {
        ventas,
        costosFijos: fixedCapitalCosts + fixedLaborCosts + costosFijos,
        costosVariables,
        ganancias,
        excedente: engineResult.distributableSurplus,
      },
      
      // Distribución de excedente (pie chart)
      surplusDistribution: {
        capitalReturn: engineResult.capitalReturn,
        laborSurplusPool: engineResult.laborSurplusPool,
        weightCapital: engineResult.weightCapital,
        weightLabor: engineResult.weightLabor,
      },
      
      // Punto de equilibrio
      breakEvenData: {
        puntodeEquilibrio: fixedCapitalCosts + fixedLaborCosts + costosFijos,
        ventasActuales: ventas,
        margenSeguridad: ventas - (fixedCapitalCosts + fixedLaborCosts + costosFijos),
      },
      
      // Totales
      totals: {
        totalCapital,
        totalCostosFijos: costosFijos,
        totalCostosVariables: costosVariables,
        totalVentas: ventas,
        totalGanancias: ganancias,
        totalExtras: extras,
        totalPersonal: fixedLaborCosts,
      }
    };

    // Log para auditoría
    logger.info("Dashboard summary generated", { userId, chartData });

    return chartData;
  }

  /**
   * Obtener KPIs principales
   */
  async getKPIs(userId = null) {
    const summary = await this.getSummary(userId);
    
    const { balanceGeneral, totals, breakEvenData } = summary;
    
    return {
      margenGanancia: totals.totalVentas > 0 
        ? ((totals.totalGanancias / totals.totalVentas) * 100).toFixed(2)
        : 0,
      margenSeguridadPorcentaje: totals.totalVentas > 0
        ? ((breakEvenData.margenSeguridad / totals.totalVentas) * 100).toFixed(2)
        : 0,
      puntodeEquilibrio: breakEvenData.puntodeEquilibrio,
      excedente: balanceGeneral.excedente,
      ventasRequeridas: breakEvenData.puntodeEquilibrio,
    };
  }
}

export default new DashboardService();
