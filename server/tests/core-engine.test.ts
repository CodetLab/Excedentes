import { runExcedentesEngine } from "../dist/core/orchestrator.js";

describe("EXCEDENTES Core Engine orchestrator", () => {
  const baseInput = {
    Sales: 100000,
    FixedCapitalCosts: 20000,
    FixedLaborCosts: 15000,
    Profit: 5000,
    Amortization: 2000,
    Interests: 1000,
    Period: "2025-Q4",
    Currency: "USD",
    InflationIndex: 1.05,
    AccountingCriteria: "accrual",
    employees: [{ id: "e-1", amount: 1 }],
  };

  const getAllocationAmount = (entry: {
    amount?: number;
    allocation?: number;
    value?: number;
  }) => entry.amount ?? entry.allocation ?? entry.value ?? 0;

  const assertAuditAndCertificate = (
    result: {
      auditStatus?: string;
      certificate?: unknown | null;
    },
    expectedStatus: string
  ) => {
    expect(result).toBeDefined();
    expect(result.auditStatus).toBe(expectedStatus);

    if (expectedStatus === "PASS") {
      expect(result.certificate).toBeDefined();
    } else {
      expect(result.certificate == null).toBe(true);
    }
  };

  const assertInvariants = (result: {
    distributableSurplus?: number;
    capitalReturn?: number;
    laborSurplusPool?: number;
    employeeSurplusLedger?: Array<{ amount?: number; allocation?: number; value?: number }>;
    weightCapital?: number;
    weightLabor?: number;
  }) => {
    const sumEmployeeAllocations = (result.employeeSurplusLedger || []).reduce(
      (total, entry) => total + getAllocationAmount(entry),
      0
    );

    expect(result.distributableSurplus).toBeGreaterThanOrEqual(0);
    expect(result.capitalReturn).toBeGreaterThanOrEqual(0);
    expect(result.laborSurplusPool).toBeGreaterThanOrEqual(0);
    expect(sumEmployeeAllocations).toBeGreaterThanOrEqual(0);

    expect((result.weightCapital || 0) + (result.weightLabor || 0)).toBeCloseTo(1, 6);
    expect((result.capitalReturn || 0) + (result.laborSurplusPool || 0)).toBeCloseTo(
      result.distributableSurplus || 0,
      6
    );
    expect(sumEmployeeAllocations).toBeCloseTo(result.laborSurplusPool || 0, 6);
  };

  describe("Black-box economic scenarios", () => {
    it("no profit company", async () => {
      const input = { ...baseInput, Profit: 0 };
      const result = await runExcedentesEngine(input);

      assertAuditAndCertificate(result, "PASS");
      assertInvariants(result);
    });

    it("minimal profit", async () => {
      const input = { ...baseInput, Profit: 1 };
      const result = await runExcedentesEngine(input);

      assertAuditAndCertificate(result, "PASS");
      assertInvariants(result);
    });

    it("capital-dominant cost structure", async () => {
      const input = {
        ...baseInput,
        FixedCapitalCosts: 35000,
        FixedLaborCosts: 5000,
      };
      const result = await runExcedentesEngine(input);

      assertAuditAndCertificate(result, "PASS");
      assertInvariants(result);
    });

    it("labor-dominant cost structure", async () => {
      const input = {
        ...baseInput,
        FixedCapitalCosts: 5000,
        FixedLaborCosts: 35000,
      };
      const result = await runExcedentesEngine(input);

      assertAuditAndCertificate(result, "PASS");
      assertInvariants(result);
    });

    it("invalid inputs: negative, missing, impossible combinations", async () => {
      const inputs: (typeof baseInput & { [key: string]: any })[] = [
        { ...baseInput, Sales: -1 },
        { ...baseInput, Profit: -10 },
        { ...baseInput, Currency: "" },
        { ...baseInput, Sales: 100, FixedCapitalCosts: 100, FixedLaborCosts: 100 },
      ];

      for (const input of inputs) {
        const result = await runExcedentesEngine(input as any);
        assertAuditAndCertificate(result, "FAIL");
      }
    });
  });

  describe("Invariant tests (immutable)", () => {
    it("no negative monetary values", async () => {
      const result = await runExcedentesEngine({ ...baseInput });

      assertAuditAndCertificate(result, "PASS");
      assertInvariants(result);
    });

    it("WeightCapital + WeightLabor = 1", async () => {
      const result = await runExcedentesEngine({ ...baseInput });

      assertAuditAndCertificate(result, "PASS");
      expect((result.weightCapital || 0) + (result.weightLabor || 0)).toBeCloseTo(1, 6);
    });

    it("CapitalReturn + LaborSurplusPool = DistributableSurplus", async () => {
      const result = await runExcedentesEngine({ ...baseInput });

      assertAuditAndCertificate(result, "PASS");
      expect((result.capitalReturn || 0) + (result.laborSurplusPool || 0)).toBeCloseTo(
        result.distributableSurplus || 0,
        6
      );
    });

    it("Sum(EmployeeAllocations) = LaborSurplusPool", async () => {
      const result = await runExcedentesEngine({ ...baseInput });
      const sumEmployeeAllocations = (result.employeeSurplusLedger || []).reduce(
        (total, entry) => total + getAllocationAmount(entry),
        0
      );

      assertAuditAndCertificate(result, "PASS");
      expect(sumEmployeeAllocations).toBeCloseTo(result.laborSurplusPool || 0, 6);
    });

    it("no PASS means no certificate", async () => {
      const input = { ...baseInput, Profit: -1 };
      const result = await runExcedentesEngine(input);

      assertAuditAndCertificate(result, "FAIL");
    });
  });

  describe("Edge cases", () => {
    it("Sales == BreakEvenAmount", async () => {
      const input = { ...baseInput, Sales: 35000, Profit: 0 };
      const result = await runExcedentesEngine(input);

      assertAuditAndCertificate(result, "PASS");
      assertInvariants(result);
    });

    it("FixedCosts == 0 must fail", async () => {
      const input = {
        ...baseInput,
        FixedCapitalCosts: 0,
        FixedLaborCosts: 0,
      };
      const result = await runExcedentesEngine(input);

      assertAuditAndCertificate(result, "FAIL");
    });

    it("negative profit", async () => {
      const input = { ...baseInput, Profit: -100 };
      const result = await runExcedentesEngine(input);

      assertAuditAndCertificate(result, "FAIL");
    });

    it("extreme inflation index", async () => {
      const input = { ...baseInput, InflationIndex: 99.9 };
      const result = await runExcedentesEngine(input);

      assertAuditAndCertificate(result, "PASS");
      assertInvariants(result);
    });
  });
});
