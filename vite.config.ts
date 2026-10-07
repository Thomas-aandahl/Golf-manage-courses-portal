import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // Only unit/component tests; Playwright specs in e2e/ are run by Playwright itself.
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
