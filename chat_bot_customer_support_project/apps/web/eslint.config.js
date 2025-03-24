import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
const config = {
  ...nextJsConfig,
  extends: [
    ...(nextJsConfig.extends || []),
    "plugin:@tanstack/eslint-plugin-query/recommended",
  ],
  plugins: [...(nextJsConfig.plugins || []), "@tanstack/query"],
  rules: {
    ...(nextJsConfig.rules || {}),
    "@tanstack/query/exhaustive-deps": "error",
    "@tanstack/query/no-deprecated-options": "error",
    "@tanstack/query/prefer-query-object-syntax": "error",
    "@tanstack/query/stable-query-client": "error",
  },
  ignores: ["components/ui/**", "components/ui/**/**"],
};

export default config;
