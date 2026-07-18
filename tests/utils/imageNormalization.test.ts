import { afterEach, describe, expect, test, vi } from "vitest";
import {
	getNormalizedJpegFilename,
	isGifUploadImage,
	isSupportedUploadImageFile,
	NormalizeUploadImageError,
	normalizeUploadImage,
	normalizeUploadImages,
} from "@/packages/utils/imageNormalization";

const createFile = (name = "photo.png", type = "image/png") => new File(["image"], name, { type });

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("image normalization helpers", () => {
	test("recognizes supported images and creates deterministic safe names", () => {
		expect(isSupportedUploadImageFile(createFile())).toBe(true);
		expect(isSupportedUploadImageFile(createFile("PHOTO.HEIC", ""))).toBe(true);
		expect(isSupportedUploadImageFile(createFile("file.txt", "text/plain"))).toBe(false);
		expect(isGifUploadImage(createFile("animation.gif", ""))).toBe(true);
		expect(getNormalizedJpegFilename("dir/a b.png", 1, 0.5)).toBe("a_b_1_i.jpg");
		expect(getNormalizedJpegFilename("", 1, 0.5)).toBe("image_1_i.jpg");
		expect(getNormalizedJpegFilename("plain", 1, 0.5)).toBe("plain_1_i.jpg");
		expect(
			isSupportedUploadImageFile({ type: undefined, name: undefined } as unknown as File),
		).toBe(false);
	});

	test("rejects unsupported files, SSR, and missing HEIC decoders", async () => {
		await expect(normalizeUploadImage(createFile("x.txt", "text/plain"))).rejects.toMatchObject({
			code: "invalid_type",
		});
		const createObjectURL = URL.createObjectURL;
		Object.defineProperty(URL, "createObjectURL", { value: undefined, configurable: true });
		await expect(normalizeUploadImage(createFile())).rejects.toMatchObject({
			code: "encode_failed",
		});
		Object.defineProperty(URL, "createObjectURL", { value: createObjectURL, configurable: true });
		await expect(normalizeUploadImage(createFile("x.heic", "image/heic"))).rejects.toMatchObject({
			code: "decode_failed",
		});
	});

	test("normalizes single and multiple images with an injected browser canvas", async () => {
		const drawImage = vi.fn();
		const canvas = {
			width: 10,
			height: 5,
			getContext: () => ({ drawImage }),
			toBlob: (callback: (blob: Blob) => void) => callback(new Blob(["x"], { type: "image/jpeg" })),
		};
		class MockImageBitmap {
			width = 20;
			height = 10;
			close = vi.fn();
		}
		vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLCanvasElement);
		vi.stubGlobal("ImageBitmap", MockImageBitmap);
		vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(new MockImageBitmap()));
		vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:preview") });

		const gif = createFile("a.gif", "image/gif");
		const result = await normalizeUploadImage(gif, { maxDimension: 10, maxOutputBytes: 10 });
		expect(result).toMatchObject({
			width: 10,
			height: 5,
			outputType: "image/jpeg",
			warnings: ["gif_first_frame_used"],
			previewUrl: "blob:preview",
		});
		expect(drawImage).toHaveBeenCalled();
		expect(await normalizeUploadImages([createFile(), createFile()])).toHaveLength(2);
	});

	test("uses the HEIC decoder and preserves typed errors", async () => {
		vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error("no bitmap")));
		vi.stubGlobal("Image", undefined);
		vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:x") });
		await expect(
			normalizeUploadImage(createFile("x.heic", "image/heic"), {
				decodeHeic: async (file) => file,
			}),
		).rejects.toBeInstanceOf(NormalizeUploadImageError);
	});

	test("falls back to Image decoding and revokes its source URL", async () => {
		const drawImage = vi.fn();
		const canvas = {
			width: 1,
			height: 1,
			getContext: () => ({ drawImage }),
			toBlob: (callback: (blob: Blob) => void) => callback(new Blob(["x"])),
		};
		class MockImage {
			naturalWidth = 4;
			naturalHeight = 2;
			width = 4;
			height = 2;
			onload: (() => void) | null = null;
			onerror: (() => void) | null = null;
			set src(_value: string) {
				this.onload?.();
			}
		}
		vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLCanvasElement);
		vi.stubGlobal("createImageBitmap", undefined);
		vi.stubGlobal("Image", MockImage);
		vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:source"), revokeObjectURL: vi.fn() });
		await expect(normalizeUploadImage(createFile())).resolves.toMatchObject({
			width: 4,
			height: 2,
		});
		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:source");
	});

	test("uses image element dimensions when natural dimensions are absent", async () => {
		const canvas = {
			width: 1,
			height: 1,
			getContext: () => ({ drawImage: vi.fn() }),
			toBlob: (callback: (blob: Blob) => void) => callback(new Blob(["x"])),
		};
		class MockImage {
			naturalWidth = 0;
			naturalHeight = 0;
			width = 3;
			height = 2;
			onload: (() => void) | null = null;
			set src(_value: string) {
				this.onload?.();
			}
		}
		vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLCanvasElement);
		vi.stubGlobal("createImageBitmap", undefined);
		vi.stubGlobal("Image", MockImage);
		vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:x"), revokeObjectURL: vi.fn() });
		await expect(normalizeUploadImage(createFile("x.png", ""))).resolves.toMatchObject({
			width: 3,
			height: 2,
			originalType: "application/octet-stream",
		});
	});

	test("reports canvas and output failures", async () => {
		class MockImageBitmap {
			width = 2000;
			height = 1000;
			close() {}
		}
		vi.stubGlobal("ImageBitmap", MockImageBitmap);
		vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(new MockImageBitmap()));
		vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:x") });
		vi.spyOn(document, "createElement").mockReturnValue({
			width: 1,
			height: 1,
			getContext: () => null,
		} as unknown as HTMLCanvasElement);
		await expect(normalizeUploadImage(createFile())).rejects.toMatchObject({
			code: "encode_failed",
		});

		const canvas = {
			width: 2000,
			height: 1000,
			getContext: () => ({ drawImage: vi.fn() }),
			toBlob: (callback: (blob: Blob) => void) => callback(new Blob(["too large".repeat(100)])),
		};
		vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLCanvasElement);
		await expect(normalizeUploadImage(createFile(), { maxOutputBytes: 1 })).rejects.toMatchObject({
			code: "output_too_large",
		});

		vi.spyOn(document, "createElement").mockReturnValue({
			width: 1,
			height: 1,
			getContext: () => ({ drawImage: vi.fn() }),
			toBlob: (callback: (blob: Blob | null) => void) => callback(null),
		} as unknown as HTMLCanvasElement);
		await expect(normalizeUploadImage(createFile())).rejects.toMatchObject({
			code: "encode_failed",
		});
	});

	test("reports Image fallback and scaled canvas failures", async () => {
		class BrokenImage {
			onerror: (() => void) | null = null;
			set src(_value: string) {
				this.onerror?.();
			}
		}
		vi.stubGlobal("createImageBitmap", undefined);
		vi.stubGlobal("Image", BrokenImage);
		vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:source"), revokeObjectURL: vi.fn() });
		await expect(normalizeUploadImage(createFile())).rejects.toMatchObject({
			code: "decode_failed",
		});

		class MockImageBitmap {
			width = 2000;
			height = 1000;
			close() {}
		}
		vi.stubGlobal("ImageBitmap", MockImageBitmap);
		vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(new MockImageBitmap()));
		const first = {
			width: 2000,
			height: 1000,
			getContext: () => ({ drawImage: vi.fn() }),
			toBlob: (callback: (blob: Blob) => void) => callback(new Blob(["x".repeat(100)])),
		};
		const scaled = { width: 1700, height: 850, getContext: () => null };
		vi.spyOn(document, "createElement")
			.mockReturnValueOnce(first as unknown as HTMLCanvasElement)
			.mockReturnValueOnce(scaled as unknown as HTMLCanvasElement);
		await expect(normalizeUploadImage(createFile(), { maxOutputBytes: 1 })).rejects.toMatchObject({
			code: "encode_failed",
		});
	});
});
