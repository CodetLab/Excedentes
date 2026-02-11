import CostoModel from "../models/CostoModel.js";

export class CostosMongoRepository {
  async getAll() {
    return CostoModel.find();
  }

  async create(data, options = {}) {
    return CostoModel.create(data, options);
  }

  async updateById(id, data, options = {}) {
    return CostoModel.findByIdAndUpdate(id, data, {
      new: true,
      ...options,
    });
  }

  async deleteById(id, options = {}) {
    return CostoModel.findByIdAndDelete(id, options);
  }
}
