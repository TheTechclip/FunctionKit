import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { NavigatorClipboard, NavigatorShare } from "@/web/packages/utils/browser/clipboardShare";

const shareProps = { title: "Test", text: "Hello", link: "https://example.com" };

beforeEach(() => {
	vi.stubGlobal("navigator", { clipboard: undefined, share: undefined });
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function setClipboard(writeText = vi.fn(() => Promise.resolve())) {
	Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
	return writeText;
}

function setShare(share: ReturnType<typeof vi.fn>) {
	Object.defineProperty(navigator, "share", { configurable: true, value: share });
}

describe("NavigatorClipboard", () => {
	test("resolves with success on write and passes the requested text", async () => {
		const write = setClipboard();
		await expect(NavigatorClipboard({ text: "hello" })).resolves.toEqual({ success: true });
		expect(write).toHaveBeenCalledExactlyOnceWith("hello");
	});

	test.each(["rejection", "synchronous exception"])(
		"converts %s to a failed result",
		async (mode) => {
			setClipboard(
				vi.fn(() => {
					if (mode === "synchronous exception") throw new Error("denied");
					return Promise.reject(new Error("denied"));
				}),
			);
			await expect(NavigatorClipboard({ text: "hello" })).resolves.toEqual({ success: false });
		},
	);

	test("returns failure when clipboard is unavailable", async () => {
		await expect(NavigatorClipboard({ text: "hello" })).resolves.toEqual({ success: false });
	});

	test("returns failure when navigator is unavailable", async () => {
		vi.stubGlobal("navigator", undefined);
		await expect(NavigatorClipboard({ text: "hello" })).resolves.toEqual({ success: false });
	});

	test("converts a throwing clipboard getter to failure", async () => {
		Object.defineProperty(navigator, "clipboard", {
			get() {
				throw new DOMException("denied", "SecurityError");
			},
		});
		await expect(NavigatorClipboard({ text: "hello" })).resolves.toEqual({ success: false });
	});
});

describe("NavigatorShare", () => {
	test("uses Web Share and maps link to url without copying", async () => {
		const share = vi.fn(() => Promise.resolve());
		setShare(share);
		const write = setClipboard();
		await expect(NavigatorShare(shareProps)).resolves.toEqual({ success: true, method: "share" });
		expect(share).toHaveBeenCalledExactlyOnceWith({
			title: "Test",
			text: "Hello",
			url: shareProps.link,
		});
		expect(write).not.toHaveBeenCalled();
	});

	test("copies link when Web Share is unavailable", async () => {
		const write = setClipboard();
		await expect(NavigatorShare(shareProps)).resolves.toEqual({
			success: true,
			method: "clipboard",
		});
		expect(write).toHaveBeenCalledExactlyOnceWith(shareProps.link);
	});

	test.each(["rejection", "synchronous exception"])(
		"does not copy after AbortError %s",
		async (mode) => {
			setShare(
				vi.fn(() => {
					const error = new DOMException("Aborted", "AbortError");
					if (mode === "synchronous exception") throw error;
					return Promise.reject(error);
				}),
			);
			const write = setClipboard();
			await expect(NavigatorShare(shareProps)).resolves.toEqual({
				success: false,
				method: "share",
			});
			expect(write).not.toHaveBeenCalled();
		},
	);

	test.each([new Error("share failed"), new DOMException("denied", "NotAllowedError")])(
		"falls back after non-cancellation rejection: %s",
		async (error) => {
			setShare(vi.fn(() => Promise.reject(error)));
			const write = setClipboard();
			await expect(NavigatorShare(shareProps)).resolves.toEqual({
				success: true,
				method: "clipboard",
			});
			expect(write).toHaveBeenCalledExactlyOnceWith(shareProps.link);
		},
	);

	test("falls back after a synchronous Web Share exception", async () => {
		setShare(
			vi.fn(() => {
				throw new Error("share failed");
			}),
		);
		setClipboard();
		await expect(NavigatorShare(shareProps)).resolves.toEqual({
			success: true,
			method: "clipboard",
		});
	});

	test("falls back after a throwing share getter", async () => {
		Object.defineProperty(navigator, "share", {
			get() {
				throw new Error("share blocked");
			},
		});
		setClipboard();
		await expect(NavigatorShare(shareProps)).resolves.toEqual({
			success: true,
			method: "clipboard",
		});
	});

	test.each(["rejection", "synchronous exception"])(
		"returns unsupported for clipboard fallback %s",
		async (mode) => {
			setShare(vi.fn(() => Promise.reject(new Error("share failed"))));
			setClipboard(
				vi.fn(() => {
					if (mode === "synchronous exception") throw new Error("clipboard denied");
					return Promise.reject(new Error("clipboard denied"));
				}),
			);
			await expect(NavigatorShare(shareProps)).resolves.toEqual({
				success: false,
				method: "unsupported",
			});
		},
	);

	test("returns unsupported when neither capability exists", async () => {
		await expect(NavigatorShare(shareProps)).resolves.toEqual({
			success: false,
			method: "unsupported",
		});
	});

	test("returns unsupported when navigator is unavailable", async () => {
		vi.stubGlobal("navigator", undefined);
		await expect(NavigatorShare(shareProps)).resolves.toEqual({
			success: false,
			method: "unsupported",
		});
	});
});
