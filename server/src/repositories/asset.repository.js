import Asset from "../models/AssetModel.js";

/**
 * Repository para Asset - desacopla el motor de cálculo de MongoDB
 */
class AssetRepository {
  async findById(id) {
    return Asset.findById(id);
  }

  async findByCompanyId(companyId, activeOnly = true) {
    const query = { companyId };
    if (activeOnly) {
      query.isActive = true;
    }
    return Asset.find(query);
  }

  async findByCategory(companyId, category) {
    return Asset.find({ companyId, category, isActive: true });
  }

  async create(data) {
    const asset = new Asset(data);
    return asset.save();
  }

  async createMany(assets) {
    return Asset.insertMany(assets);
  }

  async update(id, data) {
    return Asset.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Asset.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  /**
   * Calcular total de costos fijos de capital (suma de depreciaciones anuales)
   */
  async getTotalCapitalCosts(companyId) {
    const result = await Asset.aggregate([
      { $match: { companyId, isActive: true } },
      { $group: { _id: null, total: { $sum: "$annualDepreciation" } } },
    ]);
    return result[0]?.total || 0;
  }

  /**
   * Calcular total de amortización
   */
  async getTotalAmortization(companyId) {
    const result = await Asset.aggregate([
      { $match: { companyId, isActive: true } },
      { $group: { _id: null, total: { $sum: "$annualDepreciation" } } },
    ]);
    return result[0]?.total || 0;
  }

  /**
   * Obtener resumen por categoría
   */
  async getSummaryByCategory(companyId) {
    return Asset.aggregate([
      { $match: { companyId, isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalValue: { $sum: "$currentValue" },
          totalDepreciation: { $sum: "$annualDepreciation" },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);
  }
}

export default new AssetRepository();
