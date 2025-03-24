import { defineWorkspace } from "vitest/config";

// https://vitest.dev/guide/workspace
export default defineWorkspace([
  "apps/web/vitest.config.ts",
  "apps/api/vitest.config.ts",
]);
