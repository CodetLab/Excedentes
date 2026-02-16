module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  testMatch: [
    "**/tests/**/*.test.ts", 
    "**/tests/**/*.test.js",
    "**/__tests__/**/*.spec.js",
    "**/__tests__/**/*.spec.ts"
  ],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.json" }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(supertest)/)"
  ],
};
