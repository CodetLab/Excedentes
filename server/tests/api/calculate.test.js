/**
 * API Tests - v0.0.4
 * Tests de integración para Data Integrity & Economic Safety
 * 
 * Casos de prueba:
 * 1. Caso válido → devuelve cálculo correcto
 * 2. Ventas negativas → error
 * 3. Ganancia mayor a ventas → error
 * 4. Ventas < Ganancia + Costos Fijos → error
 * 5. Estructura de respuesta normalizada
 */

import request from "supertest";
import app from "../../src/app.js";

describe("API Calculate Endpoint - v0.0.4", () => {
  
  describe("POST /api/calculate - Successful calculations", () => {
    
    it("should return correct calculation with valid input", async () => {
      const validInput = {
        sales: 100000,
        fixedCapitalCosts: 20000,
        fixedLaborCosts: 15000,
        profit: 5000,
        amortization: 2000,
        interests: 1000,
        period: "2026-Q1",
        currency: "USD",
        inflationIndex: 1.05,
        accountingCriteria: "ACCRUAL",
        employees: [{ id: "e-1", name: "Test Employee", amount: 1 }],
      };

      const response = await request(app)
        .post("/api/calculate")
        .send(validInput)
        .expect("Content-Type", /json/)
        .expect(200);

      // Verify normalized response structure
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("timestamp");
      expect(typeof response.body.timestamp).toBe("number");

      // Verify economic data structure
      const { data } = response.body;
      expect(data).toHaveProperty("breakEven");
      expect(data).toHaveProperty("totalRevenue");
      expect(data).toHaveProperty("surplus");
      expect(data).toHaveProperty("distribution");
      expect(data).toHaveProperty("auditTrail");

      // Verify breakEven calculation
      expect(data.breakEven).toBe(validInput.fixedCapitalCosts + validInput.fixedLaborCosts);
    });

    it("should accept minimal valid input", async () => {
      const minimalInput = {
        sales: 1000,
        fixedCapitalCosts: 100,
        fixedLaborCosts: 100,
        profit: 0,
      };

      const response = await request(app)
        .post("/api/calculate")
        .send(minimalInput)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.breakEven).toBe(200);
    });

    it("should use default values for optional fields", async () => {
      const inputWithDefaults = {
        sales: 50000,
        fixedCapitalCosts: 10000,
        fixedLaborCosts: 5000,
      };

      const response = await request(app)
        .post("/api/calculate")
        .send(inputWithDefaults)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.input.currency).toBe("USD");
      expect(response.body.data.input.inflationIndex).toBe(1);
      expect(response.body.data.input.accountingCriteria).toBe("ACCRUAL");
    });
  });

  describe("POST /api/calculate - Economic validation errors", () => {
    
    it("should reject negative sales with validation error", async () => {
      const invalidInput = {
        sales: -1000,
        fixedCapitalCosts: 5000,
        fixedLaborCosts: 5000,
        profit: 0,
      };

      const response = await request(app)
        .post("/api/calculate")
        .send(invalidInput)
        .expect("Content-Type", /json/)
        .expect(400);

      // Verify error response structure - can be schema validation or economic validation
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("timestamp");
      expect(["ValidationError", "InvalidEconomicState"]).toContain(response.body.error);
    });

    it("should reject negative fixed costs with validation error", async () => {
      const invalidInput = {
        sales: 10000,
        fixedCapitalCosts: -5000,
        fixedLaborCosts: 5000,
        profit: 0,
      };

      const response = await request(app)
        .post("/api/calculate")
        .send(invalidInput)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(["ValidationError", "InvalidEconomicState"]).toContain(response.body.error);
    });

    it("should reject negative profit", async () => {
      const invalidInput = {
        sales: 10000,
        fixedCapitalCosts: 2000,
        fixedLaborCosts: 2000,
        profit: -500,
      };

      const response = await request(app)
        .post("/api/calculate")
        .send(invalidInput)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(["ValidationError", "InvalidEconomicState"]).toContain(response.body.error);
    });

    it("should reject when profit > sales (impossible state)", async () => {
      const invalidInput = {
        sales: 1000,
        fixedCapitalCosts: 100,
        fixedLaborCosts: 100,
        profit: 2000, // Profit cannot be greater than sales
      };

      const response = await request(app)
        .post("/api/calculate")
        .send(invalidInput)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("InvalidEconomicState");
      expect(response.body.message).toContain("ventas");
    });

    it("should reject when sales < fixed costs", async () => {
      const invalidInput = {
        sales: 5000,
        fixedCapitalCosts: 10000, // Total fixed = 15000 > sales
        fixedLaborCosts: 5000,
        profit: 0,
      };

      const response = await request(app)
        .post("/api/calculate")
        .send(invalidInput)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("InvalidEconomicState");
    });

    it("should reject when sales < profit + fixed costs (invalid economic state)", async () => {
      const invalidInput = {
        sales: 10000,
        fixedCapitalCosts: 5000,
        fixedLaborCosts: 3000,
        profit: 5000, // 5000 + 5000 + 3000 = 13000 > 10000 sales
      };

      const response = await request(app)
        .post("/api/calculate")
        .send(invalidInput)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("InvalidEconomicState");
      expect(response.body.message).toBe("Ventas no pueden ser menores que Ganancia + Costos Fijos");
      
      // Should include deficit information
      expect(response.body.details).toHaveProperty("deficit");
      expect(response.body.details.deficit).toBe(3000);
    });
  });

  describe("POST /api/calculate - Response structure validation", () => {
    
    it("should always include timestamp in response", async () => {
      const validInput = {
        sales: 50000,
        fixedCapitalCosts: 10000,
        fixedLaborCosts: 5000,
      };

      const response = await request(app)
        .post("/api/calculate")
        .send(validInput);

      expect(response.body.timestamp).toBeDefined();
      expect(typeof response.body.timestamp).toBe("number");
      expect(response.body.timestamp).toBeGreaterThan(0);
    });

    it("should include error type in all error responses", async () => {
      const invalidInput = {
        sales: -100,
        fixedCapitalCosts: 10,
        fixedLaborCosts: 10,
      };

      const response = await request(app)
        .post("/api/calculate")
        .send(invalidInput)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        timestamp: expect.any(Number),
      });
    });

    it("should include all required fields in successful calculation", async () => {
      const validInput = {
        sales: 100000,
        fixedCapitalCosts: 20000,
        fixedLaborCosts: 15000,
        profit: 5000,
      };

      const response = await request(app)
        .post("/api/calculate")
        .send(validInput)
        .expect(200);

      const { data } = response.body;
      
      // Core economic values
      expect(data).toHaveProperty("breakEven");
      expect(data).toHaveProperty("totalRevenue");
      expect(data).toHaveProperty("totalCost");
      expect(data).toHaveProperty("surplus");
      
      // Distribution details
      expect(data.distribution).toHaveProperty("capitalReturn");
      expect(data.distribution).toHaveProperty("laborSurplusPool");
      expect(data.distribution).toHaveProperty("weightCapital");
      expect(data.distribution).toHaveProperty("weightLabor");
      
      // Audit trail
      expect(data.auditTrail).toHaveProperty("status");
      expect(data.auditTrail).toHaveProperty("calculatedAt");
      
      // Input echo
      expect(data.input).toHaveProperty("sales", validInput.sales);
      expect(data.input).toHaveProperty("fixedCapitalCosts", validInput.fixedCapitalCosts);
    });
  });

  describe("GET / - API Health Check", () => {
    
    it("should return API status and version 0.0.4", async () => {
      const response = await request(app)
        .get("/")
        .expect(200);

      expect(response.body).toHaveProperty("status", "API running");
      expect(response.body).toHaveProperty("version", "0.0.4");
      expect(response.body).toHaveProperty("features");
      expect(response.body.features).toContain("Data Integrity & Economic Safety");
    });
  });

  describe("404 Handler", () => {
    
    it("should return structured 404 for unknown routes", async () => {
      const response = await request(app)
        .get("/api/unknown-route")
        .expect(404);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error", "NotFound");
      expect(response.body).toHaveProperty("timestamp");
    });
  });
});
