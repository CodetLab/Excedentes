import dashboardService from "../../services/dashboard.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

/**
 * GET /api/dashboard/summary
 * Retorna resumen para gráficos del dashboard
 */
export const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const summary = await dashboardService.getSummary(userId);
  sendSuccess(res, summary);
});

/**
 * GET /api/dashboard/kpis
 * Retorna KPIs principales
 */
export const getKPIs = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const kpis = await dashboardService.getKPIs(userId);
  sendSuccess(res, kpis);
});
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
