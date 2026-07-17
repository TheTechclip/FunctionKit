import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { buildContext } from "@/packages/utils/buildContext";

describe("buildContext", () => {
	const [Provider, useValue] = buildContext<string>("default");

	function TestComponent() {
		const val = useValue();
		return <div data-testid="val">{val}</div>;
	}

	test("returns default value when not wrapped in provider", () => {
		render(<TestComponent />);
		expect(screen.getByTestId("val").textContent).toBe("default");
	});

	test("returns provided value", () => {
		render(
			<Provider value="provided">
				<TestComponent />
			</Provider>,
		);
		expect(screen.getByTestId("val").textContent).toBe("provided");
	});
});
