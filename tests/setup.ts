import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
let errors: unknown[][] = [];
let warnings: unknown[][] = [];

function formatCalls(calls: unknown[][]) {
	return calls.map((call) => call.map((value) => String(value)).join(" ")).join("\n\n");
}

beforeEach(() => {
	errors = [];
	warnings = [];
	console.error = (...args: unknown[]) => {
		errors.push(args);
	};
	console.warn = (...args: unknown[]) => {
		warnings.push(args);
	};
});

afterEach(() => {
	console.error = originalConsoleError;
	console.warn = originalConsoleWarn;

	if (errors.length === 0 && warnings.length === 0) return;
	throw new Error(
		[
			errors.length > 0 ? `console.error:\n${formatCalls(errors)}` : "",
			warnings.length > 0 ? `console.warn:\n${formatCalls(warnings)}` : "",
		]
			.filter(Boolean)
			.join("\n\n"),
	);
});

class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
