import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import { SwitchCase } from "@/packages/components/SwitchCase";
import React from "react";

describe("SwitchCase", () => {
	const cases = {
		1: <div>Case 1</div>,
		2: <div>Case 2</div>,
		three: <div>Case Three</div>,
	};

	test("renders correctly matching case", () => {
		const { container } = render(<SwitchCase value={1} cases={cases} />);
		expect(container.textContent).toBe("Case 1");
	});

	test("renders another case", () => {
		const { container } = render(<SwitchCase value="three" cases={cases} />);
		expect(container.textContent).toBe("Case Three");
	});

	test("renders otherwise when case does not exist", () => {
		const { container } = render(
			<SwitchCase value={99} cases={cases} otherwise={<div>Fallback</div>} />,
		);
		expect(container.textContent).toBe("Fallback");
	});

	test("renders null when case does not exist and otherwise is not provided", () => {
		const { container } = render(<SwitchCase value={99} cases={cases} />);
		expect(container.innerHTML).toBe("");
	});
});
