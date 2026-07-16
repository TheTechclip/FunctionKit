import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import {
	parseClientCookieNames,
	getClientCookie,
	setClientCookie,
	clearClientCookie,
	clearAllClientCookies,
} from "@/packages/cookie/cookie.shared";

describe("cookie module", () => {
	beforeEach(() => {
		// Reset cookies
		Object.defineProperty(document, "cookie", {
			writable: true,
			value: "",
		});

		// Mock window location
		Object.defineProperty(window, "location", {
			writable: true,
			value: { hostname: "example.com", pathname: "/test/path" },
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("parseClientCookieNames", () => {
		test("parses cookie string correctly", () => {
			const result = parseClientCookieNames("foo=bar; baz=qux; ; empty=");
			expect(result).toEqual(["foo", "baz", "empty"]);
		});

		test("returns empty array for empty string", () => {
			expect(parseClientCookieNames("")).toEqual([]);
		});
	});

	describe("getClientCookie", () => {
		test("returns cookie value if it exists", () => {
			document.cookie = "foo=bar; baz=qux";
			expect(getClientCookie("foo")).toBe("bar");
			expect(getClientCookie("baz")).toBe("qux");
		});

		test("returns undefined if cookie does not exist", () => {
			document.cookie = "foo=bar";
			expect(getClientCookie("missing")).toBeUndefined();
		});

		test("handles undefined document", () => {
			const originalDocument = global.document;
			// @ts-ignore
			delete global.document;

			expect(getClientCookie("foo")).toBeUndefined();

			global.document = originalDocument;
		});
	});

	describe("setClientCookie", () => {
		test("sets cookie with name and value", () => {
			setClientCookie("foo", "bar");
			expect(document.cookie).toBe("foo=bar; path=/");
		});

		test("sets cookie with days", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));

			setClientCookie("foo", "bar", 7);

			const expectedDate = new Date("2020-01-08T00:00:00Z").toUTCString();
			expect(document.cookie).toBe(`foo=bar; expires=${expectedDate}; path=/`);

			vi.useRealTimers();
		});

		test("encodes cookie value", () => {
			setClientCookie("foo", "val ue;");
			expect(document.cookie).toBe("foo=val%20ue%3B; path=/");
		});
	});

	describe("clearClientCookie", () => {
		test("clears cookie with default options", () => {
			document.cookie = "foo=bar";
			clearClientCookie("foo");
			expect(document.cookie).toBe(
				"foo=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=example.com;",
			);
		});

		test("clears cookie with custom options", () => {
			const mockDoc = { cookie: "" };
			clearClientCookie("foo", {
				hostname: "custom.com",
				path: "/custom",
				documentRef: mockDoc as any,
			});
			expect(mockDoc.cookie).toBe(
				"foo=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/custom; domain=custom.com;",
			);
		});
	});

	describe("clearAllClientCookies", () => {
		test("clears all cookies based on documentRef.cookie", () => {
			const mockDoc = { cookie: "a=1; b=2" };
			const entries = clearAllClientCookies({ documentRef: mockDoc as any });

			expect(entries).toEqual(["a", "b"]);
			expect(mockDoc.cookie).toContain(
				"b=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/test/path; domain=com;",
			);
		});

		test("clears cookies using cookieStore if provided", async () => {
			const cookieStore = { delete: vi.fn().mockResolvedValue(undefined) };
			const mockDoc = { cookie: "a=1; b=2" };

			const entries = clearAllClientCookies({
				documentRef: mockDoc as any,
				cookieStore: cookieStore as any,
			});

			expect(entries).toEqual(["a", "b"]);
			expect(cookieStore.delete).toHaveBeenCalledWith("a");
			expect(cookieStore.delete).toHaveBeenCalledWith("b");
		});

		test("clears cookies from root path when includeRoot is true", () => {
			const mockDoc = { cookie: "a=1" };
			clearAllClientCookies({ documentRef: mockDoc as any, includeRoot: true });

			// The function iterates and updates document.cookie, so it will contain the last assignment.
			// With paths ["/", "/test/path"] and domain "example.com"
			expect(mockDoc.cookie).toContain(
				"a=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/test/path; domain=com;",
			);
		});

		test("uses provided cookieString instead of documentRef.cookie", () => {
			const mockDoc = { cookie: "a=1" };
			const entries = clearAllClientCookies({
				documentRef: mockDoc as any,
				cookieString: "x=1; y=2",
			});

			expect(entries).toEqual(["x", "y"]);
			expect(mockDoc.cookie).toContain("y=;");
		});
	});
});
