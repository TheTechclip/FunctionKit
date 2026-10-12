import { afterEach, describe, expect, test, vi } from "vitest";
import { revokeObjectUrl } from "../../web/packages/utils/browser/objectUrl.client";

afterEach(() => vi.unstubAllGlobals());
describe("public object URL cleanup", () => {
	test("releases a URL exactly once per call and ignores absent input", () => {
		const revoke = vi.fn();
		vi.stubGlobal("URL", { revokeObjectURL: revoke });
		revokeObjectUrl("blob:preview");
		revokeObjectUrl("");
		revokeObjectUrl(null);
		revokeObjectUrl(undefined);
		expect(revoke).toHaveBeenCalledExactlyOnceWith("blob:preview");
	});
	test("is safe when the host has no object URL API", () => {
		vi.stubGlobal("URL", undefined);
		expect(() => revokeObjectUrl("blob:preview")).not.toThrow();
		vi.stubGlobal("URL", {});
		expect(() => revokeObjectUrl("blob:preview")).not.toThrow();
	});
});
