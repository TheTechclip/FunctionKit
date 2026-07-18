"use client";

export const NORMALIZED_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const NORMALIZED_IMAGE_MAX_DIMENSION = 3840;
export const SUPPORTED_UPLOAD_IMAGE_MIME_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/avif",
	"image/heic",
	"image/heif",
]);
export const SUPPORTED_UPLOAD_IMAGE_EXTENSIONS = [
	".jpg",
	".jpeg",
	".png",
	".webp",
	".gif",
	".avif",
	".heic",
	".heif",
] as const;
export const SUPPORTED_UPLOAD_IMAGE_ACCEPT = [
	...SUPPORTED_UPLOAD_IMAGE_EXTENSIONS,
	...SUPPORTED_UPLOAD_IMAGE_MIME_TYPES,
].join(",");

type CanvasSource = ImageBitmap | HTMLImageElement;
type HeicDecoder = (file: Blob) => Promise<Blob>;

export type NormalizeUploadImageWarning = "gif_first_frame_used";
export type NormalizeUploadImageErrorCode =
	| "invalid_type"
	| "decode_failed"
	| "encode_failed"
	| "output_too_large";
export type NormalizeUploadImageOptions = {
	maxDimension?: number;
	maxOutputBytes?: number;
	decodeHeic?: HeicDecoder;
};
export type NormalizedUploadImage = {
	file: File;
	previewUrl: string;
	width: number;
	height: number;
	originalType: string;
	outputType: "image/jpeg";
	originalBytes: number;
	outputBytes: number;
	warnings: NormalizeUploadImageWarning[];
};

export class NormalizeUploadImageError extends Error {
	constructor(
		public code: NormalizeUploadImageErrorCode,
		message: string,
	) {
		super(message);
		this.name = "NormalizeUploadImageError";
	}
}

function mimeType(value: string | undefined): string {
	return value?.trim().toLowerCase() ?? "";
}

function extension(value: string | undefined): string {
	const name = value?.trim().toLowerCase() ?? "";
	return name.slice(name.lastIndexOf("."));
}

function isHeic(file: File): boolean {
	return (
		["image/heic", "image/heif"].includes(mimeType(file.type)) ||
		[".heic", ".heif"].includes(extension(file.name))
	);
}

export function isSupportedUploadImageFile(file: File): boolean {
	return (
		SUPPORTED_UPLOAD_IMAGE_MIME_TYPES.has(mimeType(file.type)) ||
		SUPPORTED_UPLOAD_IMAGE_EXTENSIONS.includes(
			extension(file.name) as (typeof SUPPORTED_UPLOAD_IMAGE_EXTENSIONS)[number],
		)
	);
}

export function isGifUploadImage(file: File): boolean {
	return mimeType(file.type) === "image/gif" || extension(file.name) === ".gif";
}

export function getNormalizedJpegFilename(
	fileName: string,
	now = Date.now(),
	random = Math.random(),
): string {
	const baseName =
		fileName
			.trim()
			.split(/[\\/]/)
			.at(-1)
			?.replace(/[^a-zA-Z0-9_.-]/g, "_") || "image";
	const extensionIndex = baseName.lastIndexOf(".");
	const stem = extensionIndex > 0 ? baseName.slice(0, extensionIndex) : baseName;
	return `${stem}_${now}_${random.toString(36).slice(2, 6)}.jpg`;
}

/** Releases a preview URL returned from `normalizeUploadImage`. Safe during SSR and for empty values. */
export function revokeObjectUrl(url: string | null | undefined): void {
	if (!url || typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") return;
	URL.revokeObjectURL(url);
}

function closeSource(source: CanvasSource): void {
	if (isImageBitmap(source)) source.close();
}

function isImageBitmap(source: CanvasSource): source is ImageBitmap {
	return typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap;
}

async function createSource(blob: Blob): Promise<CanvasSource> {
	if (typeof createImageBitmap === "function") {
		try {
			return await createImageBitmap(blob);
		} catch {}
	}
	if (typeof Image === "undefined")
		throw new NormalizeUploadImageError("decode_failed", "Image decoding is unavailable.");
	const objectUrl = URL.createObjectURL(blob);
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => {
			URL.revokeObjectURL(objectUrl);
			resolve(image);
		};
		image.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new NormalizeUploadImageError("decode_failed", "Failed to decode image."));
		};
		image.src = objectUrl;
	});
}

function resizeDimensions(width: number, height: number, maxDimension: number) {
	const scale = Math.min(1, maxDimension / Math.max(width, height));
	return {
		width: Math.max(1, Math.round(width * scale)),
		height: Math.max(1, Math.round(height * scale)),
	};
}

function toCanvas(source: CanvasSource, width: number, height: number): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext("2d");
	if (!context)
		throw new NormalizeUploadImageError("encode_failed", "Canvas context is unavailable.");
	context.drawImage(source, 0, 0, width, height);
	return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
	return new Promise((resolve, reject) =>
		canvas.toBlob(
			(blob) =>
				blob
					? resolve(blob)
					: reject(new NormalizeUploadImageError("encode_failed", "Failed to encode JPEG image.")),
			"image/jpeg",
			quality,
		),
	);
}

async function encodeWithinLimit(canvas: HTMLCanvasElement, maxBytes: number) {
	let current = canvas;
	for (let attempt = 0; attempt < 6; attempt += 1) {
		for (const quality of [0.92, 0.8, 0.68, 0.56, 0.44]) {
			const blob = await canvasToBlob(current, quality);
			if (blob.size <= maxBytes) return { blob, width: current.width, height: current.height };
		}
		if (Math.max(current.width, current.height) <= 1280) break;
		const next = document.createElement("canvas");
		next.width = Math.max(1, Math.round(current.width * 0.85));
		next.height = Math.max(1, Math.round(current.height * 0.85));
		const context = next.getContext("2d");
		if (!context)
			throw new NormalizeUploadImageError("encode_failed", "Canvas context is unavailable.");
		context.drawImage(current, 0, 0, next.width, next.height);
		current = next;
	}
	throw new NormalizeUploadImageError(
		"output_too_large",
		`Normalized image exceeded ${maxBytes} bytes.`,
	);
}

export async function normalizeUploadImage(
	file: File,
	options: NormalizeUploadImageOptions = {},
): Promise<NormalizedUploadImage> {
	if (!isSupportedUploadImageFile(file))
		throw new NormalizeUploadImageError("invalid_type", "Unsupported image format.");
	if (typeof document === "undefined" || typeof URL.createObjectURL !== "function")
		throw new NormalizeUploadImageError(
			"encode_failed",
			"Image normalization requires a browser environment.",
		);
	let decodeBlob: Blob = file;
	if (isHeic(file)) {
		if (!options.decodeHeic)
			throw new NormalizeUploadImageError("decode_failed", "A HEIC decoder is required.");
		decodeBlob = await options.decodeHeic(file);
	}

	const source = await createSource(decodeBlob);
	try {
		const sourceWidth = isImageBitmap(source) ? source.width : source.naturalWidth || source.width;
		const sourceHeight = isImageBitmap(source)
			? source.height
			: source.naturalHeight || source.height;
		const dimensions = resizeDimensions(
			sourceWidth,
			sourceHeight,
			options.maxDimension ?? NORMALIZED_IMAGE_MAX_DIMENSION,
		);
		const encoded = await encodeWithinLimit(
			toCanvas(source, dimensions.width, dimensions.height),
			options.maxOutputBytes ?? NORMALIZED_IMAGE_MAX_BYTES,
		);
		const normalized = new File([encoded.blob], getNormalizedJpegFilename(file.name), {
			type: "image/jpeg",
			lastModified: Date.now(),
		});
		return {
			file: normalized,
			previewUrl: URL.createObjectURL(normalized),
			width: encoded.width,
			height: encoded.height,
			originalType: mimeType(file.type) || "application/octet-stream",
			outputType: "image/jpeg",
			originalBytes: file.size,
			outputBytes: normalized.size,
			warnings: isGifUploadImage(file) ? ["gif_first_frame_used"] : [],
		};
	} finally {
		closeSource(source);
	}
}

export async function normalizeUploadImages(
	files: File[],
	options?: NormalizeUploadImageOptions,
): Promise<NormalizedUploadImage[]> {
	return Promise.all(files.map((file) => normalizeUploadImage(file, options)));
}
