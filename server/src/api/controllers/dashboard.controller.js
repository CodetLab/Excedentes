import Capital from "../../models/CapitalModel.js";
import Costo from "../../models/CostoModel.js";

// Importar el motor de cálculo (compilado de TypeScript)
import { runExcedentesEngine } from "../../../dist/core/orchestrator.js";

/**
 * GET /api/dashboard/summary
 * Retorna resumen para gráficos del dashboard
 */
export const getSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const capitalFilter = userId ? { userId, activo: true } : { activo: true };
    const costosFilter = userId ? { userId } : {};
    
    const [capitalItems, costosItems] = await Promise.all([
      Capital.find(capitalFilter),
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
    const fixedLaborCosts = (capitalByTipo["PERSONAL_PROPIO"] || 0) + (capitalByTipo["PERSONAL_TERCEROS"] || 0);
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
      
      // Punto de equilibrio (line chart data)
      breakEvenData: {
        breakEvenPoint: fixedCapitalCosts + fixedLaborCosts + costosFijos,
        currentSales: ventas,
        margin: ventas - (fixedCapitalCosts + fixedLaborCosts + costosFijos),
      },
    };
    
    // Resumen de KPIs
    const kpis = {
      totalCapital,
      totalCostosFijos: fixedCapitalCosts + fixedLaborCosts + costosFijos,
      totalVentas: ventas,
      totalGanancias: ganancias,
      excedente: engineResult.distributableSurplus,
      auditStatus: engineResult.auditStatus,
      employeeCount: capitalItems.filter(c => 
        c.tipo === "PERSONAL_PROPIO" || c.tipo === "PERSONAL_TERCEROS"
      ).length,
    };
    
    res.json({
      kpis,
      chartData,
      engineResult: {
        auditStatus: engineResult.auditStatus,
        certificate: engineResult.certificate,
        capitalReturn: engineResult.capitalReturn,
        laborSurplusPool: engineResult.laborSurplusPool,
        distributableSurplus: engineResult.distributableSurplus,
      },
      meta: {
        itemCount: capitalItems.length,
        costosCount: costosItems.length,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ error: error.message });
  }
};
