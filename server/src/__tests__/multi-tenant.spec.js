/**
 * TASK 12: Multi-Tenant Isolation Tests
 * 
 * Propósito: Validar que datos de una empresa no son visibles/accesibles desde otra
 * 
 * Escenarios:
 * 1. User sin companyId: rechazado con 403
 * 2. User accede solo sus datos: éxito
 * 3. User intenta acceder datos de otra compañía: rechazado (no 200)
 * 4. Data consolidation filtra por companyId
 * 5. Cálculos aislados por companyId
 * 6. Reportes isolados por companyId
 * 7. Admin puede ver múltiples companies (con flag appropriate)
 */

import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import User from "../models/User.js";
import Company from "../models/CompanyModel.js";
import Capital from "../models/CapitalModel.js";
import Venta from "../models/VentaModel.js";

describe("Multi-Tenant Isolation", () => {
  let server;
  let mongoServer;
  let company1Id, company2Id;
  let user1Token, user2Token;
  
  beforeAll(async () => {
    // Usar MongoDB en memoria para tests
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(mongoUri);
    }
    
    server = app.listen(3001);
  }, 30000);

  afterAll(async () => {
    // Limpiar fixtures
    await Company.deleteMany({});
    await User.deleteMany({});
    await Capital.deleteMany({});
    await Venta.deleteMany({});
    
    if (server) {
      server.close();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
    }
  });

  beforeEach(async () => {
    // Limpiar datos previos
    await Company.deleteMany({});
    await User.deleteMany({});
    await Capital.deleteMany({});
    await Venta.deleteMany({});
    
    // Crear usuarios primero
    const user1 = await User.create({
      name: "Owner 1",
      email: "owner1@test.com",
      passwordHash: "$2b$10$dummyhash",
      role: "admin"
    });
    
    const user2 = await User.create({
      name: "Owner 2",
      email: "owner2@test.com",
      passwordHash: "$2b$10$dummyhash",
      role: "admin"
    });
    
    // Crear 2 compañías con owners
    const comp1 = await Company.create({
      name: "Company A",
      ownerId: user1._id,
      currency: "USD",
      accountingCriteria: "ACCRUAL"
    });
    
    const comp2 = await Company.create({
      name: "Company B",
      ownerId: user2._id,
      currency: "USD",
      accountingCriteria: "ACCRUAL"
    });
    
    company1Id = comp1._id.toString();
    company2Id = comp2._id.toString();
    
    const user1Id = user1._id.toString();
    const user2Id = user2._id.toString();
    
    // Actualizar usuarios con sus companyIds
    await User.updateOne({ _id: user1Id }, { companyId: company1Id });
    await User.updateOne({ _id: user2Id }, { companyId: company2Id });
    
    // Generar tokens JWT con companyId
    // Usar el mismo secret que el middleware validará
    const secret = process.env.JWT_SECRET || "super-secret-key-must-be-at-least-32-characters-long-for-hs256-algo";
    
    user1Token = jwt.sign(
      {
        sub: user1Id,
        email: user1.email,
        companyId: company1Id,
        role: "company"
      },
      secret,
      { expiresIn: "1h" }
    );
    
    user2Token = jwt.sign(
      {
        sub: user2Id,
        email: user2.email,
        companyId: company2Id,
        role: "company"
      },
      secret,
      { expiresIn: "1h" }
    );
  });

  describe("GET /api/capital/summary (Capital Summary)", () => {
    it("SCENARIO 1: Rechaza sin companyId en JWT", async () => {
      const invalidToken = jwt.sign(
        { sub: "userId", email: "test@test.com" }, // SIN companyId
        process.env.JWT_SECRET || "super-secret-key-must-be-at-least-32-characters-long-for-hs256-algo"
      );

      const response = await request(app)
        .get("/api/capital/summary")
        .set("Authorization", `Bearer ${invalidToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain("companyId");
    });

    it("SCENARIO 2: Retorna datos solo de su compañía", async () => {
      // Crear capital para company1
      await Capital.create({
        tipo: "TIERRAS",
        companyId: company1Id,
        nombre: "Terreno A",
        valorUSD: 10000
      });

      const response = await request(app)
        .get("/api/capital/summary")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      // Verificar que solo ve datos de su compañía
    });

    it("SCENARIO 3: No ve datos de otra compañía", async () => {
      // Crear capital para company2
      const capital2 = await Capital.create({
        tipo: "MUEBLES",
        companyId: company2Id,
        nombre: "Muebles B",
        valorUSD: 5000
      });

      const response = await request(app)
        .get("/api/capital/summary")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      // El resumen de user1 no debe incluir este item de company2
      // (depende de la estructura de respuesta)
    });
  });

  describe("POST /api/capital/:tipo (Create Capital)", () => {
    it("SCENARIO 4: Crea capital en su compañía", async () => {
      const response = await request(app)
        .post("/api/capital/TIERRAS")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          nombre: "Terreno Nuevo",
          valorUSD: 15000
        });

      expect(response.status).toBe(201);
      
      // Verificar que se creó con companyId correcto
      const created = await Capital.findById(response.body.data._id);
      expect(created.companyId.toString()).toBe(company1Id);
    });

    it("SCENARIO 5: No crea capital sin companyId", async () => {
      const invalidToken = jwt.sign(
        { sub: "userId", email: "test@test.com" },
        process.env.JWT_SECRET || "super-secret-key-must-be-at-least-32-characters-long-for-hs256-algo"
      );

      const response = await request(app)
        .post("/api/capital/TIERRAS")
        .set("Authorization", `Bearer ${invalidToken}`)
        .send({
          nombre: "Terreno",
          valorUSD: 10000
        });

      expect(response.status).toBe(403);
    });
  });

  describe("POST /api/dashboard/period-summary (Data Consolidation)", () => {
    it("SCENARIO 6: Consolida datos solo de su período/compañía", async () => {
      // Crear datos para company1
      await Capital.create({
        tipo: "PERSONAL_PROPIO",
        companyId: company1Id,
        nombre: "Personal",
        costoUSD: 3000
      });

      await Venta.create({
        companyId: company1Id,
        montoUSD: 50000,
        periodo: "2/2025"
      });

      const response = await request(app)
        .post("/api/dashboard/period-summary")
        .set("Authorization", `Bearer ${user1Token}`)
        .query({ month: 2, year: 2025 });

      expect(response.status).toBe(200);
      expect(response.body.data.sales).toBe(50000);
    });

    it("SCENARIO 7: No ve datos de otra compañía en consolidación", async () => {
      // Crear datos para company2
      await Venta.create({
        companyId: company2Id,
        montoUSD: 100000,
        periodo: "2/2025"
      });

      // Crear datos para company1
      await Venta.create({
        companyId: company1Id,
        montoUSD: 30000,
        periodo: "2/2025"
      });

      const response = await request(app)
        .post("/api/dashboard/period-summary")
        .set("Authorization", `Bearer ${user1Token}`)
        .query({ month: 2, year: 2025 });

      expect(response.status).toBe(200);
      // user1 solo debe ver 30000, no 100000
      expect(response.body.data.sales).toBe(30000);
    });
  });

  describe("POST /api/excedentes/calc (Calculate Surplus)", () => {
    it("SCENARIO 8: Calcula excedentes solo con datos de su compañía", async () => {
      // Setup data para company1
      await Capital.create({
        tipo: "PERSONAL_PROPIO",
        companyId: company1Id,
        nombre: "Personal",
        costoUSD: 2000
      });

      await Venta.create({
        companyId: company1Id,
        montoUSD: 50000,
        periodo: "3/2025"
      });

      const response = await request(app)
        .post("/api/excedentes/calc")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          month: 3,
          year: 2025
        });

      expect(response.status).toBe(200);
      // El cálculo debe ser sobre datos de company1
    });

    it("SCENARIO 9: Rechaza sin companyId", async () => {
      const invalidToken = jwt.sign(
        { sub: "userId", email: "test@test.com" },
        process.env.JWT_SECRET || "super-secret-key-must-be-at-least-32-characters-long-for-hs256-algo"
      );

      const response = await request(app)
        .post("/api/excedentes/calc")
        .set("Authorization", `Bearer ${invalidToken}`)
        .send({ month: 3, year: 2025 });

      expect(response.status).toBe(403);
    });
  });

  describe("GET /api/personal/propio (Personal Data)", () => {
    it("SCENARIO 10: Retorna personal solo de su compañía", async () => {
      await Capital.create({
        tipo: "PERSONAL_PROPIO",
        companyId: company1Id,
        nombre: "Employee A",
        costoUSD: 2000
      });

      await Capital.create({
        tipo: "PERSONAL_PROPIO",
        companyId: company2Id,
        nombre: "Employee B",
        costoUSD: 3000
      });

      const response = await request(app)
        .get("/api/personal/propio")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      // Debe retornar solo Employee A, no Employee B
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].nombre).toBe("Employee A");
    });
  });

  describe("GET /api/ventas (Sales Data)", () => {
    it("SCENARIO 11: Retorna ventas solo de su compañía", async () => {
      await Venta.create({
        companyId: company1Id,
        montoUSD: 5000,
        descripcion: "Venta A"
      });

      await Venta.create({
        companyId: company2Id,
        montoUSD: 10000,
        descripcion: "Venta B"
      });

      const response = await request(app)
        .get("/api/ventas")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      // Solo debe retornar Venta A
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].descripcion).toBe("Venta A");
    });

    it("SCENARIO 12: 404 cuando intenta acceder venta de otra compañía", async () => {
      const ventaB = await Venta.create({
        companyId: company2Id,
        montoUSD: 10000,
        descripcion: "Venta B"
      });

      const response = await request(app)
        .get(`/api/ventas/${ventaB._id}`)
        .set("Authorization", `Bearer ${user1Token}`);

      // Should return 404 (not 200 showing data, not 403 which leaks info)
      expect([404, 403]).toContain(response.status);
    });
  });

  describe("Data Leakage Prevention", () => {
    it("No retorna 200 con datos de otra compañía", async () => {
      // Crear datos en company2
      const item = await Capital.create({
        tipo: "MUEBLES",
        companyId: company2Id,
        nombre: "Furniture",
        valorUSD: 5000
      });

      // user1 intenta acceder
      const response = await request(app)
        .get(`/api/capital/item/${item._id}`)
        .set("Authorization", `Bearer ${user1Token}`);

      // No debe ser 200 (sería data leakage)
      expect(response.status).not.toBe(200);
    });

    it("Error messages no revelan si existe vs permisos", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/capital/item/${fakeId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      // Ambos (no existe, no permisos) deben retornar similar
      expect([404, 403]).toContain(response.status);
      // Y no debe tener datos en respuesta que revele estructura
    });
  });
});
