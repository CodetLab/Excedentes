import Period from "../models/PeriodModel.js";
import { DuplicatePeriodError } from "../utils/errors.js";

/**
 * Repository para Period - desacopla el motor de cálculo de MongoDB
 */
class PeriodRepository {
  async findById(id) {
    return Period.findById(id);
  }

  async findByCompanyId(companyId) {
    return Period.find({ companyId }).sort({ startDate: -1 });
  }

  async findByStatus(companyId, status) {
    return Period.find({ companyId, status }).sort({ startDate: -1 });
  }

  /**
   * Verificar si existe un período con mismo companyId, month y year
   */
  async existsDuplicate(companyId, month, year, excludeId = null) {
    const query = { companyId, month, year };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await Period.countDocuments(query);
    return count > 0;
  }

  /**
   * Crear período con validación de duplicados
   */
  async create(data) {
    // Verificar duplicados antes de crear
    const isDuplicate = await this.existsDuplicate(
      data.companyId,
      data.month,
      data.year
    );

    if (isDuplicate) {
      throw new DuplicatePeriodError(data.companyId, data.month, data.year);
    }

    const period = new Period(data);
    return period.save();
  }

  async update(id, data) {
    return Period.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    const period = await Period.findById(id);
    if (period?.status === "LOCKED" || period?.status === "CERTIFIED") {
      throw new Error("No se puede eliminar un período certificado/bloqueado");
    }
    return Period.findByIdAndDelete(id);
  }

  /**
   * Guardar resultado de cálculo en el período
   */
  async saveCalculationResult(id, result) {
    return Period.findByIdAndUpdate(
      id,
      {
        calculationResult: result,
        calculatedAt: new Date(),
        status: "CALCULATED",
      },
      { new: true }
    );
  }

  /**
   * Certificar un período (bloquea futuras modificaciones)
   */
  async certify(id, certificateHash) {
    const period = await Period.findById(id);
    if (!period) {
      throw new Error("Período no encontrado");
    }
    if (period.status !== "CALCULATED") {
      throw new Error("El período debe estar calculado antes de certificar");
    }

    return Period.findByIdAndUpdate(
      id,
      {
        status: "CERTIFIED",
        certificateHash,
        certifiedAt: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Bloquear período (después de certificar)
   */
  async lock(id) {
    return Period.findByIdAndUpdate(id, { status: "LOCKED" }, { new: true });
  }

  /**
   * Obtener datos del período formateados para el motor de cálculo
   */
  async getForCalculation(id) {
    const period = await this.findById(id);
    if (!period) return null;

    return {
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
    };
  }

  /**
   * Verificar si existe overlap de fechas con otros períodos
   */
  async hasDateOverlap(companyId, startDate, endDate, excludeId = null) {
    const query = {
      companyId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await Period.countDocuments(query);
    return count > 0;
  }
}

export default new PeriodRepository();
