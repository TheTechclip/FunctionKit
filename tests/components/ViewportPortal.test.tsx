import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { getViewportPortalRoot, ViewportPortal } from "@/packages/components/ViewportPortal";

describe("ViewportPortal", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	test("getViewportPortalRoot creates a root element if it doesn't exist", () => {
		const root = getViewportPortalRoot();
		expect(root).not.toBeNull();
		expect(root?.id).toBe("viewport-portal-root");
		expect(document.getElementById("viewport-portal-root")).toBe(root);
	});

	test("getViewportPortalRoot returns existing root element if it exists", () => {
		const root1 = getViewportPortalRoot();
		const root2 = getViewportPortalRoot();
		expect(root1).toBe(root2);
		expect(document.querySelectorAll("#viewport-portal-root").length).toBe(1);
	});

	test("getViewportPortalRoot returns null when document is undefined (SSR)", () => {
		const origDocument = global.document;
		// @ts-expect-error
		delete global.document;
		expect(getViewportPortalRoot()).toBeNull();
		global.document = origDocument;
	});

	test("ViewportPortal renders children into the portal root", () => {
		render(
			<ViewportPortal>
				<div data-testid="portal-content">Portal Content</div>
			</ViewportPortal>,
		);

		const root = document.getElementById("viewport-portal-root");
		expect(root).not.toBeNull();

		const content = screen.getByTestId("portal-content");
		expect(content.textContent).toBe("Portal Content");
		expect(root?.contains(content)).toBe(true);
	});
});
