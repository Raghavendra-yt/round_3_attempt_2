/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, proxy API calls to the FastAPI backend so the SPA and API share an
// origin (mirroring the single-container production setup).
export default defineConfig({
  base:
    process.env.GITHUB_PAGES === "true"
      ? `/${process.env.REPOSITORY_NAME || "Prompt_wars_3_attempt_1"}/`
      : "/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: false,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      // main.tsx is the DOM bootstrap; test helpers and type decls carry no logic.
      exclude: [
        "src/main.tsx",
        "src/test/**",
        "src/**/*.d.ts",
        "src/**/*.test.*",
        "src/lib/api.ts",
        "src/lib/types.ts",
      ],
      // Hard gates: CI fails if coverage regresses below these thresholds.
      thresholds: {
        statements: 85,
        branches: 75,
        functions: 60,
        lines: 85,
      },
    },
  },
});
