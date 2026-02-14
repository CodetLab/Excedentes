/**
 * Data Consolidation Service - v0.0.4
 * 
 * Responsable de consolidar datos económicos de múltiples fuentes
 * para un período específico (companyId + month + year).
 * 
 * NO hace cálculos económicos.
 * Solo reúne y estructura datos desde la base de datos.
 */

import Venta from "../models/VentaModel.js";
import Capital from "../models/CapitalModel.js";
import Employee from "../models/EmployeeModel.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import logger from "../utils/logger.js";

class DataConsolidationService {
  /**
   * Consolidar todos los datos económicos para un período
   * 
   * @param {string} userId - ID del usuario/empresa
   * @param {number} month - Mes (1-12)
   * @param {number} year - Año
   * @returns {Promise<Object>} Datos consolidados listos para el motor
   */
  async consolidateByPeriod(userId, month, year) {
    // Validar inputs
    this._validatePeriodInputs(userId, month, year);

    logger.info(`Consolidando datos para período: ${month}/${year}, userId: ${userId}`);

    // Obtener datos en paralelo
    const [
      ventas,
      capitalItems,
      empleados,
      personalItems,
      extrasItems,
      gananciasItems
    ] = await Promise.all([
      this._getVentas(userId, month, year),
      this._getCapitalItems(userId, month, year),
      this._getEmpleados(userId),
      this._getPersonalItems(userId, month, year),
      this._getExtrasItems(userId, month, year),
      this._getGananciasItems(userId, month, year)
    ]);

    // Calcular totales
    const totalVentas = this._calculateTotalVentas(ventas);
    const capitalCosts = this._calculateCapitalCosts(capitalItems);
    const laborCosts = this._calculateLaborCosts(empleados, personalItems);
    const extrasCosts = this._calculateExtrasCosts(extrasItems);
    const totalGanancias = this._calculateTotalGanancias(gananciasItems);

    // Construir estructura consolidada
    const consolidatedData = {
      period: {
        month,
        year,
        name: `${month}/${year}`
      },
      sales: totalVentas,
      profit: totalGanancias,
      fixedCapitalCosts: capitalCosts.fixed,
      variableCapitalCosts: capitalCosts.variable,
      fixedLaborCosts: laborCosts.fixed,
      variableLaborCosts: laborCosts.variable,
      extrasCosts: extrasCosts,
      totalFixedCosts: capitalCosts.fixed + laborCosts.fixed + extrasCosts,
      totalCosts: capitalCosts.fixed + capitalCosts.variable + laborCosts.fixed + laborCosts.variable + extrasCosts,
      employees: empleados.map(e => ({
        id: e._id.toString(),
        name: e.name,
        baseSalary: e.baseSalary,
        productivityIndex: e.productivityIndex || 1
      })),
      details: {
        ventasCount: ventas.length,
        capitalItemsCount: capitalItems.length,
        empleadosCount: empleados.length,
        extrasCount: extrasItems.length
      }
    };

    // Validar que hay datos mínimos
    this._validateConsolidatedData(consolidatedData);

    logger.info(`Datos consolidados exitosamente`, {
      sales: totalVentas,
      totalFixedCosts: consolidatedData.totalFixedCosts,
      totalCosts: consolidatedData.totalCosts
    });

    return consolidatedData;
  }

  /**
   * Validar inputs del período
   */
  _validatePeriodInputs(userId, month, year) {
    if (!userId) {
      throw new ValidationError("userId es requerido");
    }

    if (!month || month < 1 || month > 12) {
      throw new ValidationError("month debe estar entre 1 y 12");
    }

    if (!year || year < 2000 || year > 2100) {
      throw new ValidationError("year debe estar entre 2000 y 2100");
    }
  }

  /**
   * Obtener ventas del período
   */
  async _getVentas(userId, month, year) {
    // Buscar ventas que coincidan con el período
    const periodo = `${month}/${year}`;
    const ventas = await Venta.find({
      userId,
      $or: [
        { periodo },
        { periodo: `${String(month).padStart(2, '0')}/${year}` }
      ]
    });

    return ventas;
  }

  /**
   * Obtener items de capital (tierras, inmuebles, muebles, vehículos, herramientas, stock)
   */
  async _getCapitalItems(userId, month, year) {
    const capitalTypes = ["TIERRAS", "INMUEBLES", "MUEBLES", "VEHICULOS", "HERRAMIENTAS", "STOCK"];
    
    const items = await Capital.find({
      userId,
      tipo: { $in: capitalTypes }
    });

    return items;
  }

  /**
   * Obtener empleados activos
   */
  async _getEmpleados(userId) {
    const empleados = await Employee.find({
      companyId: userId,
      isActive: true
    });

    return empleados;
  }

  /**
   * Obtener items de personal (propio y terceros)
   */
  async _getPersonalItems(userId, month, year) {
    const items = await Capital.find({
      userId,
      tipo: { $in: ["PERSONAL_PROPIO", "PERSONAL_TERCEROS"] }
    });

    return items;
  }

  /**
   * Obtener extras (costos fijos adicionales)
   */
  async _getExtrasItems(userId, month, year) {
    const items = await Capital.find({
      userId,
      tipo: "EXTRAS"
    });

    return items;
  }

  /**
   * Obtener ganancias
   */
  async _getGananciasItems(userId, month, year) {
    const items = await Capital.find({
      userId,
      tipo: "GANANCIAS"
    });

    return items;
  }

  /**
   * Calcular total de ventas
   */
  _calculateTotalVentas(ventas) {
    return ventas.reduce((sum, venta) => sum + (venta.montoUSD || 0), 0);
  }

  /**
   * Calcular costos de capital
   */
  _calculateCapitalCosts(capitalItems) {
    let fixed = 0;
    let variable = 0;

    for (const item of capitalItems) {
      const costo = item.costoUSD || 0;
      
      // Determinar si es fijo o variable según tipo
      if (item.tipo === "TIERRAS" || item.tipo === "INMUEBLES") {
        fixed += costo;
      } else {
        variable += costo;
      }
    }

    return { fixed, variable };
  }

  /**
   * Calcular costos de trabajo
   */
  _calculateLaborCosts(empleados, personalItems) {
    let fixed = 0;
    let variable = 0;

    // Costos de empleados (considerados fijos)
    for (const emp of empleados) {
      fixed += emp.baseSalary || 0;
    }

    // Costos de personal adicional
    for (const item of personalItems) {
      const costo = item.costoUSD || item.salarioMensual || 0;
      
      if (item.tipo === "PERSONAL_PROPIO") {
        fixed += costo;
      } else {
        variable += costo;
      }
    }

    return { fixed, variable };
  }

  /**
   * Calcular costos extras
   */
  _calculateExtrasCosts(extrasItems) {
    return extrasItems.reduce((sum, item) => sum + (item.costoUSD || 0), 0);
  }

  /**
   * Calcular total de ganancias
   */
  _calculateTotalGanancias(gananciasItems) {
    return gananciasItems.reduce((sum, item) => sum + (item.valorUSD || 0), 0);
  }

  /**
   * Validar que los datos consolidados son suficientes para calcular
   */
  _validateConsolidatedData(data) {
    if (data.sales === 0) {
      throw new ValidationError(
        "No hay ventas cargadas para este período. Debe cargar al menos una venta antes de calcular."
      );
    }

    if (data.sales < 0) {
      throw new ValidationError("El total de ventas no puede ser negativo");
    }

    if (data.totalFixedCosts < 0) {
      throw new ValidationError("El total de costos fijos no puede ser negativo");
    }
  }

  /**
   * Verificar si existe un período con datos
   */
  async periodExists(userId, month, year) {
    const periodo = `${month}/${year}`;
    const ventasCount = await Venta.countDocuments({
      userId,
      $or: [
        { periodo },
        { periodo: `${String(month).padStart(2, '0')}/${year}` }
      ]
    });

    return ventasCount > 0;
  }
}

export default new DataConsolidationService();
