import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		setupFiles: ["./tests/setup"],
		include: ["tests/**/*.test.{ts,tsx}"],
		globals: true,
		coverage: {
			provider: "v8",
			include: ["web/packages/**/*.{ts,tsx}"],
			exclude: ["web/packages/**/*.types.ts"],
			reportsDirectory: "coverage/public",
			reporter: ["text", "lcov"],
			thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
		},
	},
	resolve: { alias: { "@": path.resolve(import.meta.dirname, "./") } },
});
