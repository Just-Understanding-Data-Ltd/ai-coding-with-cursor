/// <reference types="vitest" />
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";

// Load env files
if (!process.env.CI) {
  dotenv.config({ path: ".env.local" });
}

export default defineConfig({
  test: {
    include: ["**/*.integration.{ts,tsx}"],
    setupFiles: ["./integration/vitest.setup.ts"],
    globalSetup: ["./integration/setup.ts"],
    environment: "node",
    globals: true,
    hookTimeout: 60000, // 60 seconds for hooks
    testTimeout: 30000, // 30 seconds for individual tests
    environmentMatchGlobs: [
      // Use jsdom for component integration tests
      ["**/*.integration.tsx", "jsdom"],
      // Use node for API/service integration tests
      ["**/*.integration.ts", "node"],
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      ".next/**",
      "coverage/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "e2e/**",
        ".next/**",
        "**/*.d.ts",
        "**/index.ts",
        "**/types.ts",
        "test/**",
      ],
    },
  },
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
