# Arquitectura limpia (explicada simple)

## Resumen rapido

Tenemos 4 cajas grandes:

- Domain: reglas del negocio (solo ideas, no sabe de web ni de base de datos).
- Application: casos de uso (que hacer y en que orden).
- Infrastructure: detalles (Express, MongoDB, Mongoose).
- Interfaces: donde se conectan las piezas (inyecta dependencias).

## Flujo paso a paso (como nene de 5 anhos)

Imagina un restaurante:

- Domain es la receta del plato. Solo dice que ingredientes son necesarios.
- Application es el cocinero. Decide cuando mezclar, cocinar y servir.
- Infrastructure son las herramientas: cocina, sarten, horno.
- Interfaces es quien reparte las tareas y dice quien usa que.

Cuando llega un pedido (HTTP):

1. La ruta (route) recibe el pedido.
2. El controller llama al caso de uso.
3. El caso de uso usa el repositorio para leer o guardar datos.
4. El repositorio habla con MongoDB.
5. La respuesta vuelve por el controller.

## Reglas simples

- Domain no conoce Express ni MongoDB.
- Controllers no tienen logica de negocio.
- Use-cases si tienen logica del negocio.
- Infrastructure solo implementa detalles tecnicos.
- Interfaces arma todo y hace la inyeccion manual.

## Estructura de carpetas

src/
  domain/
    entities/
    repositories/
  application/
    use-cases/
    services/
  infrastructure/
    database/
      models/
      repositories/
    web/
      controllers/
      routes/
      middlewares/
  interfaces/
  config/
  shared/
