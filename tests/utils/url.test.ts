import { describe, expect, test } from "vitest";
import {
	hostMatchesAny,
	isEmailAddress,
	isHttpUrl,
	normalizeHostname,
	toTrimmedString,
	toURL,
} from "@/web/packages/utils/url";

describe("URL helpers", () => {
	test("parses and validates HTTP URLs and hosts", () => {
		expect(toTrimmedString(" a ")).toBe("a");
		expect(toTrimmedString(1)).toBe("");
		expect(toURL("/a", "https://example.com")?.href).toBe("https://example.com/a");
		expect(toURL("not a url")).toBeNull();
		expect(isHttpUrl("https://example.com/a")).toBe(true);
		expect(isHttpUrl("ftp://example.com")).toBe(false);
		expect(isEmailAddress(" hello@example.com ")).toBe(true);
		expect(isEmailAddress("hello@example")).toBe(false);
		expect(normalizeHostname(" WWW.Example.com. ")).toBe("example.com");
		expect(hostMatchesAny("sub.example.com", ["example.com"])).toBe(true);
		expect(hostMatchesAny("not-example.com", ["example.com"])).toBe(false);
	});
});
