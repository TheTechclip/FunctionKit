# imageNormalization

Client-only image upload normalization. It validates supported formats, downscales and JPEG-encodes uploads to a byte limit, returns a preview URL, and reports GIF first-frame conversion. HEIC/HEIF support is optional: pass `decodeHeic` to `normalizeUploadImage` rather than forcing a heavyweight decoder dependency on every consumer.

Call `revokeObjectUrl(result.previewUrl)` when a normalized preview is replaced or no longer displayed. It is safe during SSR and for empty values.
