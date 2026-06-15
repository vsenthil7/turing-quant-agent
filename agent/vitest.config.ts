import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
export default defineConfig({
  resolve: {
    alias: { "@tqa/core": resolve(__dirname, "../packages/core/src/index.ts") }
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
      include: ["src/**/*.ts"],
      exclude: [
        "src/index.ts", "src/types.ts", "src/main.ts",
        // I/O-only network entrypoint (router logic IS covered in server-router.test.ts)
        "src/server/httpServer.ts",
        // Live adapter stubs are TODO[DESKTOP] (real external calls). Their mock
        // counterparts (mocks.ts) and the selection factory (factory.ts) ARE covered.
        "src/adapters/index.ts",
        "src/adapters/viemChain.ts",
        "src/adapters/mantleOracle.ts",
        "src/adapters/ipfsProvenance.ts",
        "src/adapters/sqliteEventStore.ts",
        "src/adapters/openaiLlm.ts"
      ]
    }
  }
});
