import Company from "../models/CompanyModel.js";

/**
 * Repository para Company - desacopla el motor de cálculo de MongoDB
 */
class CompanyRepository {
  async findById(id) {
    return Company.findById(id);
  }

  async findByOwnerId(ownerId) {
    return Company.find({ ownerId, isActive: true });
  }

  async create(data) {
    const company = new Company(data);
    return company.save();
  }

  async update(id, data) {
    return Company.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Company.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async exists(id) {
    const count = await Company.countDocuments({ _id: id, isActive: true });
    return count > 0;
  }
}

export default new CompanyRepository();
