Imagina que tu app es un restaurante.

👦 El cliente hace un pedido.

🧑‍🍳 La cocina decide cómo prepararlo.

📦 El almacén guarda los ingredientes.

🏢 El edificio es solo el lugar físico.

En Clean Architecture:
| Restaurante | Backend            |
| ----------- | ------------------ |
| Cliente     | Usuario / Frontend |
| Mesero      | Controller         |
| Chef        | Use Case           |
| Receta      | Domain             |
| Almacén     | Repository         |
| Edificio    | Express / MongoDB  |


La regla más importante:

🍳 La receta no depende del edificio.
El negocio no depende de Express ni de Mongo.


src/
│
├── domain/
│   ├── entities/
│   │   └── User.js
│   ├── repositories/
│   │   └── IUserRepository.js
│
├── application/
│   └── use-cases/
│       └── CreateUser.js
│
├── infrastructure/
│   └── repositories/
│       └── MongoUserRepository.js
│
├── presentation/
│   └── controllers/
│       └── UserController.js
│
├── main/
│   └── server.js

===


🟡 1. DOMAIN (La receta)

Aquí vive lo más importante: las reglas del negocio.

No puede usar:
- Express
- MongoDB
- Mongoose
- Nada externo

Solo lógica pura.

📄 domain/entities/User.js
class User {
  constructor(email) {
    if (!email.includes("@")) {
      throw new Error("Invalid email");
    }

    this.email = email;
  }
}

module.exports = User;


Aquí validamos reglas reales del negocio.

📄 domain/repositories/IUserRepository.js

Es solo una promesa de lo que debe existir.

class IUserRepository {
  async findByEmail(email) {}
  async save(user) {}
}

module.exports = IUserRepository;


No tiene código real.
Solo define lo que necesitamos.

🟢 2. APPLICATION (El chef)

Aquí decidimos qué hacer.

📄 application/use-cases/CreateUser.js
const User = require("../../domain/entities/User");

class CreateUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(email) {
    const existing = await this.userRepository.findByEmail(email);

    if (existing) {
      throw new Error("User already exists");
    }

    const user = new User(email);
    await this.userRepository.save(user);

    return user;
  }
}

module.exports = CreateUser;


Este archivo:

No sabe qué es Mongo

No sabe qué es Express

Solo sabe que existe un repositorio

Eso es Clean Architecture.

🔵 3. INFRASTRUCTURE (El almacén)

Aquí sí usamos MongoDB.

📄 infrastructure/repositories/MongoUserRepository.js
const mongoose = require("mongoose");
const IUserRepository = require("../../domain/repositories/IUserRepository");

const UserModel = mongoose.model("User", {
  email: String,
});

class MongoUserRepository extends IUserRepository {
  async findByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async save(user) {
    await UserModel.create({ email: user.email });
  }
}

module.exports = MongoUserRepository;


Aquí sí usamos Mongo.

Pero Mongo no toca el dominio.

🔴 4. PRESENTATION (El mesero)

Recibe la petición HTTP.

📄 presentation/controllers/UserController.js
class UserController {
  constructor(createUserUseCase) {
    this.createUserUseCase = createUserUseCase;
  }

  async handle(req, res) {
    try {
      const { email } = req.body;
      const user = await this.createUserUseCase.execute(email);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = UserController;


No hay lógica de negocio aquí.

Solo:

Leer request

Llamar use case

Devolver respuesta

⚫ 5. MAIN (Donde se conectan las piezas)

Aquí armamos todo.

📄 main/server.js
const express = require("express");
const mongoose = require("mongoose");

const MongoUserRepository = require("../infrastructure/repositories/MongoUserRepository");
const CreateUser = require("../application/use-cases/CreateUser");
const UserController = require("../presentation/controllers/UserController");

mongoose.connect("mongodb://localhost:27017/clean");

const app = express();
app.use(express.json());

const userRepository = new MongoUserRepository();
const createUser = new CreateUser(userRepository);
const userController = new UserController(createUser);

app.post("/users", (req, res) => userController.handle(req, res));

app.listen(3000, () => console.log("Server running"));


Este archivo:

Es el único que conoce todo.

Aquí hacemos la inyección de dependencias.

🔁 Flujo completo
Request HTTP
   ↓
Controller
   ↓
Use Case
   ↓
Repository (Mongo)
   ↓
Database


Y las dependencias siempre apuntan hacia adentro.

Nunca al revés.

🏆 Por qué esto es profesional

✔ Puedes cambiar Mongo por PostgreSQL sin tocar el dominio
✔ Puedes testear CreateUser sin levantar Express
✔ Puedes escalar sin romper todo
✔ Bajo acoplamiento
✔ Alta mantenibilidad

📚 Para aprender más

Libro obligatorio:

Clean Architecture — Robert C. Martin

Después:

Domain-Driven Design — Eric Evans

Implementing DDD — Vaughn Vernon

🚀 Regla final

Si quieres que tu código sea de nivel profesional real:

Nunca pongas lógica de negocio en el controller.

Nunca hagas queries directo en el use case.

Nunca dejes que Mongo toque el dominio.

Siempre depende de interfaces, no de implementaciones.