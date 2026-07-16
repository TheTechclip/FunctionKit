import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
	ViewportPortal,
	getViewportPortalRoot,
} from "@/packages/components/ViewportPortal";
import React from "react";

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
