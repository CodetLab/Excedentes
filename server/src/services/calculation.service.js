import { runExcedentesEngine } from "../../dist/core/orchestrator.js";
import companyRepository from "../repositories/company.repository.js";
import employeeRepository from "../repositories/employee.repository.js";
import assetRepository from "../repositories/asset.repository.js";
import periodRepository from "../repositories/period.repository.js";
import dataConsolidationService from "./data-consolidation.service.js";
import { validateEconomicState } from "./economic.validator.js";
import { NotFoundError } from "../utils/errors.js";
import logger from "../utils/logger.js";

/**
 * EconomicCalculationService - v0.0.4
 * 
 * Servicio principal que orquesta el cálculo económico.
 * Conecta los repositorios con el Core Engine puro.
 * Incluye validaciones económicas y logging estructurado.
 */
class EconomicCalculationService {
  /**
   * NUEVO v0.0.4: Calcular usando datos persistidos agrupados por período
   * 🔐 FASE 5: Ahora requiere companyId como identificador principal
   * 
   * @param {string} companyId - ID de la empresa
   * @param {number} month - Mes (1-12)
   * @param {number} year - Año
   * @returns {Promise<Object>} Resultado del cálculo
   */
  async calculateByPeriod(companyId, month, year) {
    if (!companyId) {
      throw new Error("companyId es requerido");
    }

    logger.info(`Iniciando cálculo para período ${month}/${year}, companyId: ${companyId}`);

    // 1. Consolidar datos desde la base de datos (ahora con companyId)
    const consolidatedData = await dataConsolidationService.consolidateByPeriod(
      companyId,
      month,
      year
    );

    // 2. Validar estado económico ANTES de calcular
    validateEconomicState({
      sales: consolidatedData.sales,
      fixedCapitalCosts: consolidatedData.fixedCapitalCosts,
      fixedLaborCosts: consolidatedData.fixedLaborCosts,
      profit: consolidatedData.profit,
    });

    // 3. Preparar input para el motor
    const engineInput = {
      Sales: consolidatedData.sales,
      FixedCapitalCosts: consolidatedData.fixedCapitalCosts,
      FixedLaborCosts: consolidatedData.fixedLaborCosts,
      Profit: consolidatedData.profit,
      Amortization: 0, // Por ahora sin amortización
      Interests: 0, // Por ahora sin intereses
      Period: consolidatedData.period.name,
      Currency: "USD",
      InflationIndex: 1,
      AccountingCriteria: "ACCRUAL",
      employees: consolidatedData.employees,
    };

    // 4. Ejecutar motor de cálculo (función pura)
    logger.info("Ejecutando motor de cálculo", { 
      sales: engineInput.Sales,
      fixedCosts: engineInput.FixedCapitalCosts + engineInput.FixedLaborCosts
    });

    const result = runExcedentesEngine(engineInput);

    // 5. Formatear respuesta
    const formattedResult = this.formatResponse(engineInput, result, null, consolidatedData);

    // 6. Log del cálculo exitoso
    logger.calculation(companyId, consolidatedData.period, formattedResult);

    return formattedResult;
  }

  /**
   * Ejecutar cálculo para un período específico
   * 🔐 FASE 5: Valida que el período pertenece a la empresa del usuario
   */
  async calculateForPeriod(periodId, companyId, userRole = "company") {
    // 1. Obtener datos del período
    const period = await periodRepository.findById(periodId);
    if (!period) {
      throw new NotFoundError("Período", periodId);
    }

    // 🔐 Validar acceso multi-tenant
    if (userRole === "company" && period.companyId.toString() !== companyId) {
      // Retornar 404 para no revelar existencia del recurso
      throw new NotFoundError("Período", periodId);
    }

    // 2. Verificar que la empresa existe
    const companyExists = await companyRepository.exists(period.companyId);
    if (!companyExists) {
      throw new NotFoundError("Empresa", period.companyId);
    }

    // 3. Validar estado económico ANTES de calcular
    validateEconomicState({
      sales: period.sales,
      fixedCapitalCosts: period.fixedCapitalCosts,
      fixedLaborCosts: period.fixedLaborCosts,
      profit: period.profit,
    });

    // 4. Obtener empleados formateados para el motor
    const employees = await employeeRepository.getForCalculation(period.companyId);

    // 5. Preparar input para el motor
    const engineInput = {
      Sales: period.sales,
      FixedCapitalCosts: period.fixedCapitalCosts,
      FixedLaborCosts: period.fixedLaborCosts,
      Profit: period.profit,
      Amortization: period.amortization,
      Interests: period.interests,
      Period: period.name,
      Currency: period.currency,
      InflationIndex: period.inflationIndex,
      AccountingCriteria: period.accountingCriteria,
      employees,
    };

    // 6. Ejecutar motor de cálculo (función pura)
    const result = runExcedentesEngine(engineInput);

    // 7. Guardar resultado en el período
    await periodRepository.saveCalculationResult(periodId, result);

    // 8. Formatear respuesta
    const formattedResult = this.formatResponse(engineInput, result, period);

    // 9. Log del cálculo
    logger.calculation(
      period.companyId?.toString(),
      { id: periodId, name: period.name, month: period.month, year: period.year },
      formattedResult
    );

    return formattedResult;
  }

  /**
   * Ejecutar cálculo con datos directos (sin persistir)
   * Útil para simulaciones y previews
   */
  async calculateDirect(inputData) {
    // Validar estado económico ANTES de calcular
    validateEconomicState({
      sales: inputData.sales ?? 0,
      fixedCapitalCosts: inputData.fixedCapitalCosts ?? 0,
      fixedLaborCosts: inputData.fixedLaborCosts ?? 0,
      profit: inputData.profit ?? 0,
    });

    // Preparar input para el motor
    const engineInput = {
      Sales: inputData.sales ?? 0,
      FixedCapitalCosts: inputData.fixedCapitalCosts ?? 0,
      FixedLaborCosts: inputData.fixedLaborCosts ?? 0,
      Profit: inputData.profit ?? 0,
      Amortization: inputData.amortization ?? 0,
      Interests: inputData.interests ?? 0,
      Period: inputData.period ?? "Current",
      Currency: inputData.currency ?? "USD",
      InflationIndex: inputData.inflationIndex ?? 1,
      AccountingCriteria: inputData.accountingCriteria ?? "ACCRUAL",
      employees: inputData.employees ?? [],
    };

    // Ejecutar motor de cálculo
    const result = runExcedentesEngine(engineInput);

    // Formatear respuesta
    const formattedResult = this.formatResponse(engineInput, result);

    // Log del cálculo
    logger.calculation(
      inputData.companyId || "direct",
      { name: engineInput.Period },
      formattedResult
    );

    return formattedResult;
  }

  /**
   * Formatear respuesta estructurada según spec v0.0.4
   */
  formatResponse(input, result, period = null, consolidatedData = null) {
    const breakEven = input.FixedCapitalCosts + input.FixedLaborCosts;
    const totalRevenue = input.Sales;
    const totalCost = breakEven + (result.distributableSurplus > 0 ? 
      input.Sales - input.Profit - breakEven - input.Amortization - input.Interests : 0);

    return {
      breakEven,
      totalRevenue,
      totalCost,
      surplus: result.distributableSurplus,
      distribution: {
        capitalReturn: result.capitalReturn,
        laborSurplusPool: result.laborSurplusPool,
        weightCapital: result.weightCapital,
        weightLabor: result.weightLabor,
      },
      auditTrail: {
        status: result.auditStatus,
        certificate: result.certificate,
        employeeSurplusLedger: result.employeeSurplusLedger,
        calculatedAt: new Date().toISOString(),
        periodId: period?._id?.toString() || null,
        periodName: period?.name || input.Period,
      },
      input: {
        sales: input.Sales,
        fixedCapitalCosts: input.FixedCapitalCosts,
        fixedLaborCosts: input.FixedLaborCosts,
        profit: input.Profit,
        amortization: input.Amortization,
        interests: input.Interests,
        currency: input.Currency,
        inflationIndex: input.InflationIndex,
        accountingCriteria: input.AccountingCriteria,
        employeeCount: input.employees?.length || 0,
      },
      // Incluir detalles de consolidación si existen
      ...(consolidatedData && {
        consolidation: {
          totalFixedCosts: consolidatedData.totalFixedCosts,
          totalCosts: consolidatedData.totalCosts,
          extrasCosts: consolidatedData.extrasCosts,
          details: consolidatedData.details,
        }
      }),
    };
  }

  /**
   * Obtener resumen de activos por categoría para una empresa
   */
  async getAssetSummary(companyId) {
    return assetRepository.getSummaryByCategory(companyId);
  }

  /**
   * Obtener totales calculados de costos
   */
  async getCostTotals(companyId) {
    const [capitalCosts, laborCosts, amortization] = await Promise.all([
      assetRepository.getTotalCapitalCosts(companyId),
      employeeRepository.getTotalLaborCosts(companyId),
      assetRepository.getTotalAmortization(companyId),
    ]);

    return {
      fixedCapitalCosts: capitalCosts,
      fixedLaborCosts: laborCosts,
      amortization,
      totalFixedCosts: capitalCosts + laborCosts,
    };
  }
}

export default new EconomicCalculationService();
