/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    // Force Vite to use ESM for all dependencies
    esbuildOptions: {
      format: "esm",
    },
  },
});
