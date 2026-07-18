import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { buildContext } from "@/packages/utils/buildContext";

describe("buildContext", () => {
	const [useValue, Provider] = buildContext<string>("TestContext");

	function TestComponent() {
		const val = useValue();
		return <div data-testid="val">{val}</div>;
	}

	test("throws a descriptive error when not wrapped in provider", () => {
		expect(() => render(<TestComponent />)).toThrow(
			"TestContext must be used within its Provider.",
		);
	});

	test("returns provided value", () => {
		render(
			<Provider value="provided">
				<TestComponent />
			</Provider>,
		);
		expect(screen.getByTestId("val").textContent).toBe("provided");
	});

	test("uses a generic context name when no display name is supplied", () => {
		const [useUnnamed] = buildContext<string>();
		function UnnamedConsumer() {
			useUnnamed();
			return null;
		}

		expect(() => render(<UnnamedConsumer />)).toThrow("Context must be used within its Provider.");
	});
});
