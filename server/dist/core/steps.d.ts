import { EmployeeAllocation, EngineInput } from "./types.js";
export declare function validateInputs(input: EngineInput): "VALID" | "INVALID";
export declare function calculateBreakEven(input: EngineInput): number;
export declare function inferVariableCosts(input: EngineInput): {
    VariableCosts: number;
    VariableCostRatio: number;
};
export declare function calculateDistributableSurplus(data: {
    Sales: number;
    breakEven: number;
    variableCosts: {
        VariableCosts: number;
    };
}): number;
export declare function calculateWeights(input: EngineInput): {
    weightCapital: number;
    weightLabor: number;
};
export declare function distributeSurplus(distributableSurplus: number, weights: {
    weightCapital: number;
    weightLabor: number;
}): {
    capitalReturn: number;
    laborSurplusPool: number;
};
export declare function allocateLaborSurplus(laborSurplusPool: number, employees?: EmployeeAllocation[]): EmployeeAllocation[];
export declare function auditSystem(data: {
    input: EngineInput;
    variableCosts: {
        VariableCosts: number;
    };
    weights: {
        weightCapital: number;
        weightLabor: number;
    };
    distributableSurplus: number;
    distribution: {
        capitalReturn: number;
        laborSurplusPool: number;
    };
    employeeSurplusLedger: EmployeeAllocation[];
}): "PASS" | "FAIL";
export declare function generateCertificate(data: any): any;
