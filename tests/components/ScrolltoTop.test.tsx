import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ScrolltoTop } from "@/packages/components/ScrolltoTop";

describe("ScrolltoTop", () => {
	test("calls window.scrollTo(0, 0) on mount", () => {
		const originalScrollTo = window.scrollTo;
		window.scrollTo = vi.fn();

		render(<ScrolltoTop />);
		expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

		window.scrollTo = originalScrollTo;
	});
});
