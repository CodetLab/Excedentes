// ════════════════════════════════════════════════════════════════════════════
// MONGODB COMMANDS - COPY & PASTE DIRECTLY INTO MONGOSH
// ════════════════════════════════════════════════════════════════════════════
// 
// INSTRUCCIONES:
// 1. Abre terminal Command Prompt o PowerShell
// 2. Ejecuta: mongosh
// 3. Espera a que aparezca el prompt de mongosh
// 4. Pega CADA bloque de código a continuación (respeta orden)
// 5. Presiona Enter después de cada bloque
// 6. Verifica que veas "acknowledged: true" o resultados
//
// TIEMPO TOTAL: 30 segundos
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// BLOQUE 1: Seleccionar base de datos (primero)
// ════════════════════════════════════════════════════════════════════════════

use excedentes;

// ════════════════════════════════════════════════════════════════════════════
// BLOQUE 2: Crear compañía
// ════════════════════════════════════════════════════════════════════════════

db.companies.insertOne({
  _id: new ObjectId(),
  name: "Jordan Test Company",
  createdAt: new Date(),
  updatedAt: new Date()
});

// ESPERA: Debes ver:
// {
//   acknowledged: true,
//   insertedId: ObjectId("...")
// }

// ════════════════════════════════════════════════════════════════════════════
// BLOQUE 3: Obtener el ID de la compañía (para el próximo paso)
// ════════════════════════════════════════════════════════════════════════════

const companyId = db.companies.findOne({ name: "Jordan Test Company" })._id;
print("Company ID: " + companyId);

// ESPERA: Debes ver algo como:
// Company ID: ObjectId("507f1f77bcf86cd799439011")

// ════════════════════════════════════════════════════════════════════════════
// BLOQUE 4: Asignar compañía al usuario
// ════════════════════════════════════════════════════════════════════════════

db.users.updateOne(
  { email: "jordan@example.com" },
  { $set: { 
    companyId: companyId,
    role: "admin",
    updatedAt: new Date()
  } }
);

// ESPERA: Debes ver:
// {
//   acknowledged: true,
//   modifiedCount: 1,
//   upsertedId: null
// }

// ════════════════════════════════════════════════════════════════════════════
// BLOQUE 5: VERIFICAR que se asignó correctamente
// ════════════════════════════════════════════════════════════════════════════

const usuario = db.users.findOne({ email: "jordan@example.com" });
print("User Data:");
print(JSON.stringify(usuario, null, 2));

// ESPERA: Verifica que en el output veas:
// "companyId": ObjectId("..."),  ← IMPORTANTE: NO debe ser null!
// "role": "admin"

// Si companyId está null, vuelve a ejecutar BLOQUE 4

// ════════════════════════════════════════════════════════════════════════════
// FIN - Ya puedes cerrar mongosh y proceder a PASO 2 (RESTART BACKEND)
// ════════════════════════════════════════════════════════════════════════════
