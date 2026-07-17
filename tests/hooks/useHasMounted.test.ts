import { renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useHasMounted } from "@/packages/hooks/useHasMounted";

describe("useHasMounted", () => {
	test("returns true after mount", () => {
		const { result } = renderHook(() => useHasMounted());
		expect(result.current).toBe(true);
	});
});
