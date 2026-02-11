import { BaseRepository } from "./BaseRepository.js";

export class ProductoRepository extends BaseRepository {
  async findByIds() {
    throw new Error("Not implemented");
  }

  async adjustStock() {
    throw new Error("Not implemented");
  }
}
