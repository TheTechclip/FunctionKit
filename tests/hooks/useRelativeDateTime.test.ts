import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useRelativeDateTime } from "@/packages/hooks/useRelativeDateTime";

describe("useRelativeDateTime", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	test("returns relative time text", () => {
		const now = Date.now();
		const fiveMinAgo = new Date(now - 5 * 60 * 1000).toISOString();
		const { result } = renderHook(() => useRelativeDateTime(fiveMinAgo, { locale: "ko" }));
		expect(result.current.ready).toBe(true);
		expect(result.current.isRelative).toBe(true);
		expect(result.current.text).toBeTruthy();
	});
});
