import ProductoModel from "../models/ProductoModel.js";

export class ProductosMongoRepository {
  async getAll() {
    return ProductoModel.find();
  }

  async getById(id, options = {}) {
    return ProductoModel.findById(id, null, options);
  }

  async findByIds(ids, options = {}) {
    return ProductoModel.find({ _id: { $in: ids } }, null, options);
  }

  async create(data, options = {}) {
    return ProductoModel.create(data, options);
  }

  async updateById(id, data, options = {}) {
    return ProductoModel.findByIdAndUpdate(id, data, {
      new: true,
      ...options,
    });
  }

  async adjustStock(id, delta, options = {}) {
    return ProductoModel.findByIdAndUpdate(
      id,
      { $inc: { stock: delta } },
      { new: true, ...options }
    );
  }

  async deleteById(id, options = {}) {
    return ProductoModel.findByIdAndDelete(id, options);
  }
}
