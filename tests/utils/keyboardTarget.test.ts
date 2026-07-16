import { describe, test, expect } from "vitest";
import { isEditableKeyboardTarget } from "@/packages/utils/keyboardTarget";

describe("isEditableKeyboardTarget", () => {
	test("returns true for contentEditable", () => {
		const el = document.createElement("div");
		Object.defineProperty(el, "isContentEditable", { value: true });
		expect(isEditableKeyboardTarget(el)).toBe(true);
	});

	test("returns true for TEXTAREA", () => {
		const el = document.createElement("textarea");
		expect(isEditableKeyboardTarget(el)).toBe(true);
	});

	test("returns true for text INPUT", () => {
		const el = document.createElement("input");
		el.type = "text";
		expect(isEditableKeyboardTarget(el)).toBe(true);
	});

	test("returns false for button INPUT", () => {
		const el = document.createElement("input");
		el.type = "button";
		expect(isEditableKeyboardTarget(el)).toBe(false);
	});

	test("returns false for checkbox INPUT", () => {
		const el = document.createElement("input");
		el.type = "checkbox";
		expect(isEditableKeyboardTarget(el)).toBe(false);
	});

	test("returns false for radio INPUT", () => {
		const el = document.createElement("input");
		el.type = "radio";
		expect(isEditableKeyboardTarget(el)).toBe(false);
	});

	test("returns false for regular div", () => {
		const el = document.createElement("div");
		expect(isEditableKeyboardTarget(el)).toBe(false);
	});
});
