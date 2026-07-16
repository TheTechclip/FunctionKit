import { describe, test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHasMounted } from "@/packages/hooks/useHasMounted";

describe("useHasMounted", () => {
	test("returns true after mount", () => {
		const { result } = renderHook(() => useHasMounted());
		expect(result.current).toBe(true);
	});
});
