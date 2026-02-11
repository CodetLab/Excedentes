import VentaModel from "../models/VentaModel.js";

export class VentasMongoRepository {
  async getAll() {
    return VentaModel.find();
  }

  async getById(id, options = {}) {
    return VentaModel.findById(id, null, options);
  }

  async create(data, options = {}) {
    const docs = await VentaModel.create([data], options);
    return docs[0];
  }

  async updateById(id, data, options = {}) {
    return VentaModel.findByIdAndUpdate(id, data, {
      new: true,
      ...options,
    });
  }

  async deleteById(id, options = {}) {
    return VentaModel.findByIdAndDelete(id, options);
  }
}
