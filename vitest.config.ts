import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Cobertura alinhada ao escopo de testes unitários (Vitest).
 * Fora do escopo: app RSC/async (Playwright), actions, repos Prisma,
 * factories, DTOs/interfaces, services externos, componentes UI (maioria client/async).
 * Ver docs/guia-testes.md § Escopo e cobertura.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.spec.{ts,tsx}", "tests/**/*.spec.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "src/utils/**/*.ts",
        "src/useCases/**/*.ts",
        "src/errors/**/*.ts",
        "src/mappers/**/*.ts",
        "src/app/**/transitions/**/*.ts",
        "src/app/api/**/*Schema.ts",
        "src/app/api/**/*schema.ts",
      ],
      exclude: [
        "**/*.spec.ts",
        "**/*.e2e-spec.ts",
        "**/*.spec.tsx",
        "**/*.d.ts",
        "**/factories/**",
        "src/generated/**",
        "src/actions/**",
        "src/repositories/**",
        "src/services/**",
        "src/schemas/**",
        "src/components/**",
        "src/email/**",
        "src/constants/**",
        "src/@types/**",
        "src/lib/auth/**",
        "src/lib/prisma.ts",
        "src/proxy.ts",
        "src/auth.ts",
        "src/errors/index.ts",
        "src/app/**/transitions/types.ts",
        "src/app/**/page.tsx",
        "src/app/**/layout.tsx",
        "src/app/**/loading.tsx",
        "src/app/**/default.tsx",
        "src/app/**/template.tsx",
        "src/app/**/_components/**",
        "src/app/**/_data/**",
        "src/app/**/route.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
