excedentes-backend/
│
├── src/
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Costo.js
│   │   │   ├── Producto.js
│   │   │   └── Venta.js
│   │   │
│   │   └── repositories/
│   │       ├── CostoRepository.js
│   │       ├── ProductoRepository.js
│   │       └── VentaRepository.js
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── costos/
│   │   │   │   ├── CreateCosto.js
│   │   │   │   ├── UpdateCosto.js
│   │   │   │   ├── DeleteCosto.js
│   │   │   │   └── GetCostos.js
│   │   │   │
│   │   │   ├── productos/
│   │   │   └── ventas/
│   │   │
│   │   └── services/
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── mongo.js
│   │   │   ├── models/
│   │   │   │   ├── CostoModel.js
│   │   │   │   ├── ProductoModel.js
│   │   │   │   └── VentaModel.js
│   │   │   │
│   │   │   └── repositories/
│   │   │       ├── MongoCostoRepository.js
│   │   │       ├── MongoProductoRepository.js
│   │   │       └── MongoVentaRepository.js
│   │   │
│   │   └── web/
│   │       ├── controllers/
│   │       │   ├── costos.controller.js
│   │       │   ├── productos.controller.js
│   │       │   └── ventas.controller.js
│   │       │
│   │       ├── routes/
│   │       │   ├── costos.routes.js
│   │       │   ├── productos.routes.js
│   │       │   └── ventas.routes.js
│   │       │
│   │       └── middlewares/
│   │           ├── errorHandler.js
│   │           └── validate.js
│   │
│   ├── config/
│   │   └── env.js
│   │
│   ├── app.js
│   └── server.js
│
├── package.json
└── README.md
