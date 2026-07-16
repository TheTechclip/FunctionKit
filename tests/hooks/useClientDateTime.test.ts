import { describe, test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useClientDateTime } from "@/packages/hooks/useClientDateTime";

describe("useClientDateTime", () => {
	test("returns ready state and formatted text", () => {
		const { result } = renderHook(() =>
			useClientDateTime("2024-06-15", { locale: "ko" }),
		);
		expect(result.current.ready).toBe(true);
		expect(result.current.text).toBeTruthy();
		expect(result.current.date).toBeInstanceOf(Date);
	});
});
