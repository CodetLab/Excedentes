import { CostosMongoRepository } from "../src/infrastructure/database/repositories/CostosMongoRepository.js";
import { ProductosMongoRepository } from "../src/infrastructure/database/repositories/ProductosMongoRepository.js";
import { VentasMongoRepository } from "../src/infrastructure/database/repositories/VentasMongoRepository.js";
import { runInTransaction } from "../src/infrastructure/database/transactionRunner.js";
import { buildGetCostos } from "../src/application/use-cases/costos/getCostos.js";
import { buildCreateCosto } from "../src/application/use-cases/costos/createCosto.js";
import { buildUpdateCosto } from "../src/application/use-cases/costos/updateCosto.js";
import { buildDeleteCosto } from "../src/application/use-cases/costos/deleteCosto.js";
import { buildGetProductos } from "../src/application/use-cases/productos/getProductos.js";
import { buildGetProductoById } from "../src/application/use-cases/productos/getProductoById.js";
import { buildCreateProducto } from "../src/application/use-cases/productos/createProducto.js";
import { buildUpdateProducto } from "../src/application/use-cases/productos/updateProducto.js";
import { buildDeleteProducto } from "../src/application/use-cases/productos/deleteProducto.js";
import { buildGetVentas } from "../src/application/use-cases/ventas/getVentas.js";
import { buildGetVentaById } from "../src/application/use-cases/ventas/getVentaById.js";
import { buildCreateVenta } from "../src/application/use-cases/ventas/createVenta.js";
import { buildUpdateVenta } from "../src/application/use-cases/ventas/updateVenta.js";
import { buildDeleteVenta } from "../src/application/use-cases/ventas/deleteVenta.js";
import { buildCostosController } from "../src/infrastructure/web/controllers/costos.controller.js";
import { buildProductosController } from "../src/infrastructure/web/controllers/productos.controller.js";
import { buildVentasController } from "../src/infrastructure/web/controllers/ventas.controller.js";
import { buildAuthController } from "../src/infrastructure/web/controllers/auth.controller.js";
import { buildCostosRouter } from "../src/infrastructure/web/routes/costos.routes.js";
import { buildProductosRouter } from "../src/infrastructure/web/routes/productos.routes.js";
import { buildVentasRouter } from "../src/infrastructure/web/routes/ventas.routes.js";
import { buildAuthRouter } from "../src/infrastructure/web/routes/auth.routes.js";

export const registerRoutes = (app) => {
  const costosRepository = new CostosMongoRepository();
  const productosRepository = new ProductosMongoRepository();
  const ventasRepository = new VentasMongoRepository();

  const getCostos = buildGetCostos({ costoRepository: costosRepository });
  const createCosto = buildCreateCosto({ costoRepository: costosRepository });
  const updateCosto = buildUpdateCosto({ costoRepository: costosRepository });
  const deleteCosto = buildDeleteCosto({ costoRepository: costosRepository });

  const getProductos = buildGetProductos({ productoRepository: productosRepository });
  const getProductoById = buildGetProductoById({ productoRepository: productosRepository });
  const createProducto = buildCreateProducto({ productoRepository: productosRepository });
  const updateProducto = buildUpdateProducto({ productoRepository: productosRepository });
  const deleteProducto = buildDeleteProducto({ productoRepository: productosRepository });

  const getVentas = buildGetVentas({ ventaRepository: ventasRepository });
  const getVentaById = buildGetVentaById({ ventaRepository: ventasRepository });
  const createVenta = buildCreateVenta({
    ventaRepository: ventasRepository,
    productoRepository: productosRepository,
    transactionRunner: runInTransaction,
  });
  const updateVenta = buildUpdateVenta({
    ventaRepository: ventasRepository,
    productoRepository: productosRepository,
    transactionRunner: runInTransaction,
  });
  const deleteVenta = buildDeleteVenta({
    ventaRepository: ventasRepository,
    productoRepository: productosRepository,
    transactionRunner: runInTransaction,
  });

  const costosController = buildCostosController({
    getCostos,
    createCosto,
    updateCosto,
    deleteCosto,
  });

  const productosController = buildProductosController({
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto,
  });

  const ventasController = buildVentasController({
    getVentas,
    getVentaById,
    createVenta,
    updateVenta,
    deleteVenta,
  });

  const authController = buildAuthController();

  app.use("/api/auth", buildAuthRouter(authController));
  app.use("/api/costos", buildCostosRouter(costosController));
  app.use("/api/productos", buildProductosRouter(productosController));
  app.use("/api/ventas", buildVentasRouter(ventasController));
};
