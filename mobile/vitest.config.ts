import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      // Unit-test scope is the pure lib layer. App.tsx (React Native UI) and the
      // Detox e2e specs are exercised by the mobile E2E suite on Desktop, not here.
      include: ["lib/**/*.ts"],
      exclude: ["lib/**/*.test.ts", "lib/**/__tests__/**"],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 }
    }
  }
});
