import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ScrollTo } from "@/web/packages/components/ScrollTo";

describe("ScrollTo", () => {
	test("scrolls the window to the default origin on mount", () => {
		const originalScrollTo = window.scrollTo;
		window.scrollTo = vi.fn();

		render(<ScrollTo />);
		expect(window.scrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: "auto" });

		window.scrollTo = originalScrollTo;
	});

	test("scrolls a supplied element to an explicit destination", () => {
		const target = document.createElement("div");
		target.scrollTo = vi.fn();

		render(<ScrollTo behavior="smooth" left={12} target={{ current: target }} top={34} />);

		expect(target.scrollTo).toHaveBeenCalledWith({
			left: 12,
			top: 34,
			behavior: "smooth",
		});
	});
});
