import { describe, expect, test } from "vitest";
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

	test("returns true for SELECT element", () => {
		const el = document.createElement("select");
		expect(isEditableKeyboardTarget(el)).toBe(true);
	});

	test("returns true for email INPUT", () => {
		const el = document.createElement("input");
		el.type = "email";
		expect(isEditableKeyboardTarget(el)).toBe(true);
	});

	test("returns true for url INPUT", () => {
		const el = document.createElement("input");
		el.type = "url";
		expect(isEditableKeyboardTarget(el)).toBe(true);
	});

	test("returns true for number INPUT", () => {
		const el = document.createElement("input");
		el.type = "number";
		expect(isEditableKeyboardTarget(el)).toBe(true);
	});

	test("returns true for password INPUT", () => {
		const el = document.createElement("input");
		el.type = "password";
		expect(isEditableKeyboardTarget(el)).toBe(true);
	});

	test("returns true for search INPUT", () => {
		const el = document.createElement("input");
		el.type = "search";
		expect(isEditableKeyboardTarget(el)).toBe(true);
	});

	test("returns true for tel INPUT", () => {
		const el = document.createElement("input");
		el.type = "tel";
		expect(isEditableKeyboardTarget(el)).toBe(true);
	});
});
