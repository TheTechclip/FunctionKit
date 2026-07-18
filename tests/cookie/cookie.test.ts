import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
	clearAllClientCookies,
	clearClientCookie,
	getClientCookie,
	setClientCookie,
} from "@/packages/cookie/cookie.client";
import { parseClientCookieNames } from "@/packages/cookie/parseClientCookieNames";

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
			// biome-ignore lint/suspicious/noDocumentCookie: test setup
			document.cookie = "foo=bar; baz=qux";
			expect(getClientCookie("foo")).toBe("bar");
			expect(getClientCookie("baz")).toBe("qux");
		});

		test("skips cookies with empty name when parsing", () => {
			// biome-ignore lint/suspicious/noDocumentCookie: test setup
			document.cookie = "=value; foo=bar";
			expect(getClientCookie("foo")).toBe("bar");
		});

		test("returns undefined if cookie does not exist", () => {
			// biome-ignore lint/suspicious/noDocumentCookie: test setup
			document.cookie = "foo=bar";
			expect(getClientCookie("missing")).toBeUndefined();
		});

		test("handles undefined document", () => {
			const originalDocument = global.document;
			// @ts-expect-error
			delete global.document;

			expect(getClientCookie("foo")).toBeUndefined();

			global.document = originalDocument;
		});
	});

	test("decodes values and preserves embedded equals signs", () => {
		// biome-ignore lint/suspicious/noDocumentCookie: test setup
		document.cookie = "token=part%3Dtwo%3Dthree";
		expect(getClientCookie("token")).toBe("part=two=three");
	});

	test("returns the raw value when a cookie contains malformed encoding", () => {
		// biome-ignore lint/suspicious/noDocumentCookie: test setup
		document.cookie = "token=%E0%A4%A";
		expect(getClientCookie("token")).toBe("%E0%A4%A");
	});

	test("treats a valueless cookie as an empty string", () => {
		// biome-ignore lint/suspicious/noDocumentCookie: test setup
		document.cookie = "flag";
		expect(getClientCookie("flag")).toBe("");
	});

	describe("setClientCookie", () => {
		test("handles undefined document in setClientCookie", () => {
			const origDocument = global.document;
			// @ts-expect-error
			delete global.document;
			setClientCookie("foo", "bar");
			global.document = origDocument;
		});

		test("parseClientCookie handles malformed entries", () => {
			const result = parseClientCookieNames("=value; key");
			expect(result).toEqual(["key"]);
		});

		test("clearAllClientCookies handles empty cookie name", () => {
			const mockDoc: { cookie: string } = { cookie: "=1;;" };
			const entries = clearAllClientCookies({ documentRef: mockDoc });
			expect(Array.isArray(entries)).toBe(true);
		});

		test("clearAllClientCookies skips entries with empty name", () => {
			const mockDoc: { cookie: string } = { cookie: "a=1;;b=2" };
			const entries = clearAllClientCookies({ documentRef: mockDoc });
			// Entries with empty names should be skipped in the loop
			expect(entries).toEqual(["a", "b"]);
		});

		test("setClientCookie with days=0 does not add expires", () => {
			setClientCookie("foo", "bar", 0);
			expect(document.cookie).toBe("foo=bar; path=/");
		});

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
			// biome-ignore lint/suspicious/noDocumentCookie: test setup
			document.cookie = "foo=bar";
			clearClientCookie("foo");
			expect(document.cookie).toBe("foo=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;");
		});

		test("clears cookie with custom options", () => {
			const mockDoc = { cookie: "" };
			clearClientCookie("foo", {
				hostname: "custom.com",
				path: "/custom",
				documentRef: mockDoc,
			});
			expect(mockDoc.cookie).toBe(
				"foo=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/custom; domain=custom.com;",
			);
		});
	});

	test("does nothing outside a browser environment", () => {
		const originalDocument = global.document;
		const originalWindow = global.window;
		// @ts-expect-error test SSR guard
		delete global.document;
		// @ts-expect-error test SSR guard
		delete global.window;

		expect(() => clearClientCookie("foo")).not.toThrow();
		expect(clearAllClientCookies()).toEqual([]);

		global.document = originalDocument;
		global.window = originalWindow;
	});

	describe("clearAllClientCookies", () => {
		test("clears all cookies based on documentRef.cookie", () => {
			const mockDoc = { cookie: "a=1; b=2" };
			const entries = clearAllClientCookies({ documentRef: mockDoc });

			expect(entries).toEqual(["a", "b"]);
			expect(mockDoc.cookie).toContain(
				"b=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/test/path; domain=example.com;",
			);
		});

		test("clears cookies using cookieStore if provided", async () => {
			const cookieStore = { delete: vi.fn().mockResolvedValue(undefined) };
			const mockDoc = { cookie: "a=1; b=2" };

			const entries = clearAllClientCookies({
				documentRef: mockDoc,
				cookieStore,
			});

			expect(entries).toEqual(["a", "b"]);
			expect(cookieStore.delete).toHaveBeenCalledWith("a");
			expect(cookieStore.delete).toHaveBeenCalledWith("b");
		});

		test("clears cookies from root path when includeRoot is true", () => {
			const mockDoc = { cookie: "a=1" };
			clearAllClientCookies({ documentRef: mockDoc, includeRoot: true });

			// The function iterates and updates document.cookie, so it will contain the last assignment.
			// With paths ["/", "/test/path"] and domain "example.com"
			expect(mockDoc.cookie).toContain(
				"a=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/test/path; domain=example.com;",
			);
		});

		test("uses provided cookieString instead of documentRef.cookie", () => {
			const mockDoc = { cookie: "a=1" };
			const entries = clearAllClientCookies({
				documentRef: mockDoc,
				cookieString: "x=1; y=2",
			});

			expect(entries).toEqual(["x", "y"]);
			expect(mockDoc.cookie).toContain("y=;");
		});
	});

	test("ignores an asynchronous Cookie Store deletion failure", async () => {
		const cookieStore = { delete: vi.fn().mockRejectedValue(new Error("unavailable")) };

		expect(clearAllClientCookies({ cookieString: "a=1", cookieStore })).toEqual(["a"]);
		await Promise.resolve();
		await Promise.resolve();
		expect(cookieStore.delete).toHaveBeenCalledWith("a");
	});
});
